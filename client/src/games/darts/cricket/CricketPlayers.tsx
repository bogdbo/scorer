import * as React from 'react';
import { CricketGame, CricketTurnDetails } from '../models';
import styled from 'styled-components';
import * as _ from 'lodash';
import { Icon } from 'react-onsenui';

const PlayerScores = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-auto-columns: minmax(30%, 50%);
  grid-template-rows: 100%;
  flex: 1 0 100%;
`;

type PlayerColumnProps = {
  isActive: boolean;
  column: number;
};

const PlayerColumn = styled.div`
  grid-column: ${(p: PlayerColumnProps) => p.column};
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  grid-row-gap: 2px;
  text-align: center;
  background: #f8fafa;
  > div:not(:first-child) {
    opacity: ${(p: PlayerColumnProps) => (p.isActive ? 1 : 0.8)};
  }
`;

type PlayerHeaderProps = {
  isActive: boolean;
};

const PlayerHeader = styled.div`
  display: flex;
  flex-flow: column;
  align-content: ceter;
  justify-content: space-around;
  white-space: pre;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 2.7vmax;
  box-shadow: ${(p: PlayerHeaderProps) =>
    p.isActive ? 'inset 0px 0px 100px 3px rgb(175, 214, 103);' : 'none'};
  > div {
    white-space: pre;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

type ScoreProps = {
  isClosed: boolean;
  canScorePoints: boolean;
  index: number;
};

const Score = styled.div`
  display: flex;
  flex-flow: column;
  align-content: ceter;
  justify-content: space-around;
  text-shadow: -1px 1px #00000059;
  background: ${(p: ScoreProps) =>
    p.canScorePoints
      ? '#88C100'
      : p.isClosed ? '#EB6841' : p.index % 2 === 0 ? '#B9C6C9' : '#C6D2D4'};
  ons-icon {
    font-size: 5vmax;
    color: purple;
  }
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
          const score = props.game.scores[username][n];
          return (
            <Score
              key={username + n}
              index={n}
              isClosed={!open}
              canScorePoints={canScorePoints}
            >
              {props.game.scores[username][n] > 0 && (
                <Icon
                  icon={
                    score === 1
                      ? 'star-o'
                      : score === 2 ? 'star-half-o' : 'star'
                  }
                />
              )}
            </Score>
          );
        });
    };

    return props.game.players.map((p, i) => {
      const isActive = p === (props.game.winner || props.turn.username);
      return (
        <PlayerColumn
          isActive={isActive}
          key={p + i}
          column={i + 1}
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
          <PlayerHeader key={p + 'username'} isActive={isActive}>
            <div>{p}</div>
            <div>{props.game.scores[p].points}p</div>
          </PlayerHeader>
          {renderScores(p)}
        </PlayerColumn>
      );
    });
  };

  return <PlayerScores>{renderPlayers()}</PlayerScores>;
};
