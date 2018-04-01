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
  font-size: 1rem;
`;

const Miss = styled(Button)`
  grid-row: 1;
  grid-column: 1 / 5;
  background-color: #c77474;
  font-size: 1rem;
`;

const PointButton = styled(Button)`
  grid-column: span ${(p: { isBull?: boolean }) => (p.isBull ? 3 : 2)};
`;

interface State {}

interface Props {
  onPoints: (hit: number, multiplier: number) => void;
  onUndo: () => void;
}

export class CricketPoints extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { multiplier: 1 };
  }

  getButton(
    text: string | JSX.Element,
    value: number,
    multiplier: number,
    isBull?: boolean
  ) {
    return (
      <PointButton
        key={value * multiplier}
        odd={value % 2 === 0}
        isBull={isBull}
        onClick={() => this.props.onPoints(value, multiplier)}
      >
        <span>{multiplier === 1 ? value : '⨯' + multiplier}</span>
      </PointButton>
    );
  }

  renderButtons = () => {
    var elems = [];
    for (let i = 20; i >= 15; i--) {
      for (let multiplier = 1; multiplier <= 3; multiplier++) {
        elems.push(this.getButton(i.toString(), i, multiplier));
      }
    }

    elems.push(this.getButton(<Icon icon="bullseye" size={40} />, 25, 1, true));
    elems.push(this.getButton(<Icon icon="bullseye" size={40} />, 25, 2, true));
    return elems;
  };

  render() {
    return (
      <Container>
        {this.renderButtons()}
        <Undo onClick={this.props.onUndo}>
          <span>Undo</span>
        </Undo>
        <Miss
          onClick={() => {
            this.props.onPoints(0, 1);
            this.setState({ multiplier: 1 });
          }}
        >
          <span>Miss</span>
        </Miss>
      </Container>
    );
  }
}
