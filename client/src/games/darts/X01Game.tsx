import * as React from 'react';
import styled from 'styled-components';
import { Player } from './Player';
import { X01Points } from './X01Points';
import { Page, Toolbar, Navigator, BackButton, Modal } from 'react-onsenui';
import { X01Settings, X01Game, DartsPlayer, DartsLeg } from './models';
import { User, Service } from '../../service';
import * as Ons from 'onsenui';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
`;

const Players = styled.div`
  display: flex;
  align-items: center;
  overflow: scroll;
`;

interface Props {
  settings: X01Settings;
  players: User[];
  navigator: Navigator;
}

interface State {
  game: X01Game;
  currentPlayer: string;
  gameOver?: boolean;
  showModal?: boolean;
}

export class X01GamePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.initNewGame();
  }

  initNewGame = () => {
    // TODO: POST new game
    // var result = await Service.newGame();
    const game: X01Game = {
      _id: 'todo',
      createdAt: new Date(),
      players: {},
      history: []
    };
    this.props.players.forEach(u => {
      game.players[u.username] = {} as DartsPlayer;
      game.players[u.username].score = this.props.settings.startScore;
    });

    this.state = { game, currentPlayer: this.props.players[0].username };
  };

  isValidClosingMultiplier = (multiplier: 1 | 2 | 3) => {
    const legType: DartsLeg = Math.pow(2, multiplier - 1);
    return (this.props.settings.endingLeg & legType) === legType;
  };

  handlePoints = async (hit: number, multiplier: 1 | 2 | 3) => {
    const game = this.state.game;
    const currentPlayer: DartsPlayer = game.players[this.state.currentPlayer];
    const points = hit * multiplier;
    currentPlayer.score -= points;

    const isValidClosingMultiplier = this.isValidClosingMultiplier(multiplier);
    const isWinner = currentPlayer.score === 0 && isValidClosingMultiplier;
    const isFail =
      (currentPlayer.score === 0 && !isValidClosingMultiplier) ||
      currentPlayer.score < 0 ||
      (currentPlayer.score === 1 &&
        (this.props.settings.endingLeg & DartsLeg.Single) === 0);

    if (isWinner) {
      currentPlayer.winner = true; // mark winner
      game.history.push({ username: this.state.currentPlayer, points }); // update history
      this.setState({ gameOver: true });
      var result: any = await Ons.notification.confirm(
        `Congratulations ${this.state.currentPlayer}! Post result to slack?`
      );

      if (result === 1) {
        const throws = game.history.filter(
          h => h.username === this.state.currentPlayer
        );
        const otherPlayers = Object.keys(game.players)
          .filter(f => f !== this.state.currentPlayer)
          .map(p => `@${p}`)
          .join(', ');

        var message = {
          text: `@${this.state.currentPlayer} won a *${
            this.props.settings.startScore
          } game* in ${throws.length} throws against ${otherPlayers}`,
          parse: 'full'
        };

        this.setState({ showModal: true });
        try {
          await Service.notify(message);
          Ons.notification.toast('Posted to slack', { timeout: 1500 });
        } catch (ex) {
          Ons.notification.toast('Could not post to slack', { timeout: 1500 });
        }

        this.setState({ showModal: false });
      }
    } else if (isFail) {
      currentPlayer.score += points; // undo points
      game.history.push({ username: this.state.currentPlayer, points: 0 }); // update history
      this.setState({ currentPlayer: this.updateNextPlayer(true) });
    } else {
      game.history.push({ username: this.state.currentPlayer, points }); // update history
      this.setState({ currentPlayer: this.updateNextPlayer() });
    }

    this.setState({ game });
  };

  handleUndo = () => {
    const game = this.state.game;
    const lastMove = game.history.pop();
    if (!lastMove) {
      Ons.notification.toast('Nothing to undo.', { timeout: 1500 });
      return;
    }
    game.players[lastMove.username].score += lastMove.points;
    this.setState({ currentPlayer: lastMove.username, game });
  };

  updateNextPlayer = (force?: boolean) => {
    const game = this.state.game;
    const lastThreeShots = game.history.slice(-3);
    if (!force && lastThreeShots.length < 3) {
      return this.state.currentPlayer;
    }

    if (
      force ||
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
  };

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="left">
          <BackButton onClick={this.handleBackButton} />
        </div>
        <div className="center">{this.props.settings.startScore} Game</div>
      </Toolbar>
    );
  };

  handleBackButton = async () => {
    if (this.state.gameOver) {
      this.props.navigator.popPage();
      return;
    }

    const result: any = await Ons.notification.confirm(
      'Are you sure you want to end the current game?',
      { title: 'End game' }
    );

    if (result === 1) {
      this.props.navigator.popPage();
    }
  };

  renderModal = () => {
    return (
      <Modal isOpen={this.state.showModal}>
        <p>Please wait...</p>
      </Modal>
    );
  };

  render() {
    return (
      <Page renderToolbar={this.renderToolbar} renderModal={this.renderModal}>
        <Container>
          <Players>
            {Object.keys(this.state.game.players).map((p, i) => (
              <Player
                active={this.state.currentPlayer === p}
                key={p}
                username={p}
                score={this.state.game.players[p].score}
                history={this.state.game.history}
              />
            ))}
          </Players>
          {!this.state.gameOver && (
            <X01Points onPoints={this.handlePoints} onUndo={this.handleUndo} />
          )}
        </Container>
      </Page>
    );
  }
}
