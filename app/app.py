from flask import Flask, request, render_template
from beat_extractor import get_beats
app = Flask(__name__)

@app.route('/')
def hello():
    # beats = get_beats('test.mp3')
    return render_template('index.html')
