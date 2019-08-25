notation  = [
    {'char':'a', 'timestamp':0}, 
    {'char':'b', 'timestamp':1}, 
    {'char':'c', 'timestamp':2}, 
    {'char':'d', 'timestamp':4}, 
    {'char':'a', 'timestamp':5}, 
]

function readNotes(curTime, notes) {
    let timeDiff = 10;
    let curStart = 0, curEnd = 0;
    let validChars = 'abcd';
    counters = {'a':0, 'b':0, 'c':0, 'd':0};
    while (curEnd < notes.length) {
        if (notes[curEnd]['timestamp'] - notes[curStart]['timestamp'] <= timeDiff) {
            curEnd += 1;
            if (curEnd === notes.length) break;
            if (notes[curEnd]['timestamp'] - notes[curStart]['timestamp'] <= timeDiff) {
                counters[notes[curEnd]['char']] = timeDiff;
            }
        } else {
            curStart += 1;
        }
        for (let i = 0; i < validChars.length; i++) {
            if (counters[validChars.charAt(i)] > 0) {
                counters[validChars.charAt(i)] -= 1;
            }
        }
        console.log("Boundaries are " + curStart + " and " + curEnd);
        console.log("Counters are " + JSON.stringify(counters));
    }
}

readNotes(notation);
