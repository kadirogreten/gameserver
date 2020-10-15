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
///////// End of Classess /////////

const app = express();

const server = http.createServer(app);

var io = socketIo(server);

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


app.use('/api/user', authRoute);

app.use('/api/player', playerRoute);


var players = [];
var sockets = [];

io.on('connection', (socket) => {
    var currentUser = new Player(); // .
    console.log('io is opened!', players);
    //console.log(socket.handshake);
    currentUser.id = socket.handshake.query['id'];
    currentUser.name = socket.handshake.query['name'];

    players[currentUser.name] = currentUser;
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

    for (var playerName in players) {
        if (playerName != currentUser.name) {
            socket.emit('spawn', players[playerName]);
            console.log('telll', players[playerName]);
        }
    }

    // socket.on('PLAY', (data) => {
    //     console.log(data);
    //     currentUser.id = data.id;
    //     currentUser.name = data.name;

    //     console.log(currentUser);

    //     players.push(currentUser);
    //     sockets[currentUser.id] = data.id;

    //     console.log(players);

    //     socket.emit('PLAY', currentUser);
    //     socket.broadcast.emit('PLAY', currentUser);


    //     //console.log('User name ' + currentUser.name + ' is connected..');
    // });


    socket.on('updatePosition', (data) => {
        currentUser.position.x = data.position.x;
        currentUser.position.y = data.position.y;

        socket.broadcast.emit('updatePosition', currentUser);

        console.log(currentUser);
    });

    socket.on('disconnect', () => {

        console.log('A player has disconnected!');
        delete players[currentUser.name];
        delete sockets[currentUser.id];
        socket.broadcast.emit('disconnected', currentUser);
        console.log('disconnected ' + currentUser.name);
        console.log('disconnected', players[playerName]);

    });


});




server.listen(3000, () => console.log('server started on port ' + 'http://localhost:3000'));



//http.listen( 3030, () => console.log('server started on port 3030'));