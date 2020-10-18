module.exports = class Connection {
    constructor() {
        this.socket;
        this.player;
        this.server;
        this.lobby;
    }


    createEvents() {
        let connection = this;
        let socket = connection.socket;
        let player = connection.player;
        let server = connection.server;


        socket.on('disconnect', () => {
            server.onDisconnected(connection);
        });

        socket.on('joinGame', () => {
            server.onAttemptToJoinGame(connection);
        });

        socket.on('fireBullet', (data) => {
            server.lobby.onFireBullet(connection, data);
        });

        socket.on('collisionDestroy', (data) => {
            server.lobby.onCollisionDestroy(connection, data);
        });

        socket.on('updatePosition', (data) => {
            player.position.x = data.position.x;
            player.position.y = data.position.y;

            socket.broadcast.to(player.lobby.id).emit('updatePosition', player);
        });

        socket.on('updateRotation', (data) => {
            player.tankRotation = data.tankRotation;
            player.barrelRotation = data.barrelRotation;

            socket.broadcast.to(player.lobby.id).emit('updateRotation', player);
        });

    }
}