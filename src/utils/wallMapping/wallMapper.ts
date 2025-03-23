import { Cell } from '../../types/maze';

/**
 * 表示二维平面上的一个点
 */
export interface Point {
  x: number;  // 水平坐标
  y: number;  // 垂直坐标
}

/**
 * 表示墙体类型
 */
export type WallType = 'horizontal' | 'vertical';

/**
 * 表示迷宫中的一面墙
 */
export interface Wall {
  start: Point;   // 墙的起点
  end: Point;     // 墙的终点
  type: WallType; // 墙的类型（水平或垂直）
  exists: boolean;  // 墙是否存在
  cells: {row: number, col: number}[];  // 哪些单元格共享这面墙
  isBoundary?: boolean; // 是否是边界墙
}

/**
 * 收集迷宫中所有墙体信息，并确保边缘墙体完整
 * @param grid 迷宫网格
 * @returns 所有墙体数组
 */
export function collectAllWalls(grid: Cell[][]): Wall[] {
  const height = grid.length;
  const width = grid[0].length;
  const walls: Wall[] = [];
  
  console.log(`收集墙体 - 迷宫尺寸: ${width}x${height}`);
  
  // 水平墙 (包括北墙和南墙)
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x < width; x++) {
      // 创建从(x,y)到(x+1,y)的水平墙
      const wall: Wall = {
        start: { x, y },
        end: { x: x + 1, y },
        type: 'horizontal',
        exists: false,
        cells: [],
        isBoundary: y === 0 || y === height // 标记为边界墙
      };
      
      // 强制顶部和底部边界墙存在
      if (wall.isBoundary) {
        wall.exists = true;
        // 记录相关单元格，但确保不越界
        if (y === 0 && y < height) {
          wall.cells.push({row: y, col: x});
        } else if (y === height && y > 0) {
          wall.cells.push({row: y-1, col: x});
        }
      } else {
        // 检查上方单元格的南墙(如果有)
        if (y > 0) {
          const cellAbove = grid[y-1][x];
          if (cellAbove.walls.south) {
            wall.exists = true;
            wall.cells.push({row: y-1, col: x});
          }
        }
        
        // 检查下方单元格的北墙(如果有)
        if (y < height) {
          const cellBelow = grid[y][x];
          if (cellBelow.walls.north) {
            wall.exists = true;
            wall.cells.push({row: y, col: x});
          }
        }
      }
      
      // 如果墙存在(至少一侧有墙)，则添加到数组
      if (wall.exists) {
        walls.push(wall);
      }
    }
  }
  
  // 垂直墙 (包括东墙和西墙)
  for (let x = 0; x <= width; x++) {
    for (let y = 0; y < height; y++) {
      // 创建从(x,y)到(x,y+1)的垂直墙
      const wall: Wall = {
        start: { x, y },
        end: { x, y: y + 1 },
        type: 'vertical',
        exists: false,
        cells: [],
        isBoundary: x === 0 || x === width // 标记为边界墙
      };
      
      // 强制左侧和右侧边界墙存在
      if (wall.isBoundary) {
        wall.exists = true;
        // 记录相关单元格，但确保不越界
        if (x === 0 && x < width) {
          wall.cells.push({row: y, col: x});
        } else if (x === width && x > 0) {
          wall.cells.push({row: y, col: x-1});
        }
      } else {
        // 检查左侧单元格的东墙(如果有)
        if (x < width) {
          const cellLeft = grid[y][x];
          if (cellLeft.walls.east) {
            wall.exists = true;
            wall.cells.push({row: y, col: x});
          }
        }
        
        // 检查右侧单元格的西墙(如果有)
        if (x > 0) {
          const cellRight = grid[y][x-1];
          if (cellRight.walls.west) {
            wall.exists = true;
            wall.cells.push({row: y, col: x-1});
          }
        }
      }
      
      // 如果墙存在(至少一侧有墙)，则添加到数组
      if (wall.exists) {
        walls.push(wall);
      }
    }
  }
  
  // 检查垂直墙完整性 - 对每列进行统计
  const verticalWallsByColumn: Record<number, number> = {};
  const verticalWalls = walls.filter(w => w.type === 'vertical');
  
  for (const wall of verticalWalls) {
    if (!verticalWallsByColumn[wall.start.x]) {
      verticalWallsByColumn[wall.start.x] = 0;
    }
    verticalWallsByColumn[wall.start.x]++;
  }
  
  console.log("垂直墙分布统计:");
  for (const [x, count] of Object.entries(verticalWallsByColumn)) {
    console.log(`列 x=${x}: ${count}个墙, 理论应有 ${height}个`);
    
    // 如果发现墙体数量少于预期，添加诊断信息
    if (count < height && (Number(x) === 0 || Number(x) === width)) {
      console.log(`  边界列 x=${x} 墙体不足! 缺少 ${height - count} 个边界墙`);
    }
  }
  
  // 确保每列都收集到了所有墙体 - 处理所有列，不只是边界列
  let addedWalls = 0;
  for (let x = 0; x <= width; x++) {
    const existingCount = verticalWallsByColumn[x] || 0;
    
    // 如果墙体数量少于高度，表示有缺失
    if (existingCount < height) {
      console.log(`修复列 x=${x} 的缺失墙体`);
      
      // 找出此列现有的墙体的y坐标
      const existingYCoords = new Set<number>();
      for (const wall of verticalWalls) {
        if (wall.start.x === x) {
          existingYCoords.add(wall.start.y);
        }
      }
      
      // 添加缺失的墙体
      for (let y = 0; y < height; y++) {
        if (!existingYCoords.has(y)) {
          const newWall: Wall = {
            start: { x, y },
            end: { x, y: y + 1 },
            type: 'vertical',
            exists: true,
            cells: [],
            isBoundary: x === 0 || x === width // 只有边界列标记为isBoundary
          };
          
          // 尝试根据相邻单元格确定此墙是否应该存在
          let shouldExist = newWall.isBoundary; // 边界墙总是存在
          
          if (!shouldExist && x > 0 && x < width) {
            // 对于内部墙，检查相邻单元格
            try {
              // 检查左侧单元格的东墙
              if (x < width) {
                const cellLeft = grid[y][x-1];
                if (cellLeft && cellLeft.walls.east) {
                  shouldExist = true;
                }
              }
              
              // 检查右侧单元格的西墙
              if (x > 0 && x <= width && !shouldExist) {
                const cellRight = grid[y][x];
                if (cellRight && cellRight.walls.west) {
                  shouldExist = true;
                }
              }
            } catch (error) {
              console.warn(`检查墙体(${x},${y})时出错`, error);
            }
          }
          
          // 只有当墙确定应该存在时才添加
          if (shouldExist) {
            // 记录相关单元格(如果在有效范围内)
            if (x === 0 && x < width) {
              newWall.cells.push({row: y, col: x});
            } else if (x === width && x > 0) {
              newWall.cells.push({row: y, col: x-1});
            } else if (x > 0 && x < width) {
              // 内部墙添加相邻单元格
              if (grid[y][x-1].walls.east) {
                newWall.cells.push({row: y, col: x-1});
              }
              if (grid[y][x].walls.west) {
                newWall.cells.push({row: y, col: x});
              }
            }
            
            walls.push(newWall);
            addedWalls++;
            console.log(`  添加缺失墙体: (${x},${y})-(${x},${y+1})`);
          }
        }
      }
    }
  }
  
  if (addedWalls > 0) {
    console.log(`总共添加了 ${addedWalls} 个缺失的墙体`);
  }
  
  return walls;
}

