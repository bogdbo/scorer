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
  winner?: string;
  players: string[];
  scores: { [key: string]: number };
  history: TurnDetails[];
}

export enum TurnResult {
  Valid = 0,
  Bust = 1 << 0
}

export interface TurnDetails {
  username: string;
  throws: number[];
  valid: TurnResult;
}
