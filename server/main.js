var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var messages = [{
    id: 1,
    text: 'Bienvenido al bingo',
    author: 'jaso'
}];

var users = [];
var partida = false;
var bombo = [];
var tiradas = 0;


var sleep = () =>{
    return new Promise(resolve => setTimeout(resolve, 1000));
};

app.use(express.static('public'));

app.get('/hello', function (req, res) {
    res.status(200).send("hola desde el servidor");
});

io.on('connect', function (socket) {
    console.log('Nueva conexion');
    socket.emit('messages', messages);
    socket.on('new-message', function (data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    });

    socket.on('reset', function () {
        users = [];
        partida = false;
        bombo = [];
        tiradas = 0;
        linea_win = [];
        bingo_win = [];
        io.sockets.emit('resetear');
    });
    socket.on('nuevo-usuario', function (data) {
        let dato;
        let userRepeat;
        if (users.length > 0){
            for (let i = 0; i < users.length; i++){
                if (users[i].nombre === data.nombre){
                    userRepeat=true;
                }
            }
        } else {
            userRepeat = false;
        }
        if (!userRepeat) {
            dato = {nombre: data.nombre, partida: partida};
            users.push(dato);
            io.sockets.emit('usuarioConectado', [users, partida, dato]);
        } else {
            dato = {nombre: data.nombre, partida: partida};
            io.sockets.emit('usuarioConectado', [users, partida, dato]);
        }
    });

    socket.on('nuevo-juego', function (data) {
        if (!partida) {
            for(let i = 0; i < 90; i++){
                bombo[i] = false;
            }
            io.sockets.emit('partida-iniciada', data);
            partida = true;
            tirada();
        }
    });
    socket.on('fin', function () {
        partida = false;
        tiradas = 0;
        users = [];
        linea_win = [];
        bingo_win = [];
        io.sockets.emit("terminar");
    });
    var linea_win = [];
    var bingo_win = [];
    socket.on('linea', function (data) {
        linea_win.push(data)
        io.sockets.emit('linea_song', linea_win);
    });

    socket.on('bingo', function (data) {
        bingo_win.push(data);
        partida = false;
        io.sockets.emit('bingo_song', bingo_win);
    });

});
function tirada(){
    if (partida) {
        sleep().then(() => {
            bola();
        });
    } else {
       return false;
    }
}

function otra_bola() {
    bola();
}

function bola(){
    let numero = Math.round(Math.random() * (80 - 1)) + 1;
    if (tiradas > 79){
        partida = false;
        tiradas = 0;
        io.sockets.emit('terminar');
    } else if(!bombo[numero]) {
        bombo[numero] = true;
        let dato = {numero: numero};
        io.sockets.emit('bola', dato);
        tiradas++;
        tirada();
    } else {
        otra_bola();
    }
}




server.listen(8080, function () {
    console.log('servidor corriendo');
});