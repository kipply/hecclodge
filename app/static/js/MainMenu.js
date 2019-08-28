var MainMenu = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize:

  function MainMenu() {
    Phaser.Scene.call(this, { key: 'mainMenu', active: true });
  },

  preload: function() {
    this.load.image('background', 'static/starfield.png');
  },

  create: function() {
    var background = this.add.image(windowWidth/2, windowHeight/2, 'background');

    background.setOrigin(0.5, 0.5).setDisplaySize(windowWidth*2, windowHeight*2);
    this.cameras.main.zoom = 0.5;

    // Creates object for input with WASD kets
    moveKeys = this.input.keyboard.addKeys({
      'start': Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.input.keyboard.on('keydown_SPACE', function (event) {
      console.log("hi")
      game.scene.remove('mainMenu');
      game.scene.add('game', Game, true);
      gameStarted = true;
    });

    titleText = this.add.text(windowWidth/2, windowHeight/2 - 50, 'Bullet Lodge', { align: 'center', fontSize: '100px', fill: '#FFFFFF'});
    instructionText = this.add.text(windowWidth/2, windowHeight/2, 'Click Space to Start', { align: 'center', fontSize: '32px', fill: '#FFFFFF'});
    titleText.setOrigin(0.5, 0.5);
    instructionText.setOrigin(0.5, 0.5);
  }
});
