class Entity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, type) {
        super(scene, x, y, key);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.world.enableBody(this, 0);
        this.setData("type", type);
        this.setData("isDead", false);
    }

    explode(canDestroy) {
        if (!this.getData("isDead")) {
          // Set the texture to the explosion image, then play the animation
          this.setTexture("sprExplosion");  // this refers to the same animation key we used when we added this.anims.create previously
          this.play("sprExplosion"); // play the animation
          if (this.shootTimer !== undefined) {
            if (this.shootTimer) {
              this.shootTimer.remove(false);
            }
          }
          this.setAngle(0);
          this.body.setVelocity(0, 0);
          this.on('animationcomplete', function() {
            if (canDestroy) {
              this.destroy();
            }
            else {
              this.setVisible(false);
            }
          }, this);
          this.setData("isDead", true);
        }
    }
}

class NoFireEnemy extends Entity {
  constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy2", "CarrierShip");
      this.play("sprEnemy2");
      this.body.velocity.y = 200;
  }
}

class BurstEnemy extends Entity {
  constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy0", "GunShip");
      this.play("sprEnemy0");
      this.body.velocity.y = Phaser.Math.Between(50,100);
      this.shootTimer = this.scene.time.addEvent({
          delay: 1000,
          callback: function() {
              for (let dx = -100; dx <= 100; dx += 100) {
                  var bullet = new EnemyBullet(
                      this.scene,
                      this.x,
                      this.y,
                      dx,
                      200
                  );
                  bullet.setScale(this.scaleX);
                  this.scene.enemyBullets.add(bullet);
              }
          },
          callbackScope: this,
          loop: true
      });
  }
  onDestroy() {
      if (this.shootTimer !== undefined) {
          if (this.shootTimer) {this.shootTimer.remove(false);}
      }
  }
}

class BulletWallEnemy extends Entity {
  constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy0", "GunShip");
      this.play("sprEnemy0");
      this.body.velocity.y = 50;
      this.shootTimer = this.scene.time.addEvent({
          delay: 10,
          callback: function() {
              var bullet = new EnemyBullet(
                  this.scene,
                  this.x,
                  this.y,
                  0,
                  200
              );
              bullet.setScale(this.scaleX);
              this.scene.enemyBullets.add(bullet);
          },
          callbackScope: this,
          loop: true
      });
  }
  onDestroy() {
      if (this.shootTimer !== undefined) {
          if (this.shootTimer) {this.shootTimer.remove(false);}
      }
  }
}

class SpiralBulletEnemy extends Entity {
  constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy0", "GunShip");
      this.play("sprEnemy0");
      this.body.velocity.y = 50;
      this.shootTimer = this.scene.time.addEvent({
          delay: 200,
          callback: function() {
              var bullet = new EnemyBullet(
                  this.scene,
                  this.x,
                  this.y,
                  150 * Math.sin(this.scene.time.now/500),
                  150 * Math.cos(this.scene.time.now/500),
              );
              bullet.setScale(this.scaleX);
              this.scene.enemyBullets.add(bullet);
          },
          callbackScope: this,
          loop: true
      });
  }
  onDestroy() {
      if (this.shootTimer !== undefined) {
          if (this.shootTimer) {this.shootTimer.remove(false);}
      }
  }
}

class HexSpiralBulletEnemy extends Entity {
  constructor(scene, x, y) {
      super(scene, x, y, "sprEnemy0", "GunShip");
      this.play("sprEnemy0");
      this.body.velocity.y = 50;
      this.shootTimer = this.scene.time.addEvent({
          delay: 200,
          callback: function() {
              for (let i = 0; i < 360; i += 60) {
                  var bullet = new EnemyBullet(
                      this.scene,
                      this.x,
                      this.y,
                      150 * Math.sin(this.scene.time.now/500 + i),
                      150 * Math.cos(this.scene.time.now/500 + i),
                  );
                  bullet.setScale(this.scaleX);
                  this.scene.enemyBullets.add(bullet);
              }
          },
          callbackScope: this,
          loop: true
      });
  }
  onDestroy() {
      if (this.shootTimer !== undefined) {
          if (this.shootTimer) {this.shootTimer.remove(false);}
      }
  }
}

class EnemyBullet extends Entity {
  constructor(scene, x, y, velX, velY) {
    super(scene, x, y, "enemy_bullet");
    this.body.velocity.x = velX;
    this.body.velocity.y = velY;
  }
}



