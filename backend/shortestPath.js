class cell {
    constructor(){
        this.parent_y = 0;
        this.parent_x = 0;
        this.f = 0;
        this.g = 0;
        this.h = 0;
    }
}

function isValid(x, y, ROW, COL) {
    return (x >= 0) && (x < COL) && (y >= 0) && (y < ROW);
}

function isBlocked(x, y, map) {
    if (map[y][x].tile.collision) {return true }
    else {return false };
}

function isDestination(x, y, destX, destY)
{
    if (x == destX && y == destY) {return true }
    else {return false };
}

function calculateHValue(startX, startY, destX, destY) { 
    let D = 1;
    let D2 = Math.sqrt(2);
    let dx = Math.abs(startX - destX);
    let dy = Math.abs(startY - destY);
    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}

//function tracePath(cellDetails, destX, destY) {
//    console.log("The Path is ");
//    let x = destX;
//    let y = destY;
// 
//    // stack<Pair> Path;
//    let Path = [];
// 
//    while (!(cellDetails[y][x].parent_y == y && cellDetails[y][x].parent_x == x)) {
//        Path.push([x, y]);
//        let temp_y = cellDetails[y][x].parent_y;
//        let temp_x = cellDetails[y][x].parent_x;
//        y = temp_y;
//        x = temp_x;
//    }
// 
//    Path.push([x, y]);
//    console.log(Path.reverse());
//    return;
//}

function tracePath(cellDetails, destX, destY) {
    let x = destX;
    let y = destY;
    let path = [];

    while (!(cellDetails[y][x].parent_y == y && cellDetails[y][x].parent_x == x)) {
        path.push({x: x, y: y});
        let temp_y = cellDetails[y][x].parent_y;
        let temp_x = cellDetails[y][x].parent_x;
        y = temp_y;
        x = temp_x;
    }
    path.push({x: x, y: y});
    return path.reverse();
}

