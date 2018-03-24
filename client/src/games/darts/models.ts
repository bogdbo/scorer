export enum DartsLeg {
  Single = 1 << 0,
  Double = 1 << 1,
  Tripple = 1 << 2
}

export interface X01Settings {
  startScore: number;
  startingLeg: DartsLeg;
  endingLeg: DartsLeg;
}

export interface X01Game {
  _id: String;
  createdAt: Date;
  players: { [key: string]: DartsPlayer };
  history: ThrowHistory[];
}

export interface DartsPlayer {
  winner: boolean;
  score: number;
}

export interface ThrowHistory {
  username: string;
  points: number;
}
