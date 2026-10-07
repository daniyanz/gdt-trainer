/*
 * progress-charts.js: charts of the user's score over time, drawn as plain
 * SVG (no chart library), for the Progress page.
 *
 * The score after any answer = questions whose most recent answer is right.
 * Replaying every saved answer in time order gives the score at each
 * moment, so earlier results stay visible: for example 92% on one day,
 * then 100% after a retake.
 *
 * Charts:
 *  1. Score over time (0 to 100%).
 *  2. One small chart per concept: how many of its questions are right.
 *  3. A table with every answer and the score after it, so no value depends on hovering.
 *
 * Every chart shows one series in the site's accent colour. Hover, or focus
 * a chart and use the arrow keys, to read exact values.
 */

const CHART = {
  series: "#c2410c",       // site accent; validated >= 3:1 on the white chart surface
  surface: "#ffffff",
  grid: "#e1e0d9",         // hairline gridlines
  axis: "#c3c2b7",         // baseline
  ink: "#1b1f24",
};
const SVGNS = "http://www.w3.org/2000/svg";

function svgEl(name, attrs, text) {
  const node = document.createElementNS(SVGNS, name);
  Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------- Replay the saved answers ----------
function buildTimeline(challenges) {
  const info = {};
  challenges.forEach(function (c) { info[c.id] = { number: c.slot, concept: c.concept }; });
  const latest = {}; // question slot -> true/false (most recent answer so far, any version)

  return loadProgress().attempts
    .filter(function (a) { return a.id in info && typeof a.time === "number"; })
    .slice()
    .sort(function (a, b) { return a.time - b.time; })
    .map(function (a) {
      latest[info[a.id].number] = { correct: a.correct, concept: info[a.id].concept };
      const rightByConcept = {};
      let right = 0;
      Object.keys(latest).forEach(function (slot) {
        if (!latest[slot].correct) return;
        right += 1;
        const concept = latest[slot].concept;
        rightByConcept[concept] = (rightByConcept[concept] || 0) + 1;
      });
      return {
        time: a.time,
        number: info[a.id].number,
        concept: a.concept,
        correct: a.correct,
        right: right,
        rightByConcept: rightByConcept,
      };
    });
}

// ---------- Formatting ----------
const fmtDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const fmtTime = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const fmtFull = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function timeTickLabel(time, span) {
  return span < 20 * 3600 * 1000 ? fmtTime.format(time) : fmtDate.format(time);
}

// ---------- Tooltip (one per chart; text set with textContent) ----------
function makeTooltip(wrapper) {
  const tip = document.createElement("div");
  tip.className = "chart-tip";
  tip.hidden = true;
  const value = document.createElement("strong");
  const detail = document.createElement("span");
  tip.appendChild(value);
  tip.appendChild(detail);
  wrapper.appendChild(tip);
  return {
    show: function (xFraction, yFraction, valueText, detailText) {
      value.textContent = valueText;
      detail.textContent = detailText;
      tip.hidden = false;
      tip.style.left = (xFraction * 100) + "%";
      tip.style.top = (yFraction * 100) + "%";
      tip.classList.toggle("flip", xFraction > 0.6);
    },
    hide: function () { tip.hidden = true; },
  };
}

/*
 * Step-line chart over time.
 * points: [{time, value, ...}] in time order.
 * opts: {height, yMax, ticks, label(v), tooltip(p) -> [value, detail], ariaLabel}
 */
function stepLineChart(wrapper, points, opts) {
  // Draw at the container's real width so text stays full size on any screen.
  const W = Math.max(260, Math.round(wrapper.clientWidth || 600)), H = opts.height;
  const m = { left: 44, right: 44, top: 16, bottom: 30 };
  const plotW = W - m.left - m.right, plotH = H - m.top - m.bottom;
  const t0 = points[0].time;
  const t1 = Math.max(points[points.length - 1].time, t0 + 60 * 1000);
  const x = function (t) { return m.left + ((t - t0) / (t1 - t0)) * plotW; };
  const y = function (v) { return m.top + plotH - (v / opts.yMax) * plotH; };

  const svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", tabindex: "0", "aria-label": opts.ariaLabel });

  // Gridlines and y ticks.
  opts.ticks.forEach(function (v) {
    svg.appendChild(svgEl("line", { x1: m.left, x2: W - m.right, y1: y(v), y2: y(v), stroke: v === 0 ? CHART.axis : CHART.grid, "stroke-width": 1 }));
    svg.appendChild(svgEl("text", { x: m.left - 8, y: y(v) + 4, "text-anchor": "end", class: "chart-tick" }, opts.label(v)));
  });
  // X ticks: start, middle, end (a label is skipped if it repeats the one before).
  const span = t1 - t0;
  let previousLabel = "";
  [t0, t0 + span / 2, t1].forEach(function (t, i) {
    const text = timeTickLabel(t, span);
    if (text === previousLabel) return;
    previousLabel = text;
    svg.appendChild(svgEl("text", {
      x: x(t), y: H - 8, class: "chart-tick", "text-anchor": i === 0 ? "start" : i === 2 ? "end" : "middle",
    }, text));
  });

  // The step line: flat until the next answer, then up or down.
  let d = "M" + x(points[0].time) + "," + y(points[0].value);
  for (let i = 1; i < points.length; i++) {
    d += " H" + x(points[i].time) + " V" + y(points[i].value);
  }
  svg.appendChild(svgEl("path", { d: d, fill: "none", stroke: CHART.series, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));

  // End dot with a surface ring, and the latest value as the one direct label.
  const last = points[points.length - 1];
  svg.appendChild(svgEl("circle", { cx: x(last.time), cy: y(last.value), r: 4.5, fill: CHART.series, stroke: CHART.surface, "stroke-width": 2 }));
  svg.appendChild(svgEl("text", { x: x(last.time) + 8, y: y(last.value) - 8, class: "chart-end" }, opts.label(last.value)));

  // Hover layer: a crosshair that snaps to the nearest answer.
  const cross = svgEl("line", { y1: m.top, y2: m.top + plotH, stroke: CHART.ink, "stroke-width": 1, visibility: "hidden" });
  const dot = svgEl("circle", { r: 5, fill: CHART.series, stroke: CHART.surface, "stroke-width": 2, visibility: "hidden" });
  svg.appendChild(cross);
  svg.appendChild(dot);
  const hit = svgEl("rect", { x: m.left, y: 0, width: plotW, height: H, fill: "transparent" });
  svg.appendChild(hit);

  wrapper.appendChild(svg);
  const tip = makeTooltip(wrapper);
  let active = points.length - 1;

  function showPoint(i) {
    active = i;
    const p = points[i];
    cross.setAttribute("x1", x(p.time));
    cross.setAttribute("x2", x(p.time));
    dot.setAttribute("cx", x(p.time));
    dot.setAttribute("cy", y(p.value));
    cross.setAttribute("visibility", "visible");
    dot.setAttribute("visibility", "visible");
    const text = opts.tooltip(p);
    tip.show(x(p.time) / W, y(p.value) / H, text[0], text[1]);
  }
  function hide() {
    cross.setAttribute("visibility", "hidden");
    dot.setAttribute("visibility", "hidden");
    tip.hide();
  }
  hit.addEventListener("pointermove", function (event) {
    const box = svg.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * W;
    let best = 0;
    points.forEach(function (p, i) { if (Math.abs(x(p.time) - px) < Math.abs(x(points[best].time) - px)) best = i; });
    showPoint(best);
  });
  hit.addEventListener("pointerleave", hide);
  // Keyboard: focus the chart, then use the arrow keys.
  svg.addEventListener("focus", function () { showPoint(active); });
  svg.addEventListener("blur", hide);
  svg.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      showPoint(Math.min(points.length - 1, Math.max(0, active + (event.key === "ArrowRight" ? 1 : -1))));
    }
  });
}

