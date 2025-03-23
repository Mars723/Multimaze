import { CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween,
  cloneGrid,
  setVisited,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用二叉树算法生成迷宫
 * 
 * 思路：
 * 1. 对每个单元格（除最底行和最右列），随机决定是移除下墙还是右墙
 * 2. 对最右列单元格，只移除下墙
 * 3. 对最底行单元格，只移除右墙
 * 4. 最右下角单元格无需处理
 */
export const generateMazeBinaryTree = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  let visited: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];

  // 遍历每个单元格
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const current: CellPosition = { row, col };
      
      // 按照从左到右、从上到下的顺序记录访问路径
      visitPath.push(current);
      
      // 跳过最底行和最右列
      if (row === height - 1 && col === width - 1) {
        continue;
      }
      
      // 最右列只能移除下墙
      if (col === width - 1) {
        if (row < height - 1) {
          const next: CellPosition = { row: row + 1, col };
          removeWallBetween(current, next, grid);
        }
      }
      // 最底行只能移除右墙
      else if (row === height - 1) {
        const next: CellPosition = { row, col: col + 1 };
        removeWallBetween(current, next, grid);
      }
      // 其他单元格随机决定
      else {
        // 随机决定移除下墙还是右墙
        const removeBottom = Math.random() < 0.5;
        
        if (removeBottom) {
          const next: CellPosition = { row: row + 1, col };
          removeWallBetween(current, next, grid);
        } else {
          const next: CellPosition = { row, col: col + 1 };
          removeWallBetween(current, next, grid);
        }
      }
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