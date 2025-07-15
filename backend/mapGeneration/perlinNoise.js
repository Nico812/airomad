export { perlinNoise };

function interpolate(a0, a1, w) {
    return (1 - w) * a0 + w * a1;
}

function randomGrid(gridRows, gridCols) {
    const grid = [];
    for (let row = 0; row <= gridRows; ++row) {
        grid[row] = [];
        for (let col = 0; col <= gridCols; ++col) {
            const theta = Math.random() * 2 * Math.PI;
            grid[row][col] = {
                x: Math.cos(theta),
                y: Math.sin(theta)
            };
        }
    }
    return grid;
}

function perlinNoise(gridRows, gridCols, mapRows, mapCols) {
    const grid = randomGrid(gridRows, gridCols);
    const heights = [];

    for (let row = 0; row < mapRows; ++row) {
        heights[row] = [];
        for (let col = 0; col < mapCols; ++col) {
            const gridCellCol = Math.floor(col * gridCols / mapCols);
            const gridCellRow = Math.floor(row * gridRows / mapRows);
            const gridCellOffsetX = (col * gridCols) % mapCols / mapCols;
            const gridCellOffsetY = (row * gridRows) % mapRows / mapRows;

            const cornerTL = grid[gridCellRow][gridCellCol];
            const cornerTR = grid[gridCellRow][gridCellCol + 1];
            const cornerBL = grid[gridCellRow + 1][gridCellCol];
            const cornerBR = grid[gridCellRow + 1][gridCellCol + 1];

            const offsetVectorTL = { x: gridCellOffsetX, y: gridCellOffsetY };
            const offsetVectorTR = { x: gridCellOffsetX - 1, y: gridCellOffsetY };
            const offsetVectorBL = { x: gridCellOffsetX, y: gridCellOffsetY - 1 };
            const offsetVectorBR = { x: gridCellOffsetX - 1, y: gridCellOffsetY - 1 };

            const dotProductTL = cornerTL.x * offsetVectorTL.x + cornerTL.y * offsetVectorTL.y;
            const dotProductTR = cornerTR.x * offsetVectorTR.x + cornerTR.y * offsetVectorTR.y;
            const dotProductBL = cornerBL.x * offsetVectorBL.x + cornerBL.y * offsetVectorBL.y;
            const dotProductBR = cornerBR.x * offsetVectorBR.x + cornerBR.y * offsetVectorBR.y;

            const height = interpolate(
                interpolate(dotProductTL, dotProductBL, gridCellOffsetY),
                interpolate(dotProductTR, dotProductBR, gridCellOffsetY),
                gridCellOffsetX
            );
            heights[row][col] = height;
        }
    }
    return heights;
}
