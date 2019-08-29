class EnemyEvents {
  spiralEnemyLine(scene, minSize, maxSize, enemyGroup) {
    for (let i = minSize; i < maxSize; i += 50) {
      let enemy = new SpiralBulletEnemy(scene, i, 0);
      if (enemy !== null) {
        enemy.setScale(Phaser.Math.Between(10,20) * 0.1);
        enemyGroup.add(enemy);
      }
    }
  }
}
