import { Cell, CellPosition, MazeGenerationStep } from '../../types/maze';
import { 
  createGrid, 
  removeWallBetween,
  cloneGrid,
  setVisited,
  shuffleArray,
  uncolorAllWalls,
  colorAllWallsOfCell
} from '../../utils/mazeUtils';

/**
 * 使用Kruskal算法生成迷宫
 * 
 * 思路：
 * 1. 初始将每个单元格看作独立的集合
 * 2. 将所有可能的墙（边）收集起来并随机排序
 * 3. 从墙列表中依次取出墙，如果墙两侧的单元格不在同一个集合中：
 *    a. 移除这面墙
 *    b. 合并两侧单元格所在的集合
 * 4. 重复直到所有单元格都在同一个集合中
 */
export const generateMazeKruskal = (width: number, height: number): MazeGenerationStep[] => {
  // 创建网格
  const grid = createGrid(width, height);
  
  // 创建步骤记录
  const steps: MazeGenerationStep[] = [];
  let visited: CellPosition[] = [];
  
  // 记录访问顺序 - 这将用于第二阶段的墙体染色
  const visitPath: CellPosition[] = [];
  
  // 初始化集合（每个单元格都是独立的集合）
  const sets: Map<string, Set<string>> = new Map();
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const key = `${row},${col}`;
      const set = new Set([key]);
      sets.set(key, set);
    }
  }
  
  // 收集所有的墙
  const walls: {from: CellPosition, to: CellPosition}[] = [];
  
  // 水平墙（每个单元格的右侧墙）
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width - 1; col++) {
      walls.push({
        from: { row, col },
        to: { row, col: col + 1 }
      });
    }
  }
  
  // 垂直墙（每个单元格的下侧墙）
  for (let row = 0; row < height - 1; row++) {
    for (let col = 0; col < width; col++) {
      walls.push({
        from: { row, col },
        to: { row: row + 1, col }
      });
    }
  }
  
  // 随机排序墙
  const shuffledWalls = shuffleArray(walls);
  
  // 定义查找单元格所在的集合的函数
  const findSet = (cell: CellPosition): Set<string> => {
    const key = `${cell.row},${cell.col}`;
    return sets.get(key)!;
  };
  
  // 遍历墙列表
  for (const { from, to } of shuffledWalls) {
    const setA = findSet(from);
    const setB = findSet(to);
    
    // 如果两个单元格不在同一个集合中
    if (setA !== setB) {
      // 移除墙
      removeWallBetween(from, to, grid);
      
      // 合并集合
      const mergedSet = new Set<string>();
      // 添加setA中的元素
      Array.from(setA).forEach(item => mergedSet.add(item));
      // 添加setB中的元素
      Array.from(setB).forEach(item => mergedSet.add(item));
      
      for (const key of Array.from(mergedSet)) {
        sets.set(key, mergedSet);
      }
      
      // 记录访问路径 - 先记录起点后记录终点
      if (!visitPath.some(p => p.row === from.row && p.col === from.col)) {
        visitPath.push(from);
      }
      if (!visitPath.some(p => p.row === to.row && p.col === to.col)) {
        visitPath.push(to);
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