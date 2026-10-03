# GD&T Trainer: Requirements Document (Template)

> **How to use this template**
> - Fill in every field marked `[ ]` or `_TBD_`. Delete the hint text in *italics* once answered.
> - Where options are listed, keep the one you choose and delete the rest.
> - Save a filled copy per agent test, e.g. `docs/requirements-v1-agentA.md`, so you can compare results.
> - Anything you leave as `_TBD_` the agent should ask about or treat as out of scope.
> - Time budget for the whole project: **8 hours**. If a section feels big, push it to "Later" (Section 10).

| Field | Value |
|---|---|
| Version | v1 |
| Author | Daniya Nussipbek |
| Date | 2026-10-03 |
| Agent / tool being tested | _e.g. Claude Code, Cursor, Copilot_ |
| Status | Draft: waiting on the source gaps in Section 7.4 and Open Questions |

---

## 1. Project Overview and Purpose

**1.1 One-sentence summary**
This is a website for engineering students and hobbyists to practice GD&T concepts and learn how to interpret engineering drawings.

**1.2 Problem it solves**
Learning GD&T can be slow and difficult because it is often presented through dense standards, textbooks, or diagrams rather than interactive examples. Many engineering students are not introduced to GD&T in depth until industry work. However, students working in robotics, research labs, maker spaces, or personal projects may need to design and order manufactured parts well before they start working in industry. In those situations, understanding engineering drawings and GD&T becomes important to communicate design choices clearly and prevent manufacturing mistakes.

**1.3 Target users** (keep the ones that apply)
- [x] Engineering students (intro level)
- [x] Hobbyists and makers

**1.4 Assumed starting knowledge of the user**
The user knows that engineering drawings have multiple views of an object and include basic dimensions that describe its geometry. However, they have limited knowledge of more advanced drawing concepts/symbols and GD&T concepts. For example, they may not know symbols for features such as counterbores, understand how datum planes are used, or know drawing rules such as avoiding repeated dimensions across multiple views.

*Scope note:* general drawing basics such as counterbore symbols and repeated dimensions get no lessons in v1. They may appear only as the error in "What is wrong with this drawing?" questions, and only if an allowed source supports the rule (see Section 7.4).

**1.5 Success looks like**
The user shows understanding of a concept across multiple different questions that test the same underlying idea. Simply memorizing the answer to a previous question they got wrong and answering it correctly when the exact same question shows up again does not demonstrate successful learning. Success should be based on whether the user can apply the concept correctly in different contexts or drawing examples.

**Measurable rule:** a concept counts as **learned** when the user has answered at least 2 *different* challenge questions on that concept correctly. Answering the same question correctly twice counts once.

---

## 2. Scope

**2.1 GD&T concepts covered in v1** (tick what you will actually build content for)

| Concept | Learn Mode | Challenge Mode | Visualization Mode |
|---|---|---|---|
| Datum planes / datum reference frame | [x] | [x] | [ ] |
| Flatness | [x] | [x] | [x] |
| Perpendicularity | [x] | [x] | [x] |
| Position | [x] | [x] | [x] |
| Profile (of a surface / of a line) | [ ] | [ ] | [ ] |

*Hint: for 8 hours, aim for 3 to 5 concepts fully done rather than 10 half done.*

**2.2 Standard the content follows**
- **Allowed technical references for v1:** NASA KSC-GP-435 Volume I and NASA GSFC-X-673-64-1F only (details in Section 7.1).
- Both NASA documents say dimensioning and tolerancing shall follow ASME Y14.5. KSC-GP-435 lists ASME Y14.5-2018, and GSFC-X-673-64-1F lists ANSI Y14.5M-1982. The site therefore uses ASME Y14.5 conventions as invoked by NASA.
- ASME and ISO standards are paid documents. Do not copy their text, tables or figures into the project, and do not use them as sources.
- **If a GD&T rule cannot be confidently supported by the two allowed NASA documents, flag it to the author. Do not invent it.** Known gaps are listed in Section 7.4.

**2.3 Out of scope for v1** (things the agent must NOT build)
- No need for accounts, mobile app, 3D CAD navigation and movement, or payment system.

---

## 3. Core Features

*For each feature, fill in what it does and how you will test it. The acceptance criteria are what you will use to judge each agent's output.*

### 3.1 Learn Mode
| Item | Your answer |
|---|---|
| What the user sees per concept | Symbol, name, 2 to 4 sentence explanation, one diagram, and one common mistake |
| Visual format | Agent-generated SVG, reviewed and corrected by me |
| Content source | Mix: based on public NASA/open educational sources, rewritten by me, with AI helping draft explanations |
| Navigation | Step-by-step course order, with the option to jump to a concept |
| Short quiz at end of each lesson? | Yes |

