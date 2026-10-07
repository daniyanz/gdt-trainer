# Prompt Log: GD&T Trainer

A record of the requests made to the AI coding assistant (Claude, in Claude Code inside VS Code) while planning and building this project, with a short summary of each response.

- Requests are copied as written, including typos.
- Responses are condensed summaries, not full transcripts.
- Screenshots, attached files and generated code are not included. Where a request was a screenshot, it is described in brackets.

---

## Planning and requirements

### 1. Requirements template
**Request:** I am creating a website for engineering students and hobbyists to practice GD&T concepts and learn how to interpret engineering drawings. I want there to be a Learn Mode where users can learn symbols and concepts such as flatness, perpendicularity, position, profile, and datum planes with some explanations and visual examples. I also want a Drawing Challenge Mode where the website shows a simplified engineering drawing or manufactured part and asks questions such as "What does this symbol mean?", "What feature does this tolerance apply to?", or "What is wrong with this drawing?" I want a Tolerance Visualization Mode where users can change tolerance values using sliders and visually see the allowed tolerance zone become larger or smaller. I also want the website to save and track user scores and areas where the user may need more practice. I am going to try use publicly available NASA engineering drawing standards and other openly accessible educational sources as references. I want the project to rely on free APIs, open source free tools, and public and free documents or standards. The only paid service I currently plan to use is the OpenAI API. Please generate a requirements document template for this project that I can fill in myself for different agent testing purposes. Do not yet design the website. Ask me needed questions and guide me through the process, telling me what you need and what do I have to do from my end. The template should have the project overview and purpose, core features, API requirements, UI/UX requirements and other requirements you might need me to fill in before starting. Keep the template simple as I plant to spend maximum of 8 hrs on this beginner website project.

**Response:** Created `docs/REQUIREMENTS_TEMPLATE.md` with 11 sections: overview, scope, core features with acceptance criteria, API and AI, technical, UI/UX, sources and licensing, privacy, testing and agent evaluation, an 8-hour timeline, and open questions. Listed six key questions to answer first and the setup steps to do yourself: gather sources, get an OpenAI key with a spending cap, keep the key server-side, and review content.

### 2. Review the filled-in document
**Request:** I have finished the requirements document. Please read the entire requirements document before making any changes. Ask me for necessary steps I need to take from my side

**Response:** The saved file was still the blank template, so the edits were probably unsaved. Asked you to save it, and described what the review would check.

### 3. Saved
**Request:** saved

**Response:** Reviewed the filled document and asked 7 questions: the missing timeline, drawing basics outside the scope, a conflict between the success rule and the progress rule, whether quizzes count, NASA vs ASME, the per-user AI limit without accounts, and Render's free-tier sleep. Listed your setup tasks: NASA sources, OpenAI key and budget, Render account.

### 4. Decisions and sources
**Request:** 1. OKay i added it back. 2. Alright change it then the way you recommend for this specific issue. 3. Alright change it accoridng to your reommendation. 4. Yes, this recommendation is okay. 5. Yes change it the way you see it for this issue. 6. I see, that recommendaiton is good. 7. Free edition is fine for this class project. As for sources: https://standards.nasa.gov/node/815, (there are two pdfs ont his website, is link enough or do you want me to attach pdfs?), https://s3vi.ndc.nasa.gov/ssri-kb/static/resources/NASA%20GSFC-X-673-64-1F.pdf. Use NASA KSC-GP-435 Volume 1 and NASA GSFC-X-673-64-1F as the allowed technical references for version 1. Do not copy ASME or ISO not free material into the project. If a GD&T rule cannot be confidently supported by the allowed public sources, flag it for me instead of inventing it. Also make sure that somewhere on the website NASA is cited and the fact that NASA based their standards on ASME, cite that too. Also cite the main issue of standards not being publicly available for download

**Response:** Applied all decisions and confirmed links were enough. Read both NASA PDFs and found that both point to ASME Y14.5 but neither defines flatness, perpendicularity zones, position zone shapes or the GD&T symbols. Flagged this source gap as blocking, and added the citation and paid-standards requirements to the document.

