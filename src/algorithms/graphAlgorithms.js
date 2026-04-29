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

class MinHeap {
  constructor(scoreOf) {
    this.scoreOf = scoreOf;
    this.heap = [];
  }
  get size() {
    return this.heap.length;
  }
  push(item) {
    this.heap.push(item);
    this._siftUp(this.heap.length - 1);
  }
  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }
  _siftUp(i) {
    const h = this.heap;
    const score = this.scoreOf;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (score(h[i]) < score(h[parent])) {
        [h[i], h[parent]] = [h[parent], h[i]];
        i = parent;
      } else break;
    }
  }
  _siftDown(i) {
    const h = this.heap;
    const score = this.scoreOf;
    const n = h.length;
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let best = i;
      if (l < n && score(h[l]) < score(h[best])) best = l;
      if (r < n && score(h[r]) < score(h[best])) best = r;
      if (best === i) break;
      [h[i], h[best]] = [h[best], h[i]];
      i = best;
    }
  }
}

export function dijkstra(grid, startNode, endNode) {
  const visitedOrder = [];
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity;
    }
  }
  startNode.distance = 0;

  const heap = new MinHeap((n) => n.distance);
  heap.push(startNode);

  while (heap.size > 0) {
    const current = heap.pop();
    if (current.visited) continue;
    if (current.distance === Infinity) break;
    current.visited = true;
    visitedOrder.push(current);

    if (current === endNode) {
      return { visitedOrder, path: buildPath(endNode) };
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.visited) continue;
      const tentative = current.distance + 1;
      if (tentative < neighbor.distance) {
        neighbor.distance = tentative;
        neighbor.previous = current;
        heap.push(neighbor);
      }
    }
  }

  return { visitedOrder, path: [] };
}

function manhattan(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function astar(grid, startNode, endNode) {
  const visitedOrder = [];
  for (const row of grid) {
    for (const node of row) {
      node.gScore = Infinity;
      node.fScore = Infinity;
      node.inOpen = false;
    }
  }
  startNode.gScore = 0;
  startNode.fScore = manhattan(startNode, endNode);

  const heap = new MinHeap((n) => n.fScore);
  heap.push(startNode);
  startNode.inOpen = true;

  while (heap.size > 0) {
    const current = heap.pop();
    if (current.visited) continue;
    current.visited = true;
    current.inOpen = false;
    visitedOrder.push(current);

    if (current === endNode) {
      return { visitedOrder, path: buildPath(endNode) };
    }

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.visited) continue;
      const tentative = current.gScore + 1;
      if (tentative < neighbor.gScore) {
        neighbor.previous = current;
        neighbor.gScore = tentative;
        neighbor.fScore = tentative + manhattan(neighbor, endNode);
        if (!neighbor.inOpen) {
          neighbor.inOpen = true;
          heap.push(neighbor);
        } else {
          // re-push; duplicates get filtered by visited check on pop
          heap.push(neighbor);
        }
      }
    }
  }

  return { visitedOrder, path: [] };
}

