"""GD&T Trainer: Flask server.

The server does two jobs:
1. Serves the website files in the "static" folder (HTML, CSS, JS, drawings).
2. Offers one API, POST /api/explain, which asks OpenAI to explain a wrong
   challenge answer. The OpenAI key stays on the server and never reaches
   the browser.
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
app.config["MAX_CONTENT_LENGTH"] = 4 * 1024  # explain requests are tiny

# A small, low-cost model. Can be changed with the OPENAI_MODEL variable.
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
DAILY_LIMIT_PER_IP = 20

# The challenge content is loaded once, so the server decides what the
# question and correct answer are. The browser only sends IDs, which keeps
# people from sending their own text to OpenAI through this site.
CHALLENGES_PATH = os.path.join(app.static_folder, "data", "challenges.json")
with open(CHALLENGES_PATH, encoding="utf-8") as f:
    CHALLENGES = {c["id"]: c for c in json.load(f)["challenges"]}

# ---- Rate limit: 20 AI explanations per IP address per day ----
# Stored in memory, so it resets when the server restarts. That is accepted
# in the requirements; the $5 OpenAI budget is the real hard cap.
_usage = {}  # ip -> (date, count)
_usage_lock = threading.Lock()


def client_ip():
    """Render puts the visitor's real IP first in X-Forwarded-For."""
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def take_one_request(ip):
    """Count one request for this IP. Returns False if over today's limit."""
    today = date.today()
    with _usage_lock:
        day, count = _usage.get(ip, (today, 0))
        if day != today:
            day, count = today, 0
        if count >= DAILY_LIMIT_PER_IP:
            return False
        _usage[ip] = (day, count + 1)
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

    if not take_one_request(client_ip()):
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


if __name__ == "__main__":
    # Local development: run "python app.py" and open http://127.0.0.1:5000
    app.run(debug=True)
