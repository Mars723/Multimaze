import { Cell, CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createEmptyMaze, 
  cloneGrid, 
  setVisited,
  uncolorAllWalls,
  colorAllWallsOfCell,
  setWallBetween
} from '../../utils/mazeUtils';

/**
 * 使用递归分割算法生成迷宫
 * 
 * 思路：
 * 1. 从一个没有内墙的空间开始（只有外墙）
 * 2. 随机选择一个位置将空间分割为两部分
 * 3. 在分割线上随机开一个通道（打开一面墙）
 * 4. 对每个新生成的子空间，重复上述过程直到空间不可再分
 */
export const generateMazeRecursiveDivision = (width: number, height: number): MazeGenerationStep[] => {
  // 创建没有墙的网格（只有外墙）
  const grid = createEmptyMaze(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  const visitedDuringGeneration: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];
  
  // 递归划分区域
  divideArea(0, 0, width, height, grid, visitPath, visitedDuringGeneration);
  
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
  
  // 如果有未访问的单元格，按行扫描处理它们
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const position = { row, col };
      
      // 检查是否已经在访问路径中
      if (visitPath.some(p => p.row === row && p.col === col)) {
        continue;
      }
      
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
  }
  
  return steps;
};

// 递归划分区域
const divideArea = (
  startX: number, 
  startY: number, 
  width: number, 
  height: number, 
  grid: Cell[][], 
  visitPath: CellPosition[],
  visited: CellPosition[]
): void => {
  // 如果区域太小，不再继续划分
  if (width < 2 || height < 2) {
    return;
  }
  
  // 决定水平划分还是垂直划分
  // 如果区域更宽，倾向于垂直划分；如果区域更高，倾向于水平划分
  const horizontal = height > width ? true : 
                    width > height ? false : 
                    Math.random() < 0.5;
  
  if (horizontal) {
    // 水平划分 - 在哪一行添加水平墙
    const y = startY + Math.floor(Math.random() * (height - 1)) + 1;
    // 在墙上随机开一个通道
    const passageX = startX + Math.floor(Math.random() * width);
    
    // 添加水平墙（除了通道位置）
    for (let x = startX; x < startX + width; x++) {
      if (x !== passageX) {
        // 在(x, y-1)和(x, y)之间添加墙
        const position = { row: y - 1, col: x };
        // 设置南墙（同时设置北墙）
        setWallBetween(grid, y - 1, x, 'south');
        setVisited(position, grid);
        visited.push(position);
        
        // 记录访问路径
        if (!visitPath.some(p => p.row === position.row && p.col === position.col)) {
          visitPath.push({...position});
        }
      }
    }
    
    // 递归划分上半部分
    divideArea(startX, startY, width, y - startY, grid, visitPath, visited);
    // 递归划分下半部分
    divideArea(startX, y, width, height - (y - startY), grid, visitPath, visited);
  } else {
    // 垂直划分 - 在哪一列添加垂直墙
    const x = startX + Math.floor(Math.random() * (width - 1)) + 1;
    // 在墙上随机开一个通道
    const passageY = startY + Math.floor(Math.random() * height);
    
    // 添加垂直墙（除了通道位置）
    for (let y = startY; y < startY + height; y++) {
      if (y !== passageY) {
        // 在(x-1, y)和(x, y)之间添加墙
        const position = { row: y, col: x - 1 };
        // 设置东墙（同时设置西墙）
        setWallBetween(grid, y, x - 1, 'east');
        setVisited(position, grid);
        visited.push(position);
        
        // 记录访问路径
        if (!visitPath.some(p => p.row === position.row && p.col === position.col)) {
          visitPath.push({...position});
        }
      }
    }
    
    // 递归划分左半部分
    divideArea(startX, startY, x - startX, height, grid, visitPath, visited);
    // 递归划分右半部分
    divideArea(x, startY, width - (x - startX), height, grid, visitPath, visited);
  }
}; 