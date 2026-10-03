# gdt-trainer

Interactive web app for engineering students and hobbyists to practice GD&T concepts and interpret engineering drawings.

It has four modes:
- **Learn:** short lessons on datums, flatness, perpendicularity and position, each with a quiz.
- **Challenge:** 12 drawing questions, with hints and optional AI explanations of wrong answers.
- **Visualize:** sliders that grow or shrink a tolerance zone until a part passes.
- **Progress:** scores and the concepts that need more practice, saved in the browser.

## Run it on your computer

```
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python app.py
```

Then open http://127.0.0.1:5000. AI explanations need `OPENAI_API_KEY` in a `.env` file. Everything else works without it.

## Where things live

| Path | What it holds |
|---|---|
| `app.py` | Flask server: serves the pages and the `/api/explain` AI endpoint |
| `static/*.html` | One page per mode, plus the Sources page |
| `static/js/` | Page logic. `storage.js` handles saved progress. |
| `static/data/` | Lesson, challenge and visualizer text, as JSON. Edit content here. |
| `static/drawings/` | Original SVG drawings. Clickable features have `class="target"`. |
| `docs/REQUIREMENTS_TEMPLATE.md` | The requirements this build follows |

## Deploy

Render runs `pip install -r requirements.txt`, then `gunicorn app:app`. The OpenAI key is set in Render's Environment tab.
