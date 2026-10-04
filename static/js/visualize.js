/*
 * visualize.js: Tolerance Visualization mode.
 *
 * Each example part has a fixed, made-up error. The slider sets the
 * tolerance, and the drawing is rebuilt as SVG every time the slider moves
 * (no page reload). The part passes when its error fits inside the zone.
 *
 * Errors are tiny in real life, so drawings exaggerate them: 1 mm of error
 * is drawn as SCALE pixels.
 */

const SCALE = 140; // pixels per millimetre of error (exaggerated on purpose)
const SVG_NS = "http://www.w3.org/2000/svg";

let modes = [];
let activeMode = null;
let lastResult = null; // latest drawing result, shared with TutorBot
const slider = document.getElementById("tolerance");

// ---------- Tiny SVG helpers ----------
function el(name, attrs, text) {
  const node = document.createElementNS(SVG_NS, name);
  Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
  if (text !== undefined) node.textContent = text;
  return node;
}
function newSvg(label) {
  const svg = el("svg", { viewBox: "0 0 640 330", role: "img", "aria-label": label });
  return svg;
}
function pointsAttr(points) {
  return points.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
}
const INK = "#1d2733";
const ZONE = "#b42318";
function zoneLine(x1, y1, x2, y2) {
  return el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: ZONE, "stroke-width": 2, "stroke-dasharray": "7 5" });
}
function label(x, y, text, anchor) {
  return el("text", { x: x, y: y, "font-size": 14, fill: "#4f5d6d", "text-anchor": anchor || "middle", "font-family": "Arial, sans-serif" }, text);
}
function datumSymbol(x, y, letter) {
  // Filled triangle on the surface, stem, and a boxed letter below.
  const g = el("g", {});
  g.appendChild(el("polygon", { points: (x - 8) + "," + y + " " + (x + 8) + "," + y + " " + x + "," + (y + 12), fill: INK }));
  g.appendChild(el("line", { x1: x, y1: y + 12, x2: x, y2: y + 22, stroke: INK }));
  g.appendChild(el("rect", { x: x - 12, y: y + 22, width: 24, height: 24, fill: "#fff", stroke: INK }));
  g.appendChild(el("text", { x: x, y: y + 39, "font-size": 15, "text-anchor": "middle", fill: INK, "font-family": "Arial, sans-serif" }, letter));
  return g;
}
function round2(value) { return Math.round(value * 100) / 100; }
function mm(value) { return value.toFixed(2) + " mm"; }

// ---------- Example 1: flatness ----------
// The top surface's deviation from a perfect plane, in mm, along its length t (0 to 1).
function flatSurface(t) {
  return 0.16 * Math.sin(2 * Math.PI * 1.2 * t + 0.3) + 0.05 * Math.sin(2 * Math.PI * 3.4 * t) + 0.08 * t;
}

// Flatness has no datum, so the two zone lines may tilt and shift.
// Try many tilts and keep the narrowest band that holds the whole surface.
function bestFlatnessZone(samples) {
  let best = null;
  for (let k = -500; k <= 500; k++) {
    const slope = k / 1000;
    const rest = samples.map(function (s) { return s.dev - slope * s.t; });
    const width = Math.max.apply(null, rest) - Math.min.apply(null, rest);
    if (!best || width < best.width) {
      best = { width: width, slope: slope, mid: (Math.max.apply(null, rest) + Math.min.apply(null, rest)) / 2 };
    }
  }
  return best;
}

function drawFlatness(tol) {
  const x0 = 90, x1 = 550, y0 = 150, bottom = 290;
  const samples = [];
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    samples.push({ t: t, dev: flatSurface(t) });
  }
  const zone = bestFlatnessZone(samples);
  const error = round2(zone.width);
  const toX = function (t) { return x0 + (x1 - x0) * t; };
  const toY = function (dev) { return y0 - dev * SCALE; };

  const svg = newSvg("Side view of a wavy top surface between two dashed zone lines");
  const outline = samples.map(function (s) { return [toX(s.t), toY(s.dev)]; });
  outline.push([x1, bottom], [x0, bottom]);
  svg.appendChild(el("polygon", { points: pointsAttr(outline), fill: "#e7e9e6", stroke: INK, "stroke-width": 2 }));

  // Zone lines: centre line is mid + slope*t, then +/- half the tolerance.
  [-tol / 2, tol / 2].forEach(function (offset) {
    const ya = toY(zone.mid + offset + zone.slope * -0.05);
    const yb = toY(zone.mid + offset + zone.slope * 1.05);
    svg.appendChild(zoneLine(toX(-0.05), ya, toX(1.05), yb));
  });

  // Mark points that stick out of the zone.
  samples.forEach(function (s, i) {
    const fromCentre = s.dev - (zone.mid + zone.slope * s.t);
    if (i % 3 === 0 && Math.abs(fromCentre) > tol / 2 + 1e-9) {
      svg.appendChild(el("circle", { cx: toX(s.t), cy: toY(s.dev), r: 4, fill: ZONE }));
    }
  });
  svg.appendChild(label(320, 318, "Red dots: parts of the surface outside the zone"));
  return { svg: svg, error: error, errorLabel: "Smallest zone that fits this surface" };
}

