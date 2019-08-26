import essentia
import pdb
from essentia.standard import BeatTrackerDegara


def get_beats(filename):
    loader = essentia.standard.MonoLoader(filename='static/' + filename)
    audio = loader()

    beat_tracker = BeatTrackerDegara()
    return beat_tracker(audio).tolist()[1] - beat_tracker(audio).tolist()[0]
