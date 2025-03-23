import React, { useEffect, useRef, useState } from 'react';
import { Cell, CellPosition, MazeGenerationAlgorithm, MazeSolvingAlgorithm } from '../types/maze';
import { useMaze } from '../hooks/useMaze';
import { areCellsEqual } from '../utils/mazeUtils';
import MazeControls from './MazeControls';
import './Maze.css';

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
  
  // 添加一个变量跟踪是否刚更改了动画设置
  const justChangedAnimationRef = useRef(false);

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

  // 处理单元格点击
  const handleCellClick = (position: CellPosition) => {
    if (currentGenerationStep === generationSteps.length - 1 && !isSolving) {
      addUserPath(position);
      setLastCellVisited(position);
    }
  };
  
  // 处理鼠标按下
  const handleMouseDown = (position: CellPosition) => {
    if (currentGenerationStep === generationSteps.length - 1 && !isSolving) {
      setIsDragging(true);
      handleCellClick(position);
    }
  };
  
  // 处理鼠标移动
  const handleMouseMove = (position: CellPosition) => {
    if (isDragging && lastCellVisited && !isSolving &&
        currentGenerationStep === generationSteps.length - 1) {
      // 确保移动到了一个新的单元格
      if (!areCellsEqual(position, lastCellVisited)) {
        addUserPath(position);
        setLastCellVisited(position);
      }
    }
  };
  
  // 处理鼠标松开
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // 处理鼠标离开迷宫区域
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentGenerationStep === generationSteps.length - 1 && !isSolving) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      if (element && element.classList.contains('maze-cell')) {
        const key = element.getAttribute('data-key');
        if (key) {
          const [row, col] = key.split('-').map(Number);
          const position = { row, col };
          
          setIsDragging(true);
          handleCellClick(position);
        }
      }
    }
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && lastCellVisited && !isSolving &&
        currentGenerationStep === generationSteps.length - 1) {
      const touch = e.touches[0];
      const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      
      if (element && element.classList.contains('maze-cell')) {
        const key = element.getAttribute('data-key');
        if (key) {
          const [row, col] = key.split('-').map(Number);
          const position = { row, col };
          
          if (!areCellsEqual(position, lastCellVisited)) {
            addUserPath(position);
            setLastCellVisited(position);
          }
        }
      }
    }
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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
      isDragging ? 'dragging' : '',
    ].filter(Boolean).join(' ');

    return (
      <div
        key={`cell-${row}-${col}`}
        data-key={`${row}-${col}`}
        className={cellClassName}
        onClick={() => handleCellClick(position)}
        onMouseDown={(e) => {
          // 只处理左键点击
          if (e.button === 0) {
            handleMouseDown(position);
          }
        }}
        onMouseMove={() => handleMouseMove(position)}
        onMouseUp={handleMouseUp}
        onTouchStart={(e) => {
          e.stopPropagation();
          handleMouseDown(position);
        }}
        onTouchMove={(e) => {
          e.stopPropagation();
          handleMouseMove(position);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          handleMouseUp();
        }}
      />
    );
  };

  // 处理迷宫尺寸变化
  const handleCellSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setCellSize(size);
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
      </div>
      
      <div className="maze-grid-container">
        <div
          ref={mazeRef}
          className="maze-grid"
          style={{
            gridTemplateColumns: `repeat(${mazeWidth}, 1fr)`,
            gridTemplateRows: `repeat(${mazeHeight}, 1fr)`,
          }}
          onMouseLeave={handleMouseLeave}
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