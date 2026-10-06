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
| Status | Ready for build (fill in the agent being tested first) |

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

*Scope note:* general drawing basics such as counterbore symbols and repeated dimensions get no lessons in v1. The approved sources do not support those two rules (Section 7.4), so they are left out of v1. "What is wrong with this drawing?" questions use the source-supported GD&T errors listed in Section 7.4 instead.

**1.5 Success looks like**
*Simplified 2026-10-06 by the author, because the earlier "Learned" rule confused users.*

The user reaches a 100% score: every challenge question's latest answer is right. A user who gets questions wrong follows the "Needs more practice" recommendation, reviews that concept's lesson, retakes those questions and gets them right. Earlier results are never erased, so the score chart shows the improvement, for example from 92% to 100%.

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
- **Primary GD&T reference:** *Fundamentals of GD&T, Part I* by J. Berez (CC BY 4.0). Use it for datums, form, orientation, location, symbols and feature control frames.
- **Supporting GD&T references:** *Fundamentals of GD&T, Part II* (Berez and Praniewicz, NIST) and NASA *GD and T Basics* (Willis, Marshall Space Flight Center).
- **Real drawing example:** the public-domain NIST PMI test drawing CTC-05, used only to see how GD&T appears on a real drawing.
- **Drawing practice references:** NASA KSC-GP-435 Volume I and NASA GSFC-X-673-64-1F.
- All of these sources follow ASME Y14.5 conventions. Part I uses ASME Y14.5-2018, and the NASA slides cite ASME Y14.5-2009. If two sources disagree, follow Part I and flag the difference to the author.
- ASME and ISO standards are paid documents. Do not use them as website content or as sources.
- **Do not copy diagrams, figures or explanatory text from any source.** Write original explanations and draw original SVGs. Part II and the NASA slides contain copyrighted material, and Part I contains figures from a copyrighted textbook.
- **If a technical claim cannot be supported by the approved sources, flag it to the author. Do not invent it.**

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
| Score rules | *Simplified 2026-10-06 by the author; replaces the earlier Learned / In progress / first-try rules.* **Score** = challenge questions whose **latest** answer is right, out of all 12. Retaking a question replaces its earlier result in the score. Lesson quizzes do not count. **Needs more practice** = every concept with a question whose latest answer is wrong; the recommendation links to that concept's lesson and to the exact questions to retake. History is never erased. |
| Where data is stored | Browser localStorage |
| User accounts | None |
| Progress page shows | Score (percentage and questions right out of 12), questions answered, lessons completed, the "Needs more practice" recommendation with retake links, questions right per concept, and every question's latest answer |
| Progress charts | Added 2026-10-05 after TA review. Updated 2026-10-06. Charts of the score over time: overall score after every answer (0 to 100%), and one small chart per concept showing how many of its questions are right. Every answer and the score after it are also listed in a "Show the history as a table" view. Plain SVG, no chart library. |
| Reset progress button? | Yes |

**Acceptance criteria**
- [ ] Refreshing or reopening the website on the same browser keeps the user's saved progress.
- [ ] Correct and incorrect answers update the statistics for the relevant GD&T concept.
- [ ] Every concept with a currently wrong question is listed under "Needs more practice", with links to its lesson and to each question to retake.
- [ ] Retaking a wrong question and getting it right raises the score; getting every question right shows 100%.
- [ ] Earlier results stay in the history: the score chart shows the score before and after a retake.
- [ ] The progress page displays the user's score and per-concept results.
- [ ] The user can reset all locally stored progress.
- [ ] The Progress page shows charts of progress over time, and they update after new answers.
- [ ] Chart values can be read by hovering, by keyboard (focus a chart and use the arrow keys), and in the table view.

### 3.5 TutorBot (floating chat assistant)

Added 2026-10-04 at the author's request.

| Item | Decision |
|---|---|
| Where | A floating "Ask TutorBot" button on every page. It opens a chat panel. |
| Page awareness | TutorBot is told which page the user is on and what they are looking at: the current lesson, challenge question, visualizer mode and slider value, or weak concepts on the Progress page. |
| What it may answer | GD&T questions covered by this site's lessons and challenges, and how to use the site. Answers use only the site's checked content. Anything beyond it is answered with "not covered by this site's approved sources". |
| Unanswered challenges | TutorBot gives hints but does not reveal or confirm the answer until the user has pressed Check. |
| Conversation | Kept for the browser tab session, so it follows the user between pages. A Clear button empties it. |