// src/dest: {x, y} format.
export function aStarSearch(map, src, dest) {
    
    let ROW = map.length;
    let COL = map[0].length;
    // If the source is out of range
    if (isValid(src.x, src.y, ROW, COL) == false) {
        console.log("Source is invalid\n");
        return;
    }
 
    // If the destination is out of range
    if (isValid(dest.x, dest.y, ROW, COL) == false) {
        console.log("Destination is invalid\n");
        return;
    }
 
    // Either the source or the destination is blocked
    if (isBlocked(src.x, src.y, map) == true || isBlocked(dest.x, dest.y, map) == true) {
        console.log("Source or the destination is blocked\n");
        return;
    }
 
    // If the destination cell is the same as source cell
    if (isDestination(src.x, src.y, dest.x, dest.y) == true) {
        console.log("Pathfinding: Source = destination\n");
        return;
    }
 
    // Create a closed list and initialise it to false which means that no cell has been included yet
    // This closed list is implemented as a boolean 2D array
    let closedList = new Array(ROW);
    for(let i = 0; i < ROW; i++){
        closedList[i] = new Array(COL).fill(false);
    }
 
    // Declare a 2D array of structure to hold the details of that cell
    let cellDetails = new Array(ROW);
    for(let i = 0; i < ROW; i++){
        cellDetails[i] = new Array(COL);
    }
 
    let x, y;
 
    for (y = 0; y < ROW; y++) {
        for (x = 0; x < COL; x++) {
            cellDetails[y][x] = new cell();
            cellDetails[y][x].f = 2147483647;
            cellDetails[y][x].g = 2147483647;
            cellDetails[y][x].h = 2147483647;
            cellDetails[y][x].parent_y = -1;
            cellDetails[y][x].parent_x = -1;
        }
    }
 
    // Initialising the parameters of the starting node
    x = src.x, y = src.y;
    cellDetails[y][x].f = 0;
    cellDetails[y][x].g = 0;
    cellDetails[y][x].h = 0;
    cellDetails[y][x].parent_y = y;
    cellDetails[y][x].parent_x = x;
 
    /*
     Create an open list having information as <f, <x, y>>
     where f = g + h,
     Note that 0 <= y <= ROW-1 & 0 <= x <= COL-1
     This open list is implemented as a set of pair of pair.*/
    let openList = new Map();
 
    // Put the starting cell on the open list and set its 'f' as 0
    openList.set(0, [x, y]);
 
    // We set this boolean value as false as initially the destination is not reached.
    let foundDest = false;
 
    while (openList.size > 0) {
        let p = openList.entries().next().value
 
        // Remove this vertex from the open list
        openList.delete(p[0]);
 
        // Add this vertex to the closed list
        x = p[1][0];
        y = p[1][1];
        closedList[y][x] = true;

        // To store the 'g', 'h' and 'f' of the 8 successors
        let gNew, hNew, fNew;
 
        //----------- 1st Successor (North) ------------
 
        // Only process this cell if this is a valid one
        if (isValid(x, y - 1, ROW, COL) == true) {
            // If the destination cell is the same as the current successor
            if (isDestination(x, y - 1, dest.x, dest.y) == true) {
                // Set the Parent of the destination cell
                cellDetails[y - 1][x].parent_y = y;
                cellDetails[y - 1][x].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            // If the successor is already on the closed list or if it is blocked, then ignore it.
            // Else do the following
            else if (closedList[y - 1][x] == false && isBlocked(x, y - 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x, y - 1, dest.x, dest.y);
                fNew = gNew + hNew;
 
                // If it isn’t on the open list, add it to the open list.
                // Make the current square the parent of this square.
                // Record the f, g, and h costs of the square cell
                //                OR
                // If it is on the open list already, check to see if this path to that square is better,
                // using 'f' cost as the measure.
                if (cellDetails[y - 1][x].f == 2147483647 || cellDetails[y - 1][x].f > fNew) {
                    openList.set(fNew, [x, y - 1]);
 
                    // Update the details of this cell
                    cellDetails[y - 1][x].f = fNew;
                    cellDetails[y - 1][x].g = gNew;
                    cellDetails[y - 1][x].h = hNew;
                    cellDetails[y - 1][x].parent_y = y;
                    cellDetails[y - 1][x].parent_x = x;
        }}}

        //----------- 2th Successor (Shouth) ------------
        if (isValid(x, y + 1, ROW, COL) == true) {
            if (isDestination(x, y + 1, dest.x, dest.y) == true) {
                cellDetails[y + 1][x].parent_y = y;
                cellDetails[y + 1][x].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y + 1][x] == false && isBlocked(x, y + 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x, y + 1, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y + 1][x].f == 2147483647 || cellDetails[y + 1][x].f > fNew) {
                    openList.set(fNew, [x, y + 1]);
                    cellDetails[y + 1][x].f = fNew;
                    cellDetails[y + 1][x].g = gNew;
                    cellDetails[y + 1][x].h = hNew;
                    cellDetails[y + 1][x].parent_y = y;
                    cellDetails[y + 1][x].parent_x = x;
        }}}

        //----------- 3th Successor (East) ------------
        if (isValid(x - 1, y, ROW, COL) == true) {
            if (isDestination(x - 1, y, dest.x, dest.y) == true) {
                cellDetails[y][x - 1].parent_y = y;
                cellDetails[y][x - 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y][x - 1] == false && isBlocked(x - 1, y, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x - 1, y, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y][x - 1].f == 2147483647 || cellDetails[y][x - 1].f > fNew) {
                    openList.set(fNew, [x - 1, y]);
                    cellDetails[y][x - 1].f = fNew;
                    cellDetails[y][x - 1].g = gNew;
                    cellDetails[y][x - 1].h = hNew;
                    cellDetails[y][x - 1].parent_y = y;
                    cellDetails[y][x - 1].parent_x = x;
        }}}

        //----------- 4th Successor (West) ------------
        if (isValid(x + 1, y, ROW, COL) == true) {
            if (isDestination(x + 1, y, dest.x, dest.y) == true) {
                cellDetails[y][x + 1].parent_y = y;
                cellDetails[y][x + 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y][x + 1] == false && isBlocked(x + 1, y, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x + 1, y, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y][x + 1].f == 2147483647 || cellDetails[y][x + 1].f > fNew) {
                    openList.set(fNew, [x + 1, y]);
                    cellDetails[y][x + 1].f = fNew;
                    cellDetails[y][x + 1].g = gNew;
                    cellDetails[y][x + 1].h = hNew;
                    cellDetails[y][x + 1].parent_y = y;
                    cellDetails[y][x + 1].parent_x = x;
        }}}
        
        //----------- 5th Successor (North-East) ------------
        if (isValid(x - 1, y - 1, ROW, COL) == true) {
            if (isDestination(x - 1, y - 1, dest.x, dest.y) == true) {
                cellDetails[y - 1][x - 1].parent_y = y;
                cellDetails[y - 1][x - 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y - 1][x - 1] == false && isBlocked(x - 1, y - 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x - 1, y - 1, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y - 1][x - 1].f == 2147483647 || cellDetails[y - 1][x - 1].f > fNew) {
                    openList.set(fNew, [x - 1, y - 1]);
                    cellDetails[y - 1][x - 1].f = fNew;
                    cellDetails[y - 1][x - 1].g = gNew;
                    cellDetails[y - 1][x - 1].h = hNew;
                    cellDetails[y - 1][x - 1].parent_y = y;
                    cellDetails[y - 1][x - 1].parent_x = x;
        }}}
        
        //----------- 6th Successor (North-West) ------------
        if (isValid(x + 1, y - 1, ROW, COL) == true) {
            if (isDestination(x + 1, y - 1, dest.x, dest.y) == true) {
                cellDetails[y - 1][x + 1].parent_y = y;
                cellDetails[y - 1][x + 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y - 1][x + 1] == false && isBlocked(x + 1, y - 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x + 1, y - 1, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y - 1][x + 1].f == 2147483647 || cellDetails[y - 1][x + 1].f > fNew) {
                    openList.set(fNew, [x + 1, y - 1]);
                    cellDetails[y - 1][x + 1].f = fNew;
                    cellDetails[y - 1][x + 1].g = gNew;
                    cellDetails[y - 1][x + 1].h = hNew;
                    cellDetails[y - 1][x + 1].parent_y = y;
                    cellDetails[y - 1][x + 1].parent_x = x;
        }}}

        //----------- 7th Successor (South-East) ------------
        if (isValid(x - 1, y + 1, ROW, COL) == true) {
            if (isDestination(x - 1, y + 1, dest.x, dest.y) == true) {
                cellDetails[y + 1][x - 1].parent_y = y;
                cellDetails[y + 1][x - 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y + 1][x - 1] == false && isBlocked(x - 1, y + 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x - 1, y + 1, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y + 1][x - 1].f == 2147483647 || cellDetails[y + 1][x - 1].f > fNew) {
                    openList.set(fNew, [x - 1, y + 1]);
                    cellDetails[y + 1][x - 1].f = fNew;
                    cellDetails[y + 1][x - 1].g = gNew;
                    cellDetails[y + 1][x - 1].h = hNew;
                    cellDetails[y + 1][x - 1].parent_y = y;
                    cellDetails[y + 1][x - 1].parent_x = x;
        }}}
        
        //----------- 8th Successor (South-West) ------------
        if (isValid(x + 1, y + 1, ROW, COL) == true) {
            if (isDestination(x + 1, y + 1, dest.x, dest.y) == true) {
                cellDetails[y + 1][x + 1].parent_y = y;
                cellDetails[y + 1][x + 1].parent_x = x;
                console.log("The destination cell is found\n");
                foundDest = true;
                return tracePath(cellDetails, dest.x, dest.y);
            }
            else if (closedList[y + 1][x + 1] == false && isBlocked(x + 1, y + 1, map) == false) {
                gNew = cellDetails[y][x].g + 1;
                hNew = calculateHValue(x + 1, y + 1, dest.x, dest.y);
                fNew = gNew + hNew;
                if (cellDetails[y + 1][x + 1].f == 2147483647 || cellDetails[y + 1][x + 1].f > fNew) {
                    openList.set(fNew, [x + 1, y + 1]);
                    cellDetails[y + 1][x + 1].f = fNew;
                    cellDetails[y + 1][x + 1].g = gNew;
                    cellDetails[y + 1][x + 1].h = hNew;
                    cellDetails[y + 1][x + 1].parent_y = y;
                    cellDetails[y + 1][x + 1].parent_x = x;
        }}}

    }
 
    if (foundDest == false) {console.log("Failed to find the Destination Cell\n") };
    return;
}