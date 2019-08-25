var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    scene: {
        create: create,
        update: update
    }
};

var text;
var graphics;
var hsv;
var timerEvents = [];

var game = new Phaser.Game(config);

function create ()
{
    text = this.add.text(32, 32);

    for (var i = 0; i < 32; i++)
    {
        timerEvents.push(this.time.addEvent({ delay: Phaser.Math.Between(1000, 8000), loop: true }));
    }

    hsv = Phaser.Display.Color.HSVColorWheel();

    graphics = this.add.graphics({ x: 240, y: 36 });
}

//assume the song notation is well-formed
//ignore song lengths for now, just assume we're trying to hit within buffer zone
//return the current note to change as needed
function getCurChars(curTime, noteArray, curNote, charCounters) {
    let bufferTime = 0; //change if current changes
    let validChars = 'abcd';
    let curStart = noteArray[curNote]['timestart'];
    for (let i = 0; i < validChars.length; i++) {
        if (charCounters[validChars.charAt(i)] > 0) {
            charCounters[validChars.charAt(i)] -= 1;
        }
    }
    if (curTime > curStart + bufferTime) {
        charCounters[noteArray[curNote]['char']] = bufferTime;
        curNote += 1;
    }
    return curNote;
}

function update ()
{
    var sampleSong = {
        0: {'a': 0, 'b': 0},
        1: {'a': 0, 'b': 1},
        2: {'a': 1, 'b': 1},
        3: {'a': 1, 'b': 0},
        4: {'a': 0, 'b': 0},
    };
    
    var output = [];

    graphics.clear();

    for (var i = 0; i < timerEvents.length; i++)
    {
        output.push('Event.progress: ' + timerEvents[i].getProgress().toString().substr(0, 4));

        graphics.fillStyle(hsv[i * 8].color, 1);
        graphics.fillRect(0, i * 16, 500 * timerEvents[i].getProgress(), 8);
    }

    output.push('The current state: ' + JSON.stringify(sampleSong[parseInt(timerEvents[0].getProgress() * 5)]) );
    output.push('The current char counter: ' + JSON.stringify(sampleSong[parseInt(timerEvents[0].getProgress() * 5)]) );
    text.setText(output);
}
