var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};
var game = new Phaser.Game(config);
function preload() {
    this.load.image('background', 'static/background.jpeg');
}

function create() {
    this.add.image(400, 300, 'background');

    for (var i = 0; i < 30; i++) {
        var bullet = this.physics.add.image(400, 100, 'logo');
        bullet.setVelocity(Math.random() * 100, Math.random() * 100);
        bullet.setBounce(1, 1);
        bullet.setCollideWorldBounds(true);
    }
}
