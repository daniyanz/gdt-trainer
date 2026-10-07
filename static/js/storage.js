/*
 * storage.js: saves and reads the user's progress with localStorage.
 *
 * localStorage keeps small text values in this browser, even after the page
 * is closed. Nothing here is sent to a server. Clearing site data in the
 * browser, or the Reset button on the Progress page, deletes it.
 *
 * The challenge has 12 question SLOTS. Each slot has 3 VERSIONS: the same
 * concept and question type, but a different drawing. Answers are stored per
 * version; the score is worked out per slot.
 *
 * Saved shape:
 * {
 *   lessonsCompleted: { "flatness": true, ... },
 *   attempts: [ { id: "flat-1b", slot: 2, concept: "flatness", correct: true, time: 1700000000000 }, ... ],
 *   active: { "2": "flat-1b", ... }   // which version of each slot is on screen
 * }
 */

const STORAGE_KEY = "gdtTrainerProgress.v1";

function emptyProgress() {
  return { lessonsCompleted: {}, attempts: [], active: {} };
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
      active: data.active && typeof data.active === "object" ? data.active : {},
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

function recordAttempt(challenge, correct) {
  const progress = loadProgress();
  progress.attempts.push({
    id: challenge.id, slot: challenge.slot, concept: challenge.concept, correct: correct, time: Date.now(),
  });
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

// ---------- Question slots and versions ----------

// Group the question bank into slots, in slot order:
// [{ slot: 1, concept, type, versions: [question, question, question] }, ...]
function slotList(challenges) {
  const bySlot = {};
  challenges.forEach(function (c) {
    if (!bySlot[c.slot]) bySlot[c.slot] = { slot: c.slot, concept: c.concept, type: c.type, versions: [] };
    bySlot[c.slot].versions.push(c);
  });
  return Object.keys(bySlot).map(Number).sort(function (a, b) { return a - b; })
    .map(function (s) { return bySlot[s]; });
}

// The version of a slot currently on screen (the first version by default).
function activeVersion(slotInfo) {
  const id = loadProgress().active[slotInfo.slot];
  return slotInfo.versions.find(function (v) { return v.id === id; }) || slotInfo.versions[0];
}

function setActiveVersion(slotNumber, versionId) {
  const progress = loadProgress();
  progress.active[slotNumber] = versionId;
  saveProgress(progress);
}

/*
 * Pick a DIFFERENT version of a slot for a retake: a version never answered
 * before if there is one, otherwise the one answered longest ago.
 */
function pickNewVersion(slotInfo, currentId) {
  const lastAnswered = {};
  loadProgress().attempts.forEach(function (a) { lastAnswered[a.id] = a.time; });
  const others = slotInfo.versions.filter(function (v) { return v.id !== currentId; });
  if (!others.length) return slotInfo.versions[0];
  const unseen = others.filter(function (v) { return !(v.id in lastAnswered); });
  if (unseen.length) return unseen[0];
  return others.slice().sort(function (a, b) { return lastAnswered[a.id] - lastAnswered[b.id]; })[0];
}

/*
 * Work out statistics from the saved attempts.
 *
 * SCORE: a slot counts as right when its MOST RECENT answer, in any version,
 * is right. So after a wrong answer, getting a new version of that question
 * right raises the score (up to 100%). Earlier answers are never deleted:
 * the charts on the Progress page replay them to show the score over time.
 *
 * A concept "needs more practice" while any of its slots is currently wrong.
 */
function computeStats(challenges, conceptNames) {
  const progress = loadProgress();
  const slots = slotList(challenges);
  const slotOf = {};
  challenges.forEach(function (c) { slotOf[c.id] = c.slot; });

  const perSlot = {};
  slots.forEach(function (s) {
    perSlot[s.slot] = { number: s.slot, concept: s.concept, type: s.type, attempts: 0, last: null, lastId: null };
  });
  // Attempts are stored in the order they happened, so the last one wins.
  progress.attempts.forEach(function (a) {
    const s = perSlot[slotOf[a.id]];
    if (!s) return; // ignore attempts for removed questions
    s.attempts += 1;
    s.last = a.correct;
    s.lastId = a.id;
  });

  const perConcept = {};
  Object.keys(conceptNames).forEach(function (key) {
    perConcept[key] = { right: 0, total: 0, wrong: [], unanswered: [] };
  });
  slots.forEach(function (info) {
    const s = perSlot[info.slot];
    const concept = perConcept[info.concept];
    concept.total += 1;
    if (s.last === true) concept.right += 1;
    else if (s.last === false) concept.wrong.push(s.number);
    else concept.unanswered.push(s.number);
  });
  Object.keys(perConcept).forEach(function (key) {
    perConcept[key].needsPractice = perConcept[key].wrong.length > 0;
  });

  const right = slots.filter(function (s) { return perSlot[s.slot].last === true; }).length;
  const answered = slots.filter(function (s) { return perSlot[s.slot].last !== null; }).length;

  return {
    perSlot: perSlot,
    perConcept: perConcept,
    right: right,
    answered: answered,
    totalQuestions: slots.length,
    score: slots.length ? right / slots.length : 0,
    lessonsCompleted: progress.lessonsCompleted,
  };
}
