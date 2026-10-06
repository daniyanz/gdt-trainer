/*
 * storage.js: saves and reads the user's progress with localStorage.
 *
 * localStorage keeps small text values in this browser, even after the page
 * is closed. Nothing here is sent to a server. Clearing site data in the
 * browser, or the Reset button on the Progress page, deletes it.
 *
 * Saved shape:
 * {
 *   lessonsCompleted: { "flatness": true, ... },
 *   attempts: [ { id: "flat-1", concept: "flatness", correct: true, time: 1700000000000 }, ... ]
 * }
 */

const STORAGE_KEY = "gdtTrainerProgress.v1";

function emptyProgress() {
  return { lessonsCompleted: {}, attempts: [] };
}

// Read progress. Falls back to empty progress if storage is blocked
// (for example, some private browsing modes) or the saved text is damaged.
function loadProgress() {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return emptyProgress();
    const data = JSON.parse(text);
    return {
      lessonsCompleted: data.lessonsCompleted || {},
      attempts: Array.isArray(data.attempts) ? data.attempts : [],
    };
  } catch (error) {
    return emptyProgress();
  }
}

// Write progress. If storage is unavailable the site still works;
// progress just will not be remembered.
function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn("Progress could not be saved in this browser.");
  }
}

function recordAttempt(challengeId, concept, correct) {
  const progress = loadProgress();
  progress.attempts.push({ id: challengeId, concept: concept, correct: correct, time: Date.now() });
  saveProgress(progress);
}

function markLessonComplete(lessonId) {
  const progress = loadProgress();
  progress.lessonsCompleted[lessonId] = true;
  saveProgress(progress);
}

function resetProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    /* nothing to remove */
  }
}

/*
 * Work out statistics from the saved attempts.
 *
 * SCORE: a question counts as right when its MOST RECENT answer is right.
 * So retaking a question you got wrong, and getting it right, raises your
 * score (up to 100%). Earlier answers are never deleted: the charts on the
 * Progress page replay them to show how the score changed over time.
 *
 * A concept "needs more practice" while any of its questions is currently wrong.
 */
function computeStats(challenges, conceptNames) {
  const progress = loadProgress();

  const perQuestion = {};
  challenges.forEach(function (c, i) {
    perQuestion[c.id] = { number: i + 1, concept: c.concept, attempts: 0, last: null };
  });
  // Attempts are stored in the order they happened, so the last one wins.
  progress.attempts.forEach(function (a) {
    const q = perQuestion[a.id];
    if (!q) return; // ignore attempts for removed questions
    q.attempts += 1;
    q.last = a.correct;
  });

  const perConcept = {};
  Object.keys(conceptNames).forEach(function (key) {
    perConcept[key] = { right: 0, total: 0, wrong: [], unanswered: [] };
  });
  challenges.forEach(function (c) {
    const q = perQuestion[c.id];
    const concept = perConcept[c.concept];
    concept.total += 1;
    if (q.last === true) concept.right += 1;
    else if (q.last === false) concept.wrong.push(q.number);
    else concept.unanswered.push(q.number);
  });
  Object.keys(perConcept).forEach(function (key) {
    perConcept[key].needsPractice = perConcept[key].wrong.length > 0;
  });

  const right = challenges.filter(function (c) { return perQuestion[c.id].last === true; }).length;
  const answered = challenges.filter(function (c) { return perQuestion[c.id].last !== null; }).length;

  return {
    perQuestion: perQuestion,
    perConcept: perConcept,
    right: right,
    answered: answered,
    totalQuestions: challenges.length,
    score: challenges.length ? right / challenges.length : 0,
    lessonsCompleted: progress.lessonsCompleted,
  };
}
