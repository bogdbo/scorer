import * as React from 'react';
import * as Ons from 'onsenui';
import styled, { injectGlobal } from 'styled-components';
import { Page, Navigator, BackButton, Modal } from 'react-onsenui';
import { User, Service } from '../../../service';
import {
  CricketGame,
  CricketTurnDetails,
  CricketThrowDetails,
  CricketThrowResult
} from '../models';
import { CricketPoints } from './CricketPoints';
import { CricketPlayers } from './CricketPlayers';
import * as _ from 'lodash';
import { Button } from '../../../common/PointButton';

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
`;

const ThrowDetails = styled.div`
  min-width: 200px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const ThrowValue = styled.span`
  padding-left: 3px;
  padding-right: 3px;
  color: #ffa500;
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
    this.state = this.initGame();
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

    return { game, turn: this.newTurn(this.props.players[0].username) };
  };

  componentDidMount() {
    this.initGame();
  }

  newTurn = (username: string) => {
    return {
      username,
      throws: []
    };
  };

  handleBackButton = async () => {
    if (this.state.game.endedAt) {
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
        <span>+{points}p</span>
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
          ? maxScorePlayers // currentUserClosed && has max points => winner
          : []; // game is still open
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

    var winners = checkEndgame();
    if (winners.length === 1) {
      game.winner = turn.username;
      game.endedAt = new Date();
    } else if (winners.length > 1) {
      game.endedAt = new Date();
      // todo: slack!
      Ons.notification.toast(`Tie between ${winners.join(', ')}`, {
        timeout: 1500
      });
    }

    this.setState(
      { game, turn: updateTurns() },
      winners.length === 1 ? this.handleGameEnd : _.noop
    );
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

  handleGameEnd = async () => {
    const { game } = this.state;
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

  renderModal = () => {
    return (
      <Modal isOpen={this.state.showModal}>
        <p>Please wait...</p>
      </Modal>
    );
  };

  render() {
    return (
      <Page renderModal={this.renderModal}>
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
              />
            )}
            {this.state.game.endedAt && (
              <Button onClick={() => this.setState(this.initGame())}>
                restart
              </Button>
            )}
          </PointsContainer>
        </Container>
      </Page>
    );
  }
}
