import { Cell } from '../../types/maze';
import { Wall, collectAllWalls } from './wallMapper';

/**
 * 表示墙体的ASCII可视化配置
 */
export interface ASCIIVisualizerConfig {
  horizontalWall: string;  // 水平墙使用的字符
  verticalWall: string;    // 垂直墙使用的字符
  intersection: string;    // 墙体交叉点使用的字符
  emptySpace: string;      // 空白区域使用的字符
  cellChar: string;        // 单元格中心使用的字符
}

/**
 * 默认的ASCII可视化配置
 */
export const DEFAULT_ASCII_CONFIG: ASCIIVisualizerConfig = {
  horizontalWall: '─',
  verticalWall: '│',
  intersection: '┼',
  emptySpace: ' ',
  cellChar: '·'
};

/**
 * 将迷宫转换为ASCII格式的字符串表示
 * @param grid 迷宫网格
 * @param config 可视化配置
 * @returns ASCII字符串
 */
export function mazeToASCII(
  grid: Cell[][],
  config: ASCIIVisualizerConfig = DEFAULT_ASCII_CONFIG
): string {
  const height = grid.length;
  const width = grid[0].length;
  const walls = collectAllWalls(grid);
  
  // 创建一个二维数组表示ASCII图
  // 每个单元格需要2x2的字符空间，外加边界
  const asciiHeight = height * 2 + 1;
  const asciiWidth = width * 2 + 1;
  const ascii: string[][] = Array(asciiHeight)
    .fill(null)
    .map(() => Array(asciiWidth).fill(config.emptySpace));
  
  // 设置所有交叉点
  for (let y = 0; y <= height; y++) {
    for (let x = 0; x <= width; x++) {
      ascii[y * 2][x * 2] = config.intersection;
    }
  }
  
  // 设置单元格中心点
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      ascii[y * 2 + 1][x * 2 + 1] = config.cellChar;
    }
  }
  
  // 绘制墙体
  for (const wall of walls) {
    if (!wall.exists) continue;
    
    const { start, end, type } = wall;
    
    if (type === 'horizontal') {
      // 水平墙
      const y = start.y * 2;
      const x1 = start.x * 2;
      const x2 = end.x * 2;
      
      // 填充水平墙
      for (let x = x1 + 1; x < x2; x++) {
        ascii[y][x] = config.horizontalWall;
      }
    } else {
      // 垂直墙
      const x = start.x * 2;
      const y1 = start.y * 2;
      const y2 = end.y * 2;
      
      // 填充垂直墙
      for (let y = y1 + 1; y < y2; y++) {
        ascii[y][x] = config.verticalWall;
      }
    }
  }
  
  // 将二维数组转换为字符串
  return ascii.map(row => row.join('')).join('\n');
}

/**
 * 将迷宫转换为SVG格式
 * @param grid 迷宫网格
 * @param cellSize 单元格大小（像素）
 * @param wallThickness 墙体厚度（像素）
 * @param backgroundColor 背景颜色
 * @param wallColor 墙体颜色
 * @returns SVG字符串
 */
export function mazeToSVG(
  grid: Cell[][],
  cellSize: number = 20,
  wallThickness: number = 2,
  backgroundColor: string = '#ffffff',
  wallColor: string = '#000000'
): string {
  const height = grid.length;
  const width = grid[0].length;
  const walls = collectAllWalls(grid);
  
  const svgWidth = width * cellSize;
  const svgHeight = height * cellSize;
  
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
`;
  
  // 绘制所有墙体
  for (const wall of walls) {
    if (!wall.exists) continue;
    
    const { start, end, type } = wall;
    
    if (type === 'horizontal') {
      // 水平墙
      const x1 = start.x * cellSize;
      const y1 = start.y * cellSize;
      const x2 = end.x * cellSize;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" stroke="${wallColor}" stroke-width="${wallThickness}" />
`;
    } else {
      // 垂直墙
      const x1 = start.x * cellSize;
      const y1 = start.y * cellSize;
      const y2 = end.y * cellSize;
      
      svg += `  <line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="${wallColor}" stroke-width="${wallThickness}" />
`;
    }
  }
  
  svg += '</svg>';
  return svg;
}

/**
 * 创建迷宫的Canvas绘制函数
 * 返回一个函数，该函数接受Canvas上下文并绘制迷宫
 * 
 * @param grid 迷宫网格
 * @param cellSize 单元格大小（像素）
 * @param wallThickness 墙体厚度（像素）
 * @param backgroundColor 背景颜色
 * @param wallColor 墙体颜色
 * @returns 接受Canvas上下文的绘制函数
 */
export function createMazeCanvasRenderer(
  grid: Cell[][],
  cellSize: number = 20,
  wallThickness: number = 2,
  backgroundColor: string = '#ffffff',
  wallColor: string = '#000000'
): (ctx: CanvasRenderingContext2D) => void {
  const height = grid.length;
  const width = grid[0].length;
  const walls = collectAllWalls(grid);
  
  return (ctx: CanvasRenderingContext2D) => {
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;
    
    // 设置画布大小
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
    
    // 填充背景
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 设置墙体样式
    ctx.strokeStyle = wallColor;
    ctx.lineWidth = wallThickness;
    
    // 绘制所有墙体
    for (const wall of walls) {
      if (!wall.exists) continue;
      
      const { start, end, type } = wall;
      
      ctx.beginPath();
      
      if (type === 'horizontal') {
        // 水平墙
        const x1 = start.x * cellSize;
        const y1 = start.y * cellSize;
        const x2 = end.x * cellSize;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
      } else {
        // 垂直墙
        const x1 = start.x * cellSize;
        const y1 = start.y * cellSize;
        const y2 = end.y * cellSize;
        
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
      }
      
      ctx.stroke();
    }
  };
}

/**
 * 导出迷宫为PNG图像数据URL
 * @param grid 迷宫网格
 * @param cellSize 单元格大小（像素）
 * @param wallThickness 墙体厚度（像素）
 * @param backgroundColor 背景颜色
 * @param wallColor 墙体颜色
 * @returns Promise包含图像的数据URL
 */
export function exportMazeAsPNG(
  grid: Cell[][],
  cellSize: number = 20,
  wallThickness: number = 2,
  backgroundColor: string = '#ffffff',
  wallColor: string = '#000000'
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const height = grid.length;
      const width = grid[0].length;
      const canvasWidth = width * cellSize;
      const canvasHeight = height * cellSize;
      
      // 创建一个临时Canvas
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法获取Canvas上下文'));
        return;
      }
      
      // 使用渲染器绘制迷宫
      const renderer = createMazeCanvasRenderer(
        grid, cellSize, wallThickness, backgroundColor, wallColor
      );
      renderer(ctx);
      
      // 导出为数据URL
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    } catch (error) {
      reject(error);
    }
  });
} 