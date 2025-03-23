import { Cell, CellPosition, MazeGenerationAlgorithm, MazeGenerationStep, MazeSolvingAlgorithm, MazeSolvingStep } from './maze';

// 应用状态
export interface AppState {
  maze: MazeState;
  algorithm: AlgorithmState;
  animation: AnimationState;
  ui: UIState;
  timer: TimerState;
}

// 迷宫状态
export interface MazeState {
  grid: Cell[][];
  width: number;
  height: number;
  start: CellPosition;
  end: CellPosition;
  generatedPath: CellPosition[];
  userPath: CellPosition[];
}

// 算法状态
export interface AlgorithmState {
  generationAlgorithm: MazeGenerationAlgorithm;
  solvingAlgorithm: MazeSolvingAlgorithm;
  isGenerating: boolean;
  isSolving: boolean;
  generationSteps: MazeGenerationStep[];
  solvingSteps: MazeSolvingStep[];
  currentGenerationStepIndex: number;
  currentSolvingStepIndex: number;
}

// 动画状态
export interface AnimationState {
  enabled: boolean;
  speed: number;
  isPlaying: boolean;
}

// UI状态
export interface UIState {
  scale: number;
  offset: { x: number; y: number };
  isMobile: boolean;
}

// 计时器状态
export interface TimerState {
  start: number | null;
  end: number | null;
} 