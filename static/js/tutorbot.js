/*
 * tutorbot.js: the floating TutorBot chat, included on every page.
 *
 * Each page can define window.getTutorContext(), which returns IDs and
 * simple values describing what the user is looking at (for example the
 * current challenge and whether it has been answered). The server turns
 * those IDs into full context from its own content files.
 *
 * The conversation is kept in sessionStorage, so it follows the user
 * between pages but is forgotten when the browser tab is closed.
 */
(function () {
  const CHAT_KEY = "gdtTutorChat.v1";
  const SEND_HISTORY = 8;    // messages sent to the server with each question
  const KEEP_HISTORY = 30;   // messages kept on screen

  // ---------- Saved conversation (sessionStorage) ----------
  function loadChat() {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(CHAT_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }
  function saveChat(messages) {
    try {
      window.sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-KEEP_HISTORY)));
    } catch (error) {
      /* chat still works, it just will not survive a page change */
    }
  }

  // ---------- Page context ----------
  function currentContext() {
    if (typeof window.getTutorContext === "function") {
      try {
        const ctx = window.getTutorContext();
        if (ctx) return ctx;
      } catch (error) {
        /* fall through to the default */
      }
    }
    const path = window.location.pathname;
    return { page: path.indexOf("sources") >= 0 ? "sources" : "home", label: "Home" };
  }

  // ---------- Build the widget ----------
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "tutor-toggle";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "tutor-panel");
  toggle.innerHTML = '<span aria-hidden="true">💬</span> Ask TutorBot';

  const panel = document.createElement("section");
  panel.className = "tutor-panel";
  panel.id = "tutor-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "TutorBot chat");
  panel.innerHTML =
    '<header class="tutor-head">' +
      "<div><b>TutorBot</b><div class=\"tutor-context\" id=\"tutor-context\"></div></div>" +
      '<div class="tutor-head-buttons">' +
        '<button type="button" class="tutor-small" id="tutor-clear">Clear</button>' +
        '<button type="button" class="tutor-small" id="tutor-close" aria-label="Close TutorBot">✕</button>' +
      "</div>" +
    "</header>" +
    '<div class="tutor-messages" id="tutor-messages" aria-live="polite"></div>' +
    '<form class="tutor-form" id="tutor-form">' +
      '<label for="tutor-input" class="visually-hidden">Your question</label>' +
      '<textarea id="tutor-input" rows="2" maxlength="600" placeholder="Ask about this page…"></textarea>' +
      '<button type="submit" class="btn" id="tutor-send">Send</button>' +
    "</form>" +
    '<p class="tutor-note">AI answers can be wrong; lessons and explanations on the site are the checked versions. ' +
      "Don't type personal information.</p>";

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  const list = panel.querySelector("#tutor-messages");
  const input = panel.querySelector("#tutor-input");
  const sendButton = panel.querySelector("#tutor-send");
  let messages = loadChat();
  let busy = false;

  function render() {
    const intro = '<div class="tutor-msg bot">Hi! I can explain anything on this page, give hints on challenges ' +
      "(without spoiling answers), or help you use the site. What would you like to know?</div>";
    list.innerHTML = intro + messages.map(function (m) {
      return '<div class="tutor-msg ' + (m.role === "user" ? "user" : "bot") + '">' + escapeHTML(m.content) + "</div>";
    }).join("") + (busy ? '<div class="tutor-msg bot typing">TutorBot is thinking…</div>' : "");
    list.scrollTop = list.scrollHeight;
    document.getElementById("tutor-context").textContent = "Looking at: " + (currentContext().label || "this page");
  }

  function open() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    render();
    input.focus();
  }
  function close() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  toggle.addEventListener("click", function () { panel.hidden ? open() : close(); });
  panel.querySelector("#tutor-close").addEventListener("click", close);
  panel.querySelector("#tutor-clear").addEventListener("click", function () {
    messages = [];
    saveChat(messages);
    render();
    input.focus();
  });
  panel.addEventListener("keydown", function (event) {
    if (event.key === "Escape") close();
  });
  // Enter sends; Shift+Enter makes a new line.
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      panel.querySelector("#tutor-form").requestSubmit();
    }
  });

  const failureText = {
    "daily-limit": "You've used today's 30 TutorBot messages. The lessons and explanations on the site still work.",
    "ai-not-configured": "TutorBot isn't set up on this server.",
  };

  /*
   * API call: send the page context (IDs only) and the last few messages
   * to our own server, which adds the checked content and asks OpenAI.
   */
  panel.querySelector("#tutor-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || busy) return;
    input.value = "";
    messages.push({ role: "user", content: question });
    saveChat(messages);
    busy = true;
    sendButton.disabled = true;
    render();

    let reply;
    let failed = false;
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: currentContext(),
          messages: messages.filter(function (m) { return !m.error; }).slice(-SEND_HISTORY)
            .map(function (m) { return { role: m.role, content: m.content }; }),
        }),
      });
      const body = await response.json();
      failed = !body.ok;
      reply = body.ok ? body.reply : (failureText[body.reason] || "TutorBot is unavailable right now. Please try again later.");
    } catch (error) {
      failed = true;
      reply = "TutorBot is unavailable right now. If the site was asleep, wait a moment and try again.";
    }
    messages.push({ role: "assistant", content: reply, error: failed });
    saveChat(messages);
    busy = false;
    sendButton.disabled = false;
    render();
    input.focus();
  });
})();
