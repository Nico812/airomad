/*
 * Imports
 */
import globalConstants from './constants/globalConstants.json' with { type: "json" };
import structUpgradeCost from './constants/sharedConstants/structUpgradeCost.json' with { type: "json" };
import unitCost from './constants/sharedConstants/unitCost.json' with { type: "json" };
import { getPlayerData, setSubAttribute, killCastle, pay, addUnits, setUnits, addResources, upgradeIfNeeded, trackUnits, removeUnitsFromTracking } from './database.js'
import { getMapComponent, getPath, addUnitsToMap, moveUnitsInMap, removeUnitsFromMap } from './map.js'

/*
 * Pending units
 */
let pendingUnits = {};

function setPendingUnits(unitsID, units, coord) {
	pendingUnits[unitsID] = {units: units, coord: coord};
}

/*
 * Compute the attack between two players.
 */
function computeAttack(attackerName, units, targetCoord) {
	if(!getMapComponent(targetCoord).castle) {
		console.log("ERROR: Computing attack -Player VS Tile-.");
		return;
	}
	const targetName = getMapComponent(targetCoord).castle.name;
    const tCastle = getPlayerData(targetName);
    let victory = false;

    const totalDamage = units.knights + units.peasants / 10 + units.mages * 2;
    const totalDefenderStrength = tCastle.units.knights * (1 + tCastle.wall.level * 0.2) +
        tCastle.units.peasants * (1 + tCastle.wall.level * 1) / 10 + tCastle.units.mages * 2;

    victory = (totalDamage > totalDefenderStrength);
    console.log("totalDamage/totalDefenderStrength:" + totalDamage / totalDefenderStrength);

    if (victory) {
        killCastle(targetName);
        const stillAlive = (1 - totalDefenderStrength / totalDamage);
        const remainingKnights = Math.floor(units.knights * stillAlive);
        const remainingPeasants = Math.floor(units.peasants * stillAlive);
        const remainingMages = Math.floor(units.mages * stillAlive);
        const remainingUnits = { knights: remainingKnights, peasants: remainingPeasants, mages: remainingMages };
        addUnits(attackerName, remainingUnits);
    } else {
        const destructionLevel = (1 - totalDamage / totalDefenderStrength);
        const remainingKnights = Math.floor(tCastle.units.knights * destructionLevel);
        const remainingPeasants = Math.floor(tCastle.units.peasants * destructionLevel);
        const remainingMages = Math.floor(tCastle.units.mages * destructionLevel);
        const remainingUnits = { knights: remainingKnights, peasants: remainingPeasants, mages: remainingMages };
        setUnits(targetName, remainingUnits);
    }
    return;
}

/*
 * Handle troops deployment
 */
function moveUnits(unitsID, path, attackerName, units) {
    const currentCoord = path.shift();
    if (path.length > 0) {
        moveUnitsInMap(unitsID, currentCoord, path[0]);
        setTimeout(function () {
            moveUnits(unitsID, path, attackerName, units);
        }, globalConstants.unitsMovementTimestep);
        return;
    }
	if(!getMapComponent(currentCoord).castle) {
    	setPendingUnits(unitsID, units, currentCoord);
    	return;
    }
    computeAttack(attackerName, units, currentCoord);
};

function handleAttack(attackerName, units, targetCoord, path) {
    let targetName = getMapComponent(targetCoord).castle.name;
    if (path.length === 0) {
        computeAttack(attackerName, units, targetName);
        return;
    }
    const unitsID = attackerName + Date.now();
    addUnitsToMap(unitsID, path[0]);
    setTimeout(function () {
        moveUnits(unitsID, path, attackerName, units);
    }, globalConstants.unitsMovementTimestep);
};

function handleTroopsPositioning(playerID, units, targetCoord, path) {
	const unitsID = playerID + Date.now();
    trackUnits(playerID, unitsID);
    addUnitsToMap(unitsID, path[0]);
    setTimeout(function () {
        moveUnits(unitsID, path, playerID, units);
    }, globalConstants.unitsMovementTimestep);
}

function handleTroopsDeployment(playerID, units, targetCoord) {
	// Checking requisites
	if (getMapComponent(targetCoord).tile.collision) { return; }
	let enoughUnits = true;
	const playerCastle = getPlayerData(playerID);
    for (const unit in units) {
        enoughUnits *= (playerCastle.units[unit] >= units[unit]);
    }
    if(!enoughUnits) { return; }
    let path = getPath(playerCastle.coord, targetCoord);
    if (!path) { return; };
    // Accepted - Units leave the castle
    for (const unit in units) {
        setSubAttribute(playerID, 'units', unit, playerCastle.units[unit] - units[unit]);
    }
	if (!getMapComponent(targetCoord).castle) {
		handleTroopsPositioning(playerID, units, targetCoord, path);
	} 
	else {
		handleAttack(playerID, units, targetCoord, path);
	}
}

export function handlePendingTroopsDeployment(playerID, unitsID, startingCoord, targetCoord) {
    if (getMapComponent(targetCoord).tile.collision) { return; };
    let path = getPath(startingCoord, targetCoord);
    if (!path) { return; };
    if(!pendingUnits[unitsID] || pendingUnits[unitsID].coord != startingCoord) { return; };
    if(!getPlayerData(playerID).trackedUnits.includes(unitsID)) { return; };

    removeUnitsFromMap(unitsID, startingCoord);
    removeUnitsFromTracking(playerID, unitsID);
    units = pendingUnits[unitsID].units;
    if (!getMapComponent(targetCoord).castle) {
        handleTroopsPositioning(playerID, units, targetCoord, path);
    } 
    else {
        handleAttack(playerID, units, targetCoord, path);
    }
}

/*
 * Upgrade a castle.
 */
function upgradeCastle(playerID, structureName) {
    const castle = getPlayerData(playerID);
    if (!castle[structureName].state.upgrading && pay(playerID, structUpgradeCost[structureName][castle[structureName].level])) {
        setSubAttribute(playerID, structureName, 'state', { upgrading: true, startTime: Date.now() });
        upgradeIfNeeded(structureName, castle[structureName]);
        console.log(`Upgrading ${structureName} of ${playerID}`);
        return true;
    } else {
        return false;
    }
};

/*
 * Train units.
 */
function trainUnits(playerID, units) {
    let totalCost = {};
    for (let unitType in units) {
        for (let resourceType in unitCost[unitType]) {
            if (!totalCost[resourceType]) {
                totalCost[resourceType] = 0;
            }
            totalCost[resourceType] += units[unitType] * unitCost[unitType][resourceType];
        }
    };
    if (pay(playerID, totalCost)) {
        if (addUnits(playerID, units)) {
            return true;
        } else {
            addResources(playerID, totalCost);
            return false;
        }
    } else {
        return false;
    }
};

/*
 * Exports
 */
export { upgradeCastle, trainUnits, handleTroopsDeployment }