**Acceptance criteria**
- [ ] The TutorBot button appears on every page and works with mouse and keyboard.
- [ ] TutorBot's replies reflect the page and item the user is viewing.
- [ ] On an unanswered challenge, TutorBot does not give away the answer.
- [ ] Questions outside the approved content get a "not covered" reply instead of invented rules.
- [ ] If the AI is unavailable or the daily limit is reached, the chat says so and the rest of the site keeps working.

## 4. API and AI Requirements

### 4.1 OpenAI API

| Item | Your answer |
|---|---|
| What OpenAI is used for | [x] Explaining wrong answers [ ] Generating new questions [x] Chat tutor: the floating TutorBot (Section 3.5) [ ] Grading free-text answers [ ] Not used in v1 |
| Model | Small, low-cost OpenAI model suitable for short educational explanations |
| Monthly budget limit | $5 |
| Max requests per user per day | 20 wrong-answer explanations and 30 TutorBot messages per IP address per day, counted in the Flask server's memory. The IP is the last X-Forwarded-For entry, which Render's proxy adds and the browser cannot fake. A site-wide backstop of 300 AI requests per day applies to all visitors together. The count resets if the server restarts, which is acceptable. The $5 OpenAI project budget is the real hard cap. |
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
- Use only the approved sources in Section 7.1 for technical claims. Flag any claim they do not support instead of inventing it.
- Never copy figures, diagrams or explanatory text from any source. All explanations and SVG drawings must be original.
---

## 6. UI/UX Requirements

