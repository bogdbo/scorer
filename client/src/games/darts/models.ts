export enum DartsLeg {
  Single = 1 << 0,
  Double = 1 << 1,
  Tripple = 1 << 2
}

export interface X01GameSettings {
  startScore: number;
  startingLeg: DartsLeg;
  endingLeg: DartsLeg;
}

export interface X01Game {
  _id: String;
  createdAt: Date;
  winner?: string;
  players: string[];
  scores: { [key: string]: number };
  history: X01TurnDetails[];
}

export enum X01TurnResult {
  Valid = 0,
  Bust = 1 << 0
}

export interface X01TurnDetails {
  username: string;
  throws: number[];
  result: X01TurnResult;
}

export enum CricketThrowResult {
  Hit = 0, // when row is open and no points are awarded
  Points = 1 << 0, // when obtained points
  Invalid = 1 << 1 // when row is closed by everyone
}

export interface CricketThrowDetails {
  throw: number;
  hit: number;
  multiplier: number;
  points: number;
  throwDistribution: CricketThrowResult[];
}

export interface CricketTurnDetails {
  username: string;
  throws: CricketThrowDetails[];
}

export interface CricketGame {
  _id: String;
  createdAt: Date;
  winner?: string;
  players: string[];
  scores: { [key: string]: { points: number; [key: number]: number } };
  history: CricketTurnDetails[];
}
