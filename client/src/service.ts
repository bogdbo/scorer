import axios from 'axios';

export interface User {
  username: string;
}

export interface Darts {
  _id: String;
  createdAt: Date;
  players: { [key: string]: DartsPlayer };
  history: DartsHistory[];
}

export interface DartsPlayer {
  winner: boolean;
  score: number;
}

export interface DartsHistory {
  username: string;
  points: number;
}

export class Service {
  private static API = 'api/v1';

  static getUsers() {
    return axios.get<User[]>(`${this.API}/users`);
  }

  static newGame() {
    return axios.put<Darts>(`${this.API}/darts`);
  }
}
