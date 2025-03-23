import { useCallback, useEffect, useReducer, useState } from 'react';
import { Cell, CellPosition, MazeGenerationAlgorithm, MazeGenerationStep, MazeSolvingAlgorithm, MazeSolvingStep } from '../types/maze';
import { mazeGenerationAlgorithms, mazeSolvingAlgorithms } from '../algorithms';
import { areCellsEqual, hasWallBetween, colorAllWalls } from '../utils/mazeUtils';

// 迷宫状态
interface MazeState {
  grid: Cell[][];
  width: number;
  height: number;
  start: CellPosition;
  end: CellPosition;
  userPath: CellPosition[];
  generationAlgorithm: MazeGenerationAlgorithm;
  solvingAlgorithm: MazeSolvingAlgorithm;
  isGenerating: boolean;
  isSolving: boolean;
  generationSteps: MazeGenerationStep[];
  solvingSteps: MazeSolvingStep[];
  currentGenerationStep: number;
  currentSolvingStep: number;
  generationAnimationEnabled: boolean;
  solvingAnimationEnabled: boolean;
  animationSpeed: number;
  animationPlaying: boolean;
  startTime: number | null;
  endTime: number | null;
  solved: boolean;
}

// 迷宫动作类型
type MazeAction =
  | { type: 'SET_SIZE'; width: number; height: number }
  | { type: 'SET_GENERATION_ALGORITHM'; algorithm: MazeGenerationAlgorithm }
  | { type: 'SET_SOLVING_ALGORITHM'; algorithm: MazeSolvingAlgorithm }
  | { type: 'GENERATE_MAZE' }
  | { type: 'SOLVE_MAZE' }
  | { type: 'SET_GENERATION_STEP'; step: number }
  | { type: 'SET_SOLVING_STEP'; step: number }
  | { type: 'SET_GENERATION_ANIMATION_ENABLED'; enabled: boolean }
  | { type: 'SET_SOLVING_ANIMATION_ENABLED'; enabled: boolean }
  | { type: 'SET_ANIMATION_SPEED'; speed: number }
  | { type: 'SET_ANIMATION_PLAYING'; playing: boolean }
  | { type: 'ADD_USER_PATH'; position: CellPosition }
  | { type: 'CLEAR_USER_PATH' }
  | { type: 'RESET_MAZE' }
  | { type: 'RESET_CURRENT_MAZE' }
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER' };

// 初始状态
const initialState: MazeState = {
  grid: [],
  width: 15,
  height: 15,
  start: { row: 0, col: 0 },
  end: { row: 14, col: 14 },
  userPath: [],
  generationAlgorithm: MazeGenerationAlgorithm.DFS,
  solvingAlgorithm: MazeSolvingAlgorithm.DFS,
  isGenerating: false,
  isSolving: false,
  generationSteps: [],
  solvingSteps: [],
  currentGenerationStep: -1,
  currentSolvingStep: -1,
  generationAnimationEnabled: true,
  solvingAnimationEnabled: true,
  animationSpeed: 10,
  animationPlaying: false,
  startTime: null,
  endTime: null,
  solved: false,
};

// 将枚举值转换为字符串键名
const getGenerationAlgorithmKey = (algorithm: MazeGenerationAlgorithm): keyof typeof mazeGenerationAlgorithms => {
  switch (algorithm) {
    case MazeGenerationAlgorithm.DFS:
      return 'DFS';
    case MazeGenerationAlgorithm.BINARY_TREE:
      return 'BINARY_TREE';
    case MazeGenerationAlgorithm.SIDEWINDER:
      return 'SIDEWINDER';
    case MazeGenerationAlgorithm.ELLER:
      return 'ELLER';
    case MazeGenerationAlgorithm.PRIM:
      return 'PRIM';
    case MazeGenerationAlgorithm.KRUSKAL:
      return 'KRUSKAL';
    case MazeGenerationAlgorithm.RECURSIVE_DIVISION:
      return 'RECURSIVE_DIVISION';
    case MazeGenerationAlgorithm.ALDOUS_BRODER:
      return 'ALDOUS_BRODER';
    default:
      return 'DFS';
  }
};

