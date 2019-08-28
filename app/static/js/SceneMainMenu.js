class SceneMainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMainMenu"});
  }

  preload() {
    this.load.image("sprBtnPlay", "static/content/sprBtnPlay.png");
    this.load.image("sprBtnPlayHover", "static/content/sprBtnPlayHover.png");
    this.load.image("sprBtnPlayDown", "static/content/sprBtnPlayDown.png");
    this.load.image("sprBtnRestart", "static/content/sprBtnRestart.png");
    this.load.image("sprBtnRestartHover", "static/content/sprBtnRestartHover.png");
    this.load.image("sprBtnRestartDown", "static/content/sprBtnRestartDown.png");

    this.load.audio("sndBtnOver", "static/content/sndBtnOver.wav");
    this.load.audio("sndBtnDown", "static/content/sndBtnDown.wav");
  }

  create() {
    this.scene.start("SceneMain");
  }
}
