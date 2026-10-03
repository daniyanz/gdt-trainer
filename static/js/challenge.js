/*
 * challenge.js: Drawing Challenge mode.
 *
 * Two answer formats, both described in data/challenges.json:
 *  - "choice": pick one option, then press Check.
 *  - "click":  click a feature on the drawing, then press Check.
 *
 * Every Check is saved as an attempt (see storage.js). After a wrong
 * answer the user can ask the server for an AI explanation; if that fails,
 * the checked, pre-written explanation is what they keep.
 */

let data = null;       // contents of challenges.json
let current = 0;       // index of the question on screen
let selected = null;   // the answer ID the user has picked
let answered = false;  // true once Check has been pressed

async function startChallenges() {
  const box = document.getElementById("challenge");
  try {
    data = await fetchJSON("data/challenges.json");
    showQuestion(0);
  } catch (error) {
    showLoadError(box, error);
  }
}

// Numbered buttons for jumping between questions.
function renderNav() {
  const stats = computeStats(data.challenges, data.concepts);
  const nav = document.getElementById("question-nav");
  nav.innerHTML = data.challenges.map(function (c, i) {
    const solved = stats.perQuestion[c.id].correct > 0;
    return (
      '<button type="button" data-index="' + i + '"' +
      (i === current ? ' aria-current="true"' : "") +
      (solved ? ' class="solved"' : "") +
      ' aria-label="Question ' + (i + 1) + (solved ? ", solved before" : "") + '">' +
      (i + 1) + "</button>"
    );
  }).join("");
  nav.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { showQuestion(Number(b.dataset.index)); });
  });
}

async function showQuestion(index) {
  current = index;
  selected = null;
  answered = false;
  renderNav();

  const c = data.challenges[index];
  const box = document.getElementById("challenge");
  const answerArea = c.format === "choice"
    ? '<div class="options" role="radiogroup" aria-label="Answer options">' +
        c.options.map(function (o) {
          return '<button type="button" class="option" role="radio" aria-checked="false" data-id="' + o.id + '">' +
            escapeHTML(o.text) + "</button>";
        }).join("") +
      "</div>"
    : '<p>Click a feature on the drawing, or press Tab to move between features and Enter to choose.</p>' +
      '<p class="selection-note" id="selection-note" aria-live="polite">Selected: nothing yet</p>';

  box.innerHTML =
    '<div class="challenge-layout">' +
      '<div class="drawing" id="drawing">Loading drawing…</div>' +
      '<section class="card">' +
        '<p><span class="tag">' + escapeHTML(data.concepts[c.concept]) + "</span>" +
        '<span class="tag">' + escapeHTML(data.types[c.type]) + "</span></p>" +
        "<h2 style=\"margin-top:6px\">Question " + (index + 1) + " of " + data.challenges.length + "</h2>" +
        "<p><b>" + escapeHTML(c.question) + "</b></p>" +
        answerArea +
        '<div class="btn-row">' +
          '<button type="button" class="btn" id="check" disabled>Check answer</button>' +
          '<button type="button" class="btn secondary" id="hint-btn">Show hint</button>' +
        "</div>" +
        '<div id="hint" class="feedback info" hidden><p class="title">Hint</p><p>' + escapeHTML(c.hint) + "</p></div>" +
        '<div id="result" aria-live="polite"></div>' +
        '<div class="btn-row" id="next-row" hidden>' +
          (index < data.challenges.length - 1
            ? '<button type="button" class="btn" id="next">Next question →</button>'
            : '<a class="btn" href="progress.html">See your progress →</a>') +
        "</div>" +
      "</section>" +
    "</div>";

  document.getElementById("hint-btn").addEventListener("click", function () {
    document.getElementById("hint").hidden = false;
  });
  document.getElementById("check").addEventListener("click", checkAnswer);
  const next = document.getElementById("next");
  if (next) next.addEventListener("click", function () { showQuestion(current + 1); });

  if (c.format === "choice") {
    box.querySelectorAll(".option").forEach(function (button) {
      button.addEventListener("click", function () { choose(button.dataset.id); });
    });
  }

  // Load the drawing straight into the page so its features can be clicked.
  const drawing = document.getElementById("drawing");
  try {
    await loadSvgInto(drawing, c.drawing);
    if (c.format === "click") wireClickTargets(drawing, c);
  } catch (error) {
    showLoadError(drawing, error);
  }
}

/*
 * SVG interaction: each clickable feature in the drawing is an invisible,
 * thick line or circle with class="target" and data-target="<id>".
 * Clicking it (or pressing Enter/Space while it has keyboard focus)
 * selects it, and CSS paints the selected one blue.
 */
function wireClickTargets(drawing, c) {
  drawing.querySelectorAll(".target").forEach(function (target) {
    const pick = function () { if (!answered) choose(target.dataset.target); };
    target.addEventListener("click", pick);
    target.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        pick();
      }
    });
  });
}