// 将枚举值转换为字符串键名
const getSolvingAlgorithmKey = (algorithm: MazeSolvingAlgorithm): keyof typeof mazeSolvingAlgorithms => {
  switch (algorithm) {
    case MazeSolvingAlgorithm.DFS:
      return 'DFS';
    case MazeSolvingAlgorithm.BFS:
      return 'BFS';
    default:
      return 'DFS';
  }
};

// 迷宫状态reducer
const mazeReducer = (state: MazeState, action: MazeAction): MazeState => {
  switch (action.type) {
    case 'SET_SIZE':
      return {
        ...state,
        width: action.width,
        height: action.height,
        end: { row: action.height - 1, col: action.width - 1 },
      };
    
    case 'SET_GENERATION_ALGORITHM':
      return {
        ...state,
        generationAlgorithm: action.algorithm,
      };
    
    case 'SET_SOLVING_ALGORITHM':
      return {
        ...state,
        solvingAlgorithm: action.algorithm,
      };
    
    case 'GENERATE_MAZE': {
      const generationAlgorithmKey = getGenerationAlgorithmKey(state.generationAlgorithm);
      const generationSteps = mazeGenerationAlgorithms[generationAlgorithmKey](state.width, state.height);
      const useAnimation = state.generationAnimationEnabled;
      
      // 如果不启用动画，将所有墙体染色
      if (!useAnimation) {
        const lastStep = generationSteps[generationSteps.length - 1];
        colorAllWalls(lastStep.cells);
      }
      
      return {
        ...state,
        isGenerating: useAnimation,
        generationSteps,
        currentGenerationStep: useAnimation ? 0 : generationSteps.length - 1,
        grid: generationSteps[useAnimation ? 0 : generationSteps.length - 1].cells,
        userPath: [],
        solvingSteps: [],
        currentSolvingStep: -1,
        isSolving: false,
        startTime: null,
        endTime: null,
        solved: false,
      };
    }
    
    case 'SOLVE_MAZE': {
      const solvingAlgorithmKey = getSolvingAlgorithmKey(state.solvingAlgorithm);
      const maze = {
        cells: state.grid,
        width: state.width,
        height: state.height,
        start: state.start,
        end: state.end,
      };
      const solvingSteps = mazeSolvingAlgorithms[solvingAlgorithmKey](maze);
      const useAnimation = state.solvingAnimationEnabled;
      
      // 如果不使用动画，为了计算解决时间，需要启动计时器
      const currentTime = Date.now();
      
      return {
        ...state,
        isSolving: useAnimation,
        solvingSteps,
        currentSolvingStep: useAnimation ? 0 : solvingSteps.length - 1,
        userPath: [],
        startTime: state.startTime || currentTime, // 如果没有开始时间，设置当前时间
        endTime: !useAnimation ? currentTime : null, // 如果不使用动画，直接结束计时
        solved: !useAnimation, // 如果不启用动画，直接标记为已解决
      };
    }
    
    case 'SET_GENERATION_STEP':
      if (action.step < 0 || action.step >= state.generationSteps.length) {
        return state;
      }
      return {
        ...state,
        currentGenerationStep: action.step,
        grid: state.generationSteps[action.step].cells,
        isGenerating: action.step < state.generationSteps.length - 1,
      };
    
    case 'SET_SOLVING_STEP':
      if (action.step < 0 || action.step >= state.solvingSteps.length) {
        return state;
      }
      return {
        ...state,
        currentSolvingStep: action.step,
        isSolving: action.step < state.solvingSteps.length - 1,
        solved: action.step === state.solvingSteps.length - 1,
      };
    
    case 'SET_GENERATION_ANIMATION_ENABLED':
      return {
        ...state,
        generationAnimationEnabled: action.enabled,
      };
    
    case 'SET_SOLVING_ANIMATION_ENABLED':
      return {
        ...state,
        solvingAnimationEnabled: action.enabled,
      };
    
    case 'SET_ANIMATION_SPEED':
      return {
        ...state,
        animationSpeed: action.speed,
      };
    
    case 'SET_ANIMATION_PLAYING':
      return {
        ...state,
        animationPlaying: action.playing,
      };
    
    case 'ADD_USER_PATH': {
      // 如果迷宫正在生成或解决，不允许添加用户路径
      if (state.isGenerating || state.isSolving) {
        return state;
      }

      const newPosition = action.position;
      const { userPath } = state;

      // 如果路径为空，只允许从起点开始
      if (userPath.length === 0) {
        if (areCellsEqual(newPosition, state.start)) {
          return {
            ...state,
            userPath: [newPosition],
            startTime: state.startTime === null ? Date.now() : state.startTime,
          };
        }
        return state;
      }

      // 检查新位置是否是最后一个位置的邻居，且之间没有墙
      const lastPosition = userPath[userPath.length - 1];
      
      // 检查是否相邻且无墙
      const isAdjacent = 
        (Math.abs(newPosition.row - lastPosition.row) === 1 && newPosition.col === lastPosition.col) ||
        (Math.abs(newPosition.col - lastPosition.col) === 1 && newPosition.row === lastPosition.row);
      
      if (!isAdjacent || hasWallBetween(lastPosition, newPosition, state.grid)) {
        return state;
      }

      // 检查是否已经在路径中
      const alreadyInPath = userPath.some(pos => areCellsEqual(pos, newPosition));
      if (alreadyInPath) {
        // 如果新位置已经在路径中，截断路径
        const index = userPath.findIndex(pos => areCellsEqual(pos, newPosition));
        return {
          ...state,
          userPath: userPath.slice(0, index + 1),
        };
      }

      // 添加新位置到路径
      const newPath = [...userPath, newPosition];
      
      // 检查是否到达终点
      const reachedEnd = areCellsEqual(newPosition, state.end);
      
      return {
        ...state,
        userPath: newPath,
        endTime: reachedEnd ? Date.now() : state.endTime,
        solved: reachedEnd,
      };
    }
    
    case 'CLEAR_USER_PATH':
      return {
        ...state,
        userPath: [],
        startTime: null,
        endTime: null,
        solved: false,
      };
    
    case 'RESET_CURRENT_MAZE':
      // 清除用户路径和求解状态，但保留当前迷宫
      return {
        ...state,
        userPath: [],
        solvingSteps: [],
        currentSolvingStep: -1,
        isSolving: false,
        startTime: null,
        endTime: null,
        solved: false,
      };
    
    case 'RESET_MAZE':
      // 完全重置迷宫
      return {
        ...initialState,
        width: state.width,
        height: state.height,
        end: { row: state.height - 1, col: state.width - 1 },
        generationAlgorithm: state.generationAlgorithm,
        solvingAlgorithm: state.solvingAlgorithm,
        generationAnimationEnabled: state.generationAnimationEnabled,
        solvingAnimationEnabled: state.solvingAnimationEnabled,
        animationSpeed: state.animationSpeed,
      };
    
    case 'START_TIMER':
      return {
        ...state,
        startTime: Date.now(),
      };
    
    case 'STOP_TIMER':
      return {
        ...state,
        endTime: Date.now(),
      };
    
    default:
      return state;
  }
};

