import { X01GameSettings, DartsLeg } from './games/darts/models';
import axios from 'axios';

export interface User {
  username: string;
}

export class Service {
  private static API = 'api/v1';
  private static CURRENT_USER = 'CURRENT_USER';
  private static X01SETTINGS = 'X01SETTINGS';
  private static users = [
    { username: 'alex.musat' },
    { username: 'andrei.nechita' },
    { username: 'bogdan.boiculese' },
    { username: 'adrian.mihu' },
    { username: 'andrei.toma' },
    { username: 'antonio.bentia' },
    { username: 'bogdan.cotoarba' },
    { username: 'calin.stan' },
    { username: 'dan.lupusanschi' },
    { username: 'danut.felix' },
    { username: 'darius.pintilie' },
    { username: 'emil.craciun' },
    { username: 'emilia.serban' },
    { username: 'horea.mihut' },
    { username: 'ionut.lupsan' },
    { username: 'istvan.vezer' },
    { username: 'mihaela.fedor' },
    { username: 'monica.mosoiu' },
    { username: 'nicu.motoc' },
    { username: 'pausan.ionut' },
    { username: 'septimiu.chiorean' },
    { username: 'serban.condrea' },
    { username: 'sergiu.murariu' },
    { username: 'sorin.marian' },
    { username: 'sorin.popa' },
    { username: 'stefan.hurjui' },
    { username: 'ștefii.trif' },
    { username: 'vlad.chincisan' },
    { username: 'voicu.seiche' }
  ];

  static getUsers() {
    // return axios.get<User[]>(`${this.API}/users`);
    return new Promise<{ data: any }>(resolve => {
      resolve({ data: this.users });
    });
  }

  static newGame() {
    // return axios.put<Darts>(`${this.API}/darts`);
    return new Promise<{ data: any }>(r => r({ data: { players: {} } }));
  }

  // TODO: Accept game object
  static async notify(data: any) {
    return axios.post(`${this.API}/darts/notify`, data);
  }

  static getCurrentIdentity() {
    return window.localStorage.getItem(this.CURRENT_USER);
  }

  static setCurrentIdentity(value: string) {
    return window.localStorage.setItem(this.CURRENT_USER, value);
  }

  static getX01Settings(): X01GameSettings {
    const persistedSettings = window.localStorage.getItem(this.X01SETTINGS);
    return persistedSettings
      ? JSON.parse(persistedSettings)
      : {
          startingLeg: DartsLeg.Single | DartsLeg.Double | DartsLeg.Tripple,
          endingLeg: DartsLeg.Double,
          startScore: 501
        };
  }

  static setX01Settings(settings: X01GameSettings) {
    return window.localStorage.setItem(
      this.X01SETTINGS,
      JSON.stringify(settings)
    );
  }
}
