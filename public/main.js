var socket = io.connect('http://ec2-18-221-32-176.us-east-2.compute.amazonaws.com:8080', {'forceNew': true});

var user = [];
var synth = window.speechSynthesis;
var playSound = null;
var jugador = false;
var carton = [];
var estado = false;
var linea = false;
var final = false;

function reseteo(){
    user = [];
    jugador = false;
    carton = [];
    estado = false;
    linea = false;
    final = false;
    socket.emit("reset");
}

socket.on('resetear', function () {
    document.getElementById('nuevo_usuario').style.display = 'inline';
    document.getElementById('bingo').style.display = 'none';
    document.getElementById('bolas_out').style.display = 'none';
});

socket.on('usuarioConectado', function (data) {
        final = false;
        if (!data[1].partida && user.nombre === data[2].nombre) {
            estado = true;
            jugador = true;
            carton = cartones();
            for (let c = 0; c < 3; c++) {
                for (let l = 0; l < 8; l++) {
                    let idi = "c" + (c + 1) + l;
                    let bola = "img/bolas/bola" + carton[c][l] + ".png";
                    if (carton[c][l] === null) {
                        document.getElementById(idi).src = "img/bolas/bola0.png";
                    } else {
                        document.getElementById(idi).src = bola;
                    }
                }
            }
            document.getElementById('nuevo_usuario').style.display = 'none';
            document.getElementById('bingo').style.display = 'inline';
            document.getElementById('bolas_out').style.display = 'none';
            render_usuarios(data[0]);
            render();
        }
        if (data[1].partida) {
            document.getElementById('esperar').style.display = 'inline';
            document.getElementById('formulario').style.display = 'none';
        }

        if (estado && user.nombre !== data[2].nombre) {
            render_usuarios(data[0]);
            playSound = new SpeechSynthesisUtterance("Se a conectado" + data[2].nombre);
            synth.speak(playSound);
        }

});

socket.on('partida-iniciada', function (data) {

    if(jugador) {
        playSound = new SpeechSynthesisUtterance("partida iniciada por " + data.nombre);
        synth.speak(playSound);
        playSound = new SpeechSynthesisUtterance("Empezamos");
        synth.speak(playSound);
        document.getElementById('btn_iniciar').style.display = 'none';
        document.getElementById('label_bola').style.display = 'none';
        document.getElementById('btn_fin').style.display = 'inline';
        document.getElementById('linea_winner').style.display = 'none';
        document.getElementById('bingo_winner').style.display = 'none';
        document.getElementById('bolas_out').style.display = 'inline';

        for (let i = 1; i < 81; i++) {
            let bola = "bola" + i;
            document.getElementById(bola).style.display = 'none';
        }
    } else {
        document.getElementById('esperar').style.display = 'inline';
        document.getElementById('formulario').style.display = 'none';
    }
});

socket.on('bola',function (data) {
    let jugada;
    if(jugador && !final) {
        document.getElementById('label_bola').style.display = 'inline';
        let img = "./img/bolas/" + "bola" + data.numero + ".png";
        let bola = "bola" + data.numero;
            document.getElementById(bola).style.display= 'inline';
            document.getElementById(bola).src = img;
        render_bola(img);
        playSound = new SpeechSynthesisUtterance(data.numero);
        synth.speak(playSound);
        let decena = parseInt(data.numero / 10, 10);
        if (decena > 0) {
            playSound = new SpeechSynthesisUtterance(decena);
            synth.speak(playSound);
            let unidad = data.numero % 10;
            playSound = new SpeechSynthesisUtterance(unidad);
            synth.speak(playSound);
        }
        jugada = comprobar(data);
        if (jugada === "linea" && !linea){
            socket.emit('linea', user);
        }
        if (jugada === "bingo"){
            socket.emit('bingo', user);
        }
    }
});

socket.on('terminar', function () {

    if (!(user.length === 0 && jugador)) {
        playSound = new SpeechSynthesisUtterance("partida terminada ");
        synth.speak(playSound);
        document.getElementById('nuevo_usuario').style.display = 'none';
        document.getElementById('bingo').style.display = 'inline';
        document.getElementById('esperar').style.display = 'none';
        document.getElementById('btn_iniciar').style.display = 'inline';
        document.getElementById('btn_fin').style.display = 'none';
        document.getElementById('label_bola').style.display = 'none';
        render();
        estado = false;
        jugador = false;
        linea = false;
        socket.emit('nuevo-usuario', user);
    } else {
        document.getElementById('esperar').style.display = 'none';
        document.getElementById('formulario').style.display = 'inline';
    }
});

socket.on('linea_song', function (data) {
    linea = true;
    render_linea(data);
    document.getElementById('linea_winner').style.display = 'inline';
    playSound = new SpeechSynthesisUtterance(" han cantado linea");
    synth.speak(playSound);
});

socket.on('bingo_song', function (data) {
    render_bingo(data);
    document.getElementById('bingo_winner').style.display = 'inline';
    playSound = new SpeechSynthesisUtterance(" han cantado bingo");
    synth.speak(playSound);
    fin();
});