**Acceptance criteria**
- [ ] Every concept ticked in 2.1 has a lesson page.
- [ ] Each lesson shows the correct GD&T symbol.
- [ ] Each lesson shows which allowed source and PDF page it is based on, or is marked as flagged if no allowed source supports it.
- [ ] Finishing the end-of-lesson quiz marks the lesson complete. Quiz answers do not count toward concept accuracy.

### 3.2 Drawing Challenge Mode

| Item | Your answer |
|---|---|
| Question types | [x] "What does this symbol mean?" [x] "What feature does this tolerance apply to?" [x] "What is wrong with this drawing?" |
| Answer format | Mix of multiple choice and click-on-the-drawing |
| Where drawings come from | Agent-generated SVGs reviewed and corrected by me |
| Number of challenges in v1 | 12 GD&T challenges: 3 per concept, each using a different drawing. Optionally up to 2 extra "Drawing basics" error questions, only if source-supported. |
| Feedback after answering | Short explanation |
| Hints available? | Yes |
| Difficulty levels | None in v1 |

**Acceptance criteria**
- [ ] User can answer a question and immediately see whether they were right.
- [ ] Each wrong answer shows a short explanation of the correct concept.
- [ ] Each of the 4 GD&T concepts appears in 3 different challenge questions.
- [ ] The 3 questions for a concept use 3 different drawings rather than repeating the same question.
- [ ] Every challenge is tagged with exactly one concept, or with "Drawing basics".
- [ ] Click-on-the-drawing questions clearly show which feature the user selected.

### 3.3 Tolerance Visualization Mode
| Item | Your answer |
|---|---|
| Concepts with a slider | Flatness, perpendicularity, position |
| 2D or 3D | 2D |
| What the slider changes | Tolerance value, approximately 0.01 to 1.00 mm |
| Units | mm only for v1 |
| What the user sees change | Flatness: distance between the two boundaries of the tolerance zone changes. Perpendicularity: width of the tolerance zone changes while remaining perpendicular to the datum. Position: the diameter of the position tolerance zone grows or shrinks. |
| Show a "part" inside the zone that passes/fails? | Yes |
| Extra controls | None for v1. MMC/LMC, bonus tolerance, and unit switching can be added later. |

**Acceptance criteria**
- [ ] Moving the slider redraws the tolerance zone with no page reload.
- [ ] The numeric tolerance value is shown next to the slider.
- [ ] The visualization clearly shows whether the example feature passes or fails for the current tolerance value.
- [ ] Changing the tolerance can cause the same example feature to switch between pass and fail.

### 3.4 Score and Progress Tracking

| Item | Your answer |
|---|---|
| What is tracked | [x] Score per challenge [x] Correct/incorrect per concept [x] Lessons completed [ ] Time spent |
| Concept status rules | Only challenge answers count. **Learned:** correct on at least 2 different questions for that concept. **Needs more practice:** at least 3 attempts and under 70% correct. **In progress:** anything else that has been attempted. **Not started:** no attempts. If both Learned and Needs more practice apply, show Needs more practice. |
| Where data is stored | Browser localStorage |
| User accounts | None |
| Progress page shows | Overall challenge score, accuracy per concept, completed lessons, and concepts that need more practice |
| Reset progress button? | Yes |

**Acceptance criteria**
- [ ] Refreshing or reopening the website on the same browser keeps the user's saved progress.
- [ ] Correct and incorrect answers update the statistics for the relevant GD&T concept.
- [ ] Concepts below the defined accuracy threshold are listed as "Needs more practice."
- [ ] Answering the same question correctly twice does not mark a concept as Learned.
- [ ] The progress page displays the user's overall score and per-concept performance.
- [ ] The user can reset all locally stored progress.

## 4. API and AI Requirements

### 4.1 OpenAI API

| Item | Your answer |
|---|---|
| What OpenAI is used for | [x] Explaining wrong answers [ ] Generating new questions [ ] Chat tutor "ask a question" box [ ] Grading free-text answers [ ] Not used in v1 |
| Model | Small, low-cost OpenAI model suitable for short educational explanations |
| Monthly budget limit | $5 |
| Max requests per user per day | 20 per IP address per day, counted in the Flask server's memory. The count resets if the server restarts, which is acceptable. The $5 OpenAI project budget is the real hard cap. |
| What happens if the API fails, the limit is reached, or the budget runs out | Show the pre-written explanation instead. The site must work fully without OpenAI. |

