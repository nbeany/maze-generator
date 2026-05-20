// =============================================================
//  MAZE DATA STRUCTURE
//  northWall[row][col] — 1 = north wall of cell (row,col) is intact
//  eastWall[row][col]  — 1 = east wall  of cell (row,col) is intact
//
//  Dimensions:
//    northWall: (R+1) rows  × (C+1) cols
//    eastWall:  (R+1) rows  × (C+1) cols
//
//  Special regions:
//    northWall[0][col] — phantom row 0: its north walls form the
//                        BOTTOM edge of the visible maze
//    eastWall[row][0]  — column 0: controls gaps in the LEFT edge
// =============================================================

const R = 10; // number of rows    (change as needed)
const C = 10; // number of columns (change as needed)

// -----------------------------------------------------------------
// createGrid(rows, cols)
//   Returns a 2-D array of dimensions (rows × cols) filled with 1s.
//   We allocate (R+1) × (C+1) for both arrays so that:
//     • Row index 0 is the phantom row below the maze
//     • Column index 0 holds the left-edge wall data
//   Visible cells occupy rows 1..R, cols 1..C.
// -----------------------------------------------------------------
function createGrid(rows, cols) {
  return Array.from({ length: rows }, () => new Array(cols).fill(1));
}

// northWall[i][j] = 1  →  the top wall of visible cell (i, j) is intact
// northWall[0][j] = 1  →  the bottom boundary of the maze is intact (phantom row)
const northWall = createGrid(R + 1, C + 1);

// eastWall[i][j]  = 1  →  the right wall of visible cell (i, j) is intact
// eastWall[i][0]  = 1  →  the left boundary column (gaps here = left-edge openings)
const eastWall  = createGrid(R + 1, C + 1);

// -----------------------------------------------------------------
// Coordinate conventions
//
//   Visible cells: row 1..R  (row 1 = top, row R = bottom)
//                  col 1..C  (col 1 = left, col C = right)
//
//   northWall[i][j]  is the wall on the TOP  of cell (i, j)
//   eastWall[i][j]   is the wall on the RIGHT of cell (i, j)
//
//   The SOUTH wall of cell (i, j) == northWall[i-1][j]
//   The WEST  wall of cell (i, j) == eastWall[i][j-1]
//
//   Boundary walls (never eaten by the mouse):
//     Top boundary    → northWall[R][j]  for j = 1..C
//     Bottom boundary → northWall[0][j]  for j = 1..C  (phantom row)
//     Right boundary  → eastWall[i][C]   for i = 1..R
//     Left boundary   → eastWall[i][0]   for i = 1..R  (column 0)
// -----------------------------------------------------------------

// -----------------------------------------------------------------
// Helper: isVisited(i, j)
//   A cell is considered "visited" (already on some path) if ANY of
//   its four walls has been eaten.  Unvisited cells have all 4 intact.
// -----------------------------------------------------------------
function isVisited(row, col) {
  const hasNorthWall = northWall[row][col]       === 1; // own north wall
  const hasSouthWall = northWall[row - 1][col]   === 1; // phantom-row trick
  const hasEastWall  = eastWall[row][col]         === 1; // own east wall
  const hasWestWall  = eastWall[row][col - 1]     === 1; // left-column trick
  return !(hasNorthWall && hasSouthWall && hasEastWall && hasWestWall);
}

// -----------------------------------------------------------------
// Helper: eatWall(fromRow, fromCol, toRow, toCol)
//   Removes the wall between two adjacent cells by setting the
//   shared wall entry to 0.
// -----------------------------------------------------------------
function eatWall(fromRow, fromCol, toRow, toCol) {
  if (toRow === fromRow + 1) {
    // moving north → remove northWall of the FROM cell
    northWall[fromRow][fromCol] = 0;
  } else if (toRow === fromRow - 1) {
    // moving south → remove northWall of the TO cell (phantom-row handles row 0)
    northWall[toRow][toCol] = 0;
  } else if (toCol === fromCol + 1) {
    // moving east → remove eastWall of the FROM cell
    eastWall[fromRow][fromCol] = 0;
  } else if (toCol === fromCol - 1) {
    // moving west → remove eastWall of the TO cell (column-0 handles col 0)
    eastWall[toRow][toCol] = 0;
  }
}

// -----------------------------------------------------------------
// Helper: getNeighbors(row, col)
//   Returns all valid neighbors (within the visible grid) of a cell.
// -----------------------------------------------------------------
function getNeighbors(row, col) {
  const neighbors = [];
  if (row < R) neighbors.push({ row: row + 1, col });       // north
  if (row > 1) neighbors.push({ row: row - 1, col });       // south
  if (col < C) neighbors.push({ row, col: col + 1 });       // east
  if (col > 1) neighbors.push({ row, col: col - 1 });       // west
  return neighbors;
}

// -----------------------------------------------------------------
// Quick sanity check — log the initial state of a sample cell
// -----------------------------------------------------------------
console.log("Initial state — all walls should be 1:");
console.log("northWall[1][1] =", northWall[1][1]); // top wall of top-left cell
console.log("eastWall[1][1]  =", eastWall[1][1]);  // right wall of top-left cell
console.log("northWall[0][1] =", northWall[0][1]); // bottom boundary (phantom row)
console.log("eastWall[1][0]  =", eastWall[1][0]);  // left boundary (column 0)
console.log(`Grid size: ${R} rows × ${C} cols (arrays are ${R+1}×${C+1})`);
