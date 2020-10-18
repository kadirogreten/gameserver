var Vector2 = require('./Vector2');

module.exports = class CurrentUser {
  constructor() {
    this.id = '';
    this.name = 'Default_Player';
    this.lobby = 0;
    this.position = new Vector2();
    this.tankRotation = new Number(0);
    this.barrelRotation = new Number(0);
    this.health = new Number(100);
    this.isDead = false;
    this.respawnTicker = new Number(0);
    this.respawnTime = new Number(0);
  }


  displayPlayerInformation() {
    let player = this;

    return '(' + player.name + ':' + player.id + ')';
  }


  respawnCounter() {
    this.respawnTicker = this.respawnTicker + 1;

    if (this.respawnTicker >= 3) {
      this.health = new Number(100);
      this.isDead = false;
      this.respawnTicker = new Number(0);
      this.respawnTime = new Number(0);
      this.position = new Vector2(-8, 3);

      return true;
    }

    return false;
  }


  dealDamage(amount = Number) {
    this.health = this.health - amount;

    if (this.health <= 0) {
      this.isDead = true;
      this.respawnTicker = new Number(0);
      this.respawnTime = new Number(0);
    }

    return this.isDead;
  }
}