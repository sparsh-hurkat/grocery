export interface Position {
  x: number;
  y: number;
}

export interface GameEntity extends Position {
  radius: number;
  speed: number;
  direction: number; // in radians
}

export interface Ghost extends GameEntity {
  color: string;
}

export interface SensorData {
  heading: number; // 0-360 degrees
  steps: number;
  isSupported: boolean;
  permissionGranted: boolean;
  lastStepTime: number;
}

export interface GameState {
  score: number;
  gameOver: boolean;
  gameWon: boolean;
  lives: number;
}

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  PELLET = 2,
  POWER_PELLET = 3,
  PACMAN_START = 9,
  GHOST_START = 8
}

export interface ShoppingItem {
  id: string;
  name: string;
  collected: boolean;
}