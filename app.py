"""GD&T Trainer: Flask server.

This is a placeholder so Render can build and start the app.
The real pages and the OpenAI explanation API will be added later.
"""
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, send_from_directory

# Load variables from a local .env file when running on your own computer.
# On Render there is no .env file; the key comes from the Environment tab.
load_dotenv()

# Render's start command "gunicorn app:app" looks for this object named "app".
app = Flask(__name__, static_folder="static", static_url_path="")


@app.route("/")
def home():
    """Serve the home page from the static folder."""
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/health")
def health():
    """Quick check that the server is running.

    Reports only WHETHER the OpenAI key is set, never the key itself.
    """
    return jsonify(
        status="ok",
        openai_key_configured=bool(os.environ.get("OPENAI_API_KEY")),
    )


if __name__ == "__main__":
    # Local development: run "python app.py" and open http://127.0.0.1:5000
    app.run(debug=True)
