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
 * Status rules come from the requirements document, Section 3.4:
 *  - Only challenge answers count (lesson quizzes do not).
 *  - Learned: correct on at least 2 DIFFERENT questions for the concept.
 *  - Needs more practice: at least 3 attempts and under 70% correct.
 *  - In progress: attempted, but neither of the above.
 *  - Not started: no attempts.
 *  - If both Learned and Needs more practice apply, show Needs more practice.
 */
function computeStats(challenges, conceptNames) {
  const progress = loadProgress();
  const perConcept = {};
  Object.keys(conceptNames).forEach(function (concept) {
    perConcept[concept] = { attempts: 0, correct: 0, solvedIds: new Set() };
  });

  const perQuestion = {};
  challenges.forEach(function (c) {
    perQuestion[c.id] = { attempts: 0, correct: 0, last: null };
  });

  progress.attempts.forEach(function (a) {
    const concept = perConcept[a.concept];
    const question = perQuestion[a.id];
    if (!concept || !question) return; // ignore attempts for removed questions
    concept.attempts += 1;
    question.attempts += 1;
    question.last = a.correct;
    if (a.correct) {
      concept.correct += 1;
      concept.solvedIds.add(a.id); // a Set counts each question only once
      question.correct += 1;
    }
  });

  Object.keys(perConcept).forEach(function (key) {
    const c = perConcept[key];
    c.accuracy = c.attempts ? c.correct / c.attempts : 0;
    c.distinctSolved = c.solvedIds.size;
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
  const totalAttempts = progress.attempts.filter(function (a) { return perQuestion[a.id]; });
  const totalCorrect = totalAttempts.filter(function (a) { return a.correct; }).length;

  return {
    perConcept: perConcept,
    perQuestion: perQuestion,
    solvedQuestions: solvedQuestions,
    totalQuestions: challenges.length,
    totalAttempts: totalAttempts.length,
    totalCorrect: totalCorrect,
    lessonsCompleted: progress.lessonsCompleted,
  };
}

const STATUS_LABELS = {
  "learned": "Learned",
  "needs-practice": "Needs more practice",
  "in-progress": "In progress",
  "not-started": "Not started",
};
