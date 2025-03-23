// 单元格位置
export interface CellPosition {
  row: number;
  col: number;
}

// 单元格墙壁
export interface CellWalls {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

// 单元格墙壁染色状态
export interface ColoredWalls {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

// 单元格
export interface Cell {
  visited: boolean;
  walls: CellWalls;
  coloredWalls: ColoredWalls; // 追踪墙体的染色状态
}

// 迷宫
export interface Maze {
  cells: Cell[][];
  width: number;
  height: number;
  start: CellPosition;
  end: CellPosition;
}

// 墙体位置标识
export interface WallIdentifier {
  position: CellPosition;
  wall: keyof CellWalls;
}

// 迷宫生成步骤
export interface MazeGenerationStep {
  cells: Cell[][];
  currentCell?: CellPosition;
  visitedCells?: CellPosition[];
  coloredWalls?: WallIdentifier[]; // 本步骤染色的墙体
}

// 迷宫求解步骤
export interface MazeSolvingStep {
  visitedCells: CellPosition[];
  path: CellPosition[];
  currentCell?: CellPosition;
}

// 迷宫生成算法枚举
export enum MazeGenerationAlgorithm {
  DFS = 0,
  BINARY_TREE = 1,
  SIDEWINDER = 2,
  ELLER = 3,
  PRIM = 4,
  KRUSKAL = 5,
  RECURSIVE_DIVISION = 6,
  ALDOUS_BRODER = 7
}

// 迷宫求解算法枚举
export enum MazeSolvingAlgorithm {
  DFS = 0,
  BFS = 1,
  // TODO: 添加更多求解算法
} 