import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Cell, CellPosition, MazeGenerationAlgorithm, MazeSolvingAlgorithm } from '../types/maze';
import { useMaze } from '../hooks/useMaze';
import { areCellsEqual } from '../utils/mazeUtils';
import MazeControls from './MazeControls';
import './Maze.css';

interface Point {
  x: number;
  y: number;
}

interface MazeProps {
  width?: number;
  height?: number;
  initialGenerationAlgorithm?: MazeGenerationAlgorithm;
  initialSolvingAlgorithm?: MazeSolvingAlgorithm;
}

export const Maze: React.FC<MazeProps> = ({
  width = 15,
  height = 15,
  initialGenerationAlgorithm = MazeGenerationAlgorithm.DFS,
  initialSolvingAlgorithm = MazeSolvingAlgorithm.DFS,
}) => {
  const {
    grid,
    start,
    end,
    userPath,
    generationAlgorithm,
    solvingAlgorithm,
    isGenerating,
    isSolving,
    generationSteps,
    solvingSteps,
    currentGenerationStep,
    currentSolvingStep,
    generationAnimationEnabled,
    solvingAnimationEnabled,
    animationSpeed,
    animationPlaying,
    startTime,
    endTime,
    solved,
    width: mazeWidth,
    height: mazeHeight,
    generateMaze,
    solveMaze,
    setMazeSize,
    setGenerationAlgorithm,
    setSolvingAlgorithm,
    setGenerationAnimationEnabled,
    setSolvingAnimationEnabled,
    setAnimationSpeed,
    toggleAnimationPlaying,
    completeGeneration,
    completeSolving,
    addUserPath,
    clearUserPath,
    resetMaze,
    resetCurrentMaze,
  } = useMaze();

  const mazeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastCellVisited, setLastCellVisited] = useState<CellPosition | null>(null);
  const [cellSize, setCellSize] = useState(30); // 默认单元格大小
  
  // 新增：用于缩放和平移的状态
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [lastTouchPosition, setLastTouchPosition] = useState<{x: number, y: number} | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  
  // 添加一个变量跟踪是否刚更改了动画设置
  const justChangedAnimationRef = useRef(false);

  // 新增：长按检测参数
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // 新增：使用requestAnimationFrame进行平滑移动
  const rafRef = useRef<number | null>(null);
  const lastMoveTimestampRef = useRef<number>(0);
  
  // 防抖动处理平移更新
  const smoothPanUpdate = useCallback((newOffset: { x: number, y: number }) => {
    // 不使用防抖，直接更新状态以获得更高帧率
    setOffset(newOffset);
  }, []);

  // 自定义处理函数，防止动画设置更改导致自动生成迷宫
  const handleGenerationAnimationChange = (checked: boolean) => {
    // 标记为刚刚更改了动画设置
    justChangedAnimationRef.current = true;
    
    // 更新动画状态
    setGenerationAnimationEnabled(checked);
    
    // 重置标记（防止下次生成迷宫被阻止）
    setTimeout(() => {
      justChangedAnimationRef.current = false;
    }, 100);
  };

  // 自定义生成迷宫函数，在动画设置刚刚更改时阻止执行
  const handleGenerateMaze = () => {
    if (!justChangedAnimationRef.current) {
      generateMaze();
    }
  };

  // 初始化
  useEffect(() => {
    setMazeSize(width, height);
    setGenerationAlgorithm(initialGenerationAlgorithm);
    setSolvingAlgorithm(initialSolvingAlgorithm);
    // 使用自定义的生成迷宫函数
    handleGenerateMaze();
  }, [width, height, initialGenerationAlgorithm, initialSolvingAlgorithm, setMazeSize, setGenerationAlgorithm, setSolvingAlgorithm]);

  // 计算求解时间
  const solvingTime = endTime && startTime ? ((endTime - startTime) / 1000).toFixed(2) : null;

  // 鼠标相关状态
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mouseDownPosition, setMouseDownPosition] = useState<Point | null>(null);
  const [mouseDownTimestamp, setMouseDownTimestamp] = useState<number>(0);
  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const [isPathDrawing, setIsPathDrawing] = useState(false); // 添加标记路径的状态
  const mouseInitialOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const [mouseLongPressTimer, setMouseLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const MOUSE_LONG_PRESS_THRESHOLD = 500; // 鼠标长按阈值改为500ms

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只处理左键点击
    if (e.button !== 0) return;
    
    // 阻止默认行为防止文本选择
    e.preventDefault();
    
    // 记录鼠标位置，用于所有情况
    setIsMouseDown(true);
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    setMouseDownTimestamp(performance.now());
    mouseInitialOffsetRef.current = offset;
    
    // 检查点击的元素
    const element = e.target as HTMLElement;
    const isCellClick = element.classList.contains('maze-cell');
    
    // 如果点击的是单元格，且迷宫已生成完成，且未在求解过程中
    if (isCellClick && currentGenerationStep === generationSteps.length - 1 && !isSolving) {
      // 启动路径绘制模式
      setIsPathDrawing(true);
      setIsMouseDragging(false);
      
      // 清除任何已存在的长按计时器
      if (mouseLongPressTimer) {
        clearTimeout(mouseLongPressTimer);
        setMouseLongPressTimer(null);
      }
      
      // 获取单元格坐标
      const key = element.getAttribute('data-key');
      if (key) {
        const [row, col] = key.split('-').map(Number);
        const position = { row, col };
        // 添加到路径
        addUserPath(position);
        setLastCellVisited(position);
      }
    } else {
      // 点击非单元格区域或不可标记的区域
      setIsPathDrawing(false);
      
      // 创建长按计时器
      const timer = setTimeout(() => {
        // 长按计时结束，启用拖动模式
        setIsMouseDragging(true);
        
        // 直接设置初始位置
        if (mazeRef.current && mouseDownPosition) {
          const dx = e.clientX - mouseDownPosition.x;
          const dy = e.clientY - mouseDownPosition.y;
          const newOffset = {
            x: mouseInitialOffsetRef.current.x + dx,
            y: mouseInitialOffsetRef.current.y + dy
          };
          mazeRef.current.style.transform = `translate3d(${newOffset.x}px, ${newOffset.y}px, 0) scale(${scale})`;
        }
        
        setMouseLongPressTimer(null);
      }, MOUSE_LONG_PRESS_THRESHOLD);
      
      setMouseLongPressTimer(timer);
    }
  };
  
  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !mouseDownPosition) return;
    
    const dx = e.clientX - mouseDownPosition.x;
    const dy = e.clientY - mouseDownPosition.y;
    const moveDistance = Math.sqrt(dx * dx + dy * dy);
    
    // 长按检测逻辑 - 无论是否在标记模式，如果鼠标静止超过阈值时间，都可以进入拖动模式
    const now = performance.now();
    const timeElapsed = now - mouseDownTimestamp;
    
    // 检测是否应该进入拖动模式：
    // 1. 已经在拖动模式
    // 2. 长按时间达到阈值
    // 3. 大幅度移动且不是在精确标记路径
    if (isMouseDragging || 
        (timeElapsed > MOUSE_LONG_PRESS_THRESHOLD && moveDistance < 5) || 
        (moveDistance > 50 && !isPathDrawing)) {
      
      // 如果还没进入拖动模式，现在启用
      if (!isMouseDragging) {
        setIsMouseDragging(true);
        
        // 清除长按计时器
        if (mouseLongPressTimer) {
          clearTimeout(mouseLongPressTimer);
          setMouseLongPressTimer(null);
        }
      }
      
      // 计算新的偏移
      const newOffset = {
        x: mouseInitialOffsetRef.current.x + dx,
        y: mouseInitialOffsetRef.current.y + dy
      };
      
      // 直接修改DOM
      if (mazeRef.current) {
        mazeRef.current.style.transform = `translate3d(${newOffset.x}px, ${newOffset.y}px, 0) scale(${scale})`;
      }
      
      // 异步更新状态
      requestAnimationFrame(() => {
        setOffset(newOffset);
      });
      
      return;
    }
    
    // 如果是标记模式并且正在标记可标记的单元格，且不在拖动模式
    if (isPathDrawing && !isMouseDragging && !isSolving &&
        currentGenerationStep === generationSteps.length - 1) {
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      
      if (element && element.classList.contains('maze-cell')) {
        const key = element.getAttribute('data-key');
        if (key) {
          const [row, col] = key.split('-').map(Number);
          const position = { row, col };
          
          if (!lastCellVisited || !areCellsEqual(position, lastCellVisited)) {
            addUserPath(position);
            setLastCellVisited(position);
          }
        }
      }
    } 
    // 如果移动了一点点距离，但没有进入拖动模式，不会立即取消长按计时器
    // 让长按计时器继续运行，这样即使在标记路径后，也可以长按进入拖动模式
  };
  
  // 处理鼠标松开
  const handleMouseUp = (e: React.MouseEvent) => {
    // 清除长按计时器
    if (mouseLongPressTimer) {
      clearTimeout(mouseLongPressTimer);
      setMouseLongPressTimer(null);
    }
    
    setIsMouseDown(false);
    setIsMouseDragging(false);
    setIsPathDrawing(false);
  };
  
  // 处理鼠标离开窗口
  const handleMouseLeave = (e: React.MouseEvent) => {
    // 清除长按计时器
    if (mouseLongPressTimer) {
      clearTimeout(mouseLongPressTimer);
      setMouseLongPressTimer(null);
    }
    
    if (isMouseDown || isPathDrawing) {
      setIsMouseDown(false);
      setIsMouseDragging(false);
      setIsPathDrawing(false);
    }
  };

  // 计算两点之间的距离
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    // 单指操作
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      // 记录触摸位置（用于所有单指操作）
      setLastTouchPosition({ x: touch.clientX, y: touch.clientY });
      setInitialOffset(offset);
      setIsLongPress(false); // 重置长按状态
      
      // 设置长按检测
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
      
      const timeout = setTimeout(() => {
        setIsLongPress(true);
        setIsPanning(true);
        setIsDragging(false);
      }, 300); // 300ms长按触发平移
      
      setLongPressTimeout(timeout);
      
      // 检查是否在迷宫单元格上（用于路径绘制）
      if (element && element.classList.contains('maze-cell') && 
          currentGenerationStep === generationSteps.length - 1 && !isSolving) {
        const key = element.getAttribute('data-key');
        if (key) {
          const [row, col] = key.split('-').map(Number);
          const position = { row, col };
          
          // 立即启动路径绘制
          setIsDragging(true);
          setIsPanning(false);
          // 添加到路径
          addUserPath(position);
          setLastCellVisited(position);
          
          // 防止页面滚动
          e.preventDefault();
        }
      } else {
        // 不在单元格上，立即启用平移
        setIsPanning(true);
        setIsDragging(false);
      }
    }
    // 双指操作 - 开始缩放
    else if (e.touches.length === 2) {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        setLongPressTimeout(null);
      }
      
      setIsDragging(false);
      setIsPinching(true);
      setIsPanning(false);
      setIsLongPress(false);
      
      // 计算初始双指距离
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialTouchDistance(distance);
      setInitialScale(scale);
      
      // 阻止默认行为以防止页面缩放
      e.preventDefault();
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    // 防止默认滚动行为
    e.preventDefault();
    
    // 清除长按定时器，因为移动了
    if (longPressTimeout && !isLongPress) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    
    // 检查移动距离
    if (e.touches.length === 1 && lastTouchPosition) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchPosition.x;
      const dy = touch.clientY - lastTouchPosition.y;
      const moveDistance = Math.sqrt(dx * dx + dy * dy);
      
      // 如果移动距离大于10px并且还没有确定操作模式，则启用平移
      if (moveDistance > 10 && !isDragging && !isPanning && !isLongPress) {
        setIsPanning(true);
        setIsDragging(false);
      }
    }
    
    // 单指绘制路径
    if (e.touches.length === 1 && isDragging && !isPanning && !isSolving &&
        currentGenerationStep === generationSteps.length - 1) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      if (element && element.classList.contains('maze-cell')) {
        const key = element.getAttribute('data-key');
        if (key) {
          const [row, col] = key.split('-').map(Number);
          const position = { row, col };
          
          if (!lastCellVisited || !areCellsEqual(position, lastCellVisited)) {
            addUserPath(position);
            setLastCellVisited(position);
          }
        }
      }
    }
    // 单指平移 (长按或检测到的平移手势)
    else if (e.touches.length === 1 && (isPanning || isLongPress) && lastTouchPosition) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastTouchPosition.x;
      const dy = touch.clientY - lastTouchPosition.y;
      
      // 直接跟随手指移动
      const newOffset = {
        x: initialOffset.x + dx,
        y: initialOffset.y + dy
      };
      
      // 直接设置DOM样式，绕过React渲染循环提高性能
      if (mazeRef.current) {
        mazeRef.current.style.transform = `translate3d(${newOffset.x}px, ${newOffset.y}px, 0) scale(${scale})`;
      }
      
      // 异步更新状态，确保松手后状态一致
      requestAnimationFrame(() => {
        setOffset(newOffset);
      });
    }
    // 双指缩放
    else if (e.touches.length === 2 && isPinching && initialTouchDistance !== null) {
      // 计算当前双指距离
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      
      // 计算缩放因子
      const scaleFactor = currentDistance / initialTouchDistance;
      const newScale = Math.max(0.5, Math.min(3, initialScale * scaleFactor));
      
      // 直接设置DOM样式，绕过React渲染循环提高性能
      if (mazeRef.current) {
        mazeRef.current.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${newScale})`;
      }
      
      // 异步更新状态，确保松手后状态一致
      requestAnimationFrame(() => {
        setScale(newScale);
      });
    }
  };

  // 处理触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    // 清除长按定时器
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
    
    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsPinching(false);
      setIsPanning(false);
      setIsLongPress(false);
    }
    // 从双指变为单指
    else if (e.touches.length === 1) {
      setIsPinching(false);
      setLastTouchPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialOffset(offset);
      setIsPanning(true);
    }
  };

  // 清理长按定时器
  useEffect(() => {
    return () => {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout);
      }
    };
  }, [longPressTimeout]);

  // 清理动画帧
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // 渲染单元格
  const renderCell = (cell: Cell, row: number, col: number) => {
    const position: CellPosition = { row, col };
    
    // 确定单元格类型
    const isStart = areCellsEqual(position, start);
    const isEnd = areCellsEqual(position, end);
    const isInUserPath = userPath.some((pos) => areCellsEqual(pos, position));
    const isLastInUserPath = userPath.length > 0 && areCellsEqual(position, userPath[userPath.length - 1]);
    
    // 确定求解动画中的单元格状态
    let isVisited = false;
    let isInSolutionPath = false;
    
    // 如果有求解步骤并且当前有效的求解步骤索引
    if (solvingSteps.length > 0 && currentSolvingStep >= 0 && currentSolvingStep < solvingSteps.length) {
      const currentStep = solvingSteps[currentSolvingStep];
      isVisited = currentStep.visitedCells.some((pos) => areCellsEqual(pos, position));
      isInSolutionPath = currentStep.path.some((pos) => areCellsEqual(pos, position));
    }
    
    // 确定墙体类名，根据染色状态
    const northWallClass = cell.walls.north ? 
      (cell.coloredWalls?.north ? 'wall-north-colored' : 'wall-north-uncolored') : '';
    const eastWallClass = cell.walls.east ? 
      (cell.coloredWalls?.east ? 'wall-east-colored' : 'wall-east-uncolored') : '';
    const southWallClass = cell.walls.south ? 
      (cell.coloredWalls?.south ? 'wall-south-colored' : 'wall-south-uncolored') : '';
    const westWallClass = cell.walls.west ? 
      (cell.coloredWalls?.west ? 'wall-west-colored' : 'wall-west-uncolored') : '';
    
    // 确定单元格类名
    const cellClassName = [
      'maze-cell',
      northWallClass,
      eastWallClass,
      southWallClass,
      westWallClass,
      isStart ? 'start-cell' : '',
      isEnd ? 'end-cell' : '',
      isInUserPath ? 'user-path' : '',
      isLastInUserPath ? 'user-path-head' : '',
      isVisited && !isInSolutionPath ? 'visited-cell' : '',
      isInSolutionPath ? 'solution-path' : '',
      isPathDrawing ? 'path-drawing' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={`cell-${row}-${col}`}
        data-key={`${row}-${col}`}
        className={cellClassName}
      />
    );
  };

  // 处理迷宫尺寸变化
  const handleCellSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setCellSize(size);
  };

  // 重置缩放和偏移
  const resetZoomAndPan = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="maze-container">
      <MazeControls
        rows={mazeHeight}
        cols={mazeWidth}
        algorithm={generationAlgorithm}
        solvingAlgorithm={solvingAlgorithm}
        onRowsChange={(rows) => setMazeSize(mazeWidth, rows)}
        onColsChange={(cols) => setMazeSize(cols, mazeHeight)}
        onAlgorithmChange={setGenerationAlgorithm}
        onSolvingAlgorithmChange={setSolvingAlgorithm}
        onGenerate={handleGenerateMaze}
        onSolve={solveMaze}
        animationSpeed={animationSpeed}
        onAnimationSpeedChange={setAnimationSpeed}
        animationEnabled={generationAnimationEnabled}
        onAnimationEnabledChange={handleGenerationAnimationChange}
        solvingAnimationEnabled={solvingAnimationEnabled}
        onSolvingAnimationEnabledChange={setSolvingAnimationEnabled}
        isGenerating={isGenerating}
        isSolving={isSolving}
        currentGenerationStep={currentGenerationStep}
        generationStepsLength={generationSteps.length}
        onReset={resetCurrentMaze}
        grid={grid}
        onCompleteGeneration={completeGeneration}
        onCompleteSolving={completeSolving}
      />
      
      <div className="maze-view-controls">
        <label htmlFor="cell-size">迷宫视图大小:</label>
        <input
          id="cell-size"
          type="range"
          min="10"
          max="50"
          step="5"
          value={cellSize}
          onChange={handleCellSizeChange}
        />
        <span>{cellSize}px</span>
        <button className="reset-zoom-btn" onClick={resetZoomAndPan}>重置视图</button>
      </div>
      
      <div className="maze-grid-container">
        <div
          ref={mazeRef}
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${mazeWidth}, 1fr)`,
            gridTemplateRows: `repeat(${mazeHeight}, 1fr)`,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transformOrigin: 'center center',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => handleMouseMove(e)}
          onMouseUp={(e) => handleMouseUp(e)}
          onMouseLeave={(e) => handleMouseLeave(e)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const cellElement = renderCell(cell, rowIndex, colIndex);
              // 应用动态样式覆盖CSS中的默认尺寸
              return React.cloneElement(cellElement, {
                style: {
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  minWidth: `${cellSize}px`,
                  minHeight: `${cellSize}px`,
                }
              });
            })
          )}
        </div>
      </div>
      
      <div className="maze-status">
        {isGenerating && <p>正在生成迷宫... (步骤 {currentGenerationStep + 1}/{generationSteps.length})</p>}
        {isSolving && <p>正在求解迷宫... (步骤 {currentSolvingStep + 1}/{solvingSteps.length})</p>}
        {solved && !isGenerating && !isSolving && <p>恭喜！解迷时间: {solvingTime}秒</p>}
        {!isGenerating && !isSolving && !solved && <p>点击起点开始解迷，自动寻找通往终点的路径</p>}
      </div>
    </div>
  );
}; 