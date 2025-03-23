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
 * 使用Eller算法生成迷宫
 * 
 * 思路：
 * 1. 逐行处理迷宫，每行中的每个单元格最初属于不同的集合
 * 2. 对当前行，随机决定是否合并相邻单元格（移除墙并合并集合）
 * 3. 对每个集合，随机选择至少一个单元格向下延伸（移除下方墙）
 * 4. 对下一行的单元格，如果上方单元格已延伸，将其加入相同集合
 * 5. 对最后一行，将所有相邻但不在同一集合的单元格合并
 */
export const generateMazeEller = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  const visitedDuringGeneration: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];
  
  // 创建初始集合
  let nextSetId = 1;
  let sets: number[] = new Array(width).fill(0).map(() => nextSetId++);
  
  // 逐行处理
  for (let row = 0; row < height; row++) {
    // 每个单元格都标记为已访问
    for (let col = 0; col < width; col++) {
      const position = { row, col };
      setVisited(position, grid);
      visitedDuringGeneration.push(position);
      
      // 记录访问路径
      visitPath.push({...position});
    }
    
    // 处理水平墙（除了最后一行）
    if (row < height - 1) {
      // 随机移除水平相邻单元格之间的墙
      for (let col = 0; col < width - 1; col++) {
        // 30%的概率合并相邻单元格（如果它们不在同一集合中）
        const shouldMerge = Math.random() < 0.3 && sets[col] !== sets[col + 1];
        
        if (shouldMerge) {
          // 移除墙
          const from = { row, col };
          const to = { row, col: col + 1 };
          removeWallBetween(from, to, grid);
          
          // 合并集合
          const oldSet = sets[col + 1];
          const newSet = sets[col];
          for (let i = 0; i < width; i++) {
            if (sets[i] === oldSet) {
              sets[i] = newSet;
            }
          }
        }
      }
      
      // 处理垂直墙 - 确保每个集合至少有一个垂直通道
      const setVerticalPaths: { [key: number]: boolean } = {};
      
      for (let col = 0; col < width; col++) {
        const setId = sets[col];
        // 40%的概率向下延伸或确保至少有一个通道
        const shouldConnect = Math.random() < 0.4 || !setVerticalPaths[setId];
        
        if (shouldConnect) {
          // 标记该集合已有通道
          setVerticalPaths[setId] = true;
          
          // 移除下方墙
          const from = { row, col };
          const to = { row: row + 1, col };
          removeWallBetween(from, to, grid);
        }
      }
      
      // 为下一行准备新的集合
      const nextRow = new Array(width);
      for (let col = 0; col < width; col++) {
        if (row < height - 1) {
          // 检查是否有向下的通道
          const hasVerticalPath = !grid[row][col].walls.south;
          if (hasVerticalPath) {
            // 如果有通道，使用相同的集合ID
            nextRow[col] = sets[col];
          } else {
            // 如果没有通道，创建新的集合ID
            nextRow[col] = nextSetId++;
          }
        }
      }
      
      // 更新集合数组
      sets = nextRow;
    } else {
      // 处理最后一行 - 确保所有相邻单元格都连接
      for (let col = 0; col < width - 1; col++) {
        // 如果相邻单元格不在同一集合中，则移除墙
        if (sets[col] !== sets[col + 1]) {
          const from = { row, col };
          const to = { row, col: col + 1 };
          removeWallBetween(from, to, grid);
          
          // 合并集合
          const oldSet = sets[col + 1];
          const newSet = sets[col];
          for (let i = 0; i < width; i++) {
            if (sets[i] === oldSet) {
              sets[i] = newSet;
            }
          }
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
  const visited: CellPosition[] = [];
  
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