### 5. Setup help
**Request:** can you give me instructions on .env file and API key and render stuff to set it up before we close the source gap? I don't want you reading the API key though

**Response:** Gave step-by-step instructions for the OpenAI key with a $5 prepaid cap, the `.env` file, and Render. Added a project setting that blocks the assistant from reading `.env` files, and tested that the block works.

### 6. Commit before Render
**Request:** okay lets commit edits to git first so i could do render stuff

**Response:** Committed and pushed the requirements document and the settings file. Confirmed `.env` is ignored by git.

### 7. Render form
**Request:** [screenshot of the Render "new web service" form] okay

**Response:** Confirmed the settings and changed the Start Command to `gunicorn app:app`. Explained the environment variable step, and warned that the first deploy would fail until the app existed.

### 8. Environment variable name
**Request:** okay i just changed the start command. Now I am going to add .env file what variable name do i select

**Response:** Use `OPENAI_API_KEY`, both in Render and in the local `.env` file.

### 9. Key added
**Request:** okay i added the key to .env and render environment variables section.

**Response:** Confirmed `.env` exists and is ignored by git, without reading it. Next step: decide how to close the source gap.

### 10. What next
**Request:** render is all set. Api key is there. Now what do i do?

**Response:** Started searching for openly licensed GD&T sources. You stopped the search.

### 11. Failed deploy
**Request:** [screenshot: Render deploy failed] OKay so deploy is failed. I will give you sources later lets fix this first

**Response:** The deploy failed because there was no `requirements.txt` yet. Added a small placeholder Flask app and a requirements file, tested them locally and pushed. Explained how to check the deploy.

### 12. Build logs
**Request:** [screenshot of Render build logs]

**Response:** Those logs were from the old commit. Render also lacked access to the repo, so pushes weren't triggering deploys. Gave the steps for a manual deploy and for granting GitHub access.

### 13. Approved sources
**Request:** alright now lets do sources. Use NIST "Fundamentals of Geometric Dimensioning and Tolerancing," as the primary educational reference for GD&T concepts including datums, form, orientation, location, symbols, and feature control frames. Use NIST Part II and NASA "GD and T Basics" as supporting references but since they have copyright material do not copy their figures or use their copyrighted material. You may also use NIST PMI public-domain engineering drawings as references for how GD&T appears on real drawings. Do not copy diagrams, figures, or explanatory text from any source into the website. Write original educational explanations and create original SVG drawings. If a technical claim cannot be supported by the approved sources, flag it rather than inventing it. Do not use not public ASME or ISO documents as website content. (links to NIST Part II, the CTC-05 drawing, NASA GD and T Basics, and Zenodo Part I)

**Response:** Read all four sources. Part I, on Zenodo, is CC BY 4.0, by J. Berez of UNC Charlotte, with no NIST author. Part II is co-written with NIST. The NASA slides contain copyrighted figures. The source gap was closed, apart from the counterbore symbol and the repeated-dimension rule, which were left out. Updated the document with the sources, a per-concept coverage table and six supported "what's wrong" errors.

### 14. Full credits
**Request:** include all the instituion, companies, authros that might be relateed to make sure they receive credit

**Response:** Added a full credits section listing source authors and institutions, third parties credited inside the sources, standards bodies, and tools. Noted a misspelling in Part II, which has "Bundynas" instead of Budynas.

---

## Building version 1

### 15. Start building
**Request:** Alright now let's start building

**Response:** Built the site:
- Learn: 4 lessons with quizzes.
- Challenge: 12 questions, with click and multiple-choice answers.
- Visualize: tolerance sliders for flatness, perpendicularity and position.
- Progress: tracking stored in the browser.
- A Sources page with credits and privacy.
- A Flask API for AI explanations of wrong answers, with a daily limit and a fallback.

All drawings are original SVGs, and every claim cites a slide or page. Tested with server tests, 35 browser checks and phone layouts.

### 16. Preview
**Request:** let me see it

**Response:** Started the site locally and opened it in the browser.

### 17. Relaunch
**Request:** please start it again / pleae launch the website again

**Response:** The server was still running, so the site was reopened.

