# Prompt Log: GD&T Trainer

GD&T Trainer is a free website for engineering students and makers to learn GD&T and practice reading engineering drawings. This log records how it was built with AI assistance, from the first plan to the final version.

## AI models and tools used

| Tool | Model | What it was used for |
|---|---|---|
| Claude Code (Anthropic), in the VS Code extension | Claude Fable 5.1 and Claude Opus 5.5 | Planning, the requirements template, source checking, writing all code, drawings and content, testing, git commits |
| A second AI agent | *[fill in which tool you used]* | Independent test-only review of version 1. It reported 18 issues and changed no code. |
| OpenAI API, inside the finished site | gpt-4.1-mini | Runtime feature only: "Explain my mistake" and the TutorBot chat. Not used to write the project. |

Claude ran its own tests with Python, Flask's test client, and Selenium with headless Chrome.

## Development process

| Date | Stage | What happened |
|---|---|---|
| Oct 2 | Plan | Asked for a requirements template and filled it in myself: audience, scope, features, tech stack, limits. |
| Oct 3 | Sources and setup | Chose the NASA references, then the NIST and NASA GD&T sources. Set up the OpenAI key, `.env` and Render. Fixed the first failed deploy. |
| Oct 3 | Version 1 build | Claude built all four modes from the requirements: Learn, Challenge, Visualize and Progress. |
| Oct 3–4 | Drawing review | I found underdefined drawings, such as missing datums, basic dimensions and hole sizes. All drawings were redrawn as fully defined two-view drawings. |
| Oct 4 | Features and design | Added TutorBot, a page-aware AI chat. Restyled the site as an engineering drawing sheet. |
| Oct 4 | Independent review | A second agent tested version 1 and wrote a report. The High and Medium issues were fixed. |
| Oct 5 | TA review | Following my TA's feedback, added progress charts over time. |
| Oct 6 | Simplify scoring | Replaced the confusing "Learned" rule with one score and a retake flow. |
| Oct 7 | Question bank | Each question now has 3 versions, 36 in total, so a retake shows a different drawing. Wrote the presentation script. |

## Time spent

| Work | Time | Stages it covers |
|---|---|---|
| Refining the requirements document | about 1 hour | Plan, sources and setup |
| Building, and fixing the AI's mistakes in the diagrams | about 2 hours | Version 1 build, drawing review |
| Agent testing and fixing again | about 2 hours | Independent review and fixes |
| Refining the UI, adding TutorBot, working out the alternative learning flow, and recording the video | about 2 hours | Features and design, progress charts, simpler scoring, question bank, script and video |
| **Total** | **about 7 hours** | |

Commit history: initial commit Oct 2, requirements Oct 3, version 1 Oct 3, drawings, TutorBot and UI Oct 4, review fixes Oct 4, scoring and charts Oct 6, question versions Oct 7.

## Who wrote what

- **Written by me:**
  - the answers in the requirements document, `docs/REQUIREMENTS_TEMPLATE.md`
  - the choice of sources and the rules for using them
  - all feature and scope decisions
  - the setup of the OpenAI key, Render and GitHub access
  - reviewing the drawings, the test report and the TA feedback
- **Written by Claude, directed by my prompts and reviewed by me:**
  - all code: `app.py`, `static/js/`, `static/css/`, the HTML pages
  - the lesson and challenge text in `static/data/`
  - all SVG drawings
  - the tests
- **Code written or substantially modified by me:** *[none, or list any files you edited by hand]*

## Key prompts, verbatim

The responses below are short summaries. The prompts are copied exactly as I typed them, typos included.

