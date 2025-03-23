import { Cell, CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween,
  cloneGrid,
  setVisited,
  getNeighbors,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用Prim算法生成迷宫
 * 
 * 思路：
 * 1. 从任意一个单元格开始
 * 2. 将此单元格的所有邻接墙加入候选墙列表
 * 3. 随机选择候选墙列表中的一面墙
 * 4. 如果墙的另一侧未被访问，则移除此墙并将新单元格加入迷宫
 * 5. 将新单元格的墙加入候选墙列表
 * 6. 重复步骤3-5直到候选墙列表为空
 */
export const generateMazePrim = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  let visited: CellPosition[] = [];
  
  // 墙的候选列表
  interface Wall {
    from: CellPosition;
    to: CellPosition;
  }
  const walls: Wall[] = [];
  
  // 随机选择起始单元格
  const startRow = Math.floor(Math.random() * height);
  const startCol = Math.floor(Math.random() * width);
  const start: CellPosition = { row: startRow, col: startCol };
  
  // 标记起始单元格为已访问
  setVisited(start, grid);
  visited.push(start);
  
  // 将起始单元格的所有邻接墙加入候选列表
  addWalls(start, walls, grid, width, height, visited);
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [start];
  
  // 主循环
  while (walls.length > 0) {
    // 随机选择一面墙
    const randomIndex = Math.floor(Math.random() * walls.length);
    const wall = walls[randomIndex];
    walls.splice(randomIndex, 1);
    
    const { from, to } = wall;
    
    // 如果目标单元格未被访问
    if (!isVisited(to, visited)) {
      // 移除墙
      removeWallBetween(from, to, grid);
      
      // 标记目标单元格为已访问
      setVisited(to, grid);
      visited.push(to);
      
      // 记录访问路径
      visitPath.push(to);
      
      // 添加目标单元格的墙到候选列表
      addWalls(to, walls, grid, width, height, visited);
    }
  }
  
  // 确保所有单元格的墙体都是未染色的
  uncolorAllWalls(grid);
  
  // 记录初始状态（所有墙体未染色）
  steps.push({
    cells: cloneGrid(grid),
    visitedCells: []
  });
  
  // 第二次遍历，按照原始的访问路径染色墙体
  visited = [];
  
  // 按照原始访问路径顺序染色墙体
  for (const position of visitPath) {
    // 标记为已访问
    setVisited(position, grid);
    visited.push(position);
    
    // 染色当前单元格的所有墙体
    const coloredWalls = colorAllWallsOfCell(position, grid);
    
    // 记录步骤
    steps.push({
      cells: cloneGrid(grid),
      currentCell: position,
      visitedCells: [...visited],
      coloredWalls
    });
  }
  
  return steps;
};

// 辅助函数：将单元格的所有邻接墙加入候选列表
const addWalls = (
  cell: CellPosition,
  walls: { from: CellPosition; to: CellPosition }[],
  grid: Cell[][],
  width: number,
  height: number,
  visited: CellPosition[]
): void => {
  const neighbors = getNeighbors(cell, grid);
  
  for (const neighbor of neighbors) {
    if (!isVisited(neighbor, visited)) {
      walls.push({
        from: cell,
        to: neighbor
      });
    }
  }
};

// 辅助函数：检查单元格是否已访问
const isVisited = (cell: CellPosition, visited: CellPosition[]): boolean => {
  return visited.some(v => v.row === cell.row && v.col === cell.col);
}; 