| Item | Your answer |
|---|---|
| Overall look | Engineering drawing sheet style (changed 2026-10-04 at the author's request): drafting-grid background, cards framed like drawing sheets, footer styled as a title block, condensed technical headings and monospace numbers. Still simple enough for a beginner. |
| Colour preferences | Off-white drafting paper with dark text, graphite header and panels, safety-orange accent. Fonts: IBM Plex, self-hosted (SIL Open Font License). |
| Dark mode | Later |
| Main navigation | Top bar with Learn, Challenge, Visualize, and Progress |
| Home page shows | Short project description, 3 main mode cards, and a small progress summary |
| Accessibility | [x] Keyboard usable [x] Readable text size [x] Not relying on colour alone for correct/incorrect |
| Example sites you like | TBD |
| Sketches or wireframes | Optional; simple hand sketch before coding |
---

## 7. Reference Sources and Licensing

### 7.1 Technical and Educational Sources

Page numbers in this document are PDF page numbers. In the three slide decks they match the slide numbers.

| Role | Source | Link | License / public status | Use it for |
|---|---|---|---|---|
| **Primary** | J. Berez, *Fundamentals of Geometric Dimensioning and Tolerancing, Part I*, v2.1.0, 2023-08-10, UNC Charlotte. DOI 10.5281/zenodo.8237096 | https://zenodo.org/records/8237096 | CC BY 4.0. Attribution required. Some figures are credited to the Shigley textbook and are **not** covered by the license. | Datums, form, orientation, location, symbols, feature control frames |
| Supporting | J. Berez and M. Praniewicz (NIST), *Fundamentals of GD&T, Part II*, 2023 | https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936463 | Published by NIST. Contains third-party copyrighted material, some of it CC BY-NC-ND. Treat as copyrighted: paraphrase only. | Clarifications, how flatness, perpendicularity and position are inspected |
| Supporting | A. Willis, *GD and T Basics*, NASA Marshall Space Flight Center, 2025-12-03. NTRS 20250011008 | https://ntrs.nasa.gov/citations/20250011008 | Public release, but NASA notes "Portions of document may include copyright protected material." Its figures come from ASME Y14.5 and a commercial trainer. Paraphrase only. | Tolerance zone shapes for flatness and perpendicularity, true position |
| Drawing example | NIST PMI test case CTC-05, machined part drawing with GD&T | https://www.innerscene.com/tools/library/drawings/machined-part-drawing-nist-ctc-05-gd-t-f2a95d84 | U.S. Government work, public domain in the U.S. This link is a third-party copy of the NIST file. | Seeing how datums and feature control frames look on a real drawing |
| Drawing practice | NASA KSC-GP-435 Volume I, *Engineering Drawing Practices*, Rev. H, Change 1, 2021-08-25 | https://standards.nasa.gov/node/815 (current PDF: GP-435-Vol-I-Chg-H-1.pdf) | Active. Marked "Internet Public". Not export controlled. | Datum and positional tolerancing policy. Evidence that NASA follows ASME Y14.5-2018. |
| Drawing practice | NASA GSFC-X-673-64-1F, *Engineering Drawing Standards Manual*, August 1994 | https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/NASA%20GSFC-X-673-64-1F.pdf | Publicly hosted U.S. Government work. Cites ANSI Y14.5M-1982. | Datum labeling, no implied datums, true position practice |

No other technical sources are allowed in v1.

### 7.2 AI Tools Used

| Tool | Official source | How it is used |
|---|---|---|
| Claude Opus 5.5 | Anthropic official documentation | Requirements planning, coding assistance, debugging, and development through Claude in VS Code |
| OpenAI API | OpenAI official API documentation | Runtime generation of short explanations for incorrect answers |

### 7.3 Citations shown on the website

The site must have a **Sources** page, linked from the footer of every page. It must state:
- [ ] Every source in Section 7.1, with author, title, date or revision, and link.
- [ ] The CC BY 4.0 attribution for Part I: title, author, a link to the license, and a note that the site's explanations are original and paraphrase the ideas.
- [ ] That the CTC-05 drawing is a NIST public-domain test drawing, viewed through a third-party copy.
- [ ] That NASA bases its dimensioning and tolerancing rules on ASME Y14.5. KSC-GP-435 Vol. I invokes ASME Y14.5-2018, and GSFC-X-673-64-1F invokes ANSI Y14.5M-1982. The NIST and NASA slide decks also teach ASME Y14.5.
- [ ] That the main GD&T standards, ASME Y14.5 and ISO 1101, are paid documents and are not publicly available for free download. This is why the site relies on free public sources and paraphrases ideas instead of quoting the standards.
- [ ] That the site is an independent educational project and is not affiliated with or endorsed by NASA, ASME or ISO.
- [ ] The full credits list in Section 7.5, grouped the same way.
- [ ] Each lesson also shows a short source line, for example "Based on Berez, Part I, slide 30, and NASA GD and T Basics, slide 22."

### 7.4 Source coverage check (flagged items)

Checked on 2026-10-03 by reading the text of all approved PDFs. The NIST CTC-05 drawing was not text-checked.

| Topic | Supported? | Where |
|---|---|---|
| GD&T symbols and the 5 control families | **Yes** | Part I slides 13, 27, 40. NASA slide 17. |
| Feature control frame parts and placement | **Yes** | Part I slides 28, 39. NASA slides 16, 21. |
| Tolerance zone idea | **Yes** | Part I slide 7. NASA slide 16. |
| Datums and datum reference frame | **Yes** | Part I slides 13 to 23. NASA slide 16. GSFC p97, p119. KSC p20, p27. |
| Flatness | **Yes** | Part I slides 27, 30: form control, no datum reference. NASA slide 22: zone is 2 parallel planes. Part II slide 25: inspection. |
| Perpendicularity | **Yes** | Part I slides 27, 32, 33: 90 degrees to a datum, datum required. NASA slide 25: 2 parallel lines or planes for a surface, a cylinder for a feature of size axis. Part II slide 24: inspection. |
| Position | **Yes** | Part I slides 27, 28, 35: locates a center, axis or median plane from a datum reference frame. The diameter symbol sets a cylindrical zone shape. NASA slide 23: basic dimensions set the true position at the zone's center. Part II slide 26: inspection. |
| MMC, LMC and bonus tolerance | **Partly** | Part I slide 45 defines MMC and LMC, but slide 28 says modifiers are not covered. Already out of scope for v1. |
| Counterbore symbol | **No** | Not in any approved source. Left out of v1. |
| Avoid repeated dimensions across views | **No** | Part I slide 20 only says not to repeat datum callouts. Left out of v1. |

**Source-supported errors for "What is wrong with this drawing?" questions:**
- Flatness with a datum reference. Part I slide 27 says flatness takes no datum.
- Perpendicularity with no datum reference. Part I slides 27 and 32.
- Position located with plus/minus dimensions instead of basic dimensions. Part I slide 35, NASA slide 23.
- The same datum feature labeled twice. Part I slide 20.
- A datum feature symbol placed on a center line. Part I slide 20.
- A feature located from an implied datum with no datum letter. GSFC p119.

**Agent rule:** do not write content for any "No" item. For "Partly" items, use only what the listed slides say.
### 7.5 Full credits list

The Sources page must show everything below. Group B is acknowledged because their work appears inside the approved sources. **Nothing from Group B is reproduced on this site.**

**A. Authors and institutions of the approved sources**

| Source | People | Institutions and hosts |
|---|---|---|
| Fundamentals of GD&T, Part I | Jaime Berez, Ph.D. | Center for Precision Metrology, Department of Mechanical Engineering and Engineering Science, University of North Carolina at Charlotte. An earlier version was developed at the Georgia Institute of Technology. Hosted on Zenodo, operated by CERN. |
| Fundamentals of GD&T, Part II | Jaime Berez, Ph.D. and Maxwell Praniewicz, Ph.D. | UNC Charlotte. National Institute of Standards and Technology (NIST), Intelligent Systems Division, Production Systems Group. Hosted by NIST. |
| GD and T Basics | Adam Willis | NASA Marshall Space Flight Center. Given as a guest lecture at the University of Alabama in Huntsville. Hosted on the NASA Technical Reports Server (NTRS). |
| CTC-05 machined part drawing | No individual authors listed | NIST PMI CAD models, a U.S. Government work. Viewed through the Innerscene drawing library. |
| KSC-GP-435 Volume I | No individual authors listed | NASA Kennedy Space Center, Engineering Directorate. Hosted on the NASA Technical Standards System. |
| GSFC-X-673-64-1F | No individual authors listed | NASA Goddard Space Flight Center, Mechanical Engineering Branch. Hosted on a NASA knowledge-base server. |

**B. Third parties whose work appears inside the approved sources**

| Credited in | Who | What |
|---|---|---|
| Part I and Part II | Richard G. Budynas and J. Keith Nisbett, McGraw-Hill | Shigley's Mechanical Engineering Design, 10th edition, 2014. Source of many figures. Part II spells the name "Bundynas". |
| Part II | Mitutoyo America Corporation | Digital outside micrometer example |
| Part II | The L.S. Starrett Company | Digital indicator example |
| Part II | D.A. Maisano et al. | Shipbuilding measurement study, Production Engineering, 2023 |
| Part II | S. Feng et al. | Fringe projection calibration review, Optics and Lasers in Engineering, 2021 |
| Part II | P. Shah, R. Racasan and P. Bills | Additive manufacturing computed tomography study, Case Studies in Nondestructive Testing and Evaluation, 2016 |
| Part II | GrabCAD community model "Spacehugger" | Case-study part. The model's author is not named in Part II. |
| Part II | S. Kalpakjian and S. Schmid, Pearson Education | Listed as further reading |
| NASA slides | Shawn W. Skinner, via imgflip.com | Title slide image |
| NASA slides | Krulikowski Consulting | Feature control frame figure |
| NASA slides | Factorem and GD&T Basics (gdandtbasics.com) | GD&T symbol references |
| Part I | SME Tooling U | Listed as a learning resource |

**C. Standards bodies named in the sources.** These are named for context only. Their standards are not used as content.
- ASME: Y14.5, Y14.5.1, Y14.41, Y14.46, Y14.100, B4.1, B4.2 and B18.2.8
- ISO Technical Committee 213, including ISO 1101
- ANSI: Y14.5M-1982
- American Welding Society: A2.4

**D. Tools and services used to build and run the site**
- OpenAI API, for wrong-answer explanations
- Anthropic Claude, for planning and coding help
- Open-source software: Flask by the Pallets Projects, Gunicorn, the OpenAI Python library and python-dotenv
- Render, for hosting
- IBM Plex fonts by IBM, SIL Open Font License 1.1

**Disclaimer to show:** this site is an independent student project. It is not affiliated with or endorsed by any person, institution or company listed above.

---

## 8. Data and Privacy

| Item | Your answer |
|---|---|
| Personal data collected | None |
| Data sent to OpenAI | Only the challenge/question context and information needed to generate feedback, plus the text of TutorBot messages the user types. No name, email, nickname, or other personal information is collected. The chat panel reminds users not to type personal information. |
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
- **Part I author.** Part I is by J. Berez at UNC Charlotte and does not name NIST. It is the first half of a seminar series whose Part II was co-written with NIST. The site should cite it under Berez's name, not as a NIST publication.
- **Original NIST link for CTC-05.** The approved link is a third-party copy. If you find NIST's own page for the PMI test cases, add it to Section 7.1.
- **Agent under test.** Fill in the header table before each agent run.
