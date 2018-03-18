import * as React from 'react';
import styled from 'styled-components';
import { Player } from './Player';
import { Points } from './Points';
import { SelectPlayers } from '../../common/SelectPlayers';
import { User, Service, Darts, DartsPlayer } from '../../service';
import { Page, Toolbar, BackButton } from 'react-onsenui';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
`;

const Players = styled.div`
  display: flex;
  overflow: scroll;
`;

interface Props { }

interface State {
  game: Darts;
  currentPlayer: string;
}

export class DartsGame extends React.Component<Props, State> {
  private INITIAL_SCORE = 501;
  constructor(props: Props) {
    super(props);
    this.state = { game: {} as Darts, currentPlayer: '' };
  }

  handleStart = async (users: User[]) => {
    var result = await Service.newGame();
    var game = result.data;
    game.history = [];
    users.forEach(u => {
      game.players[u.username] = {} as DartsPlayer;
      game.players[u.username].score = this.INITIAL_SCORE;
    });
    this.setState({ game, currentPlayer: users[0].username });
  };

  handlePoints = (points: number) => {
    const game = this.state.game;
    var currentPlayer = game.players[this.state.currentPlayer];
    currentPlayer.score -= points;
    game.history.push({ username: this.state.currentPlayer, points });

    this.setState({ game, currentPlayer: this.tryMoveNextPlayer() });
  };

  handleUndo = () => {
    const game = this.state.game;
    const lastMove = game.history.pop();
    if (!lastMove) {
      return;
    }

    game.players[lastMove.username].score += lastMove.points;
    this.setState({ currentPlayer: lastMove.username, game });
  };

  tryMoveNextPlayer = () => {
    const game = this.state.game;
    const lastThreeShots = game.history.slice(-3);
    if (lastThreeShots.length < 3) {
      return this.state.currentPlayer;
    } else {
      if (
        lastThreeShots.filter(s => s.username === this.state.currentPlayer)
          .length === 3
      ) {
        const players = Object.keys(this.state.game.players);
        const currentPlayerIndex = players.indexOf(this.state.currentPlayer);
        const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
        return players[nextPlayerIndex];
      } else {
        return this.state.currentPlayer;
      }
    }
  };

  render() {
    if (this.state.game.players) {
      return (
        <Page>
          <Container>
            <Players>
              {Object.keys(this.state.game.players).map(p => (
                <Player
                  key={p}
                  username={p}
                  score={this.state.game.players[p].score}
                  history={this.state.game.history}
                />
              ))}
            </Players>
            <Points onPoints={this.handlePoints} onUndo={this.handleUndo} />
          </Container>
        </Page>
      );
    } else {
      return (
        <Page
          renderToolbar={() => {
            return (
              <Toolbar>
                <div className="left">
                  <BackButton />
                </div>
                <div className="center">Darts</div>
              </Toolbar>
            );
          }}
        >
          <SelectPlayers onStart={this.handleStart} />
        </Page>
      );
    }
  }
}
