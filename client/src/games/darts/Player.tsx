import * as React from 'react';
import { DartsHistory } from '../../service';

interface Props {
  username: string;
  score: number;
  history: DartsHistory[];
}

export const Player: React.SFC<Props> = (props: Props) => {
  const getHistory = (history: DartsHistory[]) => {
    var currentUserHistory = history
      .filter(h => h.username === props.username)
      .slice(-3);
    return currentUserHistory.map(h => (
      <div key={Date.now.toString()}>{h.points}</div>
    ));
  };

  return (
    <div style={{ flex: '1 0 50%' }}>
      <span>
        {props.username}: {props.score}
      </span>
      <div>{getHistory(props.history)}</div>
    </div>
  );
};
