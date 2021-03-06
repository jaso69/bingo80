var socket = io.connect('localhost:8080', {'forceNew': true});

var user = null;
var synth = window.speechSynthesis;
var playSound = null;
var jugador = false;
var carton = [];
var indice = null;
var reg = false;

socket.on('usuarios', function (data) {
    location.href="acceso.html";
    if (!data[0].partida){
        jugador = true;
        carton = data[1];
        for (let c = 0; c < 3; c++){
            for (let l = 0; l < 9; l++){
                let idi = "c" + (c+1) + l;
                console.log(idi);
                let bola = "bola" + carton[c][l] + ".png";
                document.getElementById(idi).src = bola;
            }
        }
    }

    /*
    let i;
        for (i = 0; i < data.length; i++) {
            if (data[i].nombre === user.nombre) {
                jugador = true;
                indice = i;
            }
        }
    if(jugador) {
        if (!data[indice].partida) {
            document.getElementById('nuevo_usuario').style.display = 'none';
            document.getElementById('bingo').style.display = 'inline';
            if(!reg) {
                playSound = new SpeechSynthesisUtterance("bienvenido" + data[indice].nombre);
                synth.speak(playSound);
                reg = true;
            }
            render();
            render_usuarios(data);
        } else {
            document.getElementById('esperar').style.display = 'inline';
        }
    } */
});

socket.on('partida-iniciada', function (data) {

    if(jugador) {
        playSound = new SpeechSynthesisUtterance("Empezamos");
        synth.speak(playSound);
        document.getElementById('btn_iniciar').style.display = 'none';
        document.getElementById('label_bola').style.display = 'none';
        document.getElementById('btn_pausa').style.display = 'inline';
        document.getElementById('btn_linea').style.display = 'inline';
        document.getElementById('btn_fin').style.display = 'inline';
        document.getElementById('linea_winner').style.display = 'none';
        document.getElementById('bingo_winner').style.display = 'none';
        render_usuarios(data);
        for (let i = 1; i < 81; i++) {
            let bola = "bola" + i;
            document.getElementById(bola).style.display = 'none';
        }
    } else {
        return null;
    }
});

socket.on('bola',function (data) {
    if(jugador) {
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
    }
});

socket.on('terminar', function () {
    playSound = new SpeechSynthesisUtterance("partida terminada ");
    synth.speak(playSound);
    socket.emit('nuevo-usuario', user);
    document.getElementById('nuevo_usuario').style.display = 'none';
    document.getElementById('bingo').style.display = 'inline';
    document.getElementById('esperar').style.display = 'none';
    document.getElementById('btn_iniciar').style.display = 'inline';
    document.getElementById('label_bola').style.display = 'none';
    document.getElementById('btn_pausa').style.display = 'none';
    document.getElementById('btn_linea').style.display = 'none';
    document.getElementById('btn_fin').style.display = 'none';
    document.getElementById('btn_bingo').style.display = 'none';
    render();
    fin();
});

socket.on('pausar', function (data) {
    playSound = new SpeechSynthesisUtterance(data.nombre + "ha pedido una pausa");
    synth.speak(playSound);
    document.getElementById('btn_pausa').style.display = 'none';
    document.getElementById('btn_linea').style.display = 'none';
    document.getElementById('btn_fin').style.display = 'none';
    document.getElementById('btn_bingo').style.display = 'none';
    document.getElementById('btn_seguir').style.display = 'inline';
});

socket.on('seguimos', function () {
    document.getElementById('btn_pausa').style.display = 'inline';
    if(document.getElementById('linea_winner').value === undefined) {
        document.getElementById('btn_linea').style.display = 'inline';
    }
    if(document.getElementById('linea_winner').value !== undefined) {
        document.getElementById('btn_bingo').style.display = 'inline';
    }
    document.getElementById('btn_fin').style.display = 'inline';
    document.getElementById('btn_seguir').style.display = 'none';
    playSound = new SpeechSynthesisUtterance("continuamos");
    synth.speak(playSound);
});

socket.on('linea_song', function (data) {
    render_linea(data.nombre);
    document.getElementById('linea_winner').style.display = 'inline';
    playSound = new SpeechSynthesisUtterance(data.nombre + "ha cantado linea, hacemos una pausa para comprobar");
    synth.speak(playSound);
    document.getElementById('btn_pausa').style.display = 'none';
    document.getElementById('btn_seguir').style.display = 'inline';
    document.getElementById('btn_linea').style.display = 'none';
    document.getElementById('btn_bingo').style.display = 'inline';
});

socket.on('bingo_song', function (data) {
    render_bingo(data.nombre);
    document.getElementById('bingo_winner').style.display = 'inline';
    playSound = new SpeechSynthesisUtterance(data.nombre + "ha cantado bingo");
    synth.speak(playSound);
    fin();
});

function render_usuarios(data) {

    var html = data.map(function(elem, index){

        return(`<p>
                 <strong>${elem.nombre}</strong>
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

function render_linea(nombre) {
    var html = `<strong class="text-info"> Linea: ${nombre}</strong>`;

    document.getElementById('linea_winner').innerHTML = html;
}

function render_bingo(nombre) {
    var html = `<strong class="text-danger"> Bingo: ${nombre}</strong>`;

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
    socket.emit('nuevo-juego');
    return null;
}

function pausa() {
    socket.emit('pausa', user);
    return null;
}

function seguir() {
    socket.emit('seguir');
    return null;
}

function linea() {
    socket.emit('linea', user);
    return null;
}

function bingo() {
    socket.emit('bingo', user);
    return null;
}

function fin() {

    socket.emit('fin');
    return null;
}