### 18. Underdefined drawings
**Request:** [screenshot of the two-hole drawing] some examples are underdefined in the gd and t and makes me question it

**Response:** Agreed, and audited all drawings. Several position drawings referenced an undefined datum A, lacked basic dimensions or lacked hole sizes. Some "what's wrong" drawings had more than one error. Proposed four fix steps.

### 19. Fix steps 1 and 2
**Request:** Yeah lets do 1 and 2 first. Then i will say 3 and 4 after i come back

**Response:** Redrew the position and "what's wrong" drawings as complete two-view drawings. They now show datum A, hole sizes, basic dimensions, overall sizes and a general-tolerance note. Each "what's wrong" drawing has exactly one error.

### 20. Fix steps 3 and 4
**Request:** Now step 3 and 4

**Response:** Fully dimensioned the remaining six drawings and rechecked every citation against the source text. Flagged one open question: whether a perpendicularity zone may shift sideways.

### 21. Open the project
**Request:** open the peroject pls

**Response:** Opened the local site.

---

## Questions, TutorBot and design

### 22. Are questions generated?
**Request:** When I reset progress, are the challenge questions generated again, randomly selected/shuffled from a fixed question bank, or always presented exactly the same?

**Response:** Always exactly the same: a fixed bank of 12 in a fixed order. Reset only clears scores. Offered shuffling.

### 23. Expected random questions
**Request:** No i thought the questions are randomly generated but the same amount per topic

**Response:** Explained that the approved requirements specify a fixed bank. Gave three options: a bigger bank with random picks, template-generated variants, or AI-generated questions (not recommended).

### 24. Purpose of the OpenAI API
**Request:** so what is the use of openAI API if we are just hardcoding the same questions

**Response:** Currently it only rewords explanations of wrong answers. Suggested a lesson tutor as a more useful option, or removing OpenAI entirely.

### 25. TutorBot
**Request:** I want to add a floating chatbot feature then. The chatbot sees what page you are and if you have questions about the learn mode challenge mode and any mode, you could jump into discussion with the TutorBot

**Response:** Built TutorBot, a floating chat that knows the current page. It answers only from the site's checked content, gives hints without spoiling unanswered challenges, and has a limit of 30 messages per day. Testing caught it answering an off-topic question and naming a lesson that doesn't exist, so its rules were tightened and it was retested.

### 26. Engineering look
**Request:** This is great. Now UI wise, I want you to make the website look more mechanical engineery rather than borinx blue and white background

**Response:** Restyled the site as an engineering drawing sheet:
- a drafting-grid background
- graphite and safety-orange colors
- self-hosted IBM Plex fonts
- a footer styled as a title block
- a slider readout styled like a caliper

### 27. Next steps
**Request:** I like it. Now what do i do?

**Response:** Listed the remaining steps: decide the open questions, review the content, commit and push, deploy, and run the agent comparison.

---

## Testing and fixes

### 28. Agent comparison first
**Request:** I will do agent comparison before publishing

**Response:** Suggested saving this build on its own branch and giving the other agent a clean starting point and a frozen copy of the requirements.

### 29. Test-only review
**Request:** Do I need a separate branch? I want the next agent to simply test things not modify or edit. I want it to report issues

**Response:** No branch needed, but commit first. Provided a review prompt with rules: no edits, never read `.env`, at most 10 AI calls, and report in a fixed format.

### 30. Commit
**Request:** Alright let's commit

**Response:** Committed locally, without pushing.

### 31. Website link
**Request:** Alright what is the website link

**Response:** The local preview is at `http://127.0.0.1:5050`. The public Render site still showed the placeholder because nothing had been pushed.

### 32. Commit vs push
**Request:** Oh, didnt you commit things tho?

**Response:** Explained that committing saves a snapshot on your computer, while pushing sends it to GitHub, which Render deploys from.

### 33. Push
**Request:** Let's push and hten test?

**Response:** Pushed, and gave the Render deploy and health-check steps.

### 34. Testing order
**Request:** Okay now testing right

**Response:** Confirmed the order: check the live site, run the reviewer, check `git status`, then paste the report.

### 35. Reviewer prompt
**Request:** Whats the promtp. Make sure they dont look at my .env files. They should just test to see for any bugs or issues

