import { TileType } from './types';

export const TILE_SIZE = 30; // pixels
export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 15;

// 1 = Wall, 2 = Pellet, 0 = Empty/Path, 9 = Start
// A simplified symmetrical maze
export const LEVEL_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 0, 0, 1, 2, 1, 2, 1, 0, 0, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 8, 1, 1, 2, 1, 1, 2, 1],
  [1, 2, 1, 1, 2, 1, 0, 0, 0, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 1, 1, 2, 9, 2, 1, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const STEP_FORCE = 25; // How many pixels to move per step
export const MOVE_DECAY = 0.92; // Friction/Decay of movement
