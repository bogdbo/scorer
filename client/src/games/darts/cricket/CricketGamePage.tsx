import * as _ from 'lodash';
import * as Ons from 'onsenui';
import * as React from 'react';
import { BackButton, Modal, Page } from 'react-onsenui';
import { RouteComponentProps, withRouter, Prompt } from 'react-router';
import styled, { injectGlobal } from 'styled-components';

import { Button } from '../../../common/PointButton';
import { Service, User } from '../../../service';
import {
  CricketGame,
  CricketThrowDetails,
  CricketThrowResult,
  CricketTurnDetails
} from '../models';
import { CricketPlayers } from './CricketPlayers';
import { CricketPoints } from './CricketPoints';

const Header = styled.div`
  grid-row: 1 / 2;
  grid-column: 1 / end;
  display: flex;
  justify-content: space-between;
`;

const BackButtonWrapper = styled.div`
  background: #ececec;
  z-index: 10;
  > ons-back-button {
    height: 100%;
    line-height: initial;
  }
`;

const Container = styled.div`
  display: grid;
  grid-template-rows: 7% 93%;
  grid-template-columns: repeat(3, 1fr) repeat(2, 1fr);
  height: 100vh;
  max-height: 100vh;
  font-family: monospace;
`;

const PointsContainer = styled.div`
  grid-row: 2;
  grid-column: 4 / end;
  display: flex;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  flex: 1 1;
  box-shadow: 0 2px 0px 2px #0000001c;
  z-index: 10;
`;

const PlayersContainer = styled.div`
  grid-row: 2;
  grid-column: 1/4;
  display: flex;
  overflow-x: overlay;
  flex: 1;
`;

const ThrowsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex: 1;
  height: 100%;
  font-size: 3vw;
`;

const ThrowDetails = styled.div`
  min-width: 200px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const TurnPoints = styled.span`
  font-size: 3.5vmax;
`;

const ThrowValue = styled.span`
  padding-left: 3px;
  padding-right: 3px;
  color: #ffa500;
  font-size: 3.5vmax;
  background-color: ${(p: { result: CricketThrowResult[] }) => {
    const hasInvalid = p.result.indexOf(CricketThrowResult.Invalid) >= 0;
    const hasHit = p.result.indexOf(CricketThrowResult.Hit) >= 0;
    const hasPoints = p.result.indexOf(CricketThrowResult.Points) >= 0;
    return hasInvalid && hasHit
      ? '#987b47'
      : hasHit && hasPoints
        ? '#30e6e6'
        : hasInvalid
          ? 'red'
          : hasHit ? 'blue ' : hasPoints ? 'green' : 'initial';
  }};
`;

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  * {
    box-sizing: border-box;
  }