// ---------- Example 2: perpendicularity ----------
// The right face's sideways deviation from a perfect 90° line, in mm, from bottom (s=0) to top (s=1).
function perpFace(s) {
  return 0.22 * s + 0.04 * Math.sin(2 * Math.PI * 1.6 * s);
}

function drawPerpendicularity(tol) {
  const left = 150, faceX = 380, top = 60, datumY = 260;
  const samples = [];
  for (let i = 0; i <= 100; i++) {
    const s = i / 100;
    samples.push({ s: s, dev: perpFace(s) });
  }
  const devs = samples.map(function (p) { return p.dev; });
  const lo = Math.min.apply(null, devs), hi = Math.max.apply(null, devs);
  const error = round2(hi - lo);
  const mid = (hi + lo) / 2;
  const toY = function (s) { return datumY - (datumY - top) * s; };
  const toX = function (dev) { return faceX + dev * SCALE; };

  const svg = newSvg("Front view of a block on datum A with two vertical dashed zone lines around its right face");
  const outline = [[left, top]].concat(samples.slice().reverse().map(function (p) { return [toX(p.dev), toY(p.s)]; }));
  outline.push([left, datumY]);
  svg.appendChild(el("polygon", { points: pointsAttr(outline), fill: "#e7e9e6", stroke: INK, "stroke-width": 2 }));
  svg.appendChild(el("line", { x1: 90, y1: datumY, x2: 600, y2: datumY, stroke: INK, "stroke-width": 1, "stroke-dasharray": "2 3" }));
  svg.appendChild(datumSymbol(230, datumY, "A"));

  // Zone: two vertical lines (always at 90° to datum A), tol apart, around the face.
  [mid - tol / 2, mid + tol / 2].forEach(function (dev) {
    svg.appendChild(zoneLine(toX(dev), top - 20, toX(dev), datumY));
  });
  samples.forEach(function (p, i) {
    if (i % 4 === 0 && Math.abs(p.dev - mid) > tol / 2 + 1e-9) {
      svg.appendChild(el("circle", { cx: toX(p.dev), cy: toY(p.s), r: 4, fill: ZONE }));
    }
  });
  svg.appendChild(label(320, 318, "Red dots: parts of the face outside the zone"));
  return { svg: svg, error: error, errorLabel: "Smallest zone that fits this face" };
}

// ---------- Example 3: position ----------
// How far the real hole axis sits from its true position, in mm.
const AXIS_OFFSET = { x: 0.18, y: 0.12 };

