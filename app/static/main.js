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
function ingestNotes (intervalSize, noteArray, songLength) {
    let validChars = 'abcdefghijklmnopqrstuvwxyz';
    let noteMaps = {};
    for (let i = 0; i < songLength / intervalSize; i++) {
        noteMaps[i] = {};
        for (let c = 0; c < validChars.length; c++) {
            noteMaps[i][validChars.charAt(c)] = 0;
        }
    }
    for (let note = 0; note < noteArray.length; note++) {
        let start = Math.ceil(noteArray[note]['timestamp']/intervalSize) * intervalSize;
        let end = Math.floor((noteArray[note]['timestamp'] + noteArray[note]['time']) / intervalSize) * intervalSize;
        for (let time = start; time < end; time += intervalSize) {
            noteMaps[time/intervalSize][noteArray[note]['char']] = 1;
        }
    }
    return noteMaps;
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
    text.setText(output);
}
