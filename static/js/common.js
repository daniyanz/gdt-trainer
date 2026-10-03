/* common.js: small helpers shared by every page. */

// Fetch a JSON file from the site, for example "data/lessons.json".
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load " + url);
  return response.json();
}

/*
 * Put an SVG drawing directly into the page (instead of an <img>), so its
 * parts can be clicked and styled. The SVG files are our own project files.
 */
async function loadSvgInto(container, url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load " + url);
  container.innerHTML = await response.text();
  return container.querySelector("svg");
}

// Escape text before inserting it as HTML.
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = String(text);
  return div.innerHTML;
}

function percent(value) {
  return Math.round(value * 100) + "%";
}

// Show a friendly message if a page's data fails to load.
function showLoadError(element, error) {
  element.innerHTML =
    '<div class="feedback bad"><p class="title">Something went wrong loading this page.</p>' +
    "<p>" + escapeHTML(error.message) + "</p></div>";
}
