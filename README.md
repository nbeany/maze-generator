# Maze Generator & Solver

Animated DFS maze generator and backtracking solver built with JavaScript and Canvas.

## Data Structure

The maze uses two 2D arrays:

- **`northWall[row][col]`** — `1` if the north (top) wall of cell `(row, col)` is intact
- **`eastWall[row][col]`** — `1` if the east (right) wall of cell `(row, col)` is intact

Arrays are `(R+1) × (C+1)`. Row 0 is a phantom row (its north walls form the bottom boundary). Column 0 holds left-edge wall data. The south wall of a cell is `northWall[row-1][col]`; the west wall is `eastWall[row][col-1]`.

## Generator — Stack-Based DFS Mouse

The maze generator utilizes a **stack-based Depth-First Search (DFS)** algorithm. Conceptually, this acts like a **"mouse"** exploring a solid grid of walls to carve out passages. Here is a step-by-step breakdown of the logic:

1. **Start & Track:** The mouse is placed in a random starting cell on the grid. This cell is marked as visited and pushed onto a **stack** (which serves as the mouse's memory of its current path).
2. **Look for Neighbors:** From its current cell, the mouse checks for any adjacent, completely unvisited neighbors (cells that still have all four of their walls intact).
3. **Carve and Move:** If unvisited neighbors exist, the mouse randomly selects one. It "eats" the shared wall between its current cell and the chosen neighbor, pushes the new cell onto the stack, and physically moves into that new cell.
4. **Backtrack at Dead Ends:** If the mouse enters a cell and finds that all surrounding neighbors have already been visited (a dead end), it begins to **backtrack**. It pops its current cell off the stack, moving backward along its previous path until it finds a cell that still has unvisited neighbors to explore.
5. **Completion:** This cycle of exploring deep into the grid and backtracking continues until the stack is completely empty. Once empty, it means the mouse has visited every single cell exactly once. The result is a "perfect maze" (a maze where every cell is reachable, with exactly one unique path between any two points and zero loops).

For the visual application, each frame via `requestAnimationFrame` eats one wall and redraws the canvas, revealing the maze incrementally as it forms.

### Bonus Mode: Cycles
By default, the algorithm generates a "perfect maze". However, the UI includes a **"Cycles" toggle button**. When enabled, the generator has a 1-in-20 (5%) probability at each step to randomly eat an extra adjacent wall. This deliberately breaks the perfect maze rules, creating loops and cycles for a more complex and interconnected map.

## Solver — Backtracking DFS

The solver uses the same stack-based approach to find the exit:

1. From the current cell, collect open neighbours not on the current path and not marked as dead ends.
2. Pick one at random, push it onto the path stack, and move there.
3. If no moves exist, mark the current cell as a **dead end** (blue), pop the stack, and backtrack.
4. When the exit is reached, the live path becomes the **solution** (amber trail).

### Visual Feedback

- **Red dot** — mouse's current position
- **Blue cells** — dead ends (backtracked, no route to exit)
- **Green cells** — live path the solver is currently exploring
- **Amber overlay** — final solution path
