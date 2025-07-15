/*
 * Imports
 */
import fs from 'fs';
import { getPlayerDatabase } from './database.js';
import { getMap } from './map.js';

/*
 * Save a player's data to a JSON file.
 */
function savePlayer(playerData) {
    const serializedPlayerData = JSON.stringify(playerData);
    console.log(serializedPlayerData)
    fs.writeFileSync(`./saves/players/${playerData.name}.json`, serializedPlayerData);
    console.log(`Player "${playerData.name}" was saved succesfully.`);
};

/*
 * Save all players' data to separate JSON files.
 */
function savePlayers() {
    let playerData = getPlayerDatabase();
    for (let playerID in playerData) {
        savePlayer(playerData[playerID]);
    }
};

/*
 * Save the game map to a JSON file.
 */
function saveMap() {
    let map = getMap();
    const serializedMap = JSON.stringify(map);
    fs.writeFileSync(`./saves/map/map.json`, serializedMap);
    console.log(`The map was saved succesfully.`);
};

export { savePlayers };
export { saveMap };
