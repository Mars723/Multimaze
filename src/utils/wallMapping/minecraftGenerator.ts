import { Cell } from '../../types/maze';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Point, Wall, collectAllWalls } from './wallMapper';

/**
 * Transforms a wall for use in Minecraft by:
 * 1. Translating it from origin (0,0) to a new position (offsetX, offsetY)
 * 2. Scaling by a factor to make traversable in Minecraft
 * 3. Setting a uniform Y coordinate (height)
 */
export interface MinecraftWall {
  x1: number;
  y1: number;
  z1: number; 
  x2: number;
  y2: number;
  z2: number;
  isHorizontal: boolean;
}

/**
 * Configuration for Minecraft export
 */
export interface MinecraftExportConfig {
  offsetX: number;      // X coordinate offset in Minecraft
  offsetY: number;      // Z coordinate offset in Minecraft (maze y-axis maps to MC z-axis)
  z: number;            // Y coordinate for all walls (height in Minecraft)
  scale: number;        // Scaling factor (how many blocks per cell)
  height: number;       // Wall height
  blockType: string;    // Minecraft block type (e.g., "stone", "oak_planks")
}

/**
 * Debug function to log wall information
 */
function debugWall(wall: Wall, index: number): void {
  console.log(`Wall ${index}:`, 
    `Type: ${wall.type}`, 
    `Start: (${wall.start.x},${wall.start.y})`, 
    `End: (${wall.end.x},${wall.end.y})`,
    `Cells: ${wall.cells.map(c => `(${c.row},${c.col})`).join(', ')}`,
    `Exists: ${wall.exists}`
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isRealBoundaryWall(wall: Wall, width: number, height: number): boolean {
  return wall.isBoundary || 
         (wall.type === 'vertical' && wall.start.x === 0 && wall.end.x === 0) || 
         (wall.type === 'vertical' && wall.start.x === width && wall.end.x === width) || 
         (wall.type === 'horizontal' && wall.start.y === 0 && wall.end.y === 0) || 
         (wall.type === 'horizontal' && wall.start.y === height && wall.end.y === height);
}

/**
 * 判断墙体是否应该保留
 * 根据单元格的墙状态判断墙体是否存在
 */
function shouldKeepWall(wall: Wall, grid: Cell[][]): boolean {
  // 边界墙总是保留
  if (wall.isBoundary) {
    return true;
  }
  
  // 边界检查
  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return false; // 没有网格数据，不保留墙体
  }
  
  const gridWidth = grid[0].length;
  const gridHeight = grid.length;
  
  // 获取墙的坐标
  const startX = wall.start.x;
  const startY = wall.start.y;
  
  // 对于垂直墙 - 垂直墙在两个水平相邻单元格之间
  if (wall.type === 'vertical') {
    // 确保坐标在有效范围内
    if (startY < 0 || startY >= gridHeight || startX <= 0 || startX >= gridWidth) {
      return false;
    }
    
    try {
      // 检查左侧单元格的东墙 - 要确保startX-1在有效范围内
      const leftCell = startX > 0 ? grid[startY][startX - 1] : null;
      const leftHasEastWall = leftCell && leftCell.walls && leftCell.walls.east === true ? true : false;
      
      // 检查右侧单元格的西墙 - 要确保startX在有效范围内
      const rightCell = startX < gridWidth ? grid[startY][startX] : null;
      const rightHasWestWall = rightCell && rightCell.walls && rightCell.walls.west === true ? true : false;
      
      // 对于所有垂直墙，只要有一个单元格表明有墙就保留
      // 这确保我们不会过滤掉太多墙体
      return leftHasEastWall || rightHasWestWall;
    } catch (error) {
      // 错误时默认保留墙体，确保不会漏掉重要墙体
      console.warn(`处理垂直墙体(${startX},${startY})时出错，选择保留`, error);
      return true;
    }
  }
  
  // 对于水平墙 - 水平墙在两个垂直相邻单元格之间
  if (wall.type === 'horizontal') {
    // 上下边界墙特殊处理
    if (startY === 0 || startY === gridHeight) {
      return true;
    }
    
    // 确保坐标在有效范围内
    if (startX < 0 || startX >= gridWidth || startY <= 0 || startY >= gridHeight) {
      return false;
    }
    
    try {
      // 检查上侧单元格的南墙
      const topCell = startY > 0 ? grid[startY - 1][startX] : null;
      const topHasSouthWall = topCell && topCell.walls && topCell.walls.south === true ? true : false;
      
      // 检查下侧单元格的北墙
      const bottomCell = startY < gridHeight ? grid[startY][startX] : null;
      const bottomHasNorthWall = bottomCell && bottomCell.walls && bottomCell.walls.north === true ? true : false;
      
      // 对于水平墙，只要有一个单元格表明有墙就保留
      return topHasSouthWall || bottomHasNorthWall;
    } catch (error) {
      // 错误时默认保留墙体
      console.warn(`处理水平墙体(${startX},${startY})时出错，选择保留`, error);
      return true;
    }
  }
  
  // 如果不是水平墙也不是垂直墙，默认不保留
  return false;
}

/**
 * 改进的墙体转换函数，确保墙体在Minecraft中正确显示
 */
export function improvedTransformWallsForMinecraft(
  walls: Wall[],
  gridWidth: number,
  gridHeight: number,
  grid: Cell[][],
  config: MinecraftExportConfig
): MinecraftWall[] {
  console.log(`Converting ${walls.length} walls with scale ${config.scale}`);
  console.log(`Grid dimensions: ${gridWidth}x${gridHeight}`);
  
  // 水平墙和垂直墙分开处理
  const horizontalWalls = walls.filter(wall => wall.type === 'horizontal');
  const verticalWalls = walls.filter(wall => wall.type === 'vertical');
  
  console.log(`Found ${horizontalWalls.length} horizontal walls and ${verticalWalls.length} vertical walls`);
  
  // 水平墙处理
  const mcHorizontalWalls = horizontalWalls.map((wall, index) => {
    if (index < 3) debugWall(wall, index);
    
    // 水平墙直接从x1到x2延伸，z坐标相同
    const x1 = wall.start.x * config.scale + config.offsetX;
    const z1 = wall.start.y * config.scale + config.offsetY;
    const x2 = wall.end.x * config.scale + config.offsetX;
    
    return {
      x1: Math.min(x1, x2),
      y1: config.z,
      z1: z1,
      x2: Math.max(x1, x2),
      y2: config.z + config.height - 1,
      z2: z1,
      isHorizontal: true
    };
  });
  
  // 重新计算每一列的墙体，确保不重复计数
  // 根据墙体的起点和终点创建唯一标识
  const uniqueVerticalWalls = new Map<string, Wall>();
  const duplicateWallCount: Record<number, number> = {};

  for (const wall of verticalWalls) {
    // 为每个x坐标初始化重复计数
    if (!duplicateWallCount[wall.start.x]) {
      duplicateWallCount[wall.start.x] = 0;
    }
    
    // 创建墙的唯一键 - 使用完整坐标信息
    const key = `v_${wall.start.x}_${wall.start.y}_${wall.end.y}`;
    
    // 检查是否已存在这面墙
    if (uniqueVerticalWalls.has(key)) {
      duplicateWallCount[wall.start.x]++;
      console.log(`发现重复墙体 x=${wall.start.x}, y=${wall.start.y}-${wall.end.y}`);
    } else {
      uniqueVerticalWalls.set(key, wall);
    }
  }

  // 输出每列的重复墙体数量
  console.log("重复墙体统计:");
  for (const [x, count] of Object.entries(duplicateWallCount)) {
    if (count > 0) {
      console.log(`列 x=${x} 有 ${count} 个重复墙体`);
    }
  }

  // 基于唯一墙体计算统计
  const uniqueWallsArray = Array.from(uniqueVerticalWalls.values());
  console.log(`过滤重复后：${uniqueWallsArray.length} 个垂直墙 (原始: ${verticalWalls.length})`);

  // 理论上每列垂直墙应该等于迷宫高度
  console.log(`迷宫高度: ${gridHeight}, 应有垂直墙数: ${gridHeight}`);

  // 按列分组
  const wallsByColumn: Record<number, Wall[]> = {};
  for (const wall of uniqueWallsArray) {
    if (!wallsByColumn[wall.start.x]) {
      wallsByColumn[wall.start.x] = [];
    }
    wallsByColumn[wall.start.x].push(wall);
  }

  // 检查每列墙体数量是否符合预期
  console.log("每列墙体数量检查:");
  for (const [x, walls] of Object.entries(wallsByColumn)) {
    const expected = parseInt(x) === 0 || parseInt(x) === gridWidth ? gridHeight : gridHeight;
    const actual = walls.length;
    const isCorrect = actual === expected;
    console.log(`列 x=${x}: 实际=${actual}, 预期=${expected}, ${isCorrect ? '正确' : '错误'}`);
    
    // 如果不正确，打印该列的所有墙体
    if (!isCorrect) {
      console.log(`列 x=${x} 的墙体坐标:`);
      walls.forEach((wall, i) => {
        console.log(`  ${i+1}. 从(${wall.start.x},${wall.start.y})到(${wall.end.x},${wall.end.y})`);
      });
    }
  }
  
  // 过滤垂直墙
  const filteredVerticalWalls = uniqueWallsArray.filter(wall => {
    // 使用通用的墙体保留函数
    const shouldKeep = shouldKeepWall(wall, grid);
    
    return shouldKeep;
  });
  
  // 按列整理过滤后的墙体
  const filteredWallsByColumn: Record<number, Wall[]> = {};
  for (const wall of filteredVerticalWalls) {
    if (!filteredWallsByColumn[wall.start.x]) {
      filteredWallsByColumn[wall.start.x] = [];
    }
    filteredWallsByColumn[wall.start.x].push(wall);
  }

  // 输出过滤统计信息
  console.log("墙体过滤统计:");
  for (const [xStr, walls] of Object.entries(wallsByColumn)) {
    const x = parseInt(xStr);
    const filtered = walls.length - (filteredWallsByColumn[x]?.length || 0);
    const filterPercent = walls.length > 0 ? ((filtered / walls.length) * 100).toFixed(1) : '0';
    console.log(`列 x=${x}: 总数=${walls.length}, 过滤掉=${filtered} (${filterPercent}%)`);
  }

  console.log(`过滤后保留了 ${filteredVerticalWalls.length} 个垂直墙（从 ${uniqueWallsArray.length} 个)`);
  
  // 垂直墙处理
  const mcVerticalWalls = filteredVerticalWalls.map((wall, index) => {
    if (index < 3) debugWall(wall, index);
    
    // 垂直墙直接从z1到z2延伸，x坐标相同
    const x1 = wall.start.x * config.scale + config.offsetX;
    const z1 = wall.start.y * config.scale + config.offsetY;
    const z2 = wall.end.y * config.scale + config.offsetY;
    
    return {
      x1: x1,
      y1: config.z,
      z1: Math.min(z1, z2),
      x2: x1,
      y2: config.z + config.height - 1,
      z2: Math.max(z1, z2),
      isHorizontal: false
    };
  });
  
  // 添加四个角落的方块以确保墙体闭合
  const cornerBlocks = [
    // 左上角
    {
      x1: config.offsetX,
      y1: config.z,
      z1: config.offsetY,
      x2: config.offsetX,
      y2: config.z + config.height - 1,
      z2: config.offsetY,
      isHorizontal: false
    },
    // 右上角
    {
      x1: config.offsetX + gridWidth * config.scale,
      y1: config.z,
      z1: config.offsetY,
      x2: config.offsetX + gridWidth * config.scale,
      y2: config.z + config.height - 1,
      z2: config.offsetY,
      isHorizontal: false
    },
    // 左下角
    {
      x1: config.offsetX,
      y1: config.z,
      z1: config.offsetY + gridHeight * config.scale,
      x2: config.offsetX,
      y2: config.z + config.height - 1,
      z2: config.offsetY + gridHeight * config.scale,
      isHorizontal: false
    },
    // 右下角
    {
      x1: config.offsetX + gridWidth * config.scale,
      y1: config.z,
      z1: config.offsetY + gridHeight * config.scale,
      x2: config.offsetX + gridWidth * config.scale,
      y2: config.z + config.height - 1,
      z2: config.offsetY + gridHeight * config.scale,
      isHorizontal: false
    }
  ];
  
  // 合并所有墙体
  return [...mcHorizontalWalls, ...mcVerticalWalls, ...cornerBlocks];
}

/**
 * Generates Minecraft fill commands for the given maze
 */
export function generateMinecraftCommands(
  grid: Cell[][],
  config: MinecraftExportConfig
): string[] {
  // 获取网格尺寸
  const gridHeight = grid.length;
  const gridWidth = grid[0].length;
  
  // 收集所有墙体
  const walls = collectAllWalls(grid);
  console.log(`Collected ${walls.length} walls from maze (${gridWidth}x${gridHeight})`);
  
  // 使用改进的转换函数，传入网格尺寸和网格数据
  const mcWalls = improvedTransformWallsForMinecraft(walls, gridWidth, gridHeight, grid, config);
  
  // 生成填充命令
  const commands = mcWalls.map(wall => {
    const command = `fill ${wall.x1} ${wall.y1} ${wall.z1} ${wall.x2} ${wall.y2} ${wall.z2} ${config.blockType}`;
    return command;
  });
  
  console.log(`Generated ${commands.length} Minecraft fill commands`);
  return commands;
}

/**
 * Generates Minecraft fill commands for a maze with info text
 */
export function getMazeMinecraftCommandsText(
  grid: Cell[][],
  config: MinecraftExportConfig
): string {
  const commands = generateMinecraftCommands(grid, config);
  
  const header = [
    "# Minecraft Maze Commands",
    `# Generated for a ${grid.length}x${grid[0].length} maze`,
    `# Scale: ${config.scale}, Height: ${config.height}, Block: ${config.blockType}`,
    `# Starting at coordinates: X=${config.offsetX}, Y=${config.z}, Z=${config.offsetY}`,
    "#",
    "# Copy these commands into Minecraft to create your maze",
    "# You may want to split these into multiple commands if there are too many",
    "#",
    ""
  ].join("\n");
  
  return header + commands.join("\n");
}

/**
 * Returns the dimensions of the maze in Minecraft blocks
 */
export function getMazeMinecraftDimensions(
  grid: Cell[][],
  scale: number
): { width: number; height: number } {
  return {
    width: grid[0].length * scale,
    height: grid.length * scale
  };
} 