"""GD&T Trainer: Flask server.

The server does two jobs:
1. Serves the website files in the "static" folder (HTML, CSS, JS, drawings).
2. Offers two AI endpoints that call OpenAI:
   - POST /api/explain: explains a wrong challenge answer.
   - POST /api/tutor:   TutorBot, the floating chat assistant.
   The OpenAI key stays on the server and never reaches the browser.
"""
import json
import os
import threading
from datetime import date

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

# Load variables from a local .env file when running on your own computer.
# On Render there is no .env file; the key comes from the Environment tab.
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Render's start command "gunicorn app:app" looks for this object named "app".
# static_url_path="" means static/learn.html is served at /learn.html.
app = Flask(__name__, static_folder="static", static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024  # enough for 8 chat messages of 600 characters

# A small, low-cost model. Can be changed with the OPENAI_MODEL variable.
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
# Daily limits per IP address, one counter per feature.
DAILY_LIMITS = {"explain": 20, "tutor": 30}

# The challenge content is loaded once, so the server decides what the
# question and correct answer are. The browser only sends IDs, which keeps
# people from sending their own text to OpenAI through this site.
DATA_DIR = os.path.join(app.static_folder, "data")


def load_json(name):
    with open(os.path.join(DATA_DIR, name), encoding="utf-8") as f:
        return json.load(f)


CHALLENGE_DATA = load_json("challenges.json")
CHALLENGES = {c["id"]: c for c in CHALLENGE_DATA["challenges"]}
LESSONS = {l["id"]: l for l in load_json("lessons.json")["lessons"]}
VIZ_MODES = {m["id"]: m for m in load_json("visualize.json")["modes"]}

# ---- Rate limit: AI requests per IP address per day ----
# Stored in memory, so it resets when the server restarts. That is accepted
# in the requirements; the $5 OpenAI budget is the real hard cap.
_usage = {}  # (feature, ip) -> (date, count)
_usage_lock = threading.Lock()


def client_ip():
    """Render puts the visitor's real IP first in X-Forwarded-For."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def take_one_request(feature, ip):
    """Count one request for this feature and IP.
    Returns False if today's limit is already used up."""
    today = date.today()
    key = (feature, ip)
    with _usage_lock:
        day, count = _usage.get(key, (today, 0))
        if day != today:
            day, count = today, 0
        if count >= DAILY_LIMITS[feature]:
            return False
        _usage[key] = (day, count + 1)
        return True


def answer_text(challenge, answer_id):
    """Turn an answer ID into readable text for the prompt."""
    if challenge["format"] == "choice":
        for option in challenge["options"]:
            if option["id"] == answer_id:
                return option["text"]
        return None
    return challenge["targets"].get(answer_id)


@app.route("/")
def home():
    """Serve the home page from the static folder."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/health")
def health():
    """Quick check that the server is running.

    Reports only WHETHER the OpenAI key is set, never the key itself.
    """
    return jsonify(
        status="ok",
        openai_key_configured=bool(os.environ.get("OPENAI_API_KEY")),
    )


@app.route("/api/explain", methods=["POST"])
def explain():
    """Ask OpenAI to explain why a challenge answer was wrong.

    Request JSON:  {"id": "<challenge id>", "answer": "<chosen answer id>"}
    Response JSON: {"ok": true, "explanation": "..."} on success, or
                   {"ok": false, "reason": "..."} so the page can fall back
                   to the pre-written explanation.
    """
    data = request.get_json(silent=True) or {}
    challenge = CHALLENGES.get(data.get("id"))
    if challenge is None:
        return jsonify(ok=False, reason="unknown-question"), 400

    chosen = answer_text(challenge, data.get("answer"))
    correct = answer_text(challenge, challenge["answer"])
    if chosen is None or data.get("answer") == challenge["answer"]:
        return jsonify(ok=False, reason="nothing-to-explain"), 400

    if not os.environ.get("OPENAI_API_KEY"):
        return jsonify(ok=False, reason="ai-not-configured"), 503

    if not take_one_request("explain", client_ip()):
        return jsonify(ok=False, reason="daily-limit"), 429

    # The prompt gives the model the checked, source-based explanation and
    # tells it not to add anything new. This keeps AI answers inside the
    # approved sources.
    instructions = (
        "You are a patient tutor helping a beginner learn GD&T "
        "(geometric dimensioning and tolerancing). In at most 3 short "
        "sentences, explain why the student's answer is wrong and why the "
        "correct answer is right. Use ONLY the facts in the reference "
        "explanation. Do not add new rules, numbers or standards. "
        "Write plain text with no markdown."
    )
    prompt = (
        f"Question: {challenge['question']}\n"
        f"Student's answer: {chosen}\n"
        f"Correct answer: {correct}\n"
        f"Reference explanation: {challenge['explanation']}"
    )

    try:
        # Imported here so the rest of the site still works if the
        # openai package has a problem.
        from openai import OpenAI

        client = OpenAI(timeout=20, max_retries=1)
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=instructions,
            input=prompt,
            max_output_tokens=220,
        )
        text = (response.output_text or "").strip()
        if not text:
            return jsonify(ok=False, reason="empty-response"), 502
        return jsonify(ok=True, explanation=text)
    except Exception as error:  # any API problem: the page falls back
        app.logger.warning("OpenAI request failed: %s", type(error).__name__)
        return jsonify(ok=False, reason="ai-unavailable"), 502


# ---------------------------------------------------------------------------
# TutorBot
# ---------------------------------------------------------------------------
MAX_MESSAGE_CHARS = 600
MAX_HISTORY = 8


def drawing_description(path):
    """Each drawing's <title> describes it in words; give that to TutorBot."""
    try:
        with open(os.path.join(app.static_folder, path), encoding="utf-8") as f:
            text = f.read()
        start, end = text.find("<title>"), text.find("</title>")
        return text[start + 7:end] if start >= 0 and end > start else ""
    except OSError:
        return ""


def lesson_reference():
    """All lesson content: the checked material TutorBot may answer from."""
    parts = []
    for lesson in LESSONS.values():
        parts.append(
            f"LESSON: {lesson['title']} ({lesson['symbolName']})\n"
            + " ".join(lesson["explanation"])
            + f"\nCommon mistake: {lesson['commonMistake']}"
            + f"\nSources: {lesson['sources']}"
        )
    for mode in VIZ_MODES.values():
        parts.append(f"VISUALIZER, {mode['title']}: {mode['description']} Sources: {mode['source']}")
    return "\n\n".join(parts)


def page_context(ctx):
    """Describe what the student is looking at, using the server's own
    content files. The browser only sends IDs and simple values."""
    page = ctx.get("page")
    if page == "learn" and ctx.get("lessonId") in LESSONS:
        lesson = LESSONS[ctx["lessonId"]]
        quiz = " ".join(q["question"] for q in lesson["quiz"])
        return (f"The student is in Learn mode, reading the lesson '{lesson['title']}'. "
                f"Its end-of-lesson quiz asks: {quiz} Guide them toward quiz answers "
                f"instead of just stating them.")
    if page == "challenge" and ctx.get("challengeId") in CHALLENGES:
        c = CHALLENGES[ctx["challengeId"]]
        if c["format"] == "choice":
            choices = "; ".join(f"({o['id']}) {o['text']}" for o in c["options"])
        else:
            choices = "Clickable features: " + "; ".join(c["targets"].values())
        text = (f"The student is in Challenge mode on a "
                f"{CHALLENGE_DATA['concepts'][c['concept']]} question. "
                f"Drawing: {drawing_description(c['drawing'])}. "
                f"Question: {c['question']} Choices: {choices}. ")
        if ctx.get("answered") is True:
            chosen = ctx.get("selected")
            if c["format"] == "choice":
                chosen_text = next((o["text"] for o in c["options"] if o["id"] == chosen), "unknown")
                right = next(o["text"] for o in c["options"] if o["id"] == c["answer"])
            else:
                chosen_text = c["targets"].get(chosen, "unknown")
                right = c["targets"][c["answer"]]
            text += (f"They have already answered. They chose: {chosen_text}. "
                     f"Correct answer: {right}. Checked explanation: {c['explanation']} "
                     f"Source: {c['source']}")
        else:
            text += ("They have NOT answered yet. Do not reveal, confirm or rule out "
                     "any answer choice. Give hints that point to the relevant idea. "
                     f"The question's own hint is: {c['hint']}")
        return text
    if page == "visualize" and ctx.get("mode") in VIZ_MODES:
        mode = VIZ_MODES[ctx["mode"]]
        try:
            tol = float(ctx.get("tolerance"))
            need = float(ctx.get("smallestZone"))
            numbers = (f" The slider is at {tol:.2f} mm. The example part needs at "
                       f"least {need:.2f} mm, so it currently "
                       f"{'passes' if tol >= need - 1e-9 else 'fails'}.")
        except (TypeError, ValueError):
            numbers = ""
        return f"The student is in the Tolerance Visualizer, on the {mode['title']} example.{numbers}"
    if page == "progress":
        weak = [CHALLENGE_DATA["concepts"][k] for k in ctx.get("weakConcepts", [])
                if k in CHALLENGE_DATA["concepts"]]
        return ("The student is on the Progress page. Concepts that need more practice: "
                + (", ".join(weak) if weak else "none yet") + ".")
    if page == "sources":
        return "The student is on the Sources, credits and privacy page."
    return "The student is on the home page."


TUTOR_INSTRUCTIONS = """You are TutorBot, a friendly GD&T tutor inside the GD&T Trainer website, \
for beginner engineering students and hobbyists.

What this site covers (and nothing else): datums and the datum reference frame, flatness, \
perpendicularity, position, basic dimensions, feature control frames for those controls, \
their tolerance zones, and how to use the site.
The site has exactly four lessons: Datums and the datum reference frame, Flatness, \
Perpendicularity, Position. It also has Challenge mode (12 drawing questions), the \
Visualize mode (flatness, perpendicularity and position sliders) and a Progress page.

Rules:
1. Answer ONLY from the reference material and page context below. They were checked \
against the site's approved sources.
2. If the question is about anything not in the reference material (for example other \
GD&T symbols such as cylindricity, circularity, straightness, profile, runout, parallelism \
or angularity zones, MMC/LMC or bonus tolerance, or a specific standard's clauses), do NOT \
answer it from general knowledge, even if you know the answer. Reply: "That isn't covered \
by this site's approved sources yet, so I can't answer it reliably." Then suggest the \
closest real lesson or mode from the list above, if one fits.
3. Only mention lessons and modes that exist in the list above.
4. Never invent rules, numbers or standard clauses, and never quote ASME or ISO documents.
5. On an unanswered challenge, never reveal, confirm or rule out an answer choice, and \
keep hints no more specific than the question's own hint.
6. Keep answers under 120 words. Plain text only, no markdown.
"""


@app.route("/api/tutor", methods=["POST"])
def tutor():
    """TutorBot chat.

    Request JSON:  {"context": {"page": ..., ...},
                    "messages": [{"role": "user"|"assistant", "content": "..."}]}
    Response JSON: {"ok": true, "reply": "..."} or {"ok": false, "reason": "..."}
    """
    data = request.get_json(silent=True) or {}
    ctx = data.get("context") if isinstance(data.get("context"), dict) else {}

    # Keep only well-formed, short messages; the last one must be the user's.
    messages = []
    for m in (data.get("messages") or [])[-MAX_HISTORY:]:
        if (isinstance(m, dict) and m.get("role") in ("user", "assistant")
                and isinstance(m.get("content"), str) and m["content"].strip()):
            messages.append({"role": m["role"], "content": m["content"].strip()[:MAX_MESSAGE_CHARS]})
    if not messages or messages[-1]["role"] != "user":
        return jsonify(ok=False, reason="no-question"), 400

    if not os.environ.get("OPENAI_API_KEY"):
        return jsonify(ok=False, reason="ai-not-configured"), 503
    if not take_one_request("tutor", client_ip()):
        return jsonify(ok=False, reason="daily-limit"), 429

    instructions = (TUTOR_INSTRUCTIONS
                    + "\nREFERENCE MATERIAL:\n" + lesson_reference()
                    + "\n\nPAGE CONTEXT:\n" + page_context(ctx))
    try:
        from openai import OpenAI

        client = OpenAI(timeout=25, max_retries=1)
        response = client.responses.create(
            model=OPENAI_MODEL,
            instructions=instructions,
            input=messages,
            max_output_tokens=350,
            temperature=0.2,  # steadier, more rule-following answers
        )
        text = (response.output_text or "").strip()
        if not text:
            return jsonify(ok=False, reason="empty-response"), 502
        return jsonify(ok=True, reply=text)
    except Exception as error:
        app.logger.warning("TutorBot request failed: %s", type(error).__name__)
        return jsonify(ok=False, reason="ai-unavailable"), 502


if __name__ == "__main__":
    # Local development: run "python app.py" and open http://127.0.0.1:5000
    app.run(debug=True)
