export type MazeCell = {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
  visited: boolean;
};

// Generador de números pseudo-aleatorios con semilla fija
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

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

export function generateRandomMaze(rows: number, cols: number): MazeCell[][] {
  // Semilla fija para que el laberinto sea siempre el mismo
  const rng = new SeededRandom(12345);
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
      const next = neighbors[Math.floor(rng.next() * neighbors.length)];
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

  return maze;
}
