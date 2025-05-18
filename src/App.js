import React, { useState, useEffect } from 'react';

const GRID_SIZE = 5;
const TIME_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

function generateGrid() {
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0));
  // simple random walls
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if ((x === 0 && y === 0) || (x === GRID_SIZE - 1 && y === GRID_SIZE - 1)) continue;
      grid[y][x] = Math.random() < 0.2 ? 1 : 0; // 1 = wall
    }
  }
  return grid;
}

export default function App() {
  const [grid, setGrid] = useState(generateGrid);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(Date.now());
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    function handleKey(e) {
      if (ended) return;
      let { x, y } = pos;
      if (e.key === 'ArrowUp' && y > 0 && grid[y - 1][x] === 0) y -= 1;
      if (e.key === 'ArrowDown' && y < GRID_SIZE - 1 && grid[y + 1][x] === 0) y += 1;
      if (e.key === 'ArrowLeft' && x > 0 && grid[y][x - 1] === 0) x -= 1;
      if (e.key === 'ArrowRight' && x < GRID_SIZE - 1 && grid[y][x + 1] === 0) x += 1;
      setPos({ x, y });
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pos, grid, ended]);

  useEffect(() => {
    if (pos.x === GRID_SIZE - 1 && pos.y === GRID_SIZE - 1) {
      setEnded(true);
    }
  }, [pos]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - startTime > TIME_LIMIT_MS) {
        setEnded(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  function newGame() {
    setGrid(generateGrid());
    setPos({ x: 0, y: 0 });
    setStartTime(Date.now());
    setEnded(false);
  }

  return (
    <div className="maze-container">
      <h1>Treasure Maze</h1>
      <div className="board">
        {grid.map((row, y) => (
          <div className="row" key={y}>
            {row.map((cell, x) => {
              const isPlayer = pos.x === x && pos.y === y;
              const isGoal = x === GRID_SIZE - 1 && y === GRID_SIZE - 1;
              const className = `cell ${cell === 1 ? 'wall' : ''} ${isPlayer ? 'player' : ''} ${isGoal ? 'goal' : ''}`;
              return <div key={x} className={className} />;
            })}
          </div>
        ))}
      </div>
      {ended && (
        <div className="overlay">
          {pos.x === GRID_SIZE - 1 && pos.y === GRID_SIZE - 1 ? 'You found the treasure!' : 'Time\u2019s up!'}
          <button onClick={newGame}>Play Again</button>
        </div>
      )}
      <p>Use arrow keys to move. Reach the treasure in the bottom-right corner within 5 minutes.</p>
    </div>
  );
}
