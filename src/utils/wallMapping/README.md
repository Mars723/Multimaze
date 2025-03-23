# 墙体表示策略模块

## 简介

这个模块提供了多种墙体表示和处理的工具函数，用于处理迷宫的结构、可视化和存储。该模块设计为与现有的迷宫应用完全独立，不会影响现有功能，旨在为扩展和记录墙体表示策略提供基础。

## 模块结构

```
wallMapping/
├── index.ts          - 导出模块的所有功能
├── wallMapper.ts     - 墙体数据结构和映射函数
├── wallVisualizer.ts - 墙体可视化工具
├── wallEncoders.ts   - 墙体编码/解码工具
└── README.md         - 本文档
```

## 核心概念

### 墙体表示

在迷宫中，墙体可以通过以下方式表示：

1. **单元格视角**：每个单元格拥有四面墙（北、东、南、西）
2. **墙体视角**：每面墙由起点和终点定义，并有水平或垂直的类型

本模块将这两种视角统一处理，提供从单元格表示到墙体表示的转换。

### 点表示法

在墙体视角中，墙体由以下要素表示：

- **起点和终点**：墙的两个端点
- **类型**：水平或垂直
- **存在性**：墙是否存在
- **关联单元格**：哪些单元格共享这面墙

## 主要功能

### 墙体映射 (wallMapper.ts)

- `collectAllWalls`: 收集迷宫中所有墙体
- `getWallsAtPoint`: 获取特定坐标的墙体
- `getWallBetweenPoints`: 获取两点之间的墙体
- `wallToString`: 墙体的字符串表示
- `getMazeWallStats`: 获取迷宫墙体统计信息

### 墙体可视化 (wallVisualizer.ts)

- `mazeToASCII`: 将迷宫转换为ASCII字符表示
- `mazeToSVG`: 将迷宫转换为SVG格式
- `createMazeCanvasRenderer`: 创建Canvas渲染函数
- `exportMazeAsPNG`: 导出为PNG图像

### 墙体编码 (wallEncoders.ts)

- `encodeMazeToBinary`: 编码为二进制字符串
- `encodeMazeToNumberArray`: 编码为数字数组
- `encodeMazeToBase64`: 编码为Base64字符串
- `encodeMazeForURL`: 编码为URL友好格式
- 相应的解码函数

## 使用示例

### 收集墙体信息

```typescript
import { collectAllWalls } from '../utils/wallMapping';

const walls = collectAllWalls(mazeGrid);
console.log(`迷宫共有 ${walls.length} 面墙`);
```

### 生成ASCII可视化

```typescript
import { mazeToASCII } from '../utils/wallMapping';

const asciiMaze = mazeToASCII(mazeGrid);
console.log(asciiMaze);
```

### 编码迷宫以共享

```typescript
import { encodeMazeForURL } from '../utils/wallMapping';

const encodedMaze = encodeMazeForURL(mazeGrid);
const shareUrl = `https://example.com/maze?data=${encodedMaze}`;
console.log(`分享链接: ${shareUrl}`);
```

## 墙体表示策略对比

| 策略 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 单元格视角 | 简单直观，易于理解和实现 | 存在冗余(相邻单元格共享墙) | 小型迷宫，算法演示 |
| 墙体视角 | 消除冗余，更高效的存储 | 实现复杂度增加 | 大型迷宫，高效存储和传输 |
| 位编码 | 极度紧凑的存储 | 难以直接操作 | 序列化和网络传输 |

## 扩展思路

1. **迷宫共享功能**：利用编码器实现迷宫的导入/导出功能
2. **多样化可视化**：支持更多的可视化样式和主题
3. **迷宫分析工具**：分析迷宫的复杂度、解的唯一性等特性 