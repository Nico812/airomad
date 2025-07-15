// Imports
import express from 'express';
import cors from 'cors';
import http from 'http';
import readline from'readline';
import { Server as socketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import globalConstants from './constants/globalConstants.json' with { type: "json" };
import { initializeMap, loadMap, getMap, getMapComponent, addCastleToMap, getPath } from './map.js';
import { newCastle } from './castle.js';
import { getPlayerData, addNewPlayerData, checkPlayerExistence, loadPlayers } from './database.js'
import { savePlayers, saveMap } from './saves.js'
import { handleTroopsDeployment, handlePendingTroopsDeployment, upgradeCastle, trainUnits } from './gameMechanics.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/*
 * Server setup
 */
var app = express();
var server = http.createServer(app);
const io = new socketIOServer(server, {
	cors: {
		origin: "*", 
		allowedHeaders: ["my-custom-header"], 
		credentials: true 
	}
});

app.set('port', globalConstants.serverPort);

/*
 * Start server
 */
server.listen(globalConstants.serverPort, function() {
	console.log(`Starting server on port ${globalConstants.serverPort}`);
});

/*
 * Initialize game
 */
const args = process.argv.slice(2);
const existingGame = args.includes("--load");
initializeGame(existingGame);

function initializeGame(existingGame) {
	if (existingGame) {
		loadPlayers();
		loadMap();
	} else {
		initializeMap();
	}
};

/*
 * New connection
 */
io.on('connection', (socket) => {

	var playerID = undefined;
	console.log('New player connected:', socket.id)

	/*
	 * Login / Sign up
	 */
	function handleNewPlayerCoord(newPlayerCoord) {
		if (!newPlayerCoord || !getMapComponent(newPlayerCoord) || getMapComponent(newPlayerCoord).castle) {
			socket.emit('new player coord declined', 'Bad coordinates');
			console.log('new player coord declined, Bad coordinates');
			return;
		}
		if (getPlayerData(playerID)) {
			socket.emit('new player coord declined', 'You already have a castle');
			console.log('new player coord declined, You already have a castle');
			return;
		}
		var Castle = newCastle(playerID, newPlayerCoord);
		addNewPlayerData(playerID, Castle);
		addCastleToMap(Castle);
		socket.emit('new player coord accepted');
		console.log('new player coord accepted');
		socket.off('new player coord', handleNewPlayerCoord);
	}

	function handleLogin(inputID) {
		console.log('a');
		if (!inputID || typeof inputID !== 'string') {
		  return;
		}
		playerID = inputID;
		if(checkPlayerExistence(inputID)) {
			socket.emit('existing user', 'Welcome back to the realm of Airomad');
		} else {
			socket.emit('new user', 'Welcome to the realm of Airomad. Choose where to deploy your castle');
			socket.on('new player coord', handleNewPlayerCoord);
		}
		socket.off('login request', handleLogin);
	}

	socket.on('login request', handleLogin);

	/*
	 * Emitting updates to player
	 */
	setInterval( function() {
		socket.emit('castle info update', getPlayerData(playerID));
	}, globalConstants.castleUpdateEmitTimestep);

	setInterval( function() {
		socket.emit('map update', getMap());
	}, globalConstants.mapUpdateEmitTimestep);
	
	/*
	 * Managing player actions
	 */
	socket.on('new attack', function(units, targetCoord) {
		handleTroopsDeployment(playerID, units, targetCoord);
	});

	socket.on('new pending unit action', function(unitsID, startingCoord, targetCoord) {
		handlePendingTroopsDeployment(playerID, unitsID, targetCoord);
	});
	
	socket.on('upgrade request', function(structureName) {
		let success = upgradeCastle(playerID, structureName);
		console.log( `Upgrade request of ${playerID} on ${structureName} success: ${success}`);
	});
	
	socket.on('training request', function(units) {
		let success = trainUnits(playerID, units);
		console.log( `Train request of ${playerID} success: ${success}`);
	});
	
	/*
	 * Disconnection
	 */
	socket.on('disconnect', function () {
		console.log('Player disconnected:', socket.id);
	});
});

/*
 * Save / Load
 */
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', function(input) {
	if (input.trim() === '/save') {
		savePlayers();
		saveMap();
	}
	if (input.trim() === '/load') {
		loadPlayers();
		loadMap();
	}
});

// Debug pathfinding
rl.on('line', function(input) {
	if (input.trim().startsWith('/tp')) {
		// Estrai le coordinate di partenza e di destinazione dall'input utilizzando una regex
		const regex = /(\d+),\s*(\d+)\)\s*\((\d+),\s*(\d+)/;
		const matches = input.match(regex);
		if (matches && matches.length === 5) {
			const startX = parseInt(matches[1]);
			const startY = parseInt(matches[2]);
			const destX = parseInt(matches[3]);
			const destY = parseInt(matches[4]);
			// Esegui la funzione getPath() con le coordinate estratte
			getPath({x: startX, y: startY}, {x: destX, y: destY});
		} else {
			console.log('Formato non valido. Assicurati di seguire il formato: /tp (x1, y1) (x2, y2)');
		}
	}
});

