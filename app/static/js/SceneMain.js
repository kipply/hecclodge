class SceneMain extends Phaser.Scene {
    constructor() {
        super({key: "SceneMain" });
    }
    preload() {
        this.load.image("sprBg0", "static/content/sprBg0.png");
        this.load.image("sprBg1", "static/content/sprBg1.png");
        this.load.spritesheet("sprExplosion", "static/content/sprExplosion.png", {
          frameWidth: 32,
          frameHeight: 32
        });
        this.load.spritesheet("sprEnemy0", "static/content/sprEnemy0.png", {
          frameWidth: 16,
          frameHeight: 16
        });
        this.load.image("sprEnemy1", "static/content/sprEnemy1.png");
        this.load.spritesheet("sprEnemy2", "static/content/sprEnemy2.png", {
          frameWidth: 16,
          frameHeight: 16
        });
        this.load.image("sprLaserEnemy0", "static/content/sprLaserEnemy0.png");
        this.load.image("sprLaserPlayer", "static/content/sprLaserPlayer.png");
        this.load.spritesheet("sprPlayer", "static/content/sprPlayer.png", {
          frameWidth: 16,
          frameHeight: 16
        });
        this.load.spritesheet("sprMetalface", "static/sprites/metalface78x92.png", {
            frameWidth: 23, frameHeight: 78
        });

        this.load.audio("sndExplode0", "static/content/sndExplode0.wav");
        this.load.audio("sndExplode1", "static/content/sndExplode1.wav");
        this.load.audio("sndLaser", "static/content/sndLaser.wav");
    }

    create() {
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
        this.anims.create({
          key: "sprPlayer",
          frames: this.anims.generateFrameNumbers("sprPlayer"),
          frameRate: 20,
          repeat: -1
        });
        this.anims.create({ 
            key: "sprMetalface", 
            frames: this.anims.generateFrameNumbers("sprMetalface"),
            frameRate: 20,
            repeat: -1
        });
        this.sfx = {
          explosions: [
            this.sound.add("sndExplode0"),
            this.sound.add("sndExplode1")
          ],
          laser: this.sound.add("sndLaser")
        };

        this.player = new Player(
            this, 
            this.game.config.width * 0.5,
            this.game.config.height * 0.5,
            "sprPlayer" 
        );

        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        this.enemies = this.add.group();
        this.enemyLasers = this.add.group();
        this.playerLasers = this.add.group();

        //colliders
        this.physics.add.collider(this.playerLasers, this.enemies, function(playerLaser, enemy) {
            if (enemy) {
              if (enemy.onDestroy !== undefined) {
                enemy.onDestroy();
              }
              enemy.explode(true);
              playerLaser.destroy();
            }
        });

        this.physics.add.overlap(this.player, this.enemies, function(player, enemy) {
          if (!player.getData("isDead") &&
              !enemy.getData("isDead")) {
            player.explode(false);
            enemy.explode(true);
          }
        });

        this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) {
          if (!player.getData("isDead") &&
              !laser.getData("isDead")) {
            player.explode(false);
            laser.destroy();
          }
        });

        this.time.addEvent({
          delay: 1000,
          callback: function() {
            var enemy = null;
            if (Phaser.Math.Between(0, 10) >= 3) {
              enemy = new GunShip(
                this,
                Phaser.Math.Between(0, this.game.config.width),
                0
              );
            }
            else if (Phaser.Math.Between(0, 10) >= 5) {
              if (this.getEnemiesByType("ChaserShip").length < 5) {
                enemy = new ChaserShip(
                  this,
                  Phaser.Math.Between(0, this.game.config.width),
                  0
                );
              }
            }
            else {
              enemy = new CarrierShip(
                this,
                Phaser.Math.Between(0, this.game.config.width),
                0
              );
            }
            if (enemy !== null) {
              enemy.setScale(Phaser.Math.Between(10, 20) * 0.1);
              this.enemies.add(enemy);
            }
          },
          callbackScope: this,
          loop: true
        });

    }

    update() {
        if (!this.player.getData("isDead")) {
            this.player.update();
            if (this.keyW.isDown) {this.player.moveUp();}
            else if (this.keyS.isDown) {this.player.moveDown();}

            if (this.keyA.isDown) {this.player.moveLeft();}
            else if (this.keyD.isDown) {this.player.moveRight();}

            if (this.keySpace.isDown) { this.player.setData("isShooting", true); }
            else {
              this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
              this.player.setData("isShooting", false);
            }
        }

        let groupsToCull = [this.enemies, this.playerLasers, this.enemyLasers];
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

    getEnemiesByType(type) {
      var arr = [];
      for (var i = 0; i < this.enemies.getChildren().length; i++) {
        var enemy = this.enemies.getChildren()[i];
        if (enemy.getData("type") == type) {
          arr.push(enemy);
        }
      }
      return arr;
    }
}