`;

type LocationState = {
  players: User[];
};

interface Props {}

interface State {
  game: CricketGame;
  turn: CricketTurnDetails;
  showModal?: boolean;
  modalMessage?: string;
}

export class CricketGamePageInternal extends React.Component<
  Props & RouteComponentProps<{}>,
  State
> {
  gameStarted: boolean;

  constructor(props: Props & RouteComponentProps<{}>) {
    super(props);
    this.state = this.newGameState();
  }

  newGameState = () => {
    const { players }: LocationState = this.props.location.state;
    const game: CricketGame = {
      createdAt: new Date(),
      scores: {},
      players: [],
      history: []
    };

    players.forEach((u: User) => {
      game.players.push(u.username);
      game.scores[u.username] = { points: 0 };
      for (let i = 20; i >= 15; i--) {
        game.scores[u.username][i] = 0;
      }
      game.scores[u.username][25] = 0;
    });

    return {
      game,
      turn: this.getNewTurn(players[0].username)
    };
  };

  getNewTurn = (username: string) => {
    return {
      username,
      throws: []
    };
  };

  renderThrowDetails = (turn: CricketTurnDetails) => {
    var points = _.sumBy(turn.throws, 'points');
    return (
      <>
        {turn.throws.map((t, i) => (
          <ThrowValue result={t.throwDistribution} key={'currentThrow' + i}>
            {t.throw}
          </ThrowValue>
        ))}
        <TurnPoints>+{points}p</TurnPoints>
      </>
    );
  };

  renderHeader = () => {
    const previousThrow = _.first(_.takeRight(this.state.game.history, 1));
    return (
      <>
        <BackButtonWrapper>
          <BackButton onClick={() => this.props.history.goBack()} />
        </BackButtonWrapper>
        <ThrowsContainer>
          {Ons.orientation.isLandscape() &&
            previousThrow && (
              <ThrowDetails>
                {this.renderThrowDetails(previousThrow)}
              </ThrowDetails>
            )}
          <ThrowDetails>
            {this.renderThrowDetails(this.state.turn)}
          </ThrowDetails>
        </ThrowsContainer>
      </>
    );
  };

  isOpen = (hit: number) => {
    return _.some(
      this.props.location.state.players.map(
        (p: User) => this.state.game.scores[p.username][hit] < 3
      )
    );
  };

  updateTurns = () => {
    const { game, turn } = this.state;
    if (this.state.turn.throws.length === 3) {
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

  handleThrow = (value: number, multiplier: number) => {
    const { game, turn } = this.state;

    const checkEndgame = (): string[] => {
      const hasClosed = (username: string) =>
        Object.keys(game.scores[username]).every(
          key => key === 'points' || game.scores[username][key] === 3
        );

      const currentUserHasClosed = hasClosed(turn.username);
      const allClosed = game.players.every(p => hasClosed(p));
      const maxScorePlayers = game.players.filter(
        p => game.scores[p].points >= game.scores[turn.username].points
      );

      return allClosed
        ? maxScorePlayers // all closed, nothing to play, either a tie either a win
        : currentUserHasClosed && maxScorePlayers.length === 1
          ? [turn.username] // currentUserClosed && has max points => winner
          : []; // game is still open
    };

    const throwDistribution = [];
    // count points obtained for this throw
    // eg: 20 is already hit twice, current throw value is 20 and multiplier is 3
    // => 1 of those 20s closes the number and the other 2 are extra points
    // if it's still not closed by another player
    let currentThrowExtraPoints = 0;
    if (value === 0) {
      throwDistribution.push(CricketThrowResult.Invalid);
    } else {
      let tempMultiplier = multiplier;
      do {
        if (game.scores[turn.username][value] < 3) {
          game.scores[turn.username][value]++;
          throwDistribution.push(CricketThrowResult.Hit);
        } else {
          if (this.isOpen(value)) {
            game.scores[turn.username].points += value;
            currentThrowExtraPoints += value;
            throwDistribution.push(CricketThrowResult.Points);
          } else {
            throwDistribution.push(CricketThrowResult.Invalid);
          }
        }
      } while (--tempMultiplier > 0);
    }

    turn.throws.push({
      throw: value * multiplier,
      points: currentThrowExtraPoints,
      value,
      multiplier,
      throwDistribution
    });

    var winners = checkEndgame();
    if (winners.length === 1) {
      game.winner = turn.username;
      game.endedAt = new Date();
    } else if (winners.length > 1) {
      game.endedAt = new Date();
      // todo: slack!
      Ons.notification.toast(`Tie between ${winners.join(', ')}`, {
        timeout: 5000
      });
    }

    this.setState(
      { game, turn: this.updateTurns() },
      winners.length === 1 ? this.handleGameEnd : _.noop
    );
  };

  handleNextPlayer = () => {
    while (this.state.turn.throws.length < 3) {
      this.state.turn.throws.push({
        throw: 0,
        points: 0,
        value: 0,
        multiplier: 1,
        throwDistribution: [CricketThrowResult.Invalid]
      });
    }

    this.setState({ turn: this.updateTurns() });
  };

  handleUndo = () => {
    let { game, turn } = this.state;
    if (game.history.length === 0 && turn.throws.length === 0) {
      Ons.notification.toast('Nothing to undo.', { timeout: 1500 });
      return;
    }

    if (_.isEmpty(turn.throws)) {
      turn = game.history.pop() as CricketTurnDetails;
    }

    const previousThrow = turn.throws.pop() as CricketThrowDetails;
    game.scores[turn.username].points -= previousThrow.points; // undo extra points
    if (previousThrow.value !== 0) {
      game.scores[turn.username][
        previousThrow.value
      ] -= previousThrow.throwDistribution.filter(
        d => d === CricketThrowResult.Hit
      ).length; // undo hits, if there were any
    }

    this.setState({ game, turn: turn });
  };

  trySaveGame = async (game: CricketGame) => {
    this.setState({ showModal: true, modalMessage: 'Saving game' });
    let retry: any = 1;
    while (retry === 1) {
      try {
        await Service.uploadCricket(game);
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
    const { game } = this.state;

    await this.trySaveGame(game);

    const winner: string = game.winner as string;
    var result: any = await Ons.notification.confirm(
      `Congratulations ${winner}! Post result to slack?`
    );
    if (result === 1) {
      const otherPlayers = game.players
        .filter(f => f !== winner)
        .map(p => `@${p} _(${game.scores[p].points}p)_`)
        .join(', ');
      const turns = game.history.filter(h => h.username === winner).length;
      var message = {
        text: `@${winner} _(${
          game.scores[winner].points
        }p)_ won a *game of cricket* in ${turns} turns against ${otherPlayers}`,
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

  renderModal = () => {
    return (
      <Modal isOpen={this.state.showModal}>
        <p>{this.state.modalMessage || 'Please wait...'}</p>
      </Modal>
    );
  };

  render() {
    return (
      <Page renderModal={this.renderModal}>
        <Prompt
          when={this.state.game.endedAt == null}
          message="Are you sure you want to quit the game?"
        />
        <Container>
          <Header>{this.renderHeader()}</Header>
          <PlayersContainer>
            <CricketPlayers game={this.state.game} turn={this.state.turn} />
          </PlayersContainer>
          <PointsContainer>
            {!this.state.game.endedAt && (
              <CricketPoints
                onPoints={this.handleThrow}
                onUndo={this.handleUndo}
                onNextPlayer={this.handleNextPlayer}
              />
            )}
            {this.state.game.endedAt && (
              <Button onClick={() => this.setState(this.newGameState())}>
                restart
              </Button>
            )}
          </PointsContainer>
        </Container>
      </Page>
    );
  }
}

export const CricketGamePage = withRouter(CricketGamePageInternal);
