import { CellPosition, MazeGenerationStep, WallIdentifier } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween, 
  getNeighbors, 
  shuffleArray, 
  cloneGrid,
  setVisited,
  colorWallsBetween,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用深度优先搜索算法生成迷宫
 * 
 * 新动画思路：
 * 1. 生成完整迷宫，但墙体初始为白色（不可见）
 * 2. 通过"访问者"将白色墙体逐渐染色为黑色
 * 3. 访问者所在单元格的四条边如果是迷宫的墙体，就染成黑色并保持黑色
 */
export const generateMazeDFS = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建栈和步骤记录
  const stack: CellPosition[] = [];
  const steps: MazeGenerationStep[] = [];
  
  // 随机选择起点
  const startRow = Math.floor(Math.random() * height);
  const startCol = Math.floor(Math.random() * width);
  const start: CellPosition = { row: startRow, col: startCol };
  
  // 标记起点为已访问
  grid[start.row][start.col].visited = true;
  
  // 将起点推入栈
  stack.push(start);
  
  // 先通过DFS算法生成完整迷宫
  // 当栈不为空时继续循环
  while (stack.length > 0) {
    // 获取当前单元格
    const current = stack[stack.length - 1];
    
    // 获取未访问的相邻单元格
    const neighbors = getNeighbors(current, grid, true);
    
    if (neighbors.length > 0) {
      // 随机选择一个相邻单元格
      const randomNeighbor = shuffleArray(neighbors)[0];
      
      // 标记选择的单元格为已访问
      grid[randomNeighbor.row][randomNeighbor.col].visited = true;
      
      // 移除当前单元格与选择的单元格之间的墙
      removeWallBetween(current, randomNeighbor, grid);
      
      // 将选择的单元格推入栈
      stack.push(randomNeighbor);
    } else {
      // 如果没有未访问的相邻单元格，则回溯
      stack.pop();
    }
  }
  
  // 确保所有单元格的墙体都是未染色的
  uncolorAllWalls(grid);
  
  // 重置访问状态
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      grid[row][col].visited = false;
    }
  }
  
  // 记录初始状态（所有墙体未染色）
  steps.push({
    cells: cloneGrid(grid),
    currentCell: start,
    visitedCells: [start],
    coloredWalls: []
  });
  
  // 重新开始DFS，这次用于染色墙体
  stack.length = 0;
  stack.push(start);
  setVisited(start, grid);
  
  // 为起点单元格的所有墙体染色
  const initialColoredWalls = colorAllWallsOfCell(start, grid);
  
  // 记录初始染色步骤
  if (initialColoredWalls.length > 0) {
    steps.push({
      cells: cloneGrid(grid),
      currentCell: start,
      visitedCells: [...stack],
      coloredWalls: initialColoredWalls
    });
  }
  
  // 当栈不为空时继续循环
  while (stack.length > 0) {
    // 获取当前单元格
    const current = stack[stack.length - 1];
    
    // 获取未访问的相邻单元格
    const neighbors = getNeighbors(current, grid, true);
    
    if (neighbors.length > 0) {
      // 随机选择一个相邻单元格
      const randomNeighbor = shuffleArray(neighbors)[0];
      
      // 标记选择的单元格为已访问
      setVisited(randomNeighbor, grid);
      
      // 将选择的单元格推入栈
      stack.push(randomNeighbor);
      
      // 染色新单元格的所有墙体
      const allColoredWalls = colorAllWallsOfCell(randomNeighbor, grid);
      
      // 记录步骤
      if (allColoredWalls.length > 0) {
        steps.push({
          cells: cloneGrid(grid),
          currentCell: randomNeighbor,
          visitedCells: [...stack],
          coloredWalls: allColoredWalls
        });
      } else {
        // 即使没有新染色的墙体，也记录这个步骤以显示访问者移动
        steps.push({
          cells: cloneGrid(grid),
          currentCell: randomNeighbor,
          visitedCells: [...stack],
          coloredWalls: []
        });
      }
    } else {
      // 如果没有未访问的相邻单元格，则回溯
      stack.pop();
      
      if (stack.length > 0) {
        const current = stack[stack.length - 1];
        
        // 记录回溯步骤
        steps.push({
          cells: cloneGrid(grid),
          currentCell: current,
          visitedCells: [...stack],
          coloredWalls: []
        });
      }
    }
  }
  
  return steps;
}; 