**Response:** Provided the reviewer prompt with strict secret-file rules. Suggested moving `.env` out of the folder during a non-Claude review.

### 36. Fix the report's issues
**Request:** The agent saved the test report in .claude folder. Please read the report, and fix high and medium level issues under x2

**Response:** Fixed issues 1 to 6:
- answer options are now shuffled
- only first tries counted toward status
- TutorBot no longer confirms guesses
- the rate limit can't be bypassed, plus a site-wide cap
- the missing hole dimension was added
- drawings are readable on phones

All 38 checks passed. Noted that the reviewer had created a file despite the rules.

### 37. Commit and push
**Request:** commit and push

**Response:** Committed and pushed, and gave the Render deploy steps and an IP check.

---

## Progress and scoring

### 38. Progress charts (TA feedback)
**Request:** I went to TA review and they told me to add a visualization of progress. So in the progress tab you could add the graphs on users progress over time

**Response:** Added plain-SVG charts:
- progress over time, overall and per concept
- daily accuracy
- a table view of the data

Charts can be read by hover and keyboard, and draw at full size on phones.

### 39. Launch
**Request:** launch it

**Response:** Opened the Progress page locally.

### 40. Launch again
**Request:** can you launch it again

**Response:** Reopened the site.

### 41. Simpler scoring
**Request:** okay honestly the success criterion is very confusing to the user. Let's just get rid of that. So they just get the final score on the progress page. They go to the needs more practice recommendation and relearn that chapter, and then take that specific challenge question again and get it right. Then it will give them 100%. But the previous progress wont be erased. Like the graph will show u got 11/12 or 92% at this day and time and then graph shows increase to 100% next time

**Response:** Replaced the statuses with one score: the share of questions whose latest answer is right. Added "Needs more practice" links to the lesson and the exact question, and a score-over-time chart that keeps the history. Noted that this reverses the earlier first-try rule. All 42 checks passed.

### 42. Launch
**Request:** launch it please

**Response:** Opened the Progress page locally.

### 43. Push
**Request:** okay this looks good push the changes

**Response:** Committed and pushed.

---

## Presentation and question versions

### 44. Presentation script
**Request:** can you make a script so I could describe this project 2-3 minutes

**Response:** Wrote a script of about 2.5 minutes. Sections: opening, the problem, sources, the four modes, AI and TutorBot, how it's built, and testing and closing.

### 45. A different question for each retake
**Request:** Oh I know how to improve the learning.So once the user takes the test and say they got 11/12 right. The progress bar shows 11/12 (in percentage) on that time and day. Then the user can come back to that question and redo that question they did wrong. But that question will no longer be the same. Once they get it wrong, they have an option to "restart the question" which will generate a question in the same topic but different diagram or drawing. So they have to answer to that to get 12/12. For that you will need a bigger question bank

**Response:** Added 24 new questions with original, fully defined drawings, for 36 in total: 12 slots with 3 versions each. A "Try a new version" button appears after a wrong answer, and returning to a missed question shows a new version. The score counts each slot's latest answer. All 36 versions were tested, and 52 of 52 browser checks passed. Flagged four new questions that rely on sources more indirectly, for your review.

### 46. Question count
**Request:** so how many total unqieu questions u have

**Response:** 36 challenge questions: 9 per concept, across 12 slots with 3 versions each. The lessons also have 8 quiz questions.

### 47. Commit and push
**Request:** commit and push

**Response:** Committed and pushed.

### 48. Script update
**Request:** Now update the script to explain this update

**Response:** Revised the script to explain the three versions and earning points back.

### 49. Script wording
**Request:** dont call it an update cuz i havent started recording the video. Just say to improve learning, if the user got the question wrong in the challenge mode, then they will receive a different question in the same topic to earn that point back

**Response:** Rewrote that section in your wording, without calling it an update.

### 50. This log
**Request:** generate a prompt log md file and store it in this github. In the promptlog store all my requests and your responses but no need to include files, photos, screenshots, etc.. Simple request and response

**Response:** Created this file, `docs/PROMPT_LOG.md`, and committed and pushed it to GitHub.
