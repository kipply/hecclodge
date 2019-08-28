var Bullet = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,

  initialize:
  // Bullet Constructor
  function Bullet (scene) {
    Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
    this.speed = 1;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.setSize(12, 12, true);
    this.scene = scene;
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
    this.body.setImmovable(true);
    this.x += this.xSpeed * delta;
    this.y += this.ySpeed * delta;

    const bounds = this.scene.physics.world.bounds;
    if (this.x < bounds.x || this.y < bounds.y || this.x > bounds.x + bounds.width || this.y > bounds.y + bounds.height){
      this.destroy();
    }
  }
});

function preload () {
  this.audioContext = new AudioContext();
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
  this.load.spritesheet('sprEnemy0', 'static/content/sprEnemy0.png', {
    frameWidth: 16, frameHeight: 16
  });
  this.load.spritesheet('sprEnemy2', 'static/content/sprEnemy2.png', {
    frameWidth: 16, frameHeight: 16
  });
  this.load.spritesheet('sprExplosion', 'static/content/sprExplosion.png', {
    frameWidth: 32, frameHeight: 32
  });

  this.load.audio('metronome', 'static/metronome.mp3');
  this.load.audio('sndExplode0', 'static/content/sndExplode0.wav');
  this.load.audio('sndExplode1', 'static/content/sndExplode1.wav');
  this.load.audio('sndLaser', 'static/content/sndLaser.wav');
}

function create () {
  //create animations
  this.anims.create({
    key: "sprEnemy0",
    frames: this.anims.generateFrameNumbers("sprEnemy0"),
    frameRate: 20,
    repeat: -1
  });
  this.anims.create({
    key: "sprEnemy2",
    frames: this.anims.generateFrameNumbers("sprEnemy2"),
    frameRate: 20,
    repeat: -1
  });
  this.anims.create({
    key: "sprExplosion",
    frames: this.anims.generateFrameNumbers("sprExplosion"),
    frameRate: 20,
    repeat: 0
  });
  this.sfx = {
    explosions: [
    this.sound.add("sndExplode0"),
    this.sound.add("sndExplode1")
    ],
    laser: this.sound.add("sndLaser")
  };

  // Create world bounds
  this.physics.world.setBounds(-windowWidth/2, -windowHeight/2, windowWidth*2, windowHeight*2);

  // Add background, player sprites, and bullets
  var background = this.add.image(windowWidth/2, windowHeight/2, 'background');
  player = this.physics.add.sprite(windowWidth/2, windowHeight/2, 'player_handgun');
  player.setBounce(false);
  player.setImmovable(true);

  this.enemies = this.add.group();
  this.enemyBullets = this.add.group();

  playerBullets = this.physics.add.group({classType: Bullet, runChildUpdate: true});

  //add score text
  scoreText = this.add.text(-windowWidth/2 + 50, -windowHeight/2 + 50, 'Accuracy', { fontSize: '32px', fill: '#FFFFFF'});

  this.metronomeTicker = this.add.graphics();
  this.target = this.add.graphics();
  var metronomeBox = this.add.graphics();
  metronomeBox.lineStyle(2.5, 0xFFFFFF, 1);
  metronomeBox.strokeRect(scoreText.x + scoreText.width + 200, -windowHeight/2 + 50, windowWidth/2, 75);
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
    player.setAccelerationY(-1600);
  });
  this.input.keyboard.on('keydown_S', function (event) {
    player.setAccelerationY(1600);
  });
  this.input.keyboard.on('keydown_A', function (event) {
    player.setAccelerationX(-1600);
  });
  this.input.keyboard.on('keydown_D', function (event) {
    player.setAccelerationX(1600);
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

  //colliders
  //NOTE: order is NOT typical in this code (investigate why later)
  this.physics.add.collider(playerBullets, this.enemies, function(enemy, bullet) {
    if (enemy) {
      enemy.explode(true);
      bullet.destroy();
    }
  });

  //testing code: generate new enemies
  this.time.addEvent({
    delay: 5000,
    callback: function() {
      let enemy = new HexSpiralBulletEnemy(
        this,
        Phaser.Math.Between(0, this.game.config.width),
        0
        );
      if (enemy !== null) {
        enemy.setScale(Phaser.Math.Between(10,20) * 0.1);
        this.enemies.add(enemy);
      }
    },
    callbackScope: this,
    loop: true
  });
}

function destroyBullet(player, bullet) { //destroys bullet
  bullet.disableBody(true, true);
  score += 10;
}

function playerHit(player, enemyBullet) { //this HURTS the player/game over!
  // this.physics.pause();
  player.setTint(0xff0000);
  gameOver = true;
}

// Ensures sprite speed doesnt exceed maxVelocity while update is called
function constrainVelocity(sprite, maxVelocity) {
  if (!sprite || !sprite.body)
    return;

  var angle, currVelocitySqr, vx, vy;
  vx = sprite.body.velocity.x;
  vy = sprite.body.velocity.y;
  currVelocitySqr = vx * vx + vy * vy;

  if (currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx);
    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;
    sprite.body.velocity.x = vx;
    sprite.body.velocity.y = vy;
  }
}

