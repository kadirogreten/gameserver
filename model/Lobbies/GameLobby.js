let LobbyBase = require('./LobbyBase');
let GameLobbySettings = require('./GameLobbySettings');
let Connection = require('../../server/Connection');
let Bullet = require('../Bullet');
const {
    connection,
    connections
} = require('mongoose');


module.exports = class GameLobby extends LobbyBase {
    constructor(id, settings = GameLobbySettings) {
        this.id = id;
        this.settings = settings;
        this.bullets = [];
    }


    onUpdate() {
        let lobby = this;

        lobby.updateBullets();
        lobby.updateDeadPlayers();
    }


    canEnterLobby(connection = Connection) {
        let lobby = this;
        let maxPlayerCount = lobby.settings.maxPlayers;
        let currentPlayerCount = lobby.connections.length;

        if (currentPlayerCount + 1 > maxPlayerCount) {
            return false;
        }

        return true;
    }

    onEnterLobby() {
        let lobby = this;

        super.onEnterLobby(connection);

        lobby.addPlayer(connection);

        // Handle spawning any server spawned objects here
        // Example: Loot, perhaps flying bullets etc
    }

    onLeaveLobby() {
        let lobby = this;

        super.onLeaveLobby(connection);

        lobby.removePlayer(connection);
    }

    updateBullets() {
        let lobby = this;

        let bullets = lobby.bullets;

        let connections = lobby.connections;

        bullets.forEach(bullet => {
            let isDestroyed = bullet.onUpdate();

            if (isDestroyed) {
                lobby.despawnBullet(bullet);
            } else {
                var returnData = {
                    id: bullet.id,
                    position: {
                        x: bullet.position.x,
                        y: bullet.position.y,
                    }
                }

                connections.forEach(connection => {
                    connection.socket.emit('updatePosition', returnData);
                })
            }
        })
    }

    updateDeadPlayers() {
        let loby = this;

        let connections = loby.connections;

        connections.forEach(connection => {
            let player = connection.player;

            if (player.isDead) {
                let isRespawn = player.respawnCounter();

                if (isRespawn) {
                    let socket = connection.socket;

                    let returnData = {
                        id: player.id,
                        position: {
                            x: player.position.x,
                            y: player.position.y,
                        }
                    }

                    socket.emit('playerRespawn', returnData);
                    socket.broadcast.to(loby.id).emit('playerRespawn', returnData);
                }
            }
        })
    }


    onFireBullet(connection = Connection, data) {
        let lobby = this;

        let bullet = new Bullet();
        bullet.name = 'Bullet';
        bullet.activator = data.activator;

        bullet.position.x = data.position.x;
        bullet.position.y = data.position.y;


        bullet.direction.x = data.direction.x;
        bullet.direction.y = data.direction.y;

        lobby.bullets.push(bullet);

        var returnData = {
            name: bullet.name,
            id: bullet.id,
            activator: bullet.activator,
            position: {
                x: bullet.position.x,
                y: bullet.position.y,

            },
            direction: {
                x: bullet.direction.x,
                y: bullet.direction.y,

            }
        }



        connection.socket.emit('serverSpawn', returnData);
        connection.socket.broadcast.to(lobby.id).emit('serverSpawn', returnData);

    }


    onCollisionDestroy(connection = Connection, data) {
        let lobby = this;

        let returnBullets = lobby.bullets.filter(bullet => {
            bullet.id == data.id
        });

        returnBullets.forEach(bullet => {
            let playerHit = false;

            lobby.connections.forEach(c => {
                let player = c.player;

                if (bullet.activator != player.id) {
                    let distance = bullet.position.distance(player.position);

                    if (distance < 0.65) {
                        let isDead = player.dealDamage(50);
                        playerHit = true;
                        if (isDead) {
                            console.log('Player with id: ' + player.id + ' has died!');
                            let returnData = {
                                id: player.id
                            }

                            c.socket.emit('playerDied', returnData);

                            c.socket.broadcast.to(lobby.id).emit('playerDied', returnData);
                        } else {
                            console.log('Player with id: ' + player.id + ' has (' + player.health + ') health left. ');


                        }

                        lobby.despawnBullet(bullet);
                    }
                }
            });

            if(!playerHit) {
                bullet.isDestroyed = true;
            }
        });
    }


    despawnBullet(bullet = Bullet) {
        let lobby = this;
        let bullets = lobby.bullets
        let connections = lobby.connections;

        console.log('Destroying bullet (' + bullet.id + ')');

        var index = bullets.indexOf(bullet);

        if(index > -1) {
            bullets.splice(index, 1);

            var returnData = {
                id:bullet.id
            }

            // Send remove bullet command the player

            connections.forEach(connection => {
                connection.socket.emit('serverUnspawn', returnData);
            });

        }


    }


    addPlayer(connection = Connection) {
        let lobby = this;

        let connections = lobby.connections;

        let socket = connection.socket;

        var returnData = {
            id:connection.player.id
        }

        socket.emit('spawn', returnData);//tell myself i have spawn
        socket.broadcast.to(lobby.id).emit('spawn', returnData);// tell others

        connections.forEach(conn => {
            if(conn.player.id != connection.player.id) {
                socket.emit('spawn', 
                {
                    id:conn.player.id
                });
            }
        });
    }


    removePlayer(connection = Connection) {
        let lobby = this;

        connection.socket.broadcast.to(lobby.id).emit('disconnected', {
            id:connection.player.id
        });
    }
}