import { Cell } from '../../types/maze';
import { Wall, collectAllWalls } from './wallMapper';

/**
 * 将迷宫墙体编码为二进制字符串
 * 每个单元格的四面墙（北、东、南、西）使用4位表示
 * @param grid 迷宫网格
 * @returns 二进制编码字符串
 */
export function encodeMazeToBinary(grid: Cell[][]): string {
  const height = grid.length;
  const width = grid[0].length;
  let binaryString = '';
  
  // 添加迷宫尺寸到编码头部
  const dimensionBits = width.toString(2).padStart(8, '0') + height.toString(2).padStart(8, '0');
  binaryString += dimensionBits;
  
  // 对每个单元格编码其墙体
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      
      // 北东南西墙，1表示有墙，0表示无墙
      const north = cell.walls.north ? '1' : '0';
      const east = cell.walls.east ? '1' : '0';
      const south = cell.walls.south ? '1' : '0';
      const west = cell.walls.west ? '1' : '0';
      
      binaryString += north + east + south + west;
    }
  }
  
  return binaryString;
}

/**
 * 从二进制字符串解码迷宫
 * @param binaryString 二进制编码字符串
 * @returns 解码后的迷宫网格
 */
export function decodeMazeFromBinary(binaryString: string): Cell[][] {
  // 从编码头部提取迷宫尺寸
  const width = parseInt(binaryString.substring(0, 8), 2);
  const height = parseInt(binaryString.substring(8, 16), 2);
  
  // 创建空迷宫
  const grid: Cell[][] = Array(height)
    .fill(null)
    .map((_, row) => 
      Array(width)
        .fill(null)
        .map((_, col) => ({
          visited: false,
          inPath: false,
          isStart: false,
          isEnd: false,
          walls: { north: false, east: false, south: false, west: false },
          coloredWalls: { north: false, east: false, south: false, west: false },
          distance: -1,
          // 直接在创建时设置正确的位置
          position: { row, col }
        }))
    );
  
  // 解码墙体信息
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellOffset = 16 + (y * width + x) * 4;
      const cell = grid[y][x];
      
      cell.walls.north = binaryString[cellOffset] === '1';
      cell.walls.east = binaryString[cellOffset + 1] === '1';
      cell.walls.south = binaryString[cellOffset + 2] === '1';
      cell.walls.west = binaryString[cellOffset + 3] === '1';
    }
  }
  
  return grid;
}

/**
 * 将迷宫编码为紧凑的数字数组
 * @param grid 迷宫网格
 * @returns 包含编码后数据的数组
 */
export function encodeMazeToNumberArray(grid: Cell[][]): number[] {
  const height = grid.length;
  const width = grid[0].length;
  const result: number[] = [width, height];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      
      // 将四个墙体状态转换为一个4位数字（0-15）
      let wallCode = 0;
      if (cell.walls.north) wallCode |= 1;
      if (cell.walls.east) wallCode |= 2;
      if (cell.walls.south) wallCode |= 4;
      if (cell.walls.west) wallCode |= 8;
      
      result.push(wallCode);
    }
  }
  
  return result;
}

/**
 * 从数字数组解码迷宫
 * @param numbers 编码后的数字数组
 * @returns 解码后的迷宫网格
 */
export function decodeMazeFromNumberArray(numbers: number[]): Cell[][] {
  const width = numbers[0];
  const height = numbers[1];
  
  // 创建空迷宫
  const grid: Cell[][] = Array(height)
    .fill(null)
    .map((_, row) => 
      Array(width)
        .fill(null)
        .map((_, col) => ({
          visited: false,
          inPath: false,
          isStart: false,
          isEnd: false,
          walls: { north: false, east: false, south: false, west: false },
          coloredWalls: { north: false, east: false, south: false, west: false },
          distance: -1,
          // 直接在创建时设置正确的位置
          position: { row, col }
        }))
    );
  
  // 解码墙体信息
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cellIndex = 2 + (y * width + x);
      const wallCode = numbers[cellIndex];
      const cell = grid[y][x];
      
      cell.walls.north = (wallCode & 1) !== 0;
      cell.walls.east = (wallCode & 2) !== 0;
      cell.walls.south = (wallCode & 4) !== 0;
      cell.walls.west = (wallCode & 8) !== 0;
    }
  }
  
  return grid;
}

/**
 * 将迷宫编码为Base64字符串
 * 先编码为数字数组，然后转换为Base64
 * @param grid 迷宫网格
 * @returns Base64编码的字符串
 */
export function encodeMazeToBase64(grid: Cell[][]): string {
  const numbers = encodeMazeToNumberArray(grid);
  
  // 将数字转换为字节
  const bytes = new Uint8Array(numbers.length);
  for (let i = 0; i < numbers.length; i++) {
    bytes[i] = numbers[i];
  }
  
  // 转换为Base64
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

/**
 * 从Base64字符串解码迷宫
 * @param base64 Base64编码的字符串
 * @returns 解码后的迷宫网格
 */
export function decodeMazeFromBase64(base64: string): Cell[][] {
  // 从Base64转换为二进制
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // 转换为数字数组
  const numbers: number[] = Array.from(bytes);
  
  // 解码迷宫
  return decodeMazeFromNumberArray(numbers);
}

/**
 * 将迷宫编码为URL友好字符串
 * @param grid 迷宫网格
 * @returns URL友好的编码字符串
 */
export function encodeMazeForURL(grid: Cell[][]): string {
  const base64 = encodeMazeToBase64(grid);
  // 替换Base64中的特殊字符，使其URL友好
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 从URL友好字符串解码迷宫
 * @param urlStr URL友好的编码字符串
 * @returns 解码后的迷宫网格
 */
export function decodeMazeFromURL(urlStr: string): Cell[][] {
  // 恢复原始Base64格式
  let base64 = urlStr.replace(/-/g, '+').replace(/_/g, '/');
  // 添加适当的填充
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  
  return decodeMazeFromBase64(base64);
} 