**Important:** the OpenAI API key must never be in browser code. It needs a small server or serverless function (see 5.1). Confirm you understand this:
- [X] Yes, the key will live in a server-side environment variable only.

### 4.2 Other APIs (free only)

| API / service | Purpose | Free tier limit | Needed? |
|---|---|---|---|
| None for v1 | User progress is stored locally in the browser using localStorage | N/A | No |
---

## 5. Technical Requirements

**5.1 Tech stack** (pick one per row, or write "agent decides")
| Layer | Choice |
|---|---|
| Frontend | Plain HTML/CSS/JavaScript |
| Drawings and zones | SVG |
| Backend | Small Python Flask server that serves both the pages and the API in one app |
| Storage | localStorage |
| Hosting | Render free tier. The server sleeps when idle, so the first visit can be slow. This is accepted for a class project. |
| Render deploy contract | The Flask object must be named `app` in `app.py` at the repo root. `requirements.txt` at the repo root must list `flask`, `gunicorn`, `openai` and `python-dotenv`. Render build command: `pip install -r requirements.txt`. Start command: `gunicorn app:app`. The key is read from the `OPENAI_API_KEY` environment variable. |

**5.2 Content format**
- JSON files in the repo

**5.3 Devices and browsers**
- [x] Desktop Chrome
- [x] Must also work on phone screens
- [ ] Tablet specifically tested

**5.4 Rules for the agent**
- Use only free and open-source libraries and tools, except for the OpenAI API.
- Do not introduce React, TypeScript, databases, authentication, or other frameworks unless I explicitly approve them first.
- Keep the code simple enough for a beginner to understand and explain.
- Add comments for important logic, especially SVG interaction, localStorage, and API calls.
- Keep lesson and challenge content separate from application logic.
- Do not hard-code API keys or secrets.
- Do not add features that are not listed in the requirements without asking me first.
- Prefer simple implementations over clever or highly abstract code.
- All engineering drawings and visual examples must be original/project-created or come from sources that permit reuse.
- Use only the two allowed NASA documents for GD&T rules. Flag any rule they do not support instead of inventing it.
---

## 6. UI/UX Requirements

| Item | Your answer |
|---|---|
| Overall look | Clean, technical, modern engineering style; simple enough for a beginner learning tool |
| Colour preferences | Light background with dark text and a limited blue/gray accent palette |
| Dark mode | Later |
| Main navigation | Top bar with Learn, Challenge, Visualize, and Progress |
| Home page shows | Short project description, 3 main mode cards, and a small progress summary |
| Accessibility | [x] Keyboard usable [x] Readable text size [x] Not relying on colour alone for correct/incorrect |
| Example sites you like | TBD |
| Sketches or wireframes | Optional; simple hand sketch before coding |
---

## 7. Reference Sources and Licensing

### 7.1 Technical and Educational Sources

| Source title | Link | License / public status | What you will use it for |
|---|---|---|---|
| NASA KSC-GP-435, Volume I: *Engineering Drawing Practices, Aerospace and Ground Support Equipment*, Rev. H, Change 1 (2021-08-25) | https://standards.nasa.gov/node/815 (current PDF: GP-435-Vol-I-Chg-H-1.pdf on that page) | Active. NASA marks it "Internet Public: cleared for public accessibility on the internet." Not export controlled. | Datums, positional tolerancing policy, the rule that dimensioning and tolerancing follow ASME Y14.5-2018 |
| NASA GSFC-X-673-64-1F: *Engineering Drawing Standards Manual*, Goddard Space Flight Center (August 1994) | https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/NASA%20GSFC-X-673-64-1F.pdf | Publicly hosted NASA document; U.S. Government work. Older manual that references ANSI Y14.5M-1982. | Datum lines and labeling, true position practice, drafting rules, citing ANSI/ASME Y14.5 |

No other technical sources are allowed in v1. The second PDF on the KSC page is the historical Rev. H and should not be used.

### 7.2 AI Tools Used

| Tool | Official source | How it is used |
|---|---|---|
| Claude Opus 5.5 | Anthropic official documentation | Requirements planning, coding assistance, debugging, and development through Claude in VS Code |
| OpenAI API | OpenAI official API documentation | Runtime generation of short explanations for incorrect answers |

### 7.3 Citations shown on the website

