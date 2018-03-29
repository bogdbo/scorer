import * as React from 'react';
import { TurnDetails, TurnResult } from './models';
import styled, { keyframes } from 'styled-components';
import { Card } from 'react-onsenui';

const PlayerCard = styled.div`
  opacity: ${(props: { active: boolean }) => (props.active ? 1 : 0.6)};
  height: 90%;
  flex: 1 0 50%;
  max-width: 50%;
  > ons-card {
    margin: 2px;
    padding: 5px;
    border-radius: 0;
    height: 100%;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
  }
`;

const LastHits = styled.div`
  display: flex;
  justify-content: space-around;
  color: ${(p: { valid: boolean }) => (p.valid ? 'inherit' : 'red')};
`;

const PlayerName = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
`;

const Score = styled.div`
  font-size: 3rem;
  padding: 5px;
  font-weight: bold;
  text-align: center;
  font-family: monospace;
`;

const FlashScoreNumber = keyframes`
  0% {
    background-color: #4ECDC4;
  }
  100% {
    background-color: none;
  }
`;

const ScoreNumber = styled.div`
  min-width: 20px;
  text-align: center;
  animation: ${FlashScoreNumber} 0.3s ease-in-out 2;
`;

interface Props {
  username: string;
  score: number;
  active: boolean;
  lastTurn?: TurnDetails;
}

export const Player: React.SFC<Props> = (props: Props) => {
  const getHistory = () => {
    if (!props.lastTurn || !props.lastTurn.throws) {
      return <span>Please wait</span>;
    }

    if (props.lastTurn && props.lastTurn.throws.length === 0) {
      return <span>Your turn</span>;
    }

    return props.lastTurn.throws.map((p, i) => (
      <ScoreNumber key={props.username + i}>{p}</ScoreNumber>
    ));
  };

  return (
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
        <PlayerName>{props.username}</PlayerName>
        <Score>{props.score}</Score>
        <LastHits
          valid={!props.lastTurn || props.lastTurn.valid === TurnResult.Valid}
        >
          {getHistory()}
        </LastHits>
      </Card>
    </PlayerCard>
  );
};
