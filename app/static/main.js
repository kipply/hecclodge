var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
window.onload = function() {
  var context = new AudioContext();
  document.querySelector('button').addEventListener('click', function() {
    context.resume().then(() => {
      console.log('Playback resumed successfully');
    });
  });
}

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: windowWidth,
  height: windowHeight,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
    extend: {
      player: null,
      moveKeys: null,
      bullets: null,
    }
  }

};

var game = new Phaser.Game(config);
var score = 0;
var scoreText;
var beatLength = 0.71;

var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize:

  // Bullet Constructor
  function Bullet (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
    this.speed = 0.2;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.setSize(12, 12, true);
    this.scene = scene
  },

  // Fires a bullet from the player to the reticle
  fire: function (shooter) {
    this.setPosition(shooter.x, shooter.y); // Initial position
    this.direction = Math.PI/2 - shooter.rotation;

    // Calculate X and y velocity of bullet to moves it from shooter to target
    this.xSpeed = this.speed*Math.sin(this.direction);
    this.ySpeed = this.speed*Math.cos(this.direction);
    this.rotation = shooter.rotation; // angle bullet with shooters rotation
  },

  // Updates the position of the bullet each cycle
  update: function (time, delta) {
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;

    const bounds = this.scene.physics.world.bounds;
    if (this.x < bounds.x || this.y < bounds.y || this.x > bounds.x + bounds.width || this.y > bounds.y + bounds.height){
      this.destroy();
    }
  }
});


function preload () {
  // Load in images and sprites
  this.load.spritesheet('player_handgun', 'static/player_handgun.png',
    { frameWidth: 66, frameHeight: 60 }
  ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
  this.load.image('target', 'static/ball.png');
  this.load.image('background', 'static/starfield.png');
  this.load.image('bullet', 'static/bullet72.png');
  this.load.image('powerup', 'static/jets.png');
  this.load.image('enemy', 'static/melon.png');
  this.load.image('enemy_bullet', 'static/melon.png');

  this.load.audio('metronome', 'static/metronome.mp3');
}

function create () {
  // Create world bounds
  this.physics.world.setBounds(-windowWidth/2, -windowHeight/2, windowWidth*2, windowHeight*2);

  // Add background, player sprites, and bullets
  var background = this.add.image(windowWidth/2, windowHeight/2, 'background');
  player = this.physics.add.sprite(windowWidth/2, windowHeight/2, 'player_handgun');
  enemy = this.physics.add.sprite(100, 100, 'player_handgun');
  enemy.lastFired = 0;
  playerBullets = this.physics.add.group({classType: Bullet, runChildUpdate: true});
  enemyBullets = this.physics.add.group({classType: Bullet, runChildUpdate: true});

  //add score text
  scoreText = this.add.text(-windowWidth/2 + 50, -windowHeight/2 + 50, 'score: 0', { fontSize: '32px', fill: '#FFFFFF'});

  this.metronomeTicker = this.add.graphics();
  var graphics = this.add.graphics();
  graphics.lineStyle(2.5, 0xFFFFFF, 1);
  graphics.strokeRect(scoreText.x+  scoreText.width + 50, -windowHeight/2 + 50, windowWidth/2, 75);
  this.metronomeTimer = this.time.addEvent({ delay: beatLength * 10, callback: updateMetronome, callbackScope: this, repeat: 1 << 30 });

  // Set image/sprite properties
  background.setOrigin(0.5, 0.5).setDisplaySize(windowWidth*2, windowHeight*2);
  player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true).setDrag(500, 500);

  // Set camera zoom
  this.cameras.main.zoom = 0.5;

  // Creates object for input with WASD kets
  moveKeys = this.input.keyboard.addKeys({
    'up': Phaser.Input.Keyboard.KeyCodes.W,
    'down': Phaser.Input.Keyboard.KeyCodes.S,
    'left': Phaser.Input.Keyboard.KeyCodes.A,
    'right': Phaser.Input.Keyboard.KeyCodes.D,
    'rotate_left': Phaser.Input.Keyboard.KeyCodes.R,
    'rotate_right': Phaser.Input.Keyboard.KeyCodes.L,
    'shoot': Phaser.Input.Keyboard.KeyCodes.SPACE
  });

  // Enables movement of player with WASD keys
  this.input.keyboard.on('keydown_W', function (event) {
    player.setAccelerationY(-800);
  });
  this.input.keyboard.on('keydown_S', function (event) {
    player.setAccelerationY(800);
  });
  this.input.keyboard.on('keydown_A', function (event) {
    player.setAccelerationX(-800);
  });
  this.input.keyboard.on('keydown_D', function (event) {
    player.setAccelerationX(800);
  });
  this.input.keyboard.on('keydown_L', function (event) {
    player.setAngularAcceleration(400);
  });
  this.input.keyboard.on('keydown_R', function (event) {
    player.setAngularAcceleration(-400);
  });
  this.input.keyboard.on('keydown_SPACE', function (event) {
      if (player.active === false)
          return;

      // Get bullet from bullets group
      var bullet = playerBullets.create(300, 300, 'player_bullet');

      if (bullet) {
          bullet.fire(player);
          //this.physics.add.collider(enemy, bullet, enemyHitCallback);
      }
  });


  // Stops player acceleration on uppress of WASD keys
  this.input.keyboard.on('keyup_W', function (event) {
    if (moveKeys['down'].isUp)
      player.setAccelerationY(0);
  });
  this.input.keyboard.on('keyup_S', function (event) {
    if (moveKeys['up'].isUp)
      player.setAccelerationY(0);
  });
  this.input.keyboard.on('keyup_A', function (event) {
    if (moveKeys['right'].isUp)
      player.setAccelerationX(0);
  });
  this.input.keyboard.on('keyup_D', function (event) {
    if (moveKeys['left'].isUp)
      player.setAccelerationX(0);
  });
  this.input.keyboard.on('keyup_L', function (event) {
    if (moveKeys['rotate_left'].isUp)
      player.setAngularAcceleration(0);
      player.setAngularVelocity(0);
  });
  this.input.keyboard.on('keyup_R', function (event) {
    if (moveKeys['rotate_left'].isUp)
      player.setAngularAcceleration(0);
      player.setAngularVelocity(0);
  });


  // Locks pointer on mousedown
  game.canvas.addEventListener('mousedown', function () {
    game.input.mouse.requestPointerLock();
  });

  // Exit pointer lock when Q or escape (by default) is pressed.
  this.input.keyboard.on('keydown_Q', function (event) {
    if (game.input.mouse.locked)
      game.input.mouse.releasePointerLock();
  }, 0, this);
}

function destroyBullet(player, bullet) { //destroys bullet
  bullet.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
}

function playerHit(player, enemyBullet) { //this HURTS the player/game over!
  // this.physics.pause();
  player.setTint(0xff0000);
  gameOver = true;
}

function enemyFire(enemy, player, time, gameObject)
{
    if (enemy.active === false) {return;}
    if ((time - enemy.lastFired) > 1000) {
        enemy.lastFired = time;
        var bullet = enemyBullets.get().setActive(true).setVisible(true);

        if (bullet) {
            bullet.fire(enemy);
            gameObject.physics.add.collider(player, bullet, playerHit);
        }
    }
}

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity) {
  if (!sprite || !sprite.body)
    return;

  var angle, currVelocitySqr, vx, vy;
  vx = sprite.body.velocity.x;
  vy = sprite.body.velocity.y;
  currVelocitySqr = vx * vx + vy * vy;

  if (currVelocitySqr > maxVelocity * maxVelocity)
  {
    angle = Math.atan2(vy, vx);
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    sprite.body.velocity.x = vx;
    sprite.body.velocity.y = vy;
  }
}

function update (time, delta) {
  if (time % 100 === 1) { //add powerups flying around
    for (var i = 0; i < 30; i++) {
      var powerup = this.physics.add.image(400, 100, 'powerup');
      powerup.setVelocity(Math.random() * 100, Math.random() * 100);
      powerup.setBounce(1, 1);
      powerup.setCollideWorldBounds(true);
      //this.physics.add.collider(player, powerup);
      this.physics.add.overlap(player, powerup, destroyBullet, null, this);
    }
  }
  if (time % 50 === 2) { //add enemy bullets spawning (to avoid!)
    for (var i = 0; i < 5; i++) {
      var enemyBullet = this.physics.add.image(100, 400, 'enemy_bullet');
      enemyBullet.setVelocity(-Math.random() * 100, -Math.random() * 100);
      enemyBullet.setBounce(1, 1);
      enemyBullet.setCollideWorldBounds(true);
      //this.physics.add.collider(player, enemyBullet);
      this.physics.add.overlap(player, enemyBullet, playerHit, null, this);
    }
  }

  // Constrain velocity of player
  constrainVelocity(player, 500);

  // Enemy actions
  enemy.rotation = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  enemyFire(enemy, player, time, this);
}

function updateMetronome() {
  const iterations = this.metronomeTimer.repeat - this.metronomeTimer.repeatCount;
  const progress = ((iterations % 100) / 100.0);
  graphics = this.metronomeTicker;
  if (!progress) {
    this.sound.volume = 10;
    this.sound.play('metronome')﻿;
    graphics.clear();
   } else if (!(progress*100 % 25)) {
    this.sound.volume = 1;
    this.sound.play('metronome')﻿;
  }
  graphics.lineStyle(5, 0xFFFFFF, 1);
  graphics.strokeRect(scoreText.x+  scoreText.width + 50 + progress*windowWidth/2, -windowHeight/2 + 50, 5, 75);
}
