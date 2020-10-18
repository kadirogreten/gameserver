const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

let Server = require('./server/Server');



//////////// import Routes //////////////////
const authRoute = require('./auth/auth');
const playerRoute = require('./game/player');
//////////// End of import Routes //////////////////


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


let gameServer = new Server();

setInterval(() => {
    gameServer.onUpdate();
}, 100,0);


io.on('connection', (socket) => {
    let connection = gameServer.onConnected(socket);

    connection.createEvents();

    connection.socket.emit('register', {'id':connection.player.id});
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