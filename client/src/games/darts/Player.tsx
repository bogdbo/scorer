import * as React from 'react';
import { ThrowHistory } from './models';
import styled from 'styled-components';
import { Card } from 'react-onsenui';

interface Props {
  username: string;
  score: number;
  active: boolean;
  history: ThrowHistory[];
}

const PlayerCard = styled.div`
  opacity: ${(props: { active: boolean }) => (props.active ? 1 : 0.4)};
  flex: 1 0 50%;
  > ons-card {
    margin: 2px;
    padding: 5px;
    border-radius: 0;
  }
`;

const LastHits = styled.div`
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  justify-content: space-around;
`;

export const Player: React.SFC<Props> = (props: Props) => {
  const getHistory = (history: ThrowHistory[]) => {
    var currentUserHistory = history
      .filter(h => h.username === props.username)
      .slice(-3);
    return currentUserHistory.map((h, i) => (
      <div key={h.username + i}>{h.points}</div>
    ));
  };

  return (
    // tslint:disable-next-line:no-console
    <PlayerCard
      innerRef={(ref: HTMLDivElement) =>
        ref &&
        props.active &&
        ref.scrollIntoView({
          block: 'end',
          inline: 'nearest',
          behavior: 'smooth'
        })
      }
      active={props.active}
    >
      <Card>
        <div>{props.username}</div>
        <div>
          <b>{props.score}</b>
        </div>
        <LastHits>{getHistory(props.history)}</LastHits>
      </Card>
    </PlayerCard>
  );
};
