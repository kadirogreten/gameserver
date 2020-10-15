const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');



//////////// import Routes //////////////////
const authRoute = require('./auth/auth');
const playerRoute = require('./game/player');
//////////// End of import Routes //////////////////


///////// Classess /////////
const Player = require('./model/CurrentUser');
const Bullet = require('./model/Bullet');
///////// End of Classess /////////

const app = express();

const server = http.createServer(app);

var io = socketIo(server, {
    transports: ['websocket', 'polling']
});

dotenv.config();

mongoose.connect('mongodb+srv://kadirogreten:89892dbc@gamecluster.l7pqg.mongodb.net/<dbname>?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () =>
    console.log('connected to db!')
);


//////////// Middlewares //////////////////

app.use(express.json());

//////////// End of Middlewares //////////////////

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/user', authRoute);

app.use('/api/player', playerRoute);


var players = [];
var sockets = [];
var bullets = [];


setInterval(() => {
    bullets.forEach(bullet => {
        var isDestroyed = bullet.onUpdate();

        if (isDestroyed) {
            despawnBullet(bullet);
        } else {
            var returnData = {
                id: bullet.id,
                position: {
                    x: bullet.position.x,
                    y: bullet.position.y,
                    z: bullet.position.z
                }
            };

            for (var playerID in players) {
                sockets[playerID].emit('updatePosition', returnData);
            }
        }
    });

    //handle death players

    for(var playerID in players) {
        let player = players[playerID];

        if(player.isDead) {
            let isReSpawn = player.respawnCounter();

            if(isReSpawn) {
                let returnData = {
                    id:player.id,
                    position: {
                        x:player.position.x,
                        y:player.position.y,
                        z:player.position.z
                    }
                }

                sockets[playerID].emit('playerRespawn', returnData);
                sockets[playerID].broadcast.emit('playerRespawn', returnData);

            }
        }
    }

}, 100, 0);


function despawnBullet(bullet = Bullet) {
    console.log('Destroying Bullet (' + bullet.id + ')');

    var index = bullets.indexOf(bullet);

    if (index > -1) {
        bullets.splice(index, 1);

        var returnData = {
            id: bullet.id
        }


        for (var playerID in players) {
            sockets[playerID].emit('serverUnspawn', returnData);
        }
    }
}

io.on('connection', (socket) => {
    var currentUser = new Player(); // .
    console.log('io is opened!', players);
    //console.log(socket.handshake);
    currentUser.id = socket.handshake.query['id'];
    currentUser.name = socket.handshake.query['name'];

    players[currentUser.id] = currentUser;
    sockets[currentUser.id] = socket;


    //tell the client that this our id for the server
    socket.emit('register', {
        'id': currentUser.id,
        'name': currentUser.name
    });
    //tell myself i have spawned
    socket.emit('spawn', currentUser);
    //tell other i have spawned
    socket.broadcast.emit('spawn', currentUser);




    //tell myself about everyone else in the game

    for (var playerID in players) {
        if (playerID != currentUser.id) {
            socket.emit('spawn', players[playerID]);
            console.log('telll', players[playerID]);
        }
    }


    socket.on('updatePosition', (data) => {
        currentUser.position.x = data.position.x;
        currentUser.position.y = data.position.y;
        currentUser.position.z = data.position.z;

        socket.broadcast.emit('updatePosition', currentUser);

        console.log(currentUser);
    });


    socket.on('updateRotation', (data) => {
        currentUser.tankRotation = data.tankRotation;
        currentUser.barrelRotation = data.barrelRotation;

        socket.broadcast.emit('updateRotation', currentUser);
    });

    socket.on('', (data) => {
        var bullet = new Bullet();
        bullet.name = 'bullet';
        bullet.activator = data.activator;
        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;
        bullet.position.z = data.position.z;
        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;
        bullet.direction.z = data.direction.z;

        bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,
                z: bullet.position.z
            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,
                z: bullet.direction.z
            }

        };

        socket.emit('serverSpawn', returnData);
        socket.broadcast.emit('serverSpawn', returnData);



    });



    socket.on('collisionDestroy', (data) => {
        console.log('Collision with bullet id' + data.id);
        let returnBullets = bullets.filter(x => {
            return bullet.id == data.id;
        });

        returnBullets.forEach(bullet => {
            let playerHit = false;

            for (var playerID in players) {
                if (bullet.activator != playerID) {
                    let player = players[playerID];
                    let distance = bullet.position.Distance(player.position);

                    if (distance < 0.65) {
                        playerHit = true;
                        let isDead = player.dealDamage(50);

                        if (isDead) {
                            console.log('Player with id: ' + player.id + ' is dead!');

                            let returnData = {
                                id: player.id
                            }

                            sockets[playerID].emit('playerDied', returnData);
                            sockets[playerID].broadcast.emit('playerDied', returnData);
                        } else {
                            console.log('Player with id: ' + player.id + ' has (' + player.health + ') health left!');

                        }

                        despawnBullet(bullet);
                    }
                }
            }
            if (!playerHit) {
                bullet.isDestroyed = true;
            }

        });
    });

    socket.on('disconnect', () => {

        console.log('A player has disconnected!');
        delete players[currentUser.id];
        delete sockets[currentUser.id];
        socket.broadcast.emit('disconnected', currentUser);
        console.log('disconnected ' + currentUser.name);
        console.log('disconnected', players[playerName]);

    });


});




server.listen(80, () => console.log('server started on port ' + 'http://localhost:80'));


function interval(func, wait, times) {
    var interv = function (w, t) {
        return function () {
            if (typeof t === "undefined" || t-- > 0) {
                setTimeout(interv, w);
                try {
                    func.call(null);
                } catch (e) {
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
}



//http.listen( 3030, () => console.log('server started on port 3030'));