// ---------- Put it all on the page ----------
let lastChartArgs = null; // remembered so the charts can be redrawn on resize

function renderProgressCharts(root, challengeData) {
  lastChartArgs = [root, challengeData];
  const timeline = buildTimeline(challengeData.challenges);
  root.innerHTML = "";
  if (!timeline.length) {
    root.innerHTML = '<p class="chart-empty">Answer a few challenges and your score chart will appear here.</p>';
    return;
  }
  const total = slotList(challengeData.challenges).length;
  const concepts = challengeData.concepts;
  const perConceptTotal = {};
  slotList(challengeData.challenges).forEach(function (s) { perConceptTotal[s.concept] = (perConceptTotal[s.concept] || 0) + 1; });
  const pct = function (right) { return Math.round((right / total) * 100); };

  function card(parent, title, subtitle) {
    const section = document.createElement("section");
    section.className = "chart-card";
    const h = document.createElement("h3");
    h.textContent = title;
    const p = document.createElement("p");
    p.className = "chart-sub";
    p.textContent = subtitle;
    const chart = document.createElement("div");
    chart.className = "chart";
    section.appendChild(h);
    section.appendChild(p);
    section.appendChild(chart);
    parent.appendChild(section);
    return chart;
  }
  function answerNote(e) {
    return "Question " + e.number + " answered " + (e.correct ? "right" : "wrong");
  }

  // 1. Score over time
  const overall = card(root, "Score over time",
    "Your score after every answer. Retaking a question you got wrong and getting it right raises it. " +
    "Hover, or focus the chart and use the arrow keys, for details.");
  stepLineChart(overall, timeline.map(function (e) {
    return { time: e.time, value: pct(e.right), event: e };
  }), {
    height: 230, yMax: 100, ticks: [0, 25, 50, 75, 100],
    label: function (v) { return v + "%"; },
    tooltip: function (p) {
      return [p.value + "%", p.event.right + " of " + total + " right · " + fmtFull.format(p.time) + " · " + answerNote(p.event)];
    },
    ariaLabel: "Line chart: score over time",
  });

  // 2. By concept (small multiples, same measure)
  const heading = document.createElement("h3");
  heading.className = "chart-group-heading";
  heading.textContent = "By concept";
  root.appendChild(heading);
  const grid = document.createElement("div");
  grid.className = "chart-multiples";
  root.appendChild(grid);
  // Add every card first, THEN draw: the grid only settles its column
  // widths once all four cards are in it.
  const pending = [];
  Object.keys(concepts).forEach(function (key) {
    const n = perConceptTotal[key];
    const events = timeline.filter(function (e) { return e.concept === key; });
    const chart = card(grid, concepts[key], events.length ? "Questions right, out of " + n : "Not started yet");
    if (events.length) pending.push({ key: key, n: n, events: events, chart: chart });
  });
  pending.forEach(function (item) {
    const key = item.key, n = item.n, events = item.events, chart = item.chart;
    const ticks = [];
    for (let v = 0; v <= n; v++) ticks.push(v);
    stepLineChart(chart, events.map(function (e) {
      return { time: e.time, value: e.rightByConcept[key] || 0, event: e };
    }), {
      height: 160, yMax: n, ticks: ticks,
      label: function (v) { return String(v); },
      tooltip: function (p) {
        return [p.value + " of " + n + " right", fmtFull.format(p.time) + " · " + answerNote(p.event)];
      },
      ariaLabel: concepts[key] + ": questions right over time",
    });
  });

  // 3. Table view: every answer and the score after it
  const details = document.createElement("details");
  details.className = "chart-table";
  const summary = document.createElement("summary");
  summary.textContent = "Show the history as a table (" + timeline.length + " answers)";
  details.appendChild(summary);
  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const table = document.createElement("table");
  const head = table.createTHead().insertRow();
  ["When", "Question", "Concept", "Result", "Score after this answer"].forEach(function (t) {
    const th = document.createElement("th");
    th.textContent = t;
    head.appendChild(th);
  });
  const body = table.createTBody();
  timeline.forEach(function (e) {
    const row = body.insertRow();
    [fmtFull.format(e.time), String(e.number), concepts[e.concept], e.correct ? "✓ right" : "✗ wrong",
      pct(e.right) + "% (" + e.right + " of " + total + ")"].forEach(function (t) { row.insertCell().textContent = t; });
  });
  wrap.appendChild(table);
  details.appendChild(wrap);
  root.appendChild(details);
}

// Redraw at the new width when the window is resized (after a short pause).
let chartResizeTimer = null;
window.addEventListener("resize", function () {
  clearTimeout(chartResizeTimer);
  chartResizeTimer = setTimeout(function () {
    if (lastChartArgs) renderProgressCharts(lastChartArgs[0], lastChartArgs[1]);
  }, 200);
});
