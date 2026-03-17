export type MazeCell = {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
  visited: boolean;
};

export function generateEmptyMaze(rows: number, cols: number): MazeCell[][] {
  const maze: MazeCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({ N: true, S: true, E: true, W: true, visited: false });
    }
    maze.push(row);
  }
  return maze;
}

export function generateRandomMaze(rows: number, cols: number, style: string = 'classic'): MazeCell[][] {
  const maze = generateEmptyMaze(rows, cols);
  const stack: [number, number][] = [];
  let current: [number, number] = [0, 0];
  maze[0][0].visited = true;

  const getNeighbors = (r: number, c: number) => {
    const neighbors: [number, number, string][] = [];
    if (r > 0 && !maze[r - 1][c].visited) neighbors.push([r - 1, c, 'N']);
    if (r < rows - 1 && !maze[r + 1][c].visited) neighbors.push([r + 1, c, 'S']);
    if (c > 0 && !maze[r][c - 1].visited) neighbors.push([r, c - 1, 'W']);
    if (c < cols - 1 && !maze[r][c + 1].visited) neighbors.push([r, c + 1, 'E']);
    return neighbors;
  };

  let unvisitedCount = rows * cols - 1;

  while (unvisitedCount > 0) {
    const neighbors = getNeighbors(current[0], current[1]);
    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(current);
      
      const [currR, currC] = current;
      const [nextR, nextC, dir] = next;

      if (dir === 'N') {
        maze[currR][currC].N = false;
        maze[nextR][nextC].S = false;
      } else if (dir === 'S') {
        maze[currR][currC].S = false;
        maze[nextR][nextC].N = false;
      } else if (dir === 'W') {
        maze[currR][currC].W = false;
        maze[nextR][nextC].E = false;
      } else if (dir === 'E') {
        maze[currR][currC].E = false;
        maze[nextR][nextC].W = false;
      }

      maze[nextR][nextC].visited = true;
      current = [nextR, nextC];
      unvisitedCount--;
    } else if (stack.length > 0) {
      current = stack.pop()!;
    } else {
      break;
    }
  }

  // Sparsity: remove random walls if style is sparse
  if (style === 'sparse') {
    for (let i = 0; i < (rows * cols) / 5; i++) {
      const r = Math.floor(Math.random() * (rows - 2)) + 1;
      const c = Math.floor(Math.random() * (cols - 2)) + 1;
      const side = (['N', 'S', 'E', 'W'] as const)[Math.floor(Math.random() * 4)];
      if (side === 'N') { maze[r][c].N = false; maze[r-1][c].S = false; }
      if (side === 'S') { maze[r][c].S = false; maze[r+1][c].N = false; }
      if (side === 'W') { maze[r][c].W = false; maze[r][c-1].E = false; }
      if (side === 'E') { maze[r][c].E = false; maze[r][c+1].W = false; }
    }
  }

  return maze;
}