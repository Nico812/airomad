/*
 * Imports
 */
import path from 'path';
import fs from 'fs';

import globalConstants from './constants/globalConstants.json' with { type: "json" };
import structUpgradeTime from './constants/sharedConstants/structUpgradeTime.json' with { type: "json" };
import dwellingsUnitsCap from './constants/sharedConstants/dwellingsUnitsCap.json' with { type: "json" };
import depositResourcesCap from './constants/sharedConstants/depositResourcesCap.json' with { type: "json" };
import productionPerLevel from './constants/sharedConstants/productionPerLevel.json' with { type: "json" };
import { addCastleToMap } from './map.js';

/*
 * Player database.
 */
var playerData = {}; // kex: name - data: castle

function checkPlayerExistence(playerID) {
    if (playerData.hasOwnProperty(playerID)) {
        return true;
    } else {
        return false;
    }
}

function addNewPlayerData(playerID, castle) {
    playerData[playerID] = castle;
}

function killCastle(playerID) {
    playerData[playerID].alive = false;
    for (let unit in playerData[playerID].units) {
        playerData[playerID].units[unit] = 0;
    }
}

function pay(playerID, resources) {
    let haveEnough = true;
    let ownedResources = playerData[playerID].deposit;
    for (let resourceType in resources) {
        haveEnough = haveEnough && ownedResources[resourceType] >= resources[resourceType];
    }
    if (haveEnough) {
        for (let resourceType in resources) {
            playerData[playerID].deposit[resourceType] -= resources[resourceType];
        }
    };
    return haveEnough
}

function addUnits(playerID, units) {
    let totalAmountOfNewUnits = 0;
    let dwellingsLevel = playerData[playerID].dwellings.level;
    for (let unitType in units) {
        totalAmountOfNewUnits += units[unitType];
    }
    if (totalAmountOfNewUnits + getTotalAmountOfUnits(playerID) <= dwellingsUnitsCap[dwellingsLevel]) {
        for (let unitType in units) {
            playerData[playerID].units[unitType] += units[unitType];
        };
        return true;
    } else {
        console.log(`Adding too many units to ${playerID}, operation cancelled`);
        return false;
    }
}

function addResources(playerID, resources) {
    for (let resourceType in resources) {
        playerData[playerID].deposit[resourceType] += resources[resourceType];
    }
}

/*
 * Set - Get functions
 */
function getPlayerData(playerID) {
    return playerData[playerID];
};

function getPlayerDatabase(playerID) {
    return playerData;
};

function setSubAttribute(playerID, attribute, subAttribute, value) {
    playerData[playerID][attribute][subAttribute] = value;
}

function getTotalAmountOfUnits(playerID) {
    let totalAmountOfUnits = 0;
    for (let unitType in playerData[playerID].units) {
        totalAmountOfUnits += playerData[playerID].units[unitType];
    }
    return totalAmountOfUnits;
};

function setUnits(playerID, units) {
    let totalAmountOfUnits = 0;
    let dwellingsLevel = playerData[playerID].dwellings.level;
    for (let unitType in units) {
        totalAmountOfUnits += units[unitType];
    }
    console.log(totalAmountOfUnits);
    if (totalAmountOfUnits <= dwellingsUnitsCap[dwellingsLevel]) {
        for (let unitType in units) {
            playerData[playerID].units[unitType] = units[unitType];
        };
        return true;
    } else {
        console.log(`Setting too many units ({totalAmountOfUnits: ${totalAmountOfUnits}) to ${playerID}, operation cancelled`);
        return false;
    }
}

function trackUnits(playerID, unitsID) {
    playerData[playerID].trackedUnits.push(unitsID);
}

export function removeUnitsFromTracking(playerID, unitsID) {
    const updatedUnits = playerData[playerID].trackedUnits.filter(unit => unit !== unitsID);
    playerData[playerID].trackedUnits = updatedUnits;
}

/*
 * Resources production
 */
setInterval(function () {
    for (let castle of Object.values(playerData)) {
        if (!castle.alive) { continue; };
        if (castle.deposit.stones === depositResourcesCap[castle.deposit.level].stones || castle.deposit.stones + productionPerLevel.mine[castle.mine.level] > depositResourcesCap[castle.deposit.level].stones) {
            castle.deposit.stones = depositResourcesCap[castle.deposit.level].stones;
        } else {
            castle.deposit.stones += productionPerLevel.mine[castle.mine.level];
        }
        if (castle.deposit.wood === depositResourcesCap[castle.deposit.level].wood || castle.deposit.wood + productionPerLevel.sawmill[castle.sawmill.level] > depositResourcesCap[castle.deposit.level].wood) {
            castle.deposit.wood = depositResourcesCap[castle.deposit.level].wood;
        } else {
            castle.deposit.wood += productionPerLevel.sawmill[castle.sawmill.level];
        }
    }
}, 1000);

/*
 * Upgrading castles
 */
function upgradeIfNeeded(structureName, structureData) {
    const currentTime = Date.now();
    const upgradeEndTime = structureData.state.startTime + structUpgradeTime[structureName][structureData.level];
    if (currentTime >= upgradeEndTime) {
        structureData.state.upgrading = false;
        structureData.level += 1;
        structureData.state.startTime = 0;
    } else if (upgradeEndTime - currentTime <= globalConstants.UpgradeStateCheckInterval) {
        setTimeout(function () {
            upgradeIfNeeded(structureName, structureData);
        }, upgradeEndTime - currentTime);
    }
};

setInterval(function () {
    for (let castle of Object.values(playerData)) {
        if (!castle.alive) { continue; };
        for (let [attKey, attData] of Object.entries(castle)) {
            if (attData.hasOwnProperty('state') && attData.state.upgrading) {
                upgradeIfNeeded(attKey, attData);
            }
        }
    }
}, globalConstants.UpgradeStateCheckInterval);

/*
 * Loading the game
 */
function loadPlayers() {
    const saveFiles = fs.readdirSync('./saves/players');
    for (const file of saveFiles) {
        const filePath = path.join('./saves/players', file);
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        playerData[jsonData.name] = jsonData;
        console.log(`Loaded playerData of ${jsonData.name}`);
    }
};

/*
 * Exports
 */
export { getPlayerData };
export { trackUnits }
export { getPlayerDatabase };
export { checkPlayerExistence };
export { addNewPlayerData };
export { killCastle };
export { setSubAttribute };
export { loadPlayers };
export { getTotalAmountOfUnits };
export { pay };
export { addUnits, setUnits };
export { upgradeIfNeeded };
export { addResources };
