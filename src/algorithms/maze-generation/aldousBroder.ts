import { Cell, CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween,
  cloneGrid,
  setVisited,
  getNeighbors,
  randomChoice,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用Aldous-Broder算法生成迷宫
 * 
 * 思路：
 * 1. 从任意一个单元格开始
 * 2. 选择一个未访问过的相邻单元格
 * 3. 如果所有相邻单元格都已访问，随机选择一个相邻单元格
 * 4. 移除当前单元格与选择的单元格之间的墙
 * 5. 将选择的单元格设为当前单元格
 * 6. 重复步骤2-5直到所有单元格都被访问
 */
export const generateMazeAldousBroder = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  let cellsVisitedDuringGeneration: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];
  
  // 随机选择起始单元格
  const startRow = Math.floor(Math.random() * height);
  const startCol = Math.floor(Math.random() * width);
  let current: CellPosition = { row: startRow, col: startCol };
  
  // 标记起始单元格为已访问
  setVisited(current, grid);
  cellsVisitedDuringGeneration.push({...current});
  
  // 记录起始单元格到访问路径
  visitPath.push({...current});
  
  // 计算总共需要访问的单元格数
  const totalCells = width * height;
  
  // 主循环 - 当未访问的单元格数小于总数时继续
  while (cellsVisitedDuringGeneration.length < totalCells) {
    // 获取所有相邻单元格
    const neighbors = getNeighbors(current, grid);
    
    // 随机选择下一个相邻单元格
    const next = randomChoice(neighbors);
    
    // 记录这一步的访问路径（无论是否移除墙）
    if (!visitPath.some(p => p.row === next.row && p.col === next.col)) {
      visitPath.push({...next});
    }
    
    // 如果下一个单元格未被访问，移除它们之间的墙
    const isNextVisited = cellsVisitedDuringGeneration.some(v => v.row === next.row && v.col === next.col);
    if (!isNextVisited) {
      // 移除当前单元格和下一个单元格之间的墙
      removeWallBetween(current, next, grid);
      
      // 标记下一个单元格为已访问
      setVisited(next, grid);
      cellsVisitedDuringGeneration.push({...next});
    }
    
    // 移动到下一个单元格
    current = next;
  }
  
  // 确保所有单元格的墙体都是未染色的
  uncolorAllWalls(grid);
  
  // 记录初始状态（所有墙体未染色）
  steps.push({
    cells: cloneGrid(grid),
    visitedCells: []
  });
  
  // 第二次遍历，按照原始的访问路径染色墙体
  let visited: CellPosition[] = [];
  
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