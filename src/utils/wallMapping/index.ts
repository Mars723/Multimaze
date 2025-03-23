// Wall Mapping Utilities
// These utilities handle the collection, visualization and export of maze wall data

export * from './wallMapper';
export * from './wallVisualizer';
export * from './wallEncoders';
export * from './minecraftGenerator';

/**
 * Wall Mapping Tools
 * 
 * This module provides utilities for collecting and manipulating wall data
 * from a maze grid. It offers functions for:
 * 
 * - Collecting wall data from a maze grid (collectAllWalls)
 * - Querying walls at specific locations (getWallsAtPoint, getWallBetweenPoints)
 * - Converting wall data to string/JSON formats (wallToString, wallsToJson)
 * - Getting statistics about maze walls (getMazeWallStats)
 * - Exporting to Minecraft using /fill commands (getMazeMinecraftCommandsText)
 * 
 * Usage examples:
 * 
 * ```
 * // Collect all walls from a maze
 * const walls = collectAllWalls(grid);
 * 
 * // Get statistics about the maze walls
 * const stats = getMazeWallStats(grid);
 * 
 * // Generate Minecraft commands
 * const minecraftConfig = {
 *   offsetX: 0,
 *   offsetY: 0,
 *   z: 64,
 *   scale: 3,
 *   height: 3,
 *   blockType: 'stone'
 * };
 * const commands = getMazeMinecraftCommandsText(grid, minecraftConfig);
 * ```
 */

// 说明文档
/**
 * ## 墙体表示策略
 * 
 * 本模块提供了多种墙体表示和处理的工具函数，用于：
 * 
 * 1. 收集和表示迷宫中的墙体数据
 * 2. 可视化迷宫（ASCII、SVG、Canvas）
 * 3. 编码/解码迷宫数据（二进制、数字数组、Base64、URL友好格式）
 * 4. 导出到Minecraft（生成/fill命令）
 * 
 * ### 墙体映射
 * 
 * 在迷宫中，每个单元格都有四面墙（北、东、南、西）。墙体可以通过以下方式表示：
 * 
 * - 点表示法：墙体由起点和终点定义
 * - 类型标识：水平墙或垂直墙
 * - 存在性：墙是否存在
 * 
 * ### 主要功能
 * 
 * - `collectAllWalls`: 收集迷宫中所有墙体信息
 * - `mazeToASCII`: 将迷宫转换为ASCII字符表示
 * - `mazeToSVG`: 将迷宫转换为SVG格式
 * - `encodeMazeToBinary`: 将迷宫编码为二进制字符串
 * - `encodeMazeToBase64`: 将迷宫编码为Base64字符串
 * - `encodeMazeForURL`: 将迷宫编码为URL友好字符串
 * - `getMazeMinecraftCommandsText`: 获取迷宫的Minecraft命令文本
 * 
 * ### 使用示例
 * 
 * ```typescript
 * import { collectAllWalls, mazeToASCII, encodeMazeForURL } from '../utils/wallMapping';
 * 
 * // 获取所有墙体
 * const walls = collectAllWalls(grid);
 * 
 * // 生成ASCII表示
 * const asciiMaze = mazeToASCII(grid);
 * console.log(asciiMaze);
 * 
 * // 编码为URL分享
 * const urlCode = encodeMazeForURL(grid);
 * const shareUrl = `https://example.com/maze?data=${urlCode}`;
 * 
 * // 生成Minecraft命令
 * import { getMazeMinecraftCommandsText, DEFAULT_MINECRAFT_CONFIG } from '../utils/wallMapping';
 * const commands = getMazeMinecraftCommandsText(grid, {
 *   ...DEFAULT_MINECRAFT_CONFIG,
 *   baseY: 70,
 *   scale: 5
 * });
 * ```
 */ 