### 1. The plan
> I am creating a website for engineering students and hobbyists to practice GD&T concepts and learn how to interpret engineering drawings. I want there to be a Learn Mode where users can learn symbols and concepts such as flatness, perpendicularity, position, profile, and datum planes with some explanations and visual examples. I also want a Drawing Challenge Mode where the website shows a simplified engineering drawing or manufactured part and asks questions such as “What does this symbol mean?”, “What feature does this tolerance apply to?”, or “What is wrong with this drawing?” I want a Tolerance Visualization Mode where users can change tolerance values using sliders and visually see the allowed tolerance zone become larger or smaller. I also want the website to save and track user scores and areas where the user may need more practice.
> I am going to try use publicly available NASA engineering drawing standards and other openly accessible educational sources as references. I want the project to rely on free APIs, open source free tools, and public and free documents or standards. The only paid service I currently plan to use is the OpenAI API.
> Please generate a requirements document template for this project that I can fill in myself for different agent testing purposes. Do not yet design the website. Ask me needed questions and guide me through the process, telling me what you need and what do I have to do from my end. The template should have the project overview and purpose, core features, API requirements, UI/UX requirements and other requirements you might need me to fill in before starting. Keep the template simple as I plant to spend maximum of 8 hrs on this beginner website project.

**Result:** an 11-section requirements template that I filled in myself.

### 2. Review of my requirements
> I have finished the requirements document. Please read the entire requirements document before making any changes. Ask me for necessary steps I need to take from my side

**Result:** Claude raised 7 questions about conflicts and gaps, and listed the setup tasks I had to do.

### 3. My decisions and the first source rules
> 1. OKay i added it back. 2. Alright change it then the way you recommend for this specific issue. 3. Alright change it accoridng to your reommendation. 4. Yes, this recommendation is okay. 5. Yes change it the way you see it for this issue. 6. I see, that recommendaiton is good. 7. Free edition is fine for this class project.  As for sources: https://standards.nasa.gov/node/815, (there are two pdfs ont his website, is link enough or do you want me to attach pdfs?), https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/NASA%20GSFC-X-673-64-1F.pdf. Use NASA KSC-GP-435 Volume 1 and NASA GSFC-X-673-64-1F as the allowed technical references for version 1. Do not copy ASME or ISO not free material into the project. If a GD&T rule cannot be confidently supported by the allowed public sources, flag it for me instead of inventing it. Also make sure that somewhere on the website NASA is cited and the fact that NASA based their standards on ASME, cite that too. Also cite the main issue of standards not being publicly available for download

**Result:** Claude read both NASA documents and flagged that they don't define flatness, perpendicularity zones or the symbols. I needed more sources.

### 4. Keeping my API key private
> can you give me instructions on .env file and API key and render stuff to set it up before we close the source gap? I don't want you reading the API key though

**Result:** step-by-step setup, plus a project setting that blocks Claude from reading `.env`. The block was tested.

### 5. Fixing the first deploy
> OKay so deploy is failed. I will give you sources later lets fix this first

**Result:** the build failed because `requirements.txt` was missing. Claude added a small placeholder Flask app, and the deploy worked.

### 6. Approved educational sources
> alright now lets do sources. Use NIST “Fundamentals of Geometric Dimensioning and Tolerancing,” as the primary educational reference for GD&T concepts including datums, form, orientation, location, symbols, and feature control frames. Use NIST Part II and NASA “GD and T Basics” as supporting references but since they have copyright material do not copy their figures or use their copyrighted material. You may also use NIST PMI public-domain engineering drawings as references for how GD&T appears on real drawings.
> Do not copy diagrams, figures, or explanatory text from any source into the website. Write original educational explanations and create original SVG drawings. If a technical claim cannot be supported by the approved sources, flag it rather than inventing it. Do not use not public ASME or ISO documents as website content. https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=936463, https://www.innerscene.com/tools/library/drawings/machined-part-drawing-nist-ctc-05-gd-t-f2a95d84, https://ntrs.nasa.gov/citations/20250011008, https://zenodo.org/records/8237096

**Result:** these sources closed the gap. Every lesson and question now cites a specific slide or page.

### 7. Credit
> include all the instituion, companies, authros that might be relateed to make sure they receive credit

