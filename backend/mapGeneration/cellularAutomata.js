export { cellularAutomata };

function fillRandom(map, percentAreWalls) {
    const mapRows = map.length;
    const mapCols = map[0].length;

    for (let row = 0; row < mapRows; ++row) {
        for (let col = 0; col < mapCols; ++col) {
            if (row === 0 || col === 0 || row === mapRows - 1 || col === mapCols - 1) {
                map[row][col] = true;
            } else if (Math.floor(Math.random() * 100) + 1 <= percentAreWalls) {
                map[row][col] = true;
            } else {
                map[row][col] = false;
            }
        }
    }
}

function stepLife(map, tempMap) {
    const mapRows = map.length;
    const mapCols = map[0].length;

    for (let row = 0; row < mapRows; ++row) {
        for (let col = 0; col < mapCols; ++col) {
            let wallCounter = 0;
            for (let i = row - 1; i <= row + 1; ++i) {
                for (let j = col - 1; j <= col + 1; ++j) {
                    if (i === row && j === col) { continue; }
                    else if (i < 0 || j < 0 || i >= mapRows || j >= mapCols) {
                        ++wallCounter;
                    }
                    else if (map[i][j]) { ++wallCounter; }
                }
            }
            if (map[row][col]) {
                if (wallCounter >= 4) {
                    tempMap[row][col] = true;
                }
                if (wallCounter < 2) {
                    tempMap[row][col] = false;
                }
            } else {
                if (wallCounter >= 5) {
                    tempMap[row][col] = true;
                }
            }
        }
    }
}

function cellularAutomata(mapRows, mapCols, iter, percentAreWalls) {
    const map = Array.from({ length: mapRows }, () => Array(mapCols).fill(false));
    const tempMap = Array.from({ length: mapRows }, () => Array(mapCols).fill(false));

    fillRandom(map, percentAreWalls);
    for (let i = 0; i < iter; ++i) {
        stepLife(map, tempMap);
        map.forEach((row, index) => row.forEach((_, colIndex) => row[colIndex] = tempMap[index][colIndex]));
    }

    return map;
}
