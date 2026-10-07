/*
 * progress.js: the Progress page.
 *
 * Score = questions whose most recent answer is right, out of all 12.
 * "Needs more practice" lists every concept with a question that is
 * currently wrong, with links to review its lesson and retake that question.
 * The charts (progress-charts.js) show how the score changed over time.
 */

let weakForTutor = [];

// Tells TutorBot (tutorbot.js) which concepts need more practice.
window.getTutorContext = function () {
  return { page: "progress", weakConcepts: weakForTutor, label: "Progress page" };
};

// Link that opens one specific challenge question.
function questionLink(number) {
  return '<a href="challenge.html?q=' + number + '">question ' + number + "</a>";
}

function listWithAnd(items) {
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

async function showProgress() {
  const box = document.getElementById("progress");
  let lessonData, challengeData;
  try {
    [lessonData, challengeData] = await Promise.all([
      fetchJSON("data/lessons.json"),
      fetchJSON("data/challenges.json"),
    ]);
  } catch (error) {
    showLoadError(box, error);
    return;
  }

  const concepts = challengeData.concepts;
  const stats = computeStats(challengeData.challenges, concepts);
  const lessonsDone = lessonData.lessons.filter(function (l) { return stats.lessonsCompleted[l.id]; });
  const lessonTitle = {};
  lessonData.lessons.forEach(function (l) { lessonTitle[l.id] = l.title; });
  const weak = Object.keys(concepts).filter(function (k) { return stats.perConcept[k].needsPractice; });
  weakForTutor = weak;

  // ---- What to do next ----
  const unanswered = [];
  Object.keys(concepts).forEach(function (k) { unanswered.push.apply(unanswered, stats.perConcept[k].unanswered); });
  unanswered.sort(function (a, b) { return a - b; });

  let nextSteps = "";
  if (weak.length) {
    nextSteps += '<div class="feedback bad"><p class="title">Needs more practice</p>' +
      weak.map(function (k) {
        const c = stats.perConcept[k];
        return "<p><b>" + escapeHTML(concepts[k]) + ":</b> review the " +
          '<a href="learn.html#' + k + '">' + escapeHTML(lessonTitle[k] || concepts[k]) + " lesson</a>, " +
          "then retake " + listWithAnd(c.wrong.map(questionLink)) + ".</p>";
      }).join("") + "</div>";
  }
  if (unanswered.length) {
    nextSteps += '<div class="feedback info"><p class="title">Not answered yet</p><p>' +
      (unanswered.length === stats.totalQuestions
        ? 'You haven\'t answered any challenges yet. <a href="challenge.html">Start with question 1</a>.'
        : "Try " + listWithAnd(unanswered.map(questionLink)) + ".") +
      "</p></div>";
  }
  if (!weak.length && !unanswered.length) {
    nextSteps = '<div class="feedback good"><p class="title">✓ All ' + stats.totalQuestions +
      " questions right</p><p>You have a perfect score. Your history is kept in the charts below.</p></div>";
  }

  // ---- Tables ----
  const conceptRows = Object.keys(concepts).map(function (key) {
    const c = stats.perConcept[key];
    return (
      "<tr><td>" + escapeHTML(concepts[key]) + "</td>" +
      "<td>" + c.right + " of " + c.total + "</td>" +
      "<td>" + (c.wrong.length ? "✗ Retake " + listWithAnd(c.wrong.map(questionLink)) : "–") + "</td></tr>"
    );
  }).join("");

  const questionRows = slotList(challengeData.challenges).map(function (info) {
    const s = stats.perSlot[info.slot];
    const latest = s.last === null ? "Not answered" : (s.last ? "✓ right" : "✗ wrong");
    return (
      '<tr><td><a href="challenge.html?q=' + info.slot + '">' + info.slot + "</a></td>" +
      "<td>" + escapeHTML(concepts[info.concept]) + "</td>" +
      "<td>" + escapeHTML(challengeData.types[info.type]) + "</td>" +
      "<td>" + latest + "</td><td>" + s.attempts + "</td></tr>"
    );
  }).join("");

  box.innerHTML =
    '<div class="stat-grid">' +
      '<div class="stat"><b>' + percent(stats.score) + "</b><span>score: " + stats.right + " of " +
        stats.totalQuestions + " questions right</span></div>" +
      '<div class="stat"><b>' + stats.answered + " / " + stats.totalQuestions + "</b><span>questions answered</span></div>" +
      '<div class="stat"><b>' + lessonsDone.length + " / " + lessonData.lessons.length + "</b><span>lessons completed</span></div>" +
    "</div>" +

    "<h2>What to do next</h2>" + nextSteps +

    "<h2>Progress over time</h2>" +
    '<div id="progress-charts"></div>' +

    "<h2>By concept</h2>" +
    '<div class="table-wrap"><table><thead><tr><th>Concept</th><th>Right now</th><th>To retake</th></tr></thead><tbody>' +
    conceptRows + "</tbody></table></div>" +

    "<h2>Lessons</h2>" +
    "<ul>" + lessonData.lessons.map(function (l) {
      return "<li>" + (stats.lessonsCompleted[l.id] ? "✓ " : "○ ") +
        '<a href="learn.html#' + l.id + '">' + escapeHTML(l.title) + "</a>" +
        (stats.lessonsCompleted[l.id] ? " (completed)" : " (not completed)") + "</li>";
    }).join("") + "</ul>" +

    "<h2>Every question</h2>" +
    '<p class="source-line">Each question has 3 versions with different drawings. Retaking a question you got wrong gives you a new version.</p>' +
    '<div class="table-wrap"><table><thead><tr><th>#</th><th>Concept</th><th>Type</th><th>Latest answer</th><th>Times answered</th></tr></thead><tbody>' +
    questionRows + "</tbody></table></div>" +

    "<h2>Reset</h2>" +
    "<p>This deletes all saved lessons, answers and history in this browser.</p>" +
    '<button type="button" class="btn danger" id="reset">Reset all progress</button>';

  // Charts of the score over time (progress-charts.js).
  renderProgressCharts(document.getElementById("progress-charts"), challengeData);

  document.getElementById("reset").addEventListener("click", function () {
    if (window.confirm("Delete all your saved progress and history? This cannot be undone.")) {
      resetProgress();
      showProgress();
    }
  });
}

showProgress();