The site must have a **Sources** page, linked from the footer of every page. It must state:
- [ ] Both NASA documents above, with title, document number, revision or date, and link.
- [ ] That both NASA documents base their dimensioning and tolerancing rules on ASME Y14.5. KSC-GP-435 Vol. I invokes ASME Y14.5-2018, and GSFC-X-673-64-1F invokes ANSI Y14.5M-1982.
- [ ] That the main GD&T standards, ASME Y14.5 and ISO 1101, are paid documents and are not publicly available for free download. This is why the site relies on public NASA documents and paraphrases ideas instead of quoting the standards.
- [ ] That the site is an independent educational project and is not affiliated with or endorsed by NASA, ASME or ISO.
- [ ] Each lesson also shows a short source line, for example "Based on GSFC-X-673-64-1F, PDF page 119."

### 7.4 Source coverage check (flagged items)

Checked on 2026-10-03 by searching the text of both PDFs. Page numbers are PDF page numbers, not printed page numbers.

| Topic | Supported by allowed sources? | Where |
|---|---|---|
| Datums and datum reference frame | **Yes** | GSFC p42 (datum line style), p97 (primary, secondary, tertiary datums labeled alphabetically), p119 (no implied datums; datums should be functional and on a physical surface or feature of size). KSC p20 (centerline datums from features of size), p27 (datum A, B, C note). |
| Position | **Partly** | GSFC p97, p119 to p120: true position uses basic dimensions and datum letters, hole patterns should preferably be true positioned, true position can be loose, projected tolerance zones for tapped holes. KSC p20: positional tolerances for all features of size. **Not covered:** the symbol, the feature control frame layout, or the shape of the tolerance zone. |
| Perpendicularity | **Barely** | GSFC p97 and p119 only say a feature's perpendicularity relationship must be identified with datum letters. **Not covered:** the symbol or the tolerance zone. |
| Flatness | **No** | Not found in either document. |
| Tolerance zone shapes for the Visualization Mode | **No** | Neither document defines tolerance zones. |
| GD&T symbols and feature control frames | **No** | Neither document has a figure or table explaining them. |
| Counterbore symbol | **No** | GSFC p120 to p121 only give counterbore design advice. |
| Avoid repeated dimensions across views | **No** | Closest: GSFC p97 and p120 say to use as few reference dimensions as possible. KSC p23 says notes should not duplicate information. |

**Agent rule:** do not write content for any "No" or "Not covered" item until the author resolves it in Section 11.
---

## 8. Data and Privacy

| Item | Your answer |
|---|---|
| Personal data collected | None |
| Data sent to OpenAI | Only the challenge/question context and information needed to generate feedback. No name, email, nickname, or other personal information is sent. |
| Privacy note shown on the site? | Yes |
User progress data is stored locally in the browser and is not transmitted to a remote database.

## 9. Testing and Agent Evaluation

**9.1 How you will test the site**
- [ ] Click through each mode manually using the acceptance criteria in Section 3
- [ ] Check at least 3 GD&T answers against a reference source for correctness
- [ ] Test that progress is saved after refreshing/reopening the site
- [ ] Test that the tolerance sliders update the visualization correctly
- [ ] Test the site on desktop and phone-sized screens
- [ ] Test what happens when the OpenAI API request fails

**9.2 How you will compare agents** (score each 1 to 5)
| Criterion | Agent A | Agent B |
|---|---|---|
| Followed this requirements document | | |
| Acceptance criteria met | | |
| GD&T content accuracy | | |
| Code is readable for a beginner | | |
| Avoided unnecessary complexity | | |
| UI is clear and visually polished | | |
| Bugs / broken features | | |
| Time taken | | |
| Notes | | |
---

## 10. Timeline (8-hour budget)

| Block | Task | Hours |
|---|---|---|
| 1 | Finish requirements document and gather/verify sources | 1.0 |
| 2 | Project setup + navigation + basic layout | 0.75 |
| 3 | Learn Mode | 1.25 |
| 4 | Challenge Mode | 1.5 |
| 5 | Visualization Mode | 1.25 |
| 6 | Progress tracking with localStorage | 0.75 |
| 7 | OpenAI integration | 0.75 |
| 8 | Testing, fixes, and deployment cleanup | 0.75 |
|  | **Total** | **8.0** |

## 11. Open Questions
_Write down anything you are unsure about. The agent should answer or flag these before building._
- **Source gap (blocking).** The allowed NASA documents do not define flatness, perpendicularity zones, position zone shape, or the GD&T symbols (Section 7.4). The author must choose one: (a) add one free, openly licensed educational source that explains them, (b) drop the unsupported concepts from v1, or (c) allow them as clearly labeled "general practice, not from allowed sources".
- **Drawing basics questions.** The counterbore symbol and repeated-dimension rules are not supported either. Unless the author adds a source, v1 has no Drawing basics questions.
- **Agent under test.** Fill in the header table before each agent run.
