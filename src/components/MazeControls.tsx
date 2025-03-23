import React, { useState } from 'react';
import { MazeGenerationAlgorithm, Cell, MazeSolvingAlgorithm } from '../types/maze';
import SolveControls from './SolveControls';
import MinecraftExporter from './MinecraftExporter';
import './MazeControls.css';

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

interface MazeControlsProps {
  rows: number;
  cols: number;
  algorithm: MazeGenerationAlgorithm;
  solvingAlgorithm: MazeSolvingAlgorithm;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  onAlgorithmChange: (algorithm: MazeGenerationAlgorithm) => void;
  onSolvingAlgorithmChange: (algorithm: MazeSolvingAlgorithm) => void;
  onGenerate: () => void;
  onSolve: () => void;
  animationSpeed: number;
  onAnimationSpeedChange: (speed: number) => void;
  animationEnabled: boolean;
  onAnimationEnabledChange: (enabled: boolean) => void;
  solvingAnimationEnabled: boolean;
  onSolvingAnimationEnabledChange: (enabled: boolean) => void;
  isGenerating: boolean;
  isSolving: boolean;
  currentGenerationStep: number;
  generationStepsLength: number;
  onReset: () => void;
  grid: Cell[][];
  onCompleteGeneration?: () => void;
  onCompleteSolving?: () => void;
}

const MazeControls: React.FC<MazeControlsProps> = ({
  rows,
  cols,
  algorithm,
  solvingAlgorithm,
  onRowsChange,
  onColsChange,
  onAlgorithmChange,
  onSolvingAlgorithmChange,
  onGenerate,
  onSolve,
  animationSpeed,
  onAnimationSpeedChange,
  animationEnabled,
  onAnimationEnabledChange,
  solvingAnimationEnabled,
  onSolvingAnimationEnabledChange,
  isGenerating,
  isSolving,
  currentGenerationStep,
  generationStepsLength,
  onReset,
  grid,
  onCompleteGeneration,
  onCompleteSolving
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [rowsInput, setRowsInput] = useState<string | number>(rows);
  const [colsInput, setColsInput] = useState<string | number>(cols);

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setRowsInput('');
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        setRowsInput(parsedValue);
        onRowsChange(parsedValue);
      }
    }
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '') {
      setColsInput('');
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        setColsInput(parsedValue);
        onColsChange(parsedValue);
      }
    }
  };

  const handleInputBlur = (setter: React.Dispatch<React.SetStateAction<string | number>>, onChange: (value: number) => void, defaultValue: number) => {
    return (e: React.FocusEvent<HTMLInputElement>) => {
      const currentValue = e.target.value;
      if (currentValue === '') {
        setter(defaultValue);
        onChange(defaultValue);
      }
    };
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const algorithmOptions = [
    { value: MazeGenerationAlgorithm.DFS, label: 'Depth-First Search' },
    { value: MazeGenerationAlgorithm.KRUSKAL, label: 'Kruskal\'s Algorithm' },
    { value: MazeGenerationAlgorithm.PRIM, label: 'Prim\'s Algorithm' },
    { value: MazeGenerationAlgorithm.ALDOUS_BRODER, label: 'Aldous-Broder Algorithm' },
    { value: MazeGenerationAlgorithm.RECURSIVE_DIVISION, label: 'Recursive Division' },
    { value: MazeGenerationAlgorithm.BINARY_TREE, label: 'Binary Tree' },
    { value: MazeGenerationAlgorithm.SIDEWINDER, label: 'Sidewinder' },
    { value: MazeGenerationAlgorithm.ELLER, label: 'Eller\'s Algorithm' },
  ];

  return (
    <div className="maze-controls">
      <div className="control-section">
        <h3
          className="section-header"
          onClick={() => toggleSection('generation')}
        >
          Maze Generation 
          <span className="toggle-icon">
            {expandedSection === 'generation' ? '▼' : '▶'}
          </span>
        </h3>
        
        {expandedSection === 'generation' && (
          <div className="section-content">
            <div className="control-row">
              <label htmlFor="rows">Rows:</label>
              <input
                id="rows"
                type="number"
                min="3"
                max="50"
                value={rowsInput}
                onChange={handleRowsChange}
                onBlur={handleInputBlur(setRowsInput, onRowsChange, 10)}
              />
            </div>
            
            <div className="control-row">
              <label htmlFor="cols">Columns:</label>
              <input
                id="cols"
                type="number"
                min="3"
                max="50"
                value={colsInput}
                onChange={handleColsChange}
                onBlur={handleInputBlur(setColsInput, onColsChange, 10)}
              />
            </div>
            
            <div className="control-row">
              <label htmlFor="algorithm">Algorithm:</label>
              <Select
                id="algorithm"
                className="algorithm-select"
                value={algorithmOptions.find(option => option.value === algorithm)}
                onChange={(selectedOption) => {
                  onAlgorithmChange(selectedOption.value as MazeGenerationAlgorithm);
                }}
                options={algorithmOptions}
              />
            </div>
            
            <div className="control-row">
              <label htmlFor="animation-speed">Animation Speed:</label>
              <input
                id="animation-speed"
                type="range"
                min="1"
                max="20"
                step="1"
                value={animationSpeed}
                onChange={(e) => onAnimationSpeedChange(parseInt(e.target.value, 10))}
              />
              <span>{animationSpeed} ms</span>
            </div>
            
            <div className="checkbox-row">
              <label htmlFor="animation-enabled">Enable Animation:</label>
              <input
                id="animation-enabled"
                type="checkbox"
                checked={animationEnabled}
                onChange={(e) => onAnimationEnabledChange(e.target.checked)}
              />
            </div>
            
            <div className="button-row">
              <button
                onClick={onGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Maze'}
              </button>
              {isGenerating && onCompleteGeneration && (
                <button onClick={onCompleteGeneration}>
                  Skip Animation
                </button>
              )}
              <button 
                onClick={onReset}
                disabled={isGenerating}
              >
                Reset Marks
              </button>
            </div>
          </div>
        )}
      </div>
      
      <SolveControls 
        isGenerating={isGenerating} 
        isSolving={isSolving}
        currentGenerationStep={currentGenerationStep}
        generationStepsLength={generationStepsLength}
        solvingAlgorithm={solvingAlgorithm}
        solvingAnimationEnabled={solvingAnimationEnabled}
        onSolve={onSolve}
        onSetSolvingAlgorithm={onSolvingAlgorithmChange}
        onSetSolvingAnimationEnabled={onSolvingAnimationEnabledChange}
        onCompleteSolving={onCompleteSolving}
      />
      
      <div className="control-section">
        <h3
          className="section-header"
          onClick={() => toggleSection('minecraft')}
        >
          Minecraft Export 
          <span className="toggle-icon">
            {expandedSection === 'minecraft' ? '▼' : '▶'}
          </span>
        </h3>
        
        {expandedSection === 'minecraft' && (
          <div className="section-content">
            <MinecraftExporter grid={grid} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MazeControls; 