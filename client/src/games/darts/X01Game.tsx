import * as React from 'react';
import styled from 'styled-components';
import { Player } from './Player';
import { X01Points } from './X01Points';
import { Page, Toolbar, Navigator, BackButton, Modal } from 'react-onsenui';
import {
  X01Settings,
  X01Game,
  DartsLeg,
  TurnDetails,
  TurnResult
} from './models';
import { User, Service } from '../../service';
import * as Ons from 'onsenui';
import * as _ from 'lodash';
import { X01PointsLandscape } from './X01PointsLandscape';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
`;

const Players = styled.div`
  display: flex;
  align-items: center;
  overflow: scroll;
  height: 100%;
`;

interface Props {
  settings: X01Settings;
  players: User[];
  navigator: Navigator;
}

interface State {
  game: X01Game;
  turn: TurnDetails;
  showModal?: boolean;
}

export class X01GamePage extends React.Component<Props, State> {
  gameStarted: boolean;

  constructor(props: Props) {
    super(props);
    this.initGame();
  }

  initGame = () => {
    // TODO: POST new game
    // var result = await Service.newGame();
    const game: X01Game = {
      _id: 'todo',
      createdAt: new Date(),
      scores: {},
      players: [],
      history: []
    };

    this.props.players.forEach(u => {
      game.players.push(u.username);
      game.scores[u.username] = this.props.settings.startScore;
    });

    this.state = {
      game,
      turn: this.newTurn(this.props.players[0].username)
    };
  };

  newTurn = (username: string) => {
    return {
      username,
      throws: [],
      valid: TurnResult.Valid
    };
  };

  isValidMultiplier = (leg: DartsLeg, multiplier: 1 | 2 | 3): boolean => {
    const legType: DartsLeg = Math.pow(2, multiplier - 1);
    return (leg & legType) === legType;
  };

  handleThrow = async (hit: number, multiplier: 1 | 2 | 3) => {
    const { game, turn } = this.state;
    const points = hit * multiplier;
    turn.throws.push(points);

    if (
      !this.gameStarted &&
      !this.isValidMultiplier(this.props.settings.startingLeg, multiplier)
    ) {
      turn.valid = TurnResult.Bust;
      this.setState({ game, turn: this.updateTurns(game, turn, true) });
      return;
    } else {
      this.gameStarted = true;
    }

    const { isWinner, isFail } = this.checkEndgame(
      game.scores[turn.username] - points,
      multiplier
    );

    if (isWinner) {
      game.scores[turn.username] -= points;
      game.winner = turn.username; // mark winner
      this.setState({ game });
      await this.handleGameEnd();
    } else if (isFail) {
      // undo previous shots, except last one because it was not counted
      _.dropRight(turn.throws, 1).forEach(
        t => (game.scores[turn.username] += t)
      );
      turn.valid = TurnResult.Bust;
      this.setState({ game, turn: this.updateTurns(game, turn, true) });
    } else {
      game.scores[turn.username] -= points;
      this.setState({ game, turn: this.updateTurns(game, turn) });
    }
  };

  handleUndo = () => {
    const { game, turn } = this.state;
    if (game.history.length === 0 && turn.throws.length === 0) {
      Ons.notification.toast('Nothing to undo.', { timeout: 1500 });
      return;
    }

    if (_.isEmpty(turn.throws)) {
      const previousTurn = game.history.pop() as TurnDetails;
      const previousThrow = previousTurn.throws.pop() as number;
      if (previousTurn.valid === TurnResult.Valid) {
        game.scores[previousTurn.username] += previousThrow;
      } else {
        // the last turn can only be invalid because of the last throw
        // we need to ignore it and restore the previous throws
        previousTurn.throws.forEach(
          t => (game.scores[previousTurn.username] -= t)
        );
        previousTurn.valid = TurnResult.Valid;
      }
      this.setState({ game, turn: previousTurn });
    } else {
      game.scores[turn.username] += turn.throws.pop() as number;
      this.setState({ game, turn });
    }
  };

  updateTurns = (game: X01Game, turn: TurnDetails, force?: boolean) => {
    if (force || this.state.turn.throws.length === 3) {
      const nextPlayer =
        game.players[
          (game.players.indexOf(turn.username) + 1) % game.players.length
        ];
      game.history.push(turn);
      return this.newTurn(nextPlayer);
    } else {
      return this.state.turn;
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
    if (this.state.game.winner) {
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

  checkEndgame = (score: number, multiplier: 1 | 2 | 3) => {
    const isValidClosingMultiplier = this.isValidMultiplier(
      this.props.settings.endingLeg,
      multiplier
    );
    const isWinner = score === 0 && isValidClosingMultiplier;
    const isFail =
      (score === 0 && !isValidClosingMultiplier) ||
      score < 0 ||
      (score === 1 && (this.props.settings.endingLeg & DartsLeg.Single) === 0);

    return { isWinner, isFail };
  };

  handleGameEnd = async () => {
    const { game, turn } = this.state;
    var result: any = await Ons.notification.confirm(
      `Congratulations ${turn.username}! Post result to slack?`
    );
    if (result === 1) {
      const turns = this.state.game.history.filter(
        h => h.username === turn.username
      );
      const otherPlayers = game.players
        .filter(f => f !== turn.username)
        .map(p => `@${p}`)
        .join(', ');
      var message = {
        text: `@${turn.username} won a *${
          this.props.settings.startScore
        } game* in ${turns.length} turns against ${otherPlayers}`,
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
  };

  renderPlayers = () => {
    return (
      <Players>
        {this.state.game.players.map((p, i) => {
          const isActive = this.state.turn.username === p;
          return (
            <Player
              active={isActive}
              key={p}
              username={p}
              score={this.state.game.scores[p]}
              lastTurn={
                isActive
                  ? this.state.turn
                  : _.findLast(this.state.game.history, { username: p })
              }
            />
          );
        })}
      </Players>
    );
  };

  render() {
    return (
      <Page renderToolbar={this.renderToolbar} renderModal={this.renderModal}>
        <Container>
          {this.renderPlayers()}
          {!this.state.game.winner &&
            (Ons.orientation.isLandscape() ? (
              <X01PointsLandscape
                onPoints={this.handleThrow}
                onUndo={this.handleUndo}
              />
            ) : (
              <X01Points onPoints={this.handleThrow} onUndo={this.handleUndo} />
            ))}
        </Container>
      </Page>
    );
  }
}
