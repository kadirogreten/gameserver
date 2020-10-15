var Vector3 = require('./Vector3');

module.exports = class CurrentUser {
  constructor() {
    this.id = '';
    this.name = '';
    this.position = new Vector3();
    this.tankRotation = new Number(0);
    this.barrelRotation = new Number(0);
    this.health = new Number(100);
    this.isDead = false;
    this.respawnTicker = new Number(0);
    this.respawnTime = new Number(0);
  }


  respawnCounter() {
    this.respawnTicker = this.respawnTicker + 1;

    if (this.respawnTicker >= 3) {
      this.health = new Number(100);
      this.isDead = false;
      this.respawnTicker = new Number(0);
      this.respawnTime = new Number(0);
      this.position = new Vector3(-8, 3);

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