**Result:** a full credits section, covering the authors and institutions, the third parties named inside the sources, the standards bodies and the tools.

### 8. Build
> Alright now let's start building

**Result:** version 1 with all four modes, original SVG drawings, an AI explanation endpoint with daily limits, and automated tests.

### 9. My review of the drawings
> some examples are underdefined in the gd and t and makes me question it

> Yeah lets do 1 and 2 first. Then i will say 3 and 4 after i come back

> Now step 3 and 4

**Result:** every drawing was redrawn as a fully defined two-view drawing. Each "what is wrong" drawing now has exactly one error, and every citation was rechecked.

### 10. Questioning the design
> When I reset progress, are the challenge questions generated again, randomly selected/shuffled from a fixed question bank, or always presented exactly the same?

> so what is the use of openAI API if we are just hardcoding the same questions

**Result:** Claude confirmed the questions were a fixed bank and that the AI only rephrased explanations. That led to the next two features.

### 11. TutorBot
> I want to add a floating chatbot feature then. The chatbot sees what page you are and if you have questions about the learn mode challenge mode and any mode, you could jump into discussion with the TutorBot

**Result:** a floating, page-aware chat. It answers only from the site's checked content and never spoils an unanswered question. Testing caught it answering off-topic, so its rules were tightened.

### 12. Visual design
> This is great. Now UI wise, I want you to make the website look more mechanical engineery rather than borinx blue and white background

**Result:** an engineering drawing-sheet style with a drafting grid, graphite and orange colors, technical fonts and a title-block footer.

### 13. Independent testing
> Do I need a separate branch? I want the next agent to simply test things not modify or edit. I want it to report issues

> Whats the promtp. Make sure they dont look at my .env files. They should just test to see for any bugs or issues

**Result:** a strict review prompt with no edits, no secret files and a limited AI budget. The second agent reported 18 issues.

### 14. Fixing the report
> The agent saved the test report in .claude folder. Please read the report, and fix high and medium level issues under x2

**Result:**
- answer options now shuffle
- TutorBot no longer confirms guesses
- the rate limit can no longer be bypassed
- a missing hole dimension was added
- drawings are readable on phones

### 15. TA feedback
> I went to TA review and they told me to add a visualization of progress. So in the progress tab you could add the graphs on users progress over time

**Result:** progress charts over time in plain SVG, readable by hover and keyboard, with a table view.

### 16. Simplifying the scoring
> okay honestly the success criterion is very confusing to the user. Let's just get rid of that. So they just get the final score on the progress page. They go to the needs more practice recommendation and relearn that chapter, and then take that specific challenge question again and get it right. Then it will give them 100%. But the previous progress wont be erased. Like the graph will show u got 11/12 or 92% at this day and time and then graph shows increase to 100% next time

**Result:** one score, with "Needs more practice" links to the lesson and the exact question, and a chart that keeps the full history.

### 17. A bigger question bank
> Oh I know how to improve the learning.So once the user takes the test and say they got 11/12 right. The progress bar shows 11/12 (in percentage) on that time and day. Then the user can come back to that question and redo that question they did wrong. But that question will no longer be the same. Once they get it wrong, they have an option to "restart the question" which will generate a question in the same topic but different diagram or drawing. So they have to answer to that to get 12/12. For that you will need a bigger question bank

**Result:** 24 new questions with original drawings, 36 in total. A wrong answer offers a new version of the same question.

### 18. Presentation script
> can you make a script so I could describe this project 2-3 minutes

> dont call it an update cuz i havent started recording the video. Just say to improve learning, if the user got the question wrong in the challenge mode, then they will receive a different question in the same topic to earn that point back

**Result:** a script of about 2.5 minutes for the project video.

## Smaller prompts not listed

These include setup questions (the variable name, the Start Command, the website link), the difference between a commit and a push, and requests to launch the preview or commit and push.
