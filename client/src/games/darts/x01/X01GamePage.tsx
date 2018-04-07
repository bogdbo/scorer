import * as _ from 'lodash';
import * as Ons from 'onsenui';
import * as React from 'react';
import { BackButton, Modal, Page } from 'react-onsenui';
import { RouteComponentProps, withRouter, Prompt } from 'react-router';
import styled from 'styled-components';

import { Button } from '../../../common/PointButton';
import { Service, User } from '../../../service';
import {
  DartsLeg,
  X01Game,
  X01TurnDetails,
  X01TurnResult,
  X01GameSettings
} from './../models';
import { Player } from './Player';
import { X01Points } from './X01Points';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
  font-family: monospace;
`;

const Players = styled.div`
  display: flex;
  align-items: center;
  overflow: scroll;
  height: 100%;
`;

const BackButtonWrapper = styled.div`
  position: fixed;
  background: #ececec;
  z-index: 10;
  top: 8%;
`;

type LocationState = {
  settings: X01GameSettings;
  players: User[];
};

interface Props {}

interface State {
  game: X01Game;
  turn: X01TurnDetails;
  showModal?: boolean;
  modalMessage?: string;
}

export class X01GamePageInternal extends React.Component<
  Props & RouteComponentProps<{}>,
  State
> {
  gameStarted: boolean;

  constructor(props: Props & RouteComponentProps<{}>) {
    super(props);
    this.state = this.newGameState();
  }

  newGameState = () => {
    const { settings, players }: LocationState = this.props.location.state;

    const game: X01Game = {
      startScore: settings.startScore,
      createdAt: new Date(),
      scores: {},
      players: [],
      history: []
    };

    players.forEach((u: User) => {
      game.players.push(u.username);
      game.scores[u.username] = settings.startScore;
    });

    return {
      game,
      turn: this.getNewTurn(players[0].username)
    };
  };

  getNewTurn = (username: string) => {
    return {
      username,
      throws: [],
      result: X01TurnResult.Valid
    };
  };

  isValidMultiplier = (leg: DartsLeg, multiplier: 1 | 2 | 3): boolean => {
    const legType: DartsLeg = Math.pow(2, multiplier - 1);
    return (leg & legType) === legType;
  };

  updateTurns = (force?: boolean) => {
    const { game, turn } = this.state;
    if (force || this.state.turn.throws.length === 3) {
      const nextPlayer =
        game.players[
          (game.players.indexOf(turn.username) + 1) % game.players.length
        ];
      game.history.push(turn);
      return this.getNewTurn(nextPlayer);
    } else {
      return this.state.turn;
    }
  };

  handleThrow = async (value: number, multiplier: 1 | 2 | 3) => {
    const { game, turn } = this.state;
    const { settings }: LocationState = this.props.location.state;
    const points = value * multiplier;
    turn.throws.push(points);

    if (
      !this.gameStarted &&
      !this.isValidMultiplier(settings.startingLeg, multiplier)
    ) {
      turn.result = X01TurnResult.Bust;
      this.setState({ game, turn: this.updateTurns(true) });
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
      game.endedAt = new Date();
      game.history.push(turn);
      this.setState({ game });
      await this.handleGameEnd();
    } else if (isFail) {
      // undo previous shots, except last one because it was not counted
      _.dropRight(turn.throws, 1).forEach(
        t => (game.scores[turn.username] += t)
      );
      turn.result = X01TurnResult.Bust;
      this.setState({ game, turn: this.updateTurns(true) });
    } else {
      // game continues as usual
      game.scores[turn.username] -= points;
      this.setState({ game, turn: this.updateTurns() });
    }
  };

  handleSkipPlayer = () => {
    const { game, turn } = this.state;
    turn.throws = turn.throws.concat(Array(3 - turn.throws.length).fill(0));
    this.setState({ game, turn: this.updateTurns() });
  };

  handleUndo = () => {
    const { game, turn } = this.state;
    if (game.history.length === 0 && turn.throws.length === 0) {
      Ons.notification.toast('Nothing to undo.', { timeout: 1500 });
      return;
    }

    if (_.isEmpty(turn.throws)) {
      const previousTurn = game.history.pop() as X01TurnDetails;
      const previousThrow = previousTurn.throws.pop() as number;
      if (previousTurn.result === X01TurnResult.Valid) {
        game.scores[previousTurn.username] += previousThrow;
      } else {
        // the last TURN can only be BUST because of the last THROW
        // we need to ignore it and restore the previous throws
        previousTurn.throws.forEach(
          t => (game.scores[previousTurn.username] -= t)
        );
        previousTurn.result = X01TurnResult.Valid;
      }
      this.setState({ game, turn: previousTurn });
    } else {
      game.scores[turn.username] += turn.throws.pop() as number;
      this.setState({ game, turn });
    }
  };

  renderModal = () => {
    return (
      <Modal isOpen={this.state.showModal}>
        <p>{this.state.modalMessage || 'Please wait...'}</p>
      </Modal>
    );
  };

  checkEndgame = (score: number, multiplier: 1 | 2 | 3) => {
    const { settings } = this.props.location.state;
    const isValidClosingMultiplier = this.isValidMultiplier(
      settings.endingLeg,
      multiplier
    );
    const isWinner = score === 0 && isValidClosingMultiplier;
    const isFail =
      (score === 0 && !isValidClosingMultiplier) ||
      score < 0 ||
      // if score is 1 and Single ending leg is not allowed, the players is
      // bust as he/she can no loger close
      (score === 1 && (settings.endingLeg & DartsLeg.Single) === 0);

    return { isWinner, isFail };
  };

  trySaveGame = async (game: X01Game) => {
    this.setState({ showModal: true, modalMessage: 'Saving game' });
    let retry: any = 1;
    while (retry === 1) {
      try {
        await Service.uploadX01Game(game);
        retry = 0;
      } catch (ex) {
        retry = await Ons.notification.confirm(
          `Error saving game: '${JSON.stringify(
            ex.response.data
          )}'. Do you want to retry?`
        );
      }
    }

    this.setState({ showModal: false });
  };

  handleGameEnd = async () => {
    const { game, turn } = this.state;
    const { settings }: LocationState = this.props.location.state;

    await this.trySaveGame(game);

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
        text: `@${turn.username} won a *${settings.startScore} game* in ${
          turns.length
        } turns against ${otherPlayers}`,
        parse: 'full'
      };
      this.setState({ showModal: true, modalMessage: 'Please wait' });
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
        <BackButtonWrapper>
          <BackButton onClick={() => this.props.history.goBack()} />
        </BackButtonWrapper>
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
      <Page renderModal={this.renderModal}>
        <Container>
          {this.renderPlayers()}
          <Prompt
            when={this.state.game.endedAt == null}
            message="Are you sure you want to quit the game?"
          />
          {!this.state.game.endedAt && (
            <X01Points
              onPoints={this.handleThrow}
              onUndo={this.handleUndo}
              onSkipPlayer={this.handleSkipPlayer}
            />
          )}
          {this.state.game.endedAt && (
            <Button onClick={() => this.setState(this.newGameState())}>
              Restart
            </Button>
          )}
        </Container>
      </Page>
    );
  }
}

export const X01GamePage = withRouter(X01GamePageInternal);
