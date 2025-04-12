import React, { useState } from 'react';
import { Maze } from './components/Maze';
import { MazeGenerationAlgorithm, MazeSolvingAlgorithm } from './types/maze';
import './App.css';

const App: React.FC = () => {
  const [mazeWidth, setMazeWidth] = useState(15);
  const [mazeHeight, setMazeHeight] = useState(15);
  const [generationAlgorithm, setGenerationAlgorithm] = useState(MazeGenerationAlgorithm.DFS);
  const [solvingAlgorithm, setSolvingAlgorithm] = useState(MazeSolvingAlgorithm.BFS);

  return (
    <div className="app">
      <header className="app-header">
        <h1>MultiMaze</h1>
        <p>Explore Different Maze Generation and Solving Algorithms</p>
      </header>

      <main className="app-main">
        <Maze 
          width={mazeWidth}
          height={mazeHeight}
          initialGenerationAlgorithm={generationAlgorithm}
          initialSolvingAlgorithm={solvingAlgorithm}
        />
      </main>

      <footer className="app-footer">
        <p>MultiMaze © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
