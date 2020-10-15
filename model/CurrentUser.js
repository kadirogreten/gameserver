var Vector2 = require('./Vector2');

module.exports = class CurrentUser {
    constructor() {
        this.id = '';
        this.name = '';
        this.position = new Vector2();
      };
}