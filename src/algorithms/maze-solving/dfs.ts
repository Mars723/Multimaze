import { CellPosition, Maze, MazeSolvingStep } from '../../types/maze';
import { areCellsEqual, getNeighbors, hasWallBetween } from '../../utils/mazeUtils';

/**
 * 使用深度优先搜索算法求解迷宫
 * 
 * 思路：
 * 1. 从起点开始，将起点加入栈
 * 2. 当栈不为空时，取出栈顶的单元格
 * 3. 如果该单元格是终点，则结束搜索
 * 4. 否则，获取该单元格的所有未访问且无墙的相邻单元格
 * 5. 将这些相邻单元格加入栈，并记录它们的父单元格
 * 6. 标记这些相邻单元格为已访问
 * 7. 重复步骤2-6，直到找到终点或栈为空
 * 8. 如果找到终点，则从终点回溯到起点，构建路径
 */
export const solveMazeDFS = (maze: Maze): MazeSolvingStep[] => {
  const { cells, start, end } = maze;
  
  // 创建栈和已访问集合
  const stack: CellPosition[] = [start];
  const visited: CellPosition[] = [start];
  const parentMap = new Map<string, CellPosition>();
  
  // 记录步骤
  const steps: MazeSolvingStep[] = [];
  
  // 记录初始状态
  steps.push({
    visitedCells: [...visited],
    path: [],
    currentCell: start
  });
  
  // 将单元格位置转换为字符串键
  const posToKey = (pos: CellPosition): string => `${pos.row},${pos.col}`;
  
  // DFS迭代
  while (stack.length > 0) {
    // 取出栈顶单元格
    const current = stack.pop()!;
    
    // 如果找到终点，结束搜索
    if (areCellsEqual(current, end)) {
      // 重建路径
      const path = rebuildPath(parentMap, start, end);
      
      // 记录最终步骤
      steps.push({
        visitedCells: [...visited],
        path,
        currentCell: end
      });
      
      break;
    }
    
    // 获取所有相邻单元格
    const neighbors = getNeighbors(current, cells);
    
    // 遍历相邻单元格（反向，以便在栈中保持顺序）
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      
      // 检查是否已访问以及是否有墙
      const alreadyVisited = visited.some(pos => areCellsEqual(pos, neighbor));
      const hasWall = hasWallBetween(current, neighbor, cells);
      
      // 如果未访问且无墙
      if (!alreadyVisited && !hasWall) {
        // 记录父单元格
        parentMap.set(posToKey(neighbor), current);
        
        // 加入栈和已访问集合
        stack.push(neighbor);
        visited.push(neighbor);
        
        // 当前的路径
        const path = rebuildPath(parentMap, start, neighbor);
        
        // 记录步骤
        steps.push({
          visitedCells: [...visited],
          path,
          currentCell: neighbor
        });
      }
    }
  }
  
  // 如果没有找到路径，返回最后一步
  if (steps[steps.length - 1].path.length === 0) {
    steps.push({
      visitedCells: [...visited],
      path: [],
      currentCell: undefined
    });
  }
  
  return steps;
};

/**
 * 从父映射表中重建路径
 */
const rebuildPath = (
  parentMap: Map<string, CellPosition>,
  start: CellPosition,
  end: CellPosition
): CellPosition[] => {
  const path: CellPosition[] = [];
  let current = end;
  
  // 从终点回溯到起点
  while (!areCellsEqual(current, start)) {
    path.unshift(current);
    const key = `${current.row},${current.col}`;
    const parent = parentMap.get(key);
    
    // 如果没有找到父节点，返回空路径
    if (!parent) {
      return [];
    }
    
    current = parent;
  }
  
  // 加入起点
  path.unshift(start);
  
  return path;
}; 