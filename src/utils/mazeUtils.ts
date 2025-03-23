import { Cell, CellPosition, Maze, WallIdentifier, ColoredWalls } from '../types/maze';

/**
 * 创建一个具有所有墙的单元格
 */
export const createCell = (): Cell => {
  return {
    visited: false,
    walls: {
      north: true,
      east: true,
      south: true,
      west: true
    },
    coloredWalls: {
      north: false,
      east: false,
      south: false,
      west: false
    }
  };
};

/**
 * 创建指定大小的迷宫网格
 */
export const createGrid = (width: number, height: number): Cell[][] => {
  const grid: Cell[][] = [];
  
  for (let row = 0; row < height; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < width; col++) {
      rowCells.push(createCell());
    }
    grid.push(rowCells);
  }
  
  return grid;
};

/**
 * 检查两个位置是否相同
 */
export const areCellsEqual = (a: CellPosition, b: CellPosition): boolean => {
  return a.row === b.row && a.col === b.col;
};

/**
 * 获取指定单元格的所有有效相邻单元格
 */
export const getNeighbors = (
  position: CellPosition,
  grid: Cell[][],
  unvisitedOnly: boolean = false
): CellPosition[] => {
  const { row, col } = position;
  const height = grid.length;
  const width = grid[0].length;
  const neighbors: CellPosition[] = [];
  
  // 上方单元格
  if (row > 0) {
    const neighbor = { row: row - 1, col };
    if (!unvisitedOnly || !grid[neighbor.row][neighbor.col].visited) {
      neighbors.push(neighbor);
    }
  }
  
  // 右方单元格
  if (col < width - 1) {
    const neighbor = { row, col: col + 1 };
    if (!unvisitedOnly || !grid[neighbor.row][neighbor.col].visited) {
      neighbors.push(neighbor);
    }
  }
  
  // 下方单元格
  if (row < height - 1) {
    const neighbor = { row: row + 1, col };
    if (!unvisitedOnly || !grid[neighbor.row][neighbor.col].visited) {
      neighbors.push(neighbor);
    }
  }
  
  // 左方单元格
  if (col > 0) {
    const neighbor = { row, col: col - 1 };
    if (!unvisitedOnly || !grid[neighbor.row][neighbor.col].visited) {
      neighbors.push(neighbor);
    }
  }
  
  return neighbors;
};

/**
 * 随机打乱数组
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 移除两个单元格之间的墙
 */
export const removeWallBetween = (current: CellPosition, next: CellPosition, grid: Cell[][]): void => {
  const { row: currentRow, col: currentCol } = current;
  const { row: nextRow, col: nextCol } = next;
  
  // 获取两个单元格的方向关系
  if (currentRow === nextRow - 1) {
    // 当前单元格在上方
    grid[currentRow][currentCol].walls.south = false;
    grid[nextRow][nextCol].walls.north = false;
  } else if (currentRow === nextRow + 1) {
    // 当前单元格在下方
    grid[currentRow][currentCol].walls.north = false;
    grid[nextRow][nextCol].walls.south = false;
  } else if (currentCol === nextCol - 1) {
    // 当前单元格在左侧
    grid[currentRow][currentCol].walls.east = false;
    grid[nextRow][nextCol].walls.west = false;
  } else if (currentCol === nextCol + 1) {
    // 当前单元格在右侧
    grid[currentRow][currentCol].walls.west = false;
    grid[nextRow][nextCol].walls.east = false;
  }
};

/**
 * 检查两个单元格之间是否有墙
 */
export const hasWallBetween = (a: CellPosition, b: CellPosition, grid: Cell[][]): boolean => {
  // 单元格必须相邻
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  
  if (!((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1))) {
    return true; // 不相邻则视为有墙
  }
  
  if (a.row < b.row) {
    // a在b的上方
    return grid[a.row][a.col].walls.south || grid[b.row][b.col].walls.north;
  } else if (a.row > b.row) {
    // a在b的下方
    return grid[a.row][a.col].walls.north || grid[b.row][b.col].walls.south;
  } else if (a.col < b.col) {
    // a在b的左方
    return grid[a.row][a.col].walls.east || grid[b.row][b.col].walls.west;
  } else {
    // a在b的右方
    return grid[a.row][a.col].walls.west || grid[b.row][b.col].walls.east;
  }
};

/**
 * 深拷贝网格
 */
export const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({
    visited: cell.visited,
    walls: { ...cell.walls },
    coloredWalls: { ...cell.coloredWalls }
  })));
};

// 创建空迷宫
export const createEmptyMaze = (width: number, height: number): Cell[][] => {
  const cells: Cell[][] = [];
  
  for (let row = 0; row < height; row++) {
    cells[row] = [];
    for (let col = 0; col < width; col++) {
      cells[row][col] = createCell();
      
      // 移除外部边界以外的墙壁
      if (row > 0) {
        cells[row][col].walls.north = false;
      }
      if (col < width - 1) {
        cells[row][col].walls.east = false;
      }
      if (row < height - 1) {
        cells[row][col].walls.south = false;
      }
      if (col > 0) {
        cells[row][col].walls.west = false;
      }
    }
  }
  
  return cells;
};

/**
 * 检查单元格是否在迷宫范围内
 */
export const isCellInBounds = (position: CellPosition, width: number, height: number): boolean => {
  return position.row >= 0 && position.row < height && position.col >= 0 && position.col < width;
};

/**
 * 获取未访问的相邻单元格
 */
export const getUnvisitedNeighbors = (position: CellPosition, cells: Cell[][], width: number, height: number): CellPosition[] => {
  return getNeighbors(position, cells, true);
};

/**
 * 随机选择数组中的一个元素
 */
export const randomChoice = <T>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

/**
 * 设置单元格为已访问
 */
export const setVisited = (position: CellPosition, grid: Cell[][]): void => {
  const { row, col } = position;
  grid[row][col].visited = true;
};

/**
 * 染色单元格的墙体
 */
export const colorWall = (position: CellPosition, wall: keyof ColoredWalls, grid: Cell[][]): void => {
  grid[position.row][position.col].coloredWalls[wall] = true;
};

/**
 * 染色相邻单元格之间的墙体
 */
export const colorWallsBetween = (current: CellPosition, next: CellPosition, grid: Cell[][]): WallIdentifier[] => {
  const { row: currentRow, col: currentCol } = current;
  const { row: nextRow, col: nextCol } = next;
  const coloredWalls: WallIdentifier[] = [];
  
  // 获取两个单元格的方向关系
  if (currentRow === nextRow - 1) {
    // 当前单元格在上方
    if (grid[currentRow][currentCol].walls.south) {
      grid[currentRow][currentCol].coloredWalls.south = true;
      coloredWalls.push({ position: current, wall: 'south' });
    }
    if (grid[nextRow][nextCol].walls.north) {
      grid[nextRow][nextCol].coloredWalls.north = true;
      coloredWalls.push({ position: next, wall: 'north' });
    }
  } else if (currentRow === nextRow + 1) {
    // 当前单元格在下方
    if (grid[currentRow][currentCol].walls.north) {
      grid[currentRow][currentCol].coloredWalls.north = true;
      coloredWalls.push({ position: current, wall: 'north' });
    }
    if (grid[nextRow][nextCol].walls.south) {
      grid[nextRow][nextCol].coloredWalls.south = true;
      coloredWalls.push({ position: next, wall: 'south' });
    }
  } else if (currentCol === nextCol - 1) {
    // 当前单元格在左侧
    if (grid[currentRow][currentCol].walls.east) {
      grid[currentRow][currentCol].coloredWalls.east = true;
      coloredWalls.push({ position: current, wall: 'east' });
    }
    if (grid[nextRow][nextCol].walls.west) {
      grid[nextRow][nextCol].coloredWalls.west = true;
      coloredWalls.push({ position: next, wall: 'west' });
    }
  } else if (currentCol === nextCol + 1) {
    // 当前单元格在右侧
    if (grid[currentRow][currentCol].walls.west) {
      grid[currentRow][currentCol].coloredWalls.west = true;
      coloredWalls.push({ position: current, wall: 'west' });
    }
    if (grid[nextRow][nextCol].walls.east) {
      grid[nextRow][nextCol].coloredWalls.east = true;
      coloredWalls.push({ position: next, wall: 'east' });
    }
  }
  
  return coloredWalls;
};