// 自定义Hook
export const useMaze = () => {
  const [state, dispatch] = useReducer(mazeReducer, initialState);
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);

  // 生成迷宫
  const generateMaze = useCallback(() => {
    dispatch({ type: 'GENERATE_MAZE' });
    // 如果启用了生成动画，自动开始播放
    if (state.generationAnimationEnabled) {
      dispatch({ type: 'SET_ANIMATION_PLAYING', playing: true });
    }
  }, [state.generationAnimationEnabled]);

  // 求解迷宫
  const solveMaze = useCallback(() => {
    if (state.currentGenerationStep === state.generationSteps.length - 1) {
      dispatch({ type: 'SOLVE_MAZE' });
      // 如果启用了求解动画，自动开始播放
      if (state.solvingAnimationEnabled) {
        dispatch({ type: 'SET_ANIMATION_PLAYING', playing: true });
      }
    }
  }, [state.currentGenerationStep, state.generationSteps.length, state.solvingAnimationEnabled]);

  // 设置迷宫大小
  const setMazeSize = useCallback((width: number, height: number) => {
    dispatch({ type: 'SET_SIZE', width, height });
  }, []);

  // 设置生成算法
  const setGenerationAlgorithm = useCallback((algorithm: MazeGenerationAlgorithm) => {
    dispatch({ type: 'SET_GENERATION_ALGORITHM', algorithm });
  }, []);

  // 设置求解算法
  const setSolvingAlgorithm = useCallback((algorithm: MazeSolvingAlgorithm) => {
    dispatch({ type: 'SET_SOLVING_ALGORITHM', algorithm });
  }, []);

  // 设置生成动画启用状态
  const setGenerationAnimationEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_GENERATION_ANIMATION_ENABLED', enabled });
  }, []);

  // 设置求解动画启用状态
  const setSolvingAnimationEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_SOLVING_ANIMATION_ENABLED', enabled });
  }, []);

  // 设置动画速度
  const setAnimationSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_ANIMATION_SPEED', speed });
  }, []);

  // 播放/暂停动画
  const toggleAnimationPlaying = useCallback(() => {
    dispatch({ type: 'SET_ANIMATION_PLAYING', playing: !state.animationPlaying });
  }, [state.animationPlaying]);

  // 直接完成迷宫生成
  const completeGeneration = useCallback(() => {
    if (state.isGenerating && state.currentGenerationStep < state.generationSteps.length - 1) {
      // 设置为最后一步
      dispatch({ type: 'SET_GENERATION_STEP', step: state.generationSteps.length - 1 });
      // 更新网格
      dispatch({ type: 'SET_ANIMATION_PLAYING', playing: false });
    }
  }, [state.isGenerating, state.currentGenerationStep, state.generationSteps.length]);

  // 直接完成迷宫求解
  const completeSolving = useCallback(() => {
    if (state.isSolving && state.currentSolvingStep < state.solvingSteps.length - 1) {
      // 设置为最后一步
      dispatch({ type: 'SET_SOLVING_STEP', step: state.solvingSteps.length - 1 });
      // 暂停动画
      dispatch({ type: 'SET_ANIMATION_PLAYING', playing: false });
    }
  }, [state.isSolving, state.currentSolvingStep, state.solvingSteps.length]);

  // 添加用户路径
  const addUserPath = useCallback((position: CellPosition) => {
    dispatch({ type: 'ADD_USER_PATH', position });
  }, []);

  // 清除用户路径
  const clearUserPath = useCallback(() => {
    dispatch({ type: 'CLEAR_USER_PATH' });
  }, []);

  // 重置当前迷宫（保留结构但清除标记）
  const resetCurrentMaze = useCallback(() => {
    dispatch({ type: 'RESET_CURRENT_MAZE' });
  }, []);

  // 完全重置迷宫（生成新迷宫）
  const resetMaze = useCallback(() => {
    dispatch({ type: 'RESET_MAZE' });
  }, []);

  // 动画效果
  useEffect(() => {
    if (state.animationPlaying) {
      if (state.isGenerating && state.currentGenerationStep < state.generationSteps.length - 1 && state.generationAnimationEnabled) {
        // 生成动画
        const timer = setTimeout(() => {
          dispatch({ type: 'SET_GENERATION_STEP', step: state.currentGenerationStep + 1 });
        }, state.animationSpeed);
        setAnimationTimer(timer);
        return () => {
          if (timer) clearTimeout(timer);
        };
      } else if (state.isSolving && state.currentSolvingStep < state.solvingSteps.length - 1 && state.solvingAnimationEnabled) {
        // 求解动画
        const timer = setTimeout(() => {
          dispatch({ type: 'SET_SOLVING_STEP', step: state.currentSolvingStep + 1 });
        }, state.animationSpeed);
        setAnimationTimer(timer);
        return () => {
          if (timer) clearTimeout(timer);
        };
      } else {
        // 动画完成，停止播放
        dispatch({ type: 'SET_ANIMATION_PLAYING', playing: false });
      }
    }
    return undefined;
  }, [
    state.animationPlaying,
    state.isGenerating,
    state.isSolving,
    state.currentGenerationStep,
    state.currentSolvingStep,
    state.generationSteps.length,
    state.solvingSteps.length,
    state.animationSpeed,
    state.generationAnimationEnabled,
    state.solvingAnimationEnabled,
  ]);

  // 自动开始计时器
  useEffect(() => {
    if (state.currentGenerationStep === state.generationSteps.length - 1 && 
        state.startTime === null && 
        !state.isSolving) {
      dispatch({ type: 'START_TIMER' });
    }
  }, [state.currentGenerationStep, state.generationSteps.length, state.startTime, state.isSolving]);

  return {
    ...state,
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
    resetCurrentMaze,
    resetMaze,
  };
}; 