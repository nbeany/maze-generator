// =============================================================
//  MAZE GENERATOR  —  stack-based DFS "mouse"
//  Depends on: northWall, eastWall, R, C, eatWall, getNeighbors
//  (paste after maze.js, or import it)
// =============================================================

// -----------------------------------------------------------------
// Utility: shuffle an array in-place (Fisher-Yates)
// Used to randomise which neighbour the mouse visits next.
// -----------------------------------------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -----------------------------------------------------------------
// isUnvisited(row, col)
//   A cell is unvisited if ALL four of its walls are still intact.
//   Uses the phantom-row / column-0 trick from the data structure:
//     south wall of (i,j) → northWall[i-1][j]
//     west  wall of (i,j) → eastWall[i][j-1]
// -----------------------------------------------------------------
function isUnvisited(row, col) {
  return (
    northWall[row][col]     === 1 &&   // north wall intact
    northWall[row - 1][col] === 1 &&   // south wall intact  (phantom row)
    eastWall[row][col]      === 1 &&   // east  wall intact
    eastWall[row][col - 1]  === 1      // west  wall intact  (column 0)
  );
}

// -----------------------------------------------------------------
// generateMaze()
//   Runs the full DFS synchronously. Call this if you don't need
//   animation — it mutates northWall / eastWall in-place and returns
//   the ordered list of steps for playback or debugging.
//
//   Returns: Array of step objects  { from, to, stackSnapshot }
//     from  — { row, col }  cell the mouse was in
//     to    — { row, col }  cell the mouse moved into (wall was eaten)
//             null if this step was a stack-pop (dead-end backtrack)
// -----------------------------------------------------------------
function generateMaze() {
  // 1. Pick a random starting cell in the visible grid
  const startRow = Math.floor(Math.random() * R) + 1;  // 1..R
  const startCol = Math.floor(Math.random() * C) + 1;  // 1..C

  // visited tracks which cells the mouse has entered
  // (separate from "all walls intact" so we never revisit)
  const visited = Array.from({ length: R + 1 }, () =>
    new Array(C + 1).fill(false)
  );

  const stack = [];   // holds { row, col } positions
  const steps = [];   // ordered record of every move (for animation)

  // Mark start and push it
  visited[startRow][startCol] = true;
  stack.push({ row: startRow, col: startCol });

  while (stack.length > 0) {
    const current = stack[stack.length - 1]; // peek — don't pop yet
    const { row, col } = current;

    // Find all unvisited, in-bounds neighbours
    const candidates = getNeighbors(row, col).filter(
      n => !visited[n.row][n.col] && isUnvisited(n.row, n.col)
    );

    if (candidates.length === 0) {
      // Dead end — backtrack
      stack.pop();
      steps.push({ from: current, to: null, stackSnapshot: [...stack] });
    } else {
      // Shuffle so the path chosen is random
      shuffle(candidates);

      // Pick the first candidate as the direction to move
      const chosen = candidates[0];

      // The rest go onto the stack as deferred candidates.
      // NOTE: assignment spec says "save the locations of the OTHER
      // candidates on a stack". We do this by keeping `current` on the
      // stack — when we backtrack to it later, the remaining unvisited
      // neighbours will be re-evaluated (some may have been visited by
      // then, which is fine — we simply skip them).
      // This is the standard iterative DFS approach and produces proper
      // mazes (every cell connected by exactly one path).

      // Eat the wall between current and chosen
      eatWall(row, col, chosen.row, chosen.col);

      // Mark chosen as visited and push it
      visited[chosen.row][chosen.col] = true;
      stack.push(chosen);

      steps.push({
        from: current,
        to:   chosen,
        stackSnapshot: [...stack],
      });
    }
  }

  return steps;
}

// -----------------------------------------------------------------
// generateMazeSteps()
//   Returns a generator (iterator) that yields one step at a time.
//   Use this for animation — call .next() each frame.
//
//   Each yielded value: { from, to, current, visited, stackDepth }
//     current     — { row, col }  where the mouse is right now
//     to          — { row, col }  cell just moved into, or null (backtrack)
//     visited     — full visited 2-D array (reference, not copy)
//     stackDepth  — how many positions are on the stack
// -----------------------------------------------------------------
function* generateMazeSteps() {
  const startRow = Math.floor(Math.random() * R) + 1;
  const startCol = Math.floor(Math.random() * C) + 1;

  const visited = Array.from({ length: R + 1 }, () =>
    new Array(C + 1).fill(false)
  );

  const stack = [];

  visited[startRow][startCol] = true;
  stack.push({ row: startRow, col: startCol });

  // Yield the starting position before any wall is eaten
  yield {
    from:       null,
    to:         { row: startRow, col: startCol },
    current:    { row: startRow, col: startCol },
    visited,
    stackDepth: stack.length,
  };

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const { row, col } = current;

    const candidates = getNeighbors(row, col).filter(
      n => !visited[n.row][n.col] && isUnvisited(n.row, n.col)
    );

    if (candidates.length === 0) {
      stack.pop();
      yield {
        from:       current,
        to:         null,            // null signals a backtrack step
        current:    stack[stack.length - 1] ?? null,
        visited,
        stackDepth: stack.length,
      };
    } else {
      shuffle(candidates);
      const chosen = candidates[0];

      eatWall(row, col, chosen.row, chosen.col);
      visited[chosen.row][chosen.col] = true;
      stack.push(chosen);

      yield {
        from:       current,
        to:         chosen,
        current:    chosen,
        visited,
        stackDepth: stack.length,
      };
    }
  }
}

// -----------------------------------------------------------------
// QUESTION from the assignment:
//   "Might a queue be better than a stack for storing candidates?
//    How would it affect the order in which later paths are created?"
//
// ANSWER (keep in your README or as a comment):
//   A stack (LIFO) makes the mouse dive deep before backtracking —
//   this produces long, winding corridors with few short branches:
//   classic "river" mazes that feel complex.
//
//   A queue (FIFO) would process candidates in the order they were
//   discovered, expanding the frontier evenly in all directions
//   (like BFS). This produces shorter, stubbier passages that spread
//   across the grid before going deep — more "blob-like", less maze-y.
//   It still visits every cell (so the maze is proper), but it loses
//   the long-corridor character that makes mazes feel challenging.
// -----------------------------------------------------------------


// =============================================================
//  QUICK TEST (run in browser console or Node.js)
// =============================================================
(function selfTest() {
  // Reset walls to all-intact before testing
  for (let i = 0; i <= R; i++)
    for (let j = 0; j <= C; j++) {
      northWall[i][j] = 1;
      eastWall[i][j]  = 1;
    }

  const steps = generateMaze();

  // Count eaten walls: each non-backtrack step eats exactly one wall
  const wallsEaten = steps.filter(s => s.to !== null).length;

  // A proper maze on R×C cells has exactly (R*C - 1) walls removed
  const expected = R * C - 1;
  const proper = wallsEaten === expected;

  console.log(`Steps recorded : ${steps.length}`);
  console.log(`Walls eaten    : ${wallsEaten}`);
  console.log(`Expected       : ${expected}  (R×C − 1)`);
  console.log(`Proper maze?   : ${proper ? "✓ YES" : "✗ NO — check eatWall / isUnvisited"}`);
})();
