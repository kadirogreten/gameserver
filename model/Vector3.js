module.exports = class Vector3 {
    constructor(x = 0, y = 0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }


    Magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
    }


    Normalized() {
        var magnitude = this.Magnitude();
        return new Vector2(this.x / magnitude, this.y / magnitude, this.z / magnitude);
    }


    Distance(OtherVector = Vector3) {
        var direction = new Vector3();
        direction.x = OtherVector.x - this.y;
        direction.y = OtherVector.y - this.y;
        direction.z = OtherVector.z - this.z;
        return direction.Magnitude();
    }


    ConsoleOutput() {
        return '(' + this.x + ',' + this.y +  ',' + this.z + ')'
    }
}