function update(time, delta) {

  // Constrain velocity of player
  constrainVelocity(player, 500);

  // update accuracy if applicable - update accuracy of last target location if applicable
  if (this.lastTargetLocation && getDistance(player, this.lastTargetLocation) <= getBufferArea()) {
    newAccuracy = 1 - (this.metronomeTimer.elapsed/1000) % (beatLength * 4) / (beatLength*4);
    currentAccuracy = Math.max(currentAccuracy, newAccuracy * 100);
  } else if (getDistance(player, this.targetLocation) <= getBufferArea()) {
    newAccuracy = (this.metronomeTimer.elapsed/1000) % (beatLength * 4) / (beatLength*4);
    currentAccuracy = Math.max(currentAccuracy, newAccuracy* 100);
  }

  scoreText.setText('Accuracy ' + Math.round(accuracy/beatHits * 10) / 10);

  let groupsToCull = [this.enemies, this.enemyBullets];
  for (let g = 0; g < groupsToCull.length; g++) {
    for (let i = 0; i < groupsToCull[g].getChildren().length; i++) {
      let groupMember = groupsToCull[g].getChildren()[i];
      groupMember.update();
      if (groupMember.x < -groupMember.displayWidth ||
        groupMember.x > this.game.config.width + groupMember.displayWidth ||
        groupMember.y < -groupMember.displayHeight * 4 ||
        groupMember.y > this.game.config.height + groupMember.displayHeight) {
        if (groupMember) {
          if (groupMember.onDestroy !== undefined) {
            groupMember.onDestroy();
          }
          groupMember.destroy();
        }
      }
    }
  }
}

function updateMetronome() {
  const iterations = this.metronomeTimer.repeat - this.metronomeTimer.repeatCount;
  const progress = ((iterations % 100) / 100.0);
  metronomeTicker = this.metronomeTicker;
  target = this.target;
  if (!progress) {
    target.clear();
    this.sound.volume = 10;
    this.sound.play('metronome')﻿;
    this.lastTargetLocation = Object.assign({}, this.targetLocation);
    this.targetLocation = getRandomPoint();
    target.fillStyle(0xFF0000, 1);
    target.fillCircle(this.targetLocation.x, this.targetLocation.y, 25);
    target.fillStyle(0x0000FF, 1);
    target.fillCircle(this.lastTargetLocation.x, this.lastTargetLocation.y, 25);
  } else if ((progress * 100) / 25 === 1) {
    target.clear();
    target.fillStyle(0xFF0000, 1);
    target.fillCircle(this.targetLocation.x, this.targetLocation.y, 25);
    this.sound.volume = 1;
    this.sound.play('metronome')﻿;
    accuracy += currentAccuracy;
    beatHits += 1;
    currentAccuracy = 0;
  } else if (!(progress*100 % 25)) {
    this.sound.volume = 1;
    this.sound.play('metronome')﻿;
  }
  metronomeTicker.clear();
  metronomeTicker.lineStyle(5, 0xFFFFFF, 1);
  metronomeTicker.strokeRect(scoreText.x + scoreText.width + 200 + progress*windowWidth/2, -windowHeight/2 + 50, 5, 75);
}

function getRandomPoint() {
  let point = {};
  point['x'] = Math.floor(Math.random() * (windowWidth * 2 - 50) + (-windowWidth / 2 + 50));
  point['y'] = Math.floor(Math.random() * (windowHeight * 2 - 50) + (-windowHeight / 2 + 50));
  return point;
}

function getDistance(one, two) {
  return Math.pow(Math.pow(one.x - two.x, 2) + Math.pow(one.y - two.y, 2), 0.5)
}

function getBufferArea() {
  return Math.max(windowHeight, windowWidth) * 0.05;
}