// Record the user's pick and show it clearly, in colour AND in words.
function choose(answerId) {
  if (answered) return;
  selected = answerId;
  const c = data.challenges[current];
  if (c.format === "choice") {
    document.querySelectorAll("#challenge .option").forEach(function (b) {
      const isPicked = b.dataset.id === answerId;
      b.classList.toggle("selected", isPicked);
      b.setAttribute("aria-checked", isPicked ? "true" : "false");
    });
  } else {
    document.querySelectorAll("#drawing .target").forEach(function (t) {
      t.classList.toggle("selected", t.dataset.target === answerId);
    });
    document.getElementById("selection-note").textContent = "Selected: " + c.targets[answerId];
  }
  document.getElementById("check").disabled = false;
}

function labelFor(c, answerId) {
  if (c.format === "choice") {
    const option = c.options.find(function (o) { return o.id === answerId; });
    return option ? option.text : answerId;
  }
  return c.targets[answerId] || answerId;
}

function checkAnswer() {
  if (answered || selected === null) return;
  answered = true;
  const c = data.challenges[current];
  const correct = selected === c.answer;
  recordAttempt(c.id, c.concept, correct);

  // Lock the answers and mark the right one (and the wrong pick, if any).
  document.getElementById("check").disabled = true;
  if (c.format === "choice") {
    document.querySelectorAll("#challenge .option").forEach(function (b) {
      b.disabled = true;
      if (b.dataset.id === c.answer) b.classList.add("correct");
      else if (b.dataset.id === selected) b.classList.add("wrong");
    });
  } else {
    document.getElementById("drawing").classList.add("locked");
    document.querySelectorAll("#drawing .target").forEach(function (t) {
      t.classList.remove("selected");
      if (t.dataset.target === c.answer) t.classList.add("is-correct");
      else if (t.dataset.target === selected) t.classList.add("is-wrong");
    });
  }

  const result = document.getElementById("result");
  if (correct) {
    result.innerHTML =
      '<div class="feedback good"><p class="title">✓ Correct</p>' +
      "<p>" + escapeHTML(c.explanation) + "</p>" +
      '<p class="source-line">Source: ' + escapeHTML(c.source) + "</p></div>";
  } else {
    result.innerHTML =
      '<div class="feedback bad"><p class="title">✗ Not quite</p>' +
      "<p>You chose: " + escapeHTML(labelFor(c, selected)) + "</p>" +
      "<p>Correct answer: <b>" + escapeHTML(labelFor(c, c.answer)) + "</b></p>" +
      "<p>" + escapeHTML(c.explanation) + "</p>" +
      '<p class="source-line">Source: ' + escapeHTML(c.source) + "</p></div>" +
      '<div class="btn-row"><button type="button" class="btn secondary" id="ai-btn">Explain my mistake (AI)</button></div>' +
      '<div id="ai-result" aria-live="polite"></div>';
    document.getElementById("ai-btn").addEventListener("click", function () {
      askAI(c.id, selected);
    });
  }
  document.getElementById("next-row").hidden = false;
  renderNav();
}

/*
 * API call: ask our own server (not OpenAI directly) for an explanation.
 * The server holds the OpenAI key, limits each visitor to 20 requests a
 * day, and tells us when it cannot answer. In that case we fall back to
 * the pre-written explanation already shown above.
 */
async function askAI(challengeId, answerId) {
  const button = document.getElementById("ai-btn");
  const out = document.getElementById("ai-result");
  button.disabled = true;
  out.innerHTML = '<div class="feedback info"><p>Asking the AI tutor… (the first request after a quiet period can take up to a minute)</p></div>';

  const fallbackMessages = {
    "daily-limit": "You have used today's 20 AI explanations.",
    "ai-not-configured": "AI explanations are not set up on this server.",
  };

  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: challengeId, answer: answerId }),
    });
    const body = await response.json();
    if (body.ok) {
      out.innerHTML =
        '<div class="feedback info"><p class="title">AI tutor</p>' +
        '<p class="ai-box">' + escapeHTML(body.explanation) + "</p>" +
        '<p class="source-line">AI-generated and may contain mistakes. The explanation above is the checked one.</p></div>';
      return;
    }
    showAIFallback(out, fallbackMessages[body.reason] || "The AI tutor is unavailable right now.");
  } catch (error) {
    // Network problem, server asleep or a non-JSON reply.
    showAIFallback(out, "The AI tutor is unavailable right now.");
  }
}

// Fallback when the AI cannot answer: the checked explanation stays on screen.
function showAIFallback(out, reason) {
  out.innerHTML =
    '<div class="feedback warn"><p class="title">No AI explanation this time</p>' +
    "<p>" + escapeHTML(reason) + " Please use the checked explanation above.</p></div>";
}

startChallenges();