export function floydWarshall(grid, startNode, endNode) {
  const rows = grid.length;
  const cols = grid[0].length;
  const N = rows * cols;
  const idx = (r, c) => r * cols + c;
  const INF = Infinity;

  const dist = new Float64Array(N * N);
  const next = new Int32Array(N * N);
  dist.fill(INF);
  next.fill(-1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = idx(r, c);
      dist[i * N + i] = 0;
      if (grid[r][c].isWall) continue;
      for (const [dr, dc] of NEIGHBOR_OFFSETS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        if (grid[nr][nc].isWall) continue;
        const j = idx(nr, nc);
        dist[i * N + j] = 1;
        next[i * N + j] = j;
      }
    }
  }

  for (let k = 0; k < N; k++) {
    const kr = (k / cols) | 0;
    const kc = k - kr * cols;
    if (grid[kr][kc].isWall) continue;
    const baseK = k * N;
    for (let i = 0; i < N; i++) {
      const dik = dist[i * N + k];
      if (dik === INF) continue;
      const baseI = i * N;
      for (let j = 0; j < N; j++) {
        const alt = dik + dist[baseK + j];
        if (alt < dist[baseI + j]) {
          dist[baseI + j] = alt;
          next[baseI + j] = next[baseI + k];
        }
      }
    }
  }

  const startIdx = idx(startNode.row, startNode.col);
  const endIdx = idx(endNode.row, endNode.col);

  const reachable = [];
  for (let i = 0; i < N; i++) {
    const d = dist[startIdx * N + i];
    if (d !== INF && i !== startIdx) {
      const r = (i / cols) | 0;
      const c = i - r * cols;
      reachable.push({ node: grid[r][c], d });
    }
  }
  reachable.sort((a, b) => a.d - b.d);
  const visitedOrder = [startNode, ...reachable.map((x) => x.node)];

  if (next[startIdx * N + endIdx] === -1) {
    return { visitedOrder, path: [] };
  }

  const path = [startNode];
  let cur = startIdx;
  while (cur !== endIdx) {
    cur = next[cur * N + endIdx];
    if (cur === -1) return { visitedOrder, path: [] };
    const r = (cur / cols) | 0;
    const c = cur - r * cols;
    path.push(grid[r][c]);
  }

  return { visitedOrder, path };
}

export function unionFind(grid, startNode, endNode) {
  const rows = grid.length;
  const cols = grid[0].length;
  const N = rows * cols;
  const idx = (r, c) => r * cols + c;

  const parent = new Int32Array(N);
  const rank = new Int8Array(N);
  for (let i = 0; i < N; i++) parent[i] = i;

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  }

  function union(a, b) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else {
      parent[rb] = ra;
      rank[ra]++;
    }
    return true;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isWall) continue;
      if (c + 1 < cols && !grid[r][c + 1].isWall) {
        union(idx(r, c), idx(r, c + 1));
      }
      if (r + 1 < rows && !grid[r + 1][c].isWall) {
        union(idx(r, c), idx(r + 1, c));
      }
    }
  }

  // Assign each component a distinct hue using the golden-angle trick.
  const rootColor = new Map();
  let nextHue = 0;
  function colorFor(root) {
    let color = rootColor.get(root);
    if (!color) {
      const hue = (nextHue * 137.508) % 360;
      color = `hsl(${hue.toFixed(1)}, 65%, 55%)`;
      rootColor.set(root, color);
      nextHue++;
    }
    return color;
  }

  const visitedOrder = [];
  const componentColorOf = new Map();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const node = grid[r][c];
      if (node.isWall) continue;
      const root = find(idx(r, c));
      componentColorOf.set(`${r}-${c}`, colorFor(root));
      visitedOrder.push(node);
    }
  }

  const startRoot = find(idx(startNode.row, startNode.col));
  const endRoot = find(idx(endNode.row, endNode.col));
  const sameComponent = startRoot === endRoot;

  let path = [];
  if (sameComponent) {
    const prev = new Map();
    const seen = new Set([idx(startNode.row, startNode.col)]);
    const queue = [startNode];
    let found = false;
    while (queue.length > 0 && !found) {
      const cur = queue.shift();
      if (cur === endNode) {
        found = true;
        break;
      }
      for (const [dr, dc] of NEIGHBOR_OFFSETS) {
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const nb = grid[nr][nc];
        if (nb.isWall) continue;
        const nbIdx = idx(nr, nc);
        if (seen.has(nbIdx)) continue;
        seen.add(nbIdx);
        prev.set(nbIdx, cur);
        queue.push(nb);
      }
    }
    let cur = endNode;
    while (cur) {
      path.unshift(cur);
      cur = prev.get(idx(cur.row, cur.col)) || null;
    }
  }

  return {
    visitedOrder,
    path,
    componentColorOf,
    componentCount: rootColor.size,
    sameComponent,
  };
}
