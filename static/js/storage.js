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
 * FIRST TRIES ONLY: after a wrong answer the site reveals the correct one,
 * so a later correct answer to the same question could just be memory.
 * Concept statistics therefore use only the FIRST answer to each question.
 * Later answers are kept as practice: they show in the per-challenge table
 * but do not change concept status. Reset starts everything fresh.
 *
 * Status rules (requirements document, Section 3.4):
 *  - Only challenge answers count (lesson quizzes do not).
 *  - Learned: first-try correct on at least 2 DIFFERENT questions.
 *  - Needs more practice: at least 3 questions tried and under 70% first-try correct.
 *  - In progress: tried, but neither of the above.
 *  - Not started: nothing tried.
 *  - If both Learned and Needs more practice apply, show Needs more practice.
 */
function computeStats(challenges, conceptNames) {
  const progress = loadProgress();
  const perConcept = {};
  Object.keys(conceptNames).forEach(function (concept) {
    perConcept[concept] = { attempts: 0, correct: 0 };
  });

  const perQuestion = {};
  challenges.forEach(function (c) {
    perQuestion[c.id] = { attempts: 0, correct: 0, last: null, first: null };
  });

  // Attempts are stored in the order they happened.
  progress.attempts.forEach(function (a) {
    const question = perQuestion[a.id];
    const concept = perConcept[a.concept];
    if (!question || !concept) return; // ignore attempts for removed questions
    const isFirstTry = question.attempts === 0;
    question.attempts += 1;
    question.last = a.correct;
    if (a.correct) question.correct += 1;
    if (isFirstTry) {
      question.first = a.correct;
      concept.attempts += 1;               // one first try per question
      if (a.correct) concept.correct += 1;
    }
  });

  Object.keys(perConcept).forEach(function (key) {
    const c = perConcept[key];
    c.accuracy = c.attempts ? c.correct / c.attempts : 0;
    c.distinctSolved = c.correct; // first-try correct answers are all different questions
    const learned = c.distinctSolved >= 2;
    const needsPractice = c.attempts >= 3 && c.accuracy < 0.7;
    if (c.attempts === 0) c.status = "not-started";
    else if (needsPractice) c.status = "needs-practice";
    else if (learned) c.status = "learned";
    else c.status = "in-progress";
  });

  const solvedQuestions = challenges.filter(function (c) {
    return perQuestion[c.id].correct > 0;
  }).length;
  const firstTries = challenges.filter(function (c) { return perQuestion[c.id].first !== null; });
  const firstTryCorrect = firstTries.filter(function (c) { return perQuestion[c.id].first; }).length;

  return {
    perConcept: perConcept,
    perQuestion: perQuestion,
    solvedQuestions: solvedQuestions,
    totalQuestions: challenges.length,
    firstTries: firstTries.length,
    firstTryCorrect: firstTryCorrect,
    lessonsCompleted: progress.lessonsCompleted,
  };
}

const STATUS_LABELS = {
  "learned": "Learned",
  "needs-practice": "Needs more practice",
  "in-progress": "In progress",
  "not-started": "Not started",
};
