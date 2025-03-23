import React, { useState } from 'react';
import { MazeSolvingAlgorithm } from '../types/maze';
import './SolveControls.css';

// 简单的自定义Select组件
interface SelectOption {
  value: any;
  label: string;
}

interface SelectProps {
  id?: string;
  className?: string;
  value?: SelectOption;
  onChange: (option: SelectOption) => void;
  options: SelectOption[];
  isDisabled?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  id, 
  className, 
  value, 
  onChange, 
  options, 
  isDisabled 
}) => {
  return (
    <select
      id={id}
      className={className}
      value={value?.value}
      onChange={(e) => {
        const selectedOption = options.find(option => 
          option.value.toString() === e.target.value
        );
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
      disabled={isDisabled}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface SolveControlsProps {
  isGenerating: boolean;
  isSolving: boolean;
  currentGenerationStep: number;
  generationStepsLength: number;
  solvingAlgorithm: MazeSolvingAlgorithm;
  solvingAnimationEnabled: boolean;
  onSolve: () => void;
  onSetSolvingAlgorithm: (algorithm: MazeSolvingAlgorithm) => void;
  onSetSolvingAnimationEnabled: (enabled: boolean) => void;
  onCompleteSolving?: () => void;
}

const SolveControls: React.FC<SolveControlsProps> = ({
  isGenerating,
  isSolving,
  currentGenerationStep,
  generationStepsLength,
  solvingAlgorithm,
  solvingAnimationEnabled,
  onSolve,
  onSetSolvingAlgorithm,
  onSetSolvingAnimationEnabled,
  onCompleteSolving
}) => {
  const [expandedSection, setExpandedSection] = useState<boolean>(false);

  const toggleSection = () => {
    setExpandedSection(!expandedSection);
  };

  const algorithmOptions = [
    { value: MazeSolvingAlgorithm.DFS, label: 'Depth-First Search' },
    { value: MazeSolvingAlgorithm.BFS, label: 'Breadth-First Search' },
  ];

  // 检查迷宫是否已完成生成
  const isMazeGenerated = currentGenerationStep === generationStepsLength - 1;
  const canSolve = isMazeGenerated && !isGenerating && !isSolving;

  return (
    <div className="control-section">
      <h3
        className="section-header"
        onClick={toggleSection}
      >
        Maze Solving
        <span className="toggle-icon">
          {expandedSection ? '▼' : '▶'}
        </span>
      </h3>
      
      {expandedSection && (
        <div className="section-content">
          <div className="control-row">
            <label htmlFor="solve-algorithm">Algorithm:</label>
            <Select
              id="solve-algorithm"
              className="algorithm-select"
              value={algorithmOptions.find(option => option.value === solvingAlgorithm)}
              onChange={(selectedOption) => {
                onSetSolvingAlgorithm(selectedOption.value as MazeSolvingAlgorithm);
              }}
              options={algorithmOptions}
              isDisabled={isSolving}
            />
          </div>
          
          <div className="control-row">
            <div className="checkbox-control">
              <label htmlFor="solving-animation">Enable animation</label>
              <input
                id="solving-animation"
                type="checkbox"
                checked={solvingAnimationEnabled}
                onChange={(e) => onSetSolvingAnimationEnabled(e.target.checked)}
                disabled={isSolving}
              />
            </div>
          </div>
          
          <div className="button-row">
            <button
              disabled={!canSolve}
              onClick={onSolve}
            >
              Solve Maze
            </button>
            {isSolving && onCompleteSolving && (
              <button onClick={onCompleteSolving}>
                Skip Animation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SolveControls; 