/**
 * 将所有墙体设置为已染色
 */
export const colorAllWalls = (grid: Cell[][]): void => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const cell = grid[row][col];
      cell.coloredWalls = {
        north: cell.walls.north,
        east: cell.walls.east, 
        south: cell.walls.south,
        west: cell.walls.west
      };
    }
  }
};

/**
 * 将所有墙体设置为未染色
 */
export const uncolorAllWalls = (grid: Cell[][]): void => {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      grid[row][col].coloredWalls = {
        north: false,
        east: false,
        south: false,
        west: false
      };
    }
  }
};

// 兼容函数: 保留cloneCells名称以避免修改所有算法文件
export const cloneCells = cloneGrid;

/**
 * 染色单元格的所有墙体
 * 检查单元格的四条边，如果是墙体则染色
 * 同时也染色相邻单元格的对应墙体
 */
export const colorAllWallsOfCell = (position: CellPosition, grid: Cell[][]): WallIdentifier[] => {
  const { row, col } = position;
  const cell = grid[row][col];
  const coloredWalls: WallIdentifier[] = [];
  const height = grid.length;
  const width = grid[0].length;
  
  // 检查并染色上边墙
  if (cell.walls.north) {
    cell.coloredWalls.north = true;
    coloredWalls.push({ position, wall: 'north' });
    
    // 染色上方单元格的南墙（如果存在）
    if (row > 0) {
      grid[row-1][col].coloredWalls.south = true;
    }
  }
  
  // 检查并染色右边墙
  if (cell.walls.east) {
    cell.coloredWalls.east = true;
    coloredWalls.push({ position, wall: 'east' });
    
    // 染色右侧单元格的西墙（如果存在）
    if (col < width - 1) {
      grid[row][col+1].coloredWalls.west = true;
    }
  }
  
  // 检查并染色下边墙
  if (cell.walls.south) {
    cell.coloredWalls.south = true;
    coloredWalls.push({ position, wall: 'south' });
    
    // 染色下方单元格的北墙（如果存在）
    if (row < height - 1) {
      grid[row+1][col].coloredWalls.north = true;
    }
  }
  
  // 检查并染色左边墙
  if (cell.walls.west) {
    cell.coloredWalls.west = true;
    coloredWalls.push({ position, wall: 'west' });
    
    // 染色左侧单元格的东墙（如果存在）
    if (col > 0) {
      grid[row][col-1].coloredWalls.east = true;
    }
  }
  
  return coloredWalls;
};

/**
 * 设置墙体，确保设置两侧单元格的对应墙体
 * 特别用于递归分割算法
 */
export const setWallBetween = (grid: Cell[][], row1: number, col1: number, wall: 'north' | 'east' | 'south' | 'west'): void => {
  const height = grid.length;
  const width = grid[0].length;
  
  // 设置第一个单元格的墙体
  grid[row1][col1].walls[wall] = true;
  
  // 根据墙的方向，设置相邻单元格的对应墙体
  if (wall === 'north' && row1 > 0) {
    // 设置上方单元格的南墙
    grid[row1-1][col1].walls.south = true;
  } else if (wall === 'east' && col1 < width - 1) {
    // 设置右侧单元格的西墙
    grid[row1][col1+1].walls.west = true;
  } else if (wall === 'south' && row1 < height - 1) {
    // 设置下方单元格的北墙
    grid[row1+1][col1].walls.north = true;
  } else if (wall === 'west' && col1 > 0) {
    // 设置左侧单元格的东墙
    grid[row1][col1-1].walls.east = true;
  }
}; 