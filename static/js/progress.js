/*
 * progress.js: the Progress page.
 * Reads the saved attempts (storage.js) and shows the overall score,
 * per-concept performance, completed lessons, concepts that need more
 * practice, a per-challenge score list, and a Reset button.
 */

let weakForTutor = [];

// Tells TutorBot (tutorbot.js) which concepts need more practice.
window.getTutorContext = function () {
  return { page: "progress", weakConcepts: weakForTutor, label: "Progress page" };
};

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
  const weak = Object.keys(concepts).filter(function (k) { return stats.perConcept[k].status === "needs-practice"; });
  weakForTutor = weak;

  // How many challenge questions exist for each concept.
  const questionsPerConcept = {};
  Object.keys(concepts).forEach(function (k) { questionsPerConcept[k] = 0; });
  challengeData.challenges.forEach(function (q) { questionsPerConcept[q.concept] += 1; });

  const conceptRows = Object.keys(concepts).map(function (key) {
    const c = stats.perConcept[key];
    return (
      "<tr><td>" + escapeHTML(concepts[key]) + "</td>" +
      "<td>" + c.correct + " / " + c.attempts + "</td>" +
      "<td>" + (c.attempts ? percent(c.accuracy) : "–") + "</td>" +
      "<td>" + c.distinctSolved + " of " + questionsPerConcept[key] + "</td>" +
      '<td><span class="status ' + c.status + '">' + STATUS_LABELS[c.status] + "</span></td></tr>"
    );
  }).join("");

  const questionRows = challengeData.challenges.map(function (q, i) {
    const s = stats.perQuestion[q.id];
    const last = s.last === null ? "–" : (s.last ? "✓ correct" : "✗ wrong");
    return (
      "<tr><td>" + (i + 1) + "</td><td>" + escapeHTML(concepts[q.concept]) + "</td>" +
      "<td>" + escapeHTML(challengeData.types[q.type]) + "</td>" +
      "<td>" + s.correct + " / " + s.attempts + "</td><td>" + last + "</td></tr>"
    );
  }).join("");

  box.innerHTML =
    '<div class="stat-grid">' +
      '<div class="stat"><b>' + stats.solvedQuestions + " / " + stats.totalQuestions + "</b><span>challenges solved at least once</span></div>" +
      '<div class="stat"><b>' + (stats.totalAttempts ? percent(stats.totalCorrect / stats.totalAttempts) : "–") +
        "</b><span>overall accuracy (" + stats.totalCorrect + " of " + stats.totalAttempts + " answers)</span></div>" +
      '<div class="stat"><b>' + lessonsDone.length + " / " + lessonData.lessons.length + "</b><span>lessons completed</span></div>" +
    "</div>" +

    "<h2>Needs more practice</h2>" +
    (weak.length
      ? '<div class="feedback bad"><p>' + weak.map(function (k) { return "<b>" + escapeHTML(concepts[k]) + "</b>"; }).join(", ") +
        '. Review the <a href="learn.html#' + weak[0] + '">lesson</a>, then try those challenges again.</p></div>'
      : '<p>Nothing yet. A concept is listed here after at least 3 attempts with under 70% correct.</p>') +

    "<h2>By concept</h2>" +
    '<div class="table-wrap"><table><thead><tr><th>Concept</th><th>Correct / attempts</th><th>Accuracy</th>' +
    "<th>Different questions solved</th><th>Status</th></tr></thead><tbody>" + conceptRows + "</tbody></table></div>" +
    '<p class="source-line">Learned = 2 different questions solved. Needs more practice = at least 3 attempts and under 70% correct.</p>' +

    "<h2>Lessons</h2>" +
    "<ul>" + lessonData.lessons.map(function (l) {
      return "<li>" + (stats.lessonsCompleted[l.id] ? "✓ " : "○ ") +
        '<a href="learn.html#' + l.id + '">' + escapeHTML(l.title) + "</a>" +
        (stats.lessonsCompleted[l.id] ? " (completed)" : " (not completed)") + "</li>";
    }).join("") + "</ul>" +

    "<h2>Score per challenge</h2>" +
    '<div class="table-wrap"><table><thead><tr><th>#</th><th>Concept</th><th>Type</th><th>Correct / attempts</th><th>Last answer</th></tr></thead><tbody>' +
    questionRows + "</tbody></table></div>" +

    "<h2>Reset</h2>" +
    "<p>This deletes all saved lessons and challenge answers in this browser.</p>" +
    '<button type="button" class="btn danger" id="reset">Reset all progress</button>';

  document.getElementById("reset").addEventListener("click", function () {
    if (window.confirm("Delete all your saved progress? This cannot be undone.")) {
      resetProgress();
      showProgress();
    }
  });
}

showProgress();