/**
 * 获取特定坐标处的墙体
 * @param walls 所有墙体数组
 * @param x 水平坐标
 * @param y 垂直坐标
 * @returns 与该坐标相关的墙体
 */
export function getWallsAtPoint(walls: Wall[], x: number, y: number): Wall[] {
  return walls.filter(wall => 
    (wall.start.x === x && wall.start.y === y) || 
    (wall.end.x === x && wall.end.y === y)
  );
}

/**
 * 获取两点之间的墙体(如果存在)
 * @param walls 所有墙体数组
 * @param x1 起点水平坐标
 * @param y1 起点垂直坐标
 * @param x2 终点水平坐标
 * @param y2 终点垂直坐标
 * @returns 连接两点的墙体，如果不存在则返回null
 */
export function getWallBetweenPoints(
  walls: Wall[], 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number
): Wall | null {
  return walls.find(wall => 
    ((wall.start.x === x1 && wall.start.y === y1) && (wall.end.x === x2 && wall.end.y === y2)) ||
    ((wall.start.x === x2 && wall.start.y === y2) && (wall.end.x === x1 && wall.end.y === y1))
  ) || null;
}

/**
 * 将墙体转换为简单的字符串表示形式
 * @param wall 墙体
 * @returns 墙体的字符串表示
 */
export function wallToString(wall: Wall): string {
  return `${wall.type} wall from (${wall.start.x},${wall.start.y}) to (${wall.end.x},${wall.end.y})${wall.isBoundary ? ' (boundary)' : ''}`;
}

/**
 * 将墙体转换为JSON格式
 * @param walls 墙体数组
 * @returns JSON字符串
 */
export function wallsToJson(walls: Wall[]): string {
  return JSON.stringify(walls, null, 2);
}

/**
 * 获取迷宫的所有墙体数据
 * @param grid 迷宫网格
 * @returns 包含墙体统计信息的对象
 */
export function getMazeWallStats(grid: Cell[][]): {
  totalWalls: number;
  horizontalWalls: number;
  verticalWalls: number;
  boundaryWalls: number;
  wallsList: Wall[];
} {
  const walls = collectAllWalls(grid);
  
  return {
    totalWalls: walls.length,
    horizontalWalls: walls.filter(w => w.type === 'horizontal').length,
    verticalWalls: walls.filter(w => w.type === 'vertical').length,
    boundaryWalls: walls.filter(w => w.isBoundary).length,
    wallsList: walls
  };
} 