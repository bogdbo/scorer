import * as React from 'react';
import * as Ons from 'onsenui';
import styled, { injectGlobal } from 'styled-components';
import { Page, Navigator, BackButton } from 'react-onsenui';
import { User } from '../../../service';
import {
  CricketGame,
  CricketTurnDetails,
  CricketThrowDetails,
  CricketThrowResult
} from '../models';
import { CricketPoints } from './CricketPoints';
import { CricketPlayers } from './CricketPlayers';
import * as _ from 'lodash';

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
  grid-template-rows: 1fr 9fr;
  grid-template-columns: repeat(3, 1fr) repeat(2, 1fr);
  height: 100vh;
  max-height: 100vh;
`;

const PointsContainer = styled.div`
  grid-row: 2;
  grid-column: 4 / end;
  display: flex;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  flex: 1 1;
`;

const PlayersContainer = styled.div`
  grid-row: 2;
  grid-column: 1/4;
  display: flex;
  overflow-x: overlay;
  flex: 1;
  margin: 5px;
`;

const ThrowsContainer = styled.div`
  display: flex;
  div:first-child {
    opacity: 0.6;
    margin-right: 80px;
  }
`;

const ThrowDetails = styled.div`
  min-width: 200px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const ThrowValue = styled.span`
  background-color: ${(p: { result: CricketThrowResult[] }) =>
    p.result.some(r => r === CricketThrowResult.Invalid)
      ? 'red'
      : p.result.some(r => r === CricketThrowResult.Points)
        ? 'green'
        : p.result.some(r => r === CricketThrowResult.Hit)
          ? 'blue '
          : p.result.some(
              r =>
                r === CricketThrowResult.Hit || r === CricketThrowResult.Points
            )
            ? 'cyan'
            : 'initial'};
`;

interface Props {
  players: User[];
  navigator: Navigator;
}

interface State {
  game: CricketGame;
  turn: CricketTurnDetails;
  showModal?: boolean;
}

// tslint:disable-next-line:no-unused-expression
injectGlobal`
  * {
    box-sizing: border-box;
  }
`;

export class CricketGamePage extends React.Component<Props, State> {
  gameStarted: boolean;

  constructor(props: Props) {
    super(props);
    this.initGame();
  }

  initGame = () => {
    const game: CricketGame = {
      _id: 'todo',
      createdAt: new Date(),
      scores: {},
      players: [],
      history: []
    };

    this.props.players.forEach(u => {
      game.players.push(u.username);
      game.scores[u.username] = { points: 0 };
      for (let i = 20; i >= 15; i--) {
        game.scores[u.username][i] = 0;
      }
      game.scores[u.username][25] = 0;
    });

    this.state = { game, turn: this.newTurn(this.props.players[0].username) };
  };

  newTurn = (username: string) => {
    return {
      username,
      throws: []
    };
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

  renderThrowDetails = (turn: CricketTurnDetails) => {
    var points = _.sumBy(turn.throws, 'points');
    return (
      <>
        {turn.throws.map((t, i) => (
          <ThrowValue result={t.throwDistribution} key={'currentThrow' + i}>
            {t.throw}
          </ThrowValue>
        ))}
        <span>+{points} points</span>
      </>
    );
  };

  renderHeader = () => {
    const previousThrow = _.first(_.takeRight(this.state.game.history, 1));
    return (
      <>
        <BackButtonWrapper>
          <BackButton onClick={this.handleBackButton} />
        </BackButtonWrapper>
        <ThrowsContainer>
          {previousThrow && (
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
      this.props.players.map(p => this.state.game.scores[p.username][hit] < 3)
    );
  };

  handleThrow = (hit: number, multiplier: number) => {
    const { game, turn } = this.state;

    const updateTurns = () => {
      if (this.state.turn.throws.length === 3) {
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

    const throwDistribution = [];
    let points = 0;
    if (hit === 0) {
      throwDistribution.push(CricketThrowResult.Invalid);
    } else {
      let tempMultiplier = multiplier;
      do {
        if (game.scores[turn.username][hit] < 3) {
          game.scores[turn.username][hit]++;
          throwDistribution.push(CricketThrowResult.Hit);
        } else {
          if (this.isOpen(hit)) {
            game.scores[turn.username].points += hit;
            points += hit;
            throwDistribution.push(CricketThrowResult.Points);
          } else {
            throwDistribution.push(CricketThrowResult.Invalid);
          }
        }
      } while (--tempMultiplier > 0);
    }

    var currentThrow: CricketThrowDetails = {
      throw: hit * multiplier,
      points,
      hit,
      multiplier,
      throwDistribution
    };
    turn.throws.push(currentThrow);

    this.setState({ game, turn: updateTurns() });
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
    game.scores[turn.username].points -= previousThrow.points;
    game.scores[turn.username][
      previousThrow.hit
    ] -= previousThrow.throwDistribution.filter(
      d => d === CricketThrowResult.Hit
    ).length;

    this.setState({ game, turn: turn });
  };

  render() {
    return (
      <Page>
        <Container>
          <Header>{this.renderHeader()}</Header>
          <PlayersContainer>
            <CricketPlayers game={this.state.game} turn={this.state.turn} />
          </PlayersContainer>
          <PointsContainer>
            <CricketPoints
              onPoints={this.handleThrow}
              onUndo={this.handleUndo}
            />
          </PointsContainer>
        </Container>
      </Page>
    );
  }
}
