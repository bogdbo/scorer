import axios from 'axios';

export interface User {
  username: string;
}

export class Service {
  private static API = 'api/v1';

  static getUsers() {
    return axios.get<User[]>(`${this.API}/users`);
  }
}
