/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import { bfs, dfs } from "../algorithms/graphAlgorithms";

const ROWS = 20;
const COLS = 40;
const DEFAULT_START = { row: 10, col: 8 };
const DEFAULT_END = { row: 10, col: 31 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createNode(row, col) {
  return {
    row,
    col,
    isStart: row === DEFAULT_START.row && col === DEFAULT_START.col,
    isEnd: row === DEFAULT_END.row && col === DEFAULT_END.col,
    isWall: false,
    visited: false,
    previous: null,
  };
}

function createInitialGrid() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push(createNode(r, c));
    }
    grid.push(row);
  }
  return grid;
}

function resetSearchState(grid) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      visited: false,
      previous: null,
    })),
  );
}

function clearWalls(grid) {
  return grid.map((row) =>
    row.map((node) => ({
      ...node,
      isWall: false,
      visited: false,
      previous: null,
    })),
  );
}

export default function GraphVisualizer() {
  const [grid, setGrid] = useState(createInitialGrid);
  const [algorithm, setAlgorithm] = useState("BFS");
  const [delay, setDelay] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState("Click + drag to draw walls. Drag the green/red nodes to move them.");

  const isMouseDownRef = useRef(false);
  const dragModeRef = useRef(null); // "wall" | "start" | "end"
  const isRunningRef = useRef(false);
  const visitedCellsRef = useRef(new Set());
  const pathCellsRef = useRef(new Set());

  useEffect(() => {
    const handleUp = () => {
      isMouseDownRef.current = false;
      dragModeRef.current = null;
    };
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  const updateNode = useCallback((row, col, updater) => {
    setGrid((prev) => {
      const next = prev.slice();
      next[row] = next[row].slice();
      next[row][col] = { ...next[row][col], ...updater(next[row][col]) };
      return next;
    });
  }, []);

  function handleMouseDown(row, col) {
    if (isRunningRef.current) return;
    const node = grid[row][col];
    isMouseDownRef.current = true;

    if (node.isStart) {
      dragModeRef.current = "start";
      return;
    }
    if (node.isEnd) {
      dragModeRef.current = "end";
      return;
    }

    dragModeRef.current = "wall";
    updateNode(row, col, (n) => ({ isWall: !n.isWall }));
  }

  function handleMouseEnter(row, col) {
    if (isRunningRef.current) return;
    if (!isMouseDownRef.current) return;
    const mode = dragModeRef.current;
    if (!mode) return;

    if (mode === "wall") {
      const node = grid[row][col];
      if (node.isStart || node.isEnd) return;
      if (node.isWall) return;
      updateNode(row, col, () => ({ isWall: true }));
      return;
    }

    if (mode === "start" || mode === "end") {
      const node = grid[row][col];
      if (node.isWall) return;
      if (mode === "start" && node.isEnd) return;
      if (mode === "end" && node.isStart) return;

      setGrid((prev) => {
        const next = prev.map((r) => r.slice());
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const cell = next[r][c];
            if (mode === "start" && cell.isStart) next[r][c] = { ...cell, isStart: false };
            if (mode === "end" && cell.isEnd) next[r][c] = { ...cell, isEnd: false };
          }
        }
        const target = next[row][col];
        next[row][col] =
          mode === "start" ? { ...target, isStart: true } : { ...target, isEnd: true };
        return next;
      });
    }
  }

  function findStartAndEnd(g) {
    let start = null;
    let end = null;
    for (const row of g) {
      for (const node of row) {
        if (node.isStart) start = node;
        if (node.isEnd) end = node;
      }
    }
    return { start, end };
  }

  function clearVisualsOnly() {
    visitedCellsRef.current = new Set();
    pathCellsRef.current = new Set();
    const nodes = document.querySelectorAll("[data-node]");
    nodes.forEach((el) => {
      el.classList.remove("node-visited", "node-path");
    });
  }

  async function runAlgorithm() {
    if (isRunningRef.current) return;

    clearVisualsOnly();
    const fresh = resetSearchState(grid);
    setGrid(fresh);

    const { start, end } = findStartAndEnd(fresh);
    if (!start || !end) {
      setStatus("Grid must have a start and end node.");
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    setStatus(`Running ${algorithm}...`);

    const run = algorithm === "BFS" ? bfs : dfs;
    const { visitedOrder, path } = run(fresh, start, end);

    for (let i = 0; i < visitedOrder.length; i++) {
      const node = visitedOrder[i];
      if (!isRunningRef.current) break;
      if (!node.isStart && !node.isEnd) {
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) el.classList.add("node-visited");
        visitedCellsRef.current.add(`${node.row}-${node.col}`);
      }
      if (delay > 0) await sleep(delay);
    }

    if (!isRunningRef.current) {
      return;
    }

    if (path.length === 0) {
      setStatus("No path found.");
      isRunningRef.current = false;
      setIsRunning(false);
      return;
    }

    for (const node of path) {
      if (!node.isStart && !node.isEnd) {
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) el.classList.add("node-path");
        pathCellsRef.current.add(`${node.row}-${node.col}`);
      }
      await sleep(30);
    }

    setStatus(
      `${algorithm} finished. Visited ${visitedOrder.length} nodes, path length ${path.length - 1}.`,
    );
    isRunningRef.current = false;
    setIsRunning(false);
  }

  function stopRun() {
    isRunningRef.current = false;
    setIsRunning(false);
    setStatus("Stopped.");
  }

  function handleClearWalls() {
    if (isRunningRef.current) return;
    clearVisualsOnly();
    setGrid((prev) => clearWalls(prev));
    setStatus("Cleared walls and visualization.");
  }

  function handleClearPath() {
    if (isRunningRef.current) return;
    clearVisualsOnly();
    setGrid((prev) => resetSearchState(prev));
    setStatus("Cleared visualization.");
  }

  function handleReset() {
    if (isRunningRef.current) return;
    clearVisualsOnly();
    setGrid(createInitialGrid());
    setStatus("Grid reset.");
  }

  return (
    <>
      <div className="optionBox">
        <div className="flexItemOption">
          <select
            className="btnOption bg-lightBgColor"
            onChange={(e) => setAlgorithm(e.target.value)}
            value={algorithm}
            disabled={isRunning}
          >
            <option value="BFS">BREADTH-FIRST SEARCH</option>
            <option value="DFS">DEPTH-FIRST SEARCH</option>
          </select>
        </div>

        <div className="flexItemOption">
          <div className="flex justify-between items-center w-full">
            <label className="mx-2">Speed</label>
            <input
              type="range"
              min={0}
              max={100}
              value={100 - delay}
              onChange={(e) => setDelay(100 - Number(e.target.value))}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={handleClearPath} disabled={isRunning}>
            Clear Path
          </button>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={handleClearWalls} disabled={isRunning}>
            Clear Walls
          </button>
        </div>

        <div className="flexItemOption">
          <button className="btnOption" onClick={handleReset} disabled={isRunning}>
            Reset
          </button>
        </div>

        <div className="flexItemOption">
          {isRunning ? (
            <button className="btnOption" onClick={stopRun}>
              Stop
            </button>
          ) : (
            <button className="btnOption" onClick={runAlgorithm}>
              Visualize
            </button>
          )}
        </div>
      </div>

      <div className="mx-10 mt-4 flex flex-wrap gap-4 text-textColor text-sm items-center">
        <Legend className="node-start" label="Start" />
        <Legend className="node-end" label="End" />
        <Legend className="node-wall" label="Wall" />
        <Legend className="node-visited" label="Visited" />
        <Legend className="node-path" label="Shortest Path" />
        <span className="ml-auto opacity-80">{status}</span>
      </div>

      <div
        className="mx-10 my-4 p-2 bg-lightBgColor rounded-md overflow-auto"
        onMouseLeave={() => {
          isMouseDownRef.current = false;
          dragModeRef.current = null;
        }}
      >
        <div
          className="grid gap-[1px] mx-auto select-none"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1.5rem)`,
            width: "max-content",
          }}
        >
          {grid.map((row) =>
            row.map((node) => (
              <div
                key={`${node.row}-${node.col}`}
                id={`node-${node.row}-${node.col}`}
                data-node
                className={`graph-node ${
                  node.isStart
                    ? "node-start"
                    : node.isEnd
                      ? "node-end"
                      : node.isWall
                        ? "node-wall"
                        : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleMouseDown(node.row, node.col);
                }}
                onMouseEnter={() => handleMouseEnter(node.row, node.col)}
              />
            )),
          )}
        </div>
      </div>
    </>
  );
}

function Legend({ className, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`graph-node legend-swatch ${className}`} />
      <span>{label}</span>
    </div>
  );
}
