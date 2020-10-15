const shortid = require("shortid");
const Vector3 = require("./Vector3");


module.exports = class ServerObject {
    constructor(){
        this.id = shortid.generate();
        this.name='ServerObject';
        this.position = new Vector3();
    }
}