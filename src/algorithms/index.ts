// 导入迷宫生成算法
import { generateMazeDFS } from './maze-generation/dfs';
import { generateMazeBinaryTree } from './maze-generation/binaryTree';
import { generateMazeSideWinder } from './maze-generation/sidewinder';
import { generateMazeEller } from './maze-generation/eller';
import { generateMazePrim } from './maze-generation/prim';
import { generateMazeKruskal } from './maze-generation/kruskal';
import { generateMazeRecursiveDivision } from './maze-generation/recursiveDivision';
import { generateMazeAldousBroder } from './maze-generation/aldousBroder';

// 导入迷宫求解算法
import { solveMazeDFS } from './maze-solving/dfs';
import { solveMazeBFS } from './maze-solving/bfs';

// 导出迷宫生成算法
export const mazeGenerationAlgorithms = {
  DFS: generateMazeDFS,
  BINARY_TREE: generateMazeBinaryTree,
  SIDEWINDER: generateMazeSideWinder,
  ELLER: generateMazeEller,
  PRIM: generateMazePrim,
  KRUSKAL: generateMazeKruskal,
  RECURSIVE_DIVISION: generateMazeRecursiveDivision,
  ALDOUS_BRODER: generateMazeAldousBroder
};

// 导出迷宫求解算法
export const mazeSolvingAlgorithms = {
  DFS: solveMazeDFS,
  BFS: solveMazeBFS
}; 