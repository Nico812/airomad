import ('./userUI.js');

var socket = io();

// Dati giocatore
var myCastle;
var myMap;

// Login trial
socket.on('playerID request', function() {
    let playerID = prompt("Inserisci il tuo nome:");
    socket.emit('login request', playerID);
})

// New login
socket.on('new login', function() {
    let xCoord = prompt("Inserisci la coordinata x del castello:");
    let yCoord = prompt("Inserisci la coordinata y del castello:");
    socket.emit('new playerCoord', { x: xCoord, y: yCoord } )
});

// Existing login
socket.on('existing login', function(playerData_) {
    playerData = playerData_;
});

//// Ricevi la mappa update
//socket.on('map update', function (map){
//    myMap = map;
//    let mapHTML = generateMapHTML(map)
//    document.getElementById('map-container').innerHTML = mapHTML;
//});

// Ricevi il castello update
socket.on('castle update', function(castle) {
    myCastle = castle;
    let userUI_HTML = generateUserUI_HTML(castle)
    document.getElementById('list-container').innerHTML = userUI_HTML;
});

// Ricevi i risultati dell'attacco
socket.on('attack results', function(result) {
    console.log('Attack was: ', result);
})