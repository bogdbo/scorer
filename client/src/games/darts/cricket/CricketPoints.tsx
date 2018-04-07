import * as React from 'react';
import styled from 'styled-components';
import { Icon } from 'react-onsenui';
import { Button } from '../../../common/PointButton';

const Container = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(8, 1fr);
  border-collapse: collapse;
  flex: 1;
`;

const Undo = styled(Button)`
  grid-row: 1;
  grid-column: 5 / 7;
  background-color: #e6c1b3;
  font-size: 2vmax;
`;

const Miss = styled(Button)`
  grid-column: span 2;
  background-color: #c77474;
  font-size: 2vmax;
`;

const PointButton = styled(Button)`
  grid-column: span 2;
`;

const NextPlayerButton = styled(Button)`
  grid-row: 1;
  grid-column: 1 / 5;
  background-color: #e0c070;
  font-size: 2vmax;
`;

interface Props {
  onPoints: (hit: number, multiplier: number) => void;
  onUndo: () => void;
  onNextPlayer: () => void;
}

export const CricketPoints: React.SFC<Props> = (props: Props) => {
  const getButton = (
    text: string | JSX.Element,
    value: number,
    multiplier: number
  ) => {
    return (
      <PointButton
        key={value * multiplier}
        odd={value % 2 === 0}
        onClick={() => props.onPoints(value, multiplier)}
      >
        <span>{multiplier === 1 ? value : '⨯' + multiplier}</span>
      </PointButton>
    );
  };

  const renderButtons = () => {
    var elems = [];
    for (let i = 20; i >= 15; i--) {
      for (let multiplier = 1; multiplier <= 3; multiplier++) {
        elems.push(getButton(i.toString(), i, multiplier));
      }
    }

    elems.push(getButton(<Icon icon="bullseye" size={40} />, 25, 1));
    elems.push(getButton(<Icon icon="bullseye" size={40} />, 25, 2));
    return elems;
  };

  return (
    <Container>
      {renderButtons()}
      <Miss
        onClick={() => {
          props.onPoints(0, 1);
        }}
      >
        <span>MISS</span>
      </Miss>
      <Undo onClick={props.onUndo}>
        <span>UNDO</span>
      </Undo>
      <NextPlayerButton key="nextplayer" onClick={() => props.onNextPlayer()}>
        <span>SKIP</span>
      </NextPlayerButton>
    </Container>
  );
};
