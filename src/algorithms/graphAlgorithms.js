const NEIGHBOR_OFFSETS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function getNeighbors(node, grid) {
  const { row, col } = node;
  const neighbors = [];
  for (const [dr, dc] of NEIGHBOR_OFFSETS) {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length) continue;
    const n = grid[r][c];
    if (n.isWall) continue;
    neighbors.push(n);
  }
  return neighbors;
}

function buildPath(endNode) {
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = current.previous;
  }
  return path;
}

export function bfs(grid, startNode, endNode) {
  const visitedOrder = [];
  const queue = [startNode];
  startNode.visited = true;

  while (queue.length > 0) {
    const current = queue.shift();
    visitedOrder.push(current);

    if (current === endNode) {
      return { visitedOrder, path: buildPath(endNode) };
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      queue.push(neighbor);
    }
  }

  return { visitedOrder, path: [] };
}

export function dfs(grid, startNode, endNode) {
  const visitedOrder = [];
  const stack = [startNode];
  startNode.visited = true;

  while (stack.length > 0) {
    const current = stack.pop();
    visitedOrder.push(current);

    if (current === endNode) {
      return { visitedOrder, path: buildPath(endNode) };
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.visited) continue;
      neighbor.visited = true;
      neighbor.previous = current;
      stack.push(neighbor);
    }
  }

  return { visitedOrder, path: [] };
}
