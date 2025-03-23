import { CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween, 
  randomChoice, 
  cloneGrid,
  setVisited,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用Sidewinder算法生成迷宫
 * 
 * 思路：
 * 1. 从第一行开始，每行从左到右处理每个单元格
 * 2. 对于第一行，始终移除右墙（形成一条直线）
 * 3. 对于其他行，对每个单元格：
 *    a. 随机选择是否要结束当前"运行"
 *    b. 如果不结束，移除右墙并将当前单元格加入运行
 *    c. 如果结束，从当前运行中随机选择一个单元格，移除其北墙，然后清空运行
 * 4. 最右列单元格永远结束当前运行
 */
export const generateMazeSideWinder = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  let visited: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];
  
  // 第一行特殊处理（没有北墙可以移除）
  for (let col = 0; col < width - 1; col++) {
    const current: CellPosition = { row: 0, col };
    const next: CellPosition = { row: 0, col: col + 1 };
    
    // 记录访问路径
    visitPath.push(current);
    
    // 移除右墙
    removeWallBetween(current, next, grid);
  }
  
  // 记录最后一列第一行单元格的访问
  const lastCol: CellPosition = { row: 0, col: width - 1 };
  visitPath.push(lastCol);
  
  // 处理其余行
  for (let row = 1; row < height; row++) {
    // 当前"运行"中的单元格
    let run: CellPosition[] = [];
    
    for (let col = 0; col < width; col++) {
      const current: CellPosition = { row, col };
      
      // 记录访问路径
      visitPath.push(current);
      
      // 加入当前运行
      run.push(current);
      
      // 是否结束运行（到达最右列或随机决定）
      const shouldCloseOut = (col === width - 1) || (Math.random() < 0.5);
      
      if (shouldCloseOut && run.length > 0) {
        // 从运行中随机选择一个单元格
        const randomCell = randomChoice(run);
        
        // 移除北墙
        const northCell: CellPosition = { row: randomCell.row - 1, col: randomCell.col };
        removeWallBetween(randomCell, northCell, grid);
        
        // 清空运行
        run = [];
      } else if (col < width - 1) {
        // 如果不结束并且不是最右列，移除右墙
        const next: CellPosition = { row, col: col + 1 };
        removeWallBetween(current, next, grid);
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