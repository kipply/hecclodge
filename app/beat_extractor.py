import essentia
import pdb
from essentia.standard import RhythmExtractor2013

def get_beats(filename):
    loader = essentia.standard.MonoLoader(filename='static/' + filename)
    audio = loader()

    rhythm_extractor = RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)
    cnt = 0
    for i in range(len(beats)):
        cnt += 1
        if beats[i] > 10: break
    return round(bpm)
