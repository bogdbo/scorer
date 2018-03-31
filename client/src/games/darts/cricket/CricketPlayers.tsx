import * as React from 'react';
import { CricketGame, CricketTurnDetails } from '../models';
import styled, { keyframes } from 'styled-components';
import * as _ from 'lodash';

const PlayerScores = styled.div`
  display: grid;
  grid-gap: 5px;
  grid-auto-columns: minmax(30%, 50%);
  grid-template-rows: 100%;
  flex: 1 0 100%;
`;

type PlayerColumnProps = {
  isActive: boolean;
  column: number;
};

const HighlightActivePlayer = keyframes`
  0%  {
    box-shadow: 0px 0px 5px 1px rgba(0,160,176,0.5);
  }
  50% {
    box-shadow: 0px 0px 15px 1px rgba(0,160,176,0.5);
  }
  100% {
    box-shadow: 0px 0px 5px 1px rgba(0,160,176,0.5);
  }
`;

const PlayerColumn = styled.div`
  grid-column: ${(p: PlayerColumnProps) => p.column};
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  grid-row-gap: 5px;
  text-align: center;
  background: #f8fafa;
  /* animation: ${(p: PlayerColumnProps) =>
    p.isActive ? HighlightActivePlayer : 'none'}
    1.7s ease-in-out infinite; */
  opacity: ${(p: PlayerColumnProps) => (p.isActive ? 1 : 0.6)};
`;

const PlayerHeader = styled.div`
  display: flex;
  flex-flow: column;
  align-content: ceter;
  justify-content: space-around;
  white-space: pre;
  text-overflow: ellipsis;
  overflow: hidden;
  > div {
    white-space: pre;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

type ScoreProps = {
  isClosed: boolean;
  canScorePoints: boolean;
};

const Score = styled.div`
  display: flex;
  flex-flow: column;
  align-content: ceter;
  justify-content: space-around;
  background: ${(p: ScoreProps) =>
    p.canScorePoints ? '#88C100' : p.isClosed ? '#EB6841' : 'initial'};
  color: ${(p: ScoreProps) => (p.isClosed ? '#6A4A3C' : 'initial')};
`;

interface Props {
  game: CricketGame;
  turn: CricketTurnDetails;
}

export const CricketPlayers: React.SFC<Props> = (props: Props) => {
  const isOpen = (hit: number) => {
    return _.some(props.game.players.map(p => props.game.scores[p][hit] < 3));
  };

  const renderPlayers = () => {
    const renderScores = (username: string) => {
      return _.range(15, 20 + 1)
        .reverse()
        .concat(25)
        .map(n => {
          const open = isOpen(n);
          const canScorePoints = props.game.scores[username][n] === 3 && open;
          return (
            <Score
              key={username + n}
              isClosed={!open}
              canScorePoints={canScorePoints}
            >
              <span>{props.game.scores[username][n]}</span>
            </Score>
          );
        });
    };

    return props.game.players.map((p, i) => {
      const isActive = p === props.turn.username;
      return (
        <PlayerColumn
          key={p + i}
          column={i + 1}
          isActive={isActive}
          innerRef={(ref: HTMLDivElement) =>
            ref &&
            isActive &&
            ref.scrollIntoView({
              block: 'start',
              inline: 'start',
              behavior: 'smooth'
            })
          }
        >
          <PlayerHeader key={p + 'username'}>
            <div>{p}</div>
            <div>{props.game.scores[p].points}</div>
          </PlayerHeader>
          {renderScores(p)}
        </PlayerColumn>
      );
    });
  };

  return <PlayerScores>{renderPlayers()}</PlayerScores>;
};
