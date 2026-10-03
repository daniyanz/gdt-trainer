/*
 * learn.js: Learn mode.
 * Shows one lesson at a time. The lesson ID lives in the address bar
 * (for example learn.html#flatness), so each lesson can be linked directly.
 * Answering every quiz question correctly marks the lesson complete.
 * Quiz answers are NOT counted toward concept accuracy.
 */

let lessons = [];

async function startLearn() {
  const article = document.getElementById("lesson");
  try {
    const data = await fetchJSON("data/lessons.json");
    lessons = data.lessons;
    window.addEventListener("hashchange", showCurrentLesson);
    showCurrentLesson();
  } catch (error) {
    showLoadError(article, error);
  }
}

function currentLessonIndex() {
  const id = window.location.hash.replace("#", "");
  const index = lessons.findIndex(function (l) { return l.id === id; });
  return index >= 0 ? index : 0;
}

function renderLessonList(activeIndex) {
  const done = loadProgress().lessonsCompleted;
  const list = document.getElementById("lesson-list");
  list.innerHTML = lessons.map(function (lesson, i) {
    return (
      '<li><a href="#' + lesson.id + '"' + (i === activeIndex ? ' aria-current="true"' : "") + ">" +
      "<span>" + (i + 1) + ". " + escapeHTML(lesson.title) + "</span>" +
      (done[lesson.id] ? '<span class="done">✓ done</span>' : "") +
      "</a></li>"
    );
  }).join("");
}

function showCurrentLesson() {
  const index = currentLessonIndex();
  const lesson = lessons[index];
  renderLessonList(index);

  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const completed = loadProgress().lessonsCompleted[lesson.id];

  const article = document.getElementById("lesson");
  article.innerHTML =
    '<div class="lesson-head">' +
      '<img src="' + lesson.symbolSvg + '" alt="' + escapeHTML(lesson.symbolName) + '">' +
      "<div><h2 style=\"margin:0\">" + escapeHTML(lesson.title) + "</h2>" +
      '<p class="symbol-name">' + escapeHTML(lesson.symbolName) + "</p></div>" +
    "</div>" +
    lesson.explanation.map(function (p) { return "<p>" + escapeHTML(p) + "</p>"; }).join("") +
    '<div class="drawing"><img src="' + lesson.diagram + '" alt="' + escapeHTML(lesson.diagramAlt) + '"></div>' +
    "<h3>Common mistake</h3>" +
    '<p class="mistake">' + escapeHTML(lesson.commonMistake) + "</p>" +
    '<p class="source-line">Based on: ' + escapeHTML(lesson.sources) + ' <a href="sources.html">(sources)</a></p>' +
    "<h3>Quick quiz</h3>" +
    '<p class="source-line">Answer both questions correctly to complete the lesson. Quiz answers do not affect your challenge statistics.</p>' +
    '<div id="quiz"></div>' +
    '<div id="lesson-status">' + (completed ? completeMessage() : "") + "</div>" +
    '<div class="btn-row">' +
      (prev ? '<a class="btn secondary" href="#' + prev.id + '">← ' + escapeHTML(prev.title) + "</a>" : "") +
      (next ? '<a class="btn" href="#' + next.id + '">Next: ' + escapeHTML(next.title) + " →</a>"
            : '<a class="btn" href="challenge.html">Go to challenges →</a>') +
    "</div>";

  renderQuiz(lesson);
  window.scrollTo(0, 0);
}

function completeMessage() {
  return '<div class="feedback good"><p class="title">✓ Lesson complete</p></div>';
}

function renderQuiz(lesson) {
  const quiz = document.getElementById("quiz");
  const solved = lesson.quiz.map(function () { return false; });

  lesson.quiz.forEach(function (q, qi) {
    const block = document.createElement("div");
    block.className = "quiz-question";
    block.innerHTML =
      "<p><b>" + (qi + 1) + ". " + escapeHTML(q.question) + "</b></p>" +
      '<div class="options">' +
      q.options.map(function (text, oi) {
        return '<button type="button" class="option" data-index="' + oi + '">' + escapeHTML(text) + "</button>";
      }).join("") +
      "</div><div class=\"quiz-feedback\"></div>";
    quiz.appendChild(block);

    block.querySelectorAll(".option").forEach(function (button) {
      button.addEventListener("click", function () {
        const chosen = Number(button.dataset.index);
        const right = chosen === q.answer;
        const feedback = block.querySelector(".quiz-feedback");
        block.querySelectorAll(".option").forEach(function (b) { b.classList.remove("wrong"); });
        if (right) {
          button.classList.add("correct");
          block.querySelectorAll(".option").forEach(function (b) { b.disabled = true; });
          feedback.innerHTML = '<div class="feedback good"><p class="title">✓ Correct</p><p>' + escapeHTML(q.explanation) + "</p></div>";
          solved[qi] = true;
        } else {
          // Wrong quiz answers can be retried; they are not recorded anywhere.
          button.classList.add("wrong");
          feedback.innerHTML = '<div class="feedback bad"><p class="title">✗ Not quite. Try again.</p></div>';
        }
        if (solved.every(Boolean)) {
          markLessonComplete(lesson.id);
          document.getElementById("lesson-status").innerHTML = completeMessage();
          renderLessonList(currentLessonIndex());
        }
      });
    });
  });
}

startLearn();
