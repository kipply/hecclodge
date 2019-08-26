from flask import Flask, request, render_template
from beat_extractor import get_beats
app = Flask(__name__)

@app.route('/')
def hello():
    beats = get_beats('test.mp3')
    print(app.root_path)
    print(beats)
    return render_template('index.html', beats=beats)