function comprobar(bola) {
    for(let l= 0; l < 8; l++){
        if(carton[0][l] === bola.numero){
            let idi = "c1" + l;
            document.getElementById(idi).src = "img/bolas/bola0.png";
        }
        if(carton[1][l] === bola.numero){
            let idi = "c2" + l;
            document.getElementById(idi).src = "img/bolas/bola0.png";
        }
        if(carton[2][l] === bola.numero){
            let idi = "c3" + l;
            document.getElementById(idi).src = "img/bolas/bola0.png";
        }
    }
    let idi1, idi2, idi3;
    let linea1,linea1f, linea2, linea2f, linea3, linea3f;
    for(let l= 0; l < 8; l++){
        idi1 = "c1" + l;
        if (document.getElementById(idi1).attributes.src.value === "img/bolas/bola0.png"){
            linea1 = true;
        } else {
            linea1f = true;
        }
        idi2 = "c2" + l;
        if (document.getElementById(idi2).attributes.src.value === "img/bolas/bola0.png"){
            linea2 = true;
        } else {
            linea2f = true;
        }
        idi3 = "c3" + l;
        if (document.getElementById(idi3).attributes.src.value === "img/bolas/bola0.png"){
            linea3 = true;
        } else {
            linea3f = true;
        }
    }

    if ((linea1 && !linea1f) || (linea2 && !linea2f) || (linea3 && !linea3f)){
        if (!linea) {
            return "linea";
        }
    }

    if ((linea1 && !linea1f) && (linea2 && !linea2f) && (linea3 && !linea3f)){
        return "bingo";
    }
    return "nada";
}

function render_usuarios(data) {

    var html = data.map(function(elem, index){

        return(`<p>
                 <strong>${elem.nombre}</strong><hr>
        </p>`)

    }).join(" ");

    document.getElementById('usuarios').innerHTML = html;

}

function render() {
    var html = `<strong>${user.nombre}</strong>`;

    document.getElementById('usuario').innerHTML = html;
}

function render_bola(img) {
    document.getElementById('numero').src = img;
}

function render_linea(data) {
    //var html = `<strong class="text-info"> Linea: ${nombre}</strong>`;
    var html = data.map(function(elem, index){

        return(`<p>
                 <strong class="text-info">Linea: ${elem.nombre}</strong><hr>
        </p>`)

    }).join(" ");

    document.getElementById('linea_winner').innerHTML = html;
}

function render_bingo(data) {
    //var html = `<strong class="text-danger"> Bingo: ${nombre}</strong>`;
    var html = data.map(function(elem, index){

        return(`<p>
                 <strong class="text-info">Bingo: ${elem.nombre}</strong><hr>
        </p>`)

    }).join(" ");

    document.getElementById('bingo_winner').innerHTML = html;
}

function addUser(e) {
    if(document.getElementById('nombre').value !== "") {
        user = {
            nombre: document.getElementById('nombre').value
        };
        socket.emit('nuevo-usuario', user);
    } else {
        playSound = new SpeechSynthesisUtterance("por favor introduzca su nombre");
        synth.speak(playSound);
    }
    return false;
}

function iniciar(e) {
    socket.emit('nuevo-juego', user);
    return null;
}

function fin() {
    socket.emit('fin');
    final = true;
    return null;
}

function cartones(){
    let carton1 = [];
    let linea1 = [];
    let linea2 = [];
    let linea3 = [];
    let bolas_bombo = 80;
    let bombo_carton = [];
    let pos = [];
    let cont = 1;

    for (let c = 0; c < bolas_bombo; c++){
        bombo_carton[c] =  false;
    }
    for(let l = 0; l < 9; l++){
        linea1[l] = 0;
        linea2[l] = 0;
        linea3[l] = 0;
    }

    for (let p = 0; p < 8; p++){
        pos[p] = false;
    }
    while (cont < 6) {
        let bola = bola_carton();
        if (!bombo_carton[bola]) {
            bombo_carton[bola] = true;
            let decena = parseInt(bola / 10, 10);
            if (!pos[decena]) {
                pos[decena] = true;
                linea1[decena] = bola;
                cont++;
            }
        }
    }
    carton1.push(linea1);
    cont = 1;

    for (let p = 0; p < 8; p++){
        pos[p] = false;
    }
    while (cont < 6) {
        let bola = bola_carton();
        if (!bombo_carton[bola]) {
            bombo_carton[bola] = true;
            let decena = parseInt(bola / 10, 10);
            if (!pos[decena]) {
                pos[decena] = true;
                linea2[decena] = bola;
                cont++;
            }
        }
    }
    carton1.push(linea2);
    cont = 1;

    for (let p = 0; p < 8; p++){
        pos[p] = false;
    }
    while (cont < 6) {
        let bola = bola_carton();
        if (!bombo_carton[bola]) {
            bombo_carton[bola] = true;
            let decena = parseInt(bola / 10, 10);
            if (!pos[decena]) {
                pos[decena] = true;
                linea3[decena] = bola;
                cont++;
            }
        }
    }
    carton1.push(linea3);
    return carton1;
}

function bola_carton()
{
    let numero = Math.round(Math.random() * (80 - 1)) + 1;
    return numero;
}


