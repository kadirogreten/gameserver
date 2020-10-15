var Vector3 = require('./Vector3');

module.exports = class CurrentUser {
    constructor() {
        this.id = '';
        this.name = '';
        this.position = new Vector3();
        this.tankRotation = new Number(0);
        this.barrelRotation = new Number(0);
      };
}