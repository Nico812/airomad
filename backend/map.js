/*
 * Imports
 */
import fs from 'fs';
import path from 'path';
import globalConstants from './constants/globalConstants.json' with { type: "json" };
import { aStarSearch } from './shortestPath.js';
import { cellularAutomata } from './mapGeneration/cellularAutomata.js';
import { perlinNoise } from './mapGeneration/perlinNoise.js';

/*
 * Exports
 */
export { initializeMap, addCastleToMap, getMap, getMapComponent, loadMap, getPath, addUnitsToMap, moveUnitsInMap };

/*
 * Tiles JSON
 */
const tileData = [
    { id: 1, name: "grass", coord: { x: 0, y: 0 }, collision: false },
    { id: 2, name: "water", coord: { x: 0, y: 0 }, collision: true },
    { id: 3, name: "mountains", coord: { x: 0, y: 0 }, collision: true },
    { id: 4, name: "highMountains", coord: { x: 0, y: 0 }, collision: true },
    { id: 5, name: "forest", coord: { x: 0, y: 0 }, collision: false },
    { id: 6, name: "hills", coord: { x: 0, y: 0 }, collision: false }
];

/*
 * Initialize the map with terrain data.
 */
let map = [];
function initializeMap() {
    let cellularMap = cellularAutomata(globalConstants.mapSize.rows, globalConstants.mapSize.cols, 5, 35);
    let noiseMap = perlinNoise(6, 5, globalConstants.mapSize.rows, globalConstants.mapSize.cols);

    console.log(cellularMap[0][0]);

    for (let i = 0; i < globalConstants.mapSize.rows; i++) {
        map[i] = [];
        for (let j = 0; j < globalConstants.mapSize.cols; j++) {
            let index = 0;
            if (cellularMap[i][j]) { index = 1 };
            if (index == 0 && noiseMap[i][j] > 0.45) { index = 3 }
            else if (index == 0 && noiseMap[i][j] > 0.35) { index = 2 }
            else if (index == 0 && noiseMap[i][j] > 0.2) { index = 4 }
            else if (index == 0 && noiseMap[i][j] > -0.1) { index = 5 };
            map[i][j] = {
                coord: { x: j, y: i },
                tile: { ...tileData[index] },
                castle: null,
                units: []
            };
        }
    }
}

/*
 * Add units to the map at a specific coordinate.
 */
function addUnitsToMap(unitsID, coord) {
    map[coord.y][coord.x].units.push(unitsID);
}

export function removeUnitsFromMap(unitsID, coord) {
    const updatedUnits = map[coord.y][coord.x].units.filter(unit => unit !== unitsID);
    map[coord.y][coord.x].units = updatedUnits;
}

/*
 * Move units within the map from one coordinate to another.
 */
function moveUnitsInMap(unitsID, initCoord, targetCoord) {
    const unitsIndex = map[initCoord.y][initCoord.x].units.indexOf(unitsID);
    if (unitsIndex !== -1) {
        const units = map[initCoord.y][initCoord.x].units.splice(unitsIndex, 1)[0];
        map[targetCoord.y][targetCoord.x].units.push(units);
    } else {
        console.error("ERROR in map.js:moveUnits(), unitID not found in given coordinates.");
    }
}

/*
 * Get the entire map.
 */
function getMap() {
    return map;
}

/*
 * Get a specific component of the map based on coordinates.
 */
function getMapComponent(coord) {
    if (!map[coord.y][coord.x]) {
        console.log("ERROR in map.js:getMapComponent(), component not found.");
        return null;
    }
    return map[coord.y][coord.x];
}

/*
 * Add a castle to the map.
 */
function addCastleToMap(castle) {
    console.log("Adding a new castle to the map")
    map[castle.coord.y][castle.coord.x].castle = { id: castle.id, name: castle.name, coord: castle.coord, collision: castle.collision };
};

/*
 * Load the map from saved files.
 */
function loadMap() {
    const saveFiles = fs.readdirSync('./saves/map');
    for (const file of saveFiles) {
        const filePath = path.join('./saves/map', file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        map = jsonData;
        console.log(`Loaded map`);
    }
}

/*
 * Find a path between two points on the map.
 */
function getPath(src, dest) {
    return aStarSearch(map, src, dest);
}
