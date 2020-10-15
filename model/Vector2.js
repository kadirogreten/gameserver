module.exports = class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }


    Magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }


    Normalized() {
        var magnitude = this.Magnitude();
        return new Vector2(this.x / magnitude, this.y / magnitude);
    }


    Distance(OtherVector = Vector2) {
        var direction = new Vector2();
        direction.x = OtherVector.x - this.y;
        direction.y = OtherVector.y - this.y;
        return direction.Magnitude();
    }


    ConsoleOutput() {
        return '(' + this.x + ',' + this.y + ')'
    }
}