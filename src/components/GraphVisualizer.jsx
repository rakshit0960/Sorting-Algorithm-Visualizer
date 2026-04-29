/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  astar,
  bfs,
  dfs,
  dijkstra,
  floydWarshall,
  unionFind,
} from "../algorithms/graphAlgorithms";

const ALGORITHMS = {
  BFS: { label: "BREADTH-FIRST SEARCH", run: bfs },
  DFS: { label: "DEPTH-FIRST SEARCH", run: dfs },
  DIJKSTRA: { label: "DIJKSTRA'S ALGORITHM", run: dijkstra },
  ASTAR: { label: "A* SEARCH", run: astar },
  FLOYD_WARSHALL: { label: "FLOYD-WARSHALL", run: floydWarshall, heavy: true },
  UNION_FIND: { label: "UNION-FIND (CONNECTED COMPONENTS)", run: unionFind },
};

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
  const [status, setStatus] = useState(
    "Tap/drag to draw walls. Drag the green/red nodes to move them.",
  );

  const isPointerDownRef = useRef(false);
  const dragModeRef = useRef(null); // "wall" | "start" | "end"
  const lastCellRef = useRef(null); // "row-col" of last processed cell in current drag
  const isRunningRef = useRef(false);
  const visitedCellsRef = useRef(new Set());
  const pathCellsRef = useRef(new Set());

  useEffect(() => {
    const handleUp = () => {
      isPointerDownRef.current = false;
      dragModeRef.current = null;
      lastCellRef.current = null;
    };
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, []);

  const updateNode = useCallback((row, col, updater) => {
    setGrid((prev) => {
      const next = prev.slice();
      next[row] = next[row].slice();
      next[row][col] = { ...next[row][col], ...updater(next[row][col]) };
      return next;
    });
  }, []);

  function pressCell(row, col) {
    if (isRunningRef.current) return;
    const node = grid[row][col];
    isPointerDownRef.current = true;
    lastCellRef.current = `${row}-${col}`;

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

  function enterCell(row, col) {
    if (isRunningRef.current) return;
    if (!isPointerDownRef.current) return;
    const mode = dragModeRef.current;
    if (!mode) return;

    const key = `${row}-${col}`;
    if (lastCellRef.current === key) return;
    lastCellRef.current = key;

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

  function handlePointerDown(e, row, col) {
    e.preventDefault();
    if (e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    pressCell(row, col);
  }

  function handlePointerEnter(row, col) {
    enterCell(row, col);
  }

  // Handle touch drag: pointerenter isn't reliable during touch, so track via pointermove
  function handleGridPointerMove(e) {
    if (!isPointerDownRef.current) return;
    if (e.pointerType !== "touch") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const nodeEl = el.closest("[data-row][data-col]");
    if (!nodeEl) return;
    const row = Number(nodeEl.dataset.row);
    const col = Number(nodeEl.dataset.col);
    enterCell(row, col);
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
      el.classList.remove("node-visited", "node-path", "node-component");
      el.style.backgroundColor = "";
      el.style.borderColor = "";
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

    const algoEntry = ALGORITHMS[algorithm];
    if (!algoEntry) {
      setStatus(`Unknown algorithm: ${algorithm}`);
      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    setStatus(
      algoEntry.heavy
        ? `Computing ${algoEntry.label} (this may take a moment)...`
        : `Running ${algoEntry.label}...`,
    );

    if (algoEntry.heavy) {
      // yield to the browser so the status text paints before the heavy compute
      await sleep(0);
    }

    const result = algoEntry.run(fresh, start, end);
    const { visitedOrder, path, componentColorOf } = result;

    for (let i = 0; i < visitedOrder.length; i++) {
      const node = visitedOrder[i];
      if (!isRunningRef.current) break;
      if (!node.isStart && !node.isEnd) {
        const el = document.getElementById(`node-${node.row}-${node.col}`);
        if (el) {
          if (componentColorOf) {
            const color = componentColorOf.get(`${node.row}-${node.col}`);
            if (color) {
              el.classList.add("node-component");
              el.style.backgroundColor = color;
              el.style.borderColor = color;
            }
          } else {
            el.classList.add("node-visited");
          }
        }
        visitedCellsRef.current.add(`${node.row}-${node.col}`);
      }
      if (delay > 0) await sleep(delay);
    }

    if (!isRunningRef.current) {
      return;
    }

    if (componentColorOf) {
      if (result.sameComponent) {
        for (const node of path) {
          if (!node.isStart && !node.isEnd) {
            const el = document.getElementById(`node-${node.row}-${node.col}`);
            if (el) el.classList.add("node-path");
            pathCellsRef.current.add(`${node.row}-${node.col}`);
          }
          await sleep(30);
        }
        setStatus(
          `Union-Find finished. ${result.componentCount} component${result.componentCount === 1 ? "" : "s"}. Start and End are connected — path length ${path.length - 1}.`,
        );
      } else {
        setStatus(
          `Union-Find finished. ${result.componentCount} component${result.componentCount === 1 ? "" : "s"}. Start and End are in different components.`,
        );
      }
      isRunningRef.current = false;
      setIsRunning(false);
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
      `${algoEntry.label} finished. Visited ${visitedOrder.length} nodes, path length ${path.length - 1}.`,
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
            className="btnOption bg-lightBgColor w-full sm:w-auto"
            onChange={(e) => setAlgorithm(e.target.value)}
            value={algorithm}
            disabled={isRunning}
          >
            {Object.entries(ALGORITHMS).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flexItemOption">
          <div className="flex justify-between items-center w-full">
            <label className="mx-2">Speed</label>
            <input
              className="flex-1 sm:flex-none"
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
          <button
            className="btnOption w-full sm:w-auto"
            onClick={handleClearPath}
            disabled={isRunning}
          >
            Clear Path
          </button>
        </div>

        <div className="flexItemOption">
          <button
            className="btnOption w-full sm:w-auto"
            onClick={handleClearWalls}
            disabled={isRunning}
          >
            Clear Walls
          </button>
        </div>

        <div className="flexItemOption">
          <button
            className="btnOption w-full sm:w-auto"
            onClick={handleReset}
            disabled={isRunning}
          >
            Reset
          </button>
        </div>

        <div className="flexItemOption">
          {isRunning ? (
            <button className="btnOption w-full sm:w-auto" onClick={stopRun}>
              Stop
            </button>
          ) : (
            <button className="btnOption w-full sm:w-auto" onClick={runAlgorithm}>
              Visualize
            </button>
          )}
        </div>
      </div>

      <div className="mx-2 sm:mx-10 mt-4 flex flex-wrap gap-3 text-textColor text-xs sm:text-sm items-center">
        <Legend className="node-start" label="Start" />
        <Legend className="node-end" label="End" />
        <Legend className="node-wall" label="Wall" />
        <Legend className="node-visited" label="Visited" />
        <Legend className="node-path" label="Shortest Path" />
        <span className="w-full sm:w-auto sm:ml-auto opacity-80">{status}</span>
      </div>

      <div
        className="mx-2 sm:mx-10 my-4 p-2 bg-lightBgColor rounded-md overflow-auto"
        onPointerMove={handleGridPointerMove}
        onPointerLeave={() => {
          isPointerDownRef.current = false;
          dragModeRef.current = null;
          lastCellRef.current = null;
        }}
        style={{ touchAction: "none" }}
      >
        <div
          className="grid gap-[1px] mx-auto select-none"
          style={{
            gridTemplateColumns: `repeat(${COLS}, var(--cell-size, 1.5rem))`,
            width: "max-content",
          }}
        >
          {grid.map((row) =>
            row.map((node) => (
              <div
                key={`${node.row}-${node.col}`}
                id={`node-${node.row}-${node.col}`}
                data-node
                data-row={node.row}
                data-col={node.col}
                className={`graph-node ${
                  node.isStart
                    ? "node-start"
                    : node.isEnd
                      ? "node-end"
                      : node.isWall
                        ? "node-wall"
                        : ""
                }`}
                onPointerDown={(e) => handlePointerDown(e, node.row, node.col)}
                onPointerEnter={() => handlePointerEnter(node.row, node.col)}
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