function drawPosition(tol) {
  const svg = newSvg("Plate with a hole, and a magnified view of the circular position zone around the true position");
  // Left: small overview of the plate.
  svg.appendChild(el("rect", { x: 30, y: 80, width: 200, height: 150, fill: "#e7e9e6", stroke: INK, "stroke-width": 2 }));
  svg.appendChild(el("circle", { cx: 130, cy: 150, r: 22, fill: "#fff", stroke: INK, "stroke-width": 2 }));
  svg.appendChild(el("rect", { x: 100, y: 120, width: 60, height: 60, fill: "none", stroke: "#c2410c", "stroke-dasharray": "4 3" }));
  svg.appendChild(el("line", { x1: 160, y1: 120, x2: 330, y2: 40, stroke: "#c2410c", "stroke-dasharray": "4 3" }));
  svg.appendChild(el("line", { x1: 160, y1: 180, x2: 330, y2: 300, stroke: "#c2410c", "stroke-dasharray": "4 3" }));
  svg.appendChild(label(130, 260, "plate (top view)"));

  // Right: magnified view around the true position.
  const cx = 470, cy = 170, k = 150; // k: pixels per mm in the magnified view
  svg.appendChild(el("rect", { x: 330, y: 40, width: 280, height: 260, fill: "#fff", stroke: "#c2410c" }));
  svg.appendChild(el("line", { x1: 340, y1: cy, x2: 600, y2: cy, stroke: INK, "stroke-dasharray": "14 3 3 3" }));
  svg.appendChild(el("line", { x1: cx, y1: 50, x2: cx, y2: 290, stroke: INK, "stroke-dasharray": "14 3 3 3" }));
  const r = (tol / 2) * k;
  svg.appendChild(el("circle", { cx: cx, cy: cy, r: r, fill: ZONE, "fill-opacity": 0.08, stroke: ZONE, "stroke-width": 2, "stroke-dasharray": "7 5" }));
  const ax = cx + AXIS_OFFSET.x * k, ay = cy - AXIS_OFFSET.y * k;
  svg.appendChild(el("line", { x1: cx, y1: cy, x2: ax, y2: ay, stroke: "#4f5d6d", "stroke-width": 1 }));
  svg.appendChild(el("circle", { cx: ax, cy: ay, r: 5, fill: INK }));
  svg.appendChild(label(ax + 10, ay - 8, "real axis", "start"));
  svg.appendChild(label(cx, 292, "crosshair = true position"));

  // The axis passes if it lies inside the circle: distance <= tol / 2,
  // so the smallest zone that fits has diameter 2 x distance.
  const distance = Math.hypot(AXIS_OFFSET.x, AXIS_OFFSET.y);
  return { svg: svg, error: round2(2 * distance), errorLabel: "Smallest zone that fits (2 × the axis's " + mm(distance) + " offset)" };
}

const DRAWERS = { flatness: drawFlatness, perpendicularity: drawPerpendicularity, position: drawPosition };

// ---------- Page wiring ----------
function update() {
  const tol = Number(slider.value);
  document.getElementById("tolerance-value").textContent = (activeMode.id === "position" ? "Ø" : "") + mm(tol);

  const result = DRAWERS[activeMode.id](tol);
  lastResult = result;
  const viz = document.getElementById("viz");
  viz.innerHTML = "";
  viz.appendChild(result.svg);

  // Compare at the slider's 0.01 mm resolution, so the numbers shown agree.
  const passes = tol >= result.error - 1e-9;
  const verdict = document.getElementById("verdict");
  verdict.className = "feedback " + (passes ? "good" : "bad");
  verdict.innerHTML = passes
    ? '<p class="verdict">✓ PASS: the feature fits inside the tolerance zone.</p>'
    : '<p class="verdict">✗ FAIL: part of the feature is outside the tolerance zone.</p>';

  const prefix = activeMode.id === "position" ? "Ø" : "";
  document.getElementById("readout").innerHTML =
    "<div>" + escapeHTML(result.errorLabel) + "<b>" + prefix + mm(result.error) + "</b></div>" +
    "<div>Your tolerance<b>" + prefix + mm(tol) + "</b></div>";
}

function selectMode(id) {
  activeMode = modes.find(function (m) { return m.id === id; });
  document.querySelectorAll("#tabs button").forEach(function (b) {
    b.setAttribute("aria-selected", b.dataset.id === id ? "true" : "false");
  });
  document.getElementById("description").textContent = activeMode.description;
  document.getElementById("source").textContent = "Based on: " + activeMode.source;
  slider.value = activeMode.startValue;
  update();
}

async function startVisualizer() {
  try {
    modes = (await fetchJSON("data/visualize.json")).modes;
  } catch (error) {
    showLoadError(document.getElementById("viz"), error);
    return;
  }
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = modes.map(function (m) {
    return '<button type="button" role="tab" data-id="' + m.id + '">' + escapeHTML(m.title) + "</button>";
  }).join("");
  tabs.querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () { selectMode(b.dataset.id); });
  });
  slider.addEventListener("input", update); // redraw live while dragging
  selectMode(modes[0].id);
}

// Tells TutorBot (tutorbot.js) which example and slider value are on screen.
window.getTutorContext = function () {
  if (!activeMode) return { page: "visualize", label: "Visualizer" };
  return {
    page: "visualize",
    mode: activeMode.id,
    tolerance: Number(slider.value),
    smallestZone: lastResult ? lastResult.error : null,
    label: "Visualizer: " + activeMode.title + " at " + Number(slider.value).toFixed(2) + " mm",
  };
};

startVisualizer();
