# Maze Generation and Solving Visualization

A React and TypeScript based project for visualizing various maze generation and solving algorithms, providing an intuitive demonstration of how these algorithms work.

## Features

- Supports multiple maze generation algorithms:
  - Depth-First Search (DFS)
  - Binary Tree algorithm
  - Sidewinder algorithm
  - Eller's algorithm
  - Prim's algorithm
  - Kruskal's algorithm
  - Recursive Division algorithm
  - Aldous-Broder algorithm

- Supports multiple maze solving algorithms:
  - Depth-First Search (DFS)
  - Breadth-First Search (BFS)

- Additional features:
  - Adjustable maze size
  - Animated demonstration of generation/solving processes
  - Adjustable animation speed
  - Timer function to record solving time
  - Manual maze solving with automatic validation

## Installation and Setup

1. Clone the repository
```
git clone https://github.com/yourusername/maze-generator-solver.git
cd maze-generator-solver
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Open your browser and visit http://localhost:3000

## How to Use

1. Select a maze generation algorithm and click the "Generate Maze" button
2. After the maze is generated, you can:
   - Solve manually: Click on the starting point and then click on adjacent cells to find a path to the end
   - Solve automatically: Select a solving algorithm and click the "Auto Solve" button

3. Use the animation control panel to:
   - Enable/disable animation
   - Adjust animation speed
   - Play/pause animation

## Maze Generation Algorithms

1. **Depth-First Search (DFS)**: Starts from a point, randomly chooses an unvisited neighboring cell, removes the wall between them, and moves to that cell. If there are no unvisited neighboring cells, it backtracks.

2. **Binary Tree Algorithm**: For each cell, randomly decides whether to remove its north or west wall (if possible). Simple algorithm but produces mazes with noticeable bias.

3. **Sidewinder Algorithm**: Similar to Binary Tree, but when deciding to remove a north wall, it randomly selects a cell from the current "run." Produces more balanced mazes than Binary Tree.

4. **Eller's Algorithm**: Processes one row at a time, ensuring cells within each row are connected, and randomly decides connections to the next row. Very efficient and suitable for generating large mazes.

5. **Prim's Algorithm**: Starts from a random cell, adds all its adjacent walls to a candidate list, then randomly selects a wall. If it connects two cells where only one has been visited, removes the wall and marks the unvisited cell as visited.

6. **Kruskal's Algorithm**: Starts with a set of all walls, randomly selects a wall, and if it connects two cells that are not in the same set, removes the wall and merges the two sets.

7. **Recursive Division Algorithm**: Starts with an area without walls, recursively adds walls to divide the space, and randomly adds a passage in each wall.

8. **Aldous-Broder Algorithm**: Starts from a random cell, randomly moves to an adjacent cell, and if the new cell has not been visited, removes the wall between them. This algorithm produces unbiased mazes but is inefficient.

## Maze Solving Algorithms

1. **Depth-First Search (DFS)**: Explores as far as possible along a path from the starting point, backtracking when it reaches a dead end.

2. **Breadth-First Search (BFS)**: Explores all possible directions from the starting point simultaneously until it finds the end point. BFS guarantees the shortest path.

## Technology Stack

- React 18
- TypeScript
- CSS Grid and Flexbox layout

