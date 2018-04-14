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
  grid-column: span 4;
`;

const NextPlayerButton = styled(Button)`
  grid-row: 1;
  grid-column: 1 / 5;
  background-color: #e0c070;
  font-size: 2vmax;
`;

type MultiplierProps = {
  selected?: boolean;
};

const Multiplier = styled(Button)`
  text-orientation: upright;
  font-size: 2.3vmax;
  writing-mode: tb;
  color: ${(props: MultiplierProps) =>
    props.selected ? '#E9F9C2' : '#5c5e5f'};
`;

const Double = styled(Multiplier)`
  grid-column: 5/7;
  grid-row: 2/5;
  background-color: ${(props: MultiplierProps) =>
    props.selected ? '#72AC4A' : '#E9F9C2'};
`;

const Tripple = styled(Multiplier)`
  grid-column: 5/7;
  grid-row: 5/8;
  background-color: ${(props: MultiplierProps) =>
    props.selected ? '#72AC4A' : '#D8FA86'};
`;

interface Props {
  onPoints: (hit: number, multiplier: number) => void;
  onUndo: () => void;
  onNextPlayer: () => void;
}

interface State {
  multiplier: 1 | 2 | 3;
}

export class CricketPointsWithModifiers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { multiplier: 1 };
  }

  getButton = (text: string | JSX.Element, value: number) => {
    return (
      <PointButton
        key={value}
        odd={value % 2 === 0}
        onClick={() => {
          this.props.onPoints(value, this.state.multiplier);
          this.setState({ multiplier: 1 });
        }}
      >
        <span>{value}</span>
      </PointButton>
    );
  };

  renderPoints = () => {
    var elems = [];
    for (let i = 20; i >= 15; i--) {
      elems.push(this.getButton(i.toString(), i));
    }

    elems.push(this.getButton(<Icon icon="bullseye" size={40} />, 25));
    return elems;
  };

  render() {
    return (
      <Container>
        <Double
          selected={this.state.multiplier === 2}
          onClick={() => {
            this.setState({ multiplier: this.state.multiplier === 2 ? 1 : 2 });
          }}
        >
          DOUBLE
        </Double>
        <Tripple
          selected={this.state.multiplier === 3}
          onClick={() => {
            this.setState({ multiplier: this.state.multiplier === 3 ? 1 : 3 });
          }}
        >
          TRIPLE
        </Tripple>
        {this.renderPoints()}
        <Miss
          onClick={() => {
            this.props.onPoints(0, 1);
          }}
        >
          <span>MISS</span>
        </Miss>
        <Undo onClick={this.props.onUndo}>
          <span>UNDO</span>
        </Undo>
        <NextPlayerButton
          key="nextplayer"
          onClick={() => this.props.onNextPlayer()}
        >
          <span>SKIP</span>
        </NextPlayerButton>
      </Container>
    );
  }
}
