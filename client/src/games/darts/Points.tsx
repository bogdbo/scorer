import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: grid;
  grid-gap: 2px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: 'double double tripple tripple tripple';
  border-collapse: collapse;
`;

const Button = styled.div`
  display: flex;
  flex: 1 1 auto;
  vertical-align: middle;
  align-self: center;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${(props: { odd?: boolean }) =>
    props.odd ? '#FF8800' : '#0088FF'};
`;

interface MultiplierProps {
  type: string;
  selected?: boolean;
}
const Multiplier = styled(Button)`
  background-color: ${(props: MultiplierProps) =>
    props.selected ? 'red' : 'yellow'};
  grid-area: ${(props: MultiplierProps) => props.type};
`;

const Undo = styled(Button)`
  grid-row: 6;
  grid-column: 2;
  grid-column-end: -1;
`;

interface State {
  multiplier: 1 | 2 | 3;
}

interface Props {
  onPoints?: (points: Number) => void;
  onUndo: () => void;
}

export class Points extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { multiplier: 1 };
  }

  getButton(text: string, value: number) {
    return (
      <Button
        key={text}
        onClick={() => {
          if (this.props.onPoints) {
            this.props.onPoints(value * this.state.multiplier);
          }

          this.setState({ multiplier: 1 });
        }}
        odd={value % 2 === 0}
      >
        <span>{text}</span>
      </Button>
    );
  }

  renderButtons() {
    var elems = [];
    for (let i = 1; i <= 20; i++) {
      elems.push(this.getButton(i.toString(), i));
    }

    elems.push(this.getButton('BULL', 25));
    return elems;
  }

  renderMultipliers() {
    return (
      <>
        <Multiplier
          key="double"
          type="double"
          selected={this.state.multiplier === 2}
          onClick={() =>
            this.setState({ multiplier: this.state.multiplier === 2 ? 1 : 2 })
          }
        >
          Double
        </Multiplier>
        <Multiplier
          key="triple"
          type="tripple"
          selected={this.state.multiplier === 3}
          onClick={() =>
            this.setState({ multiplier: this.state.multiplier === 3 ? 1 : 3 })
          }
        >
          Triple
        </Multiplier>
      </>
    );
  }

  render() {
    return (
      <Container>
        {this.renderMultipliers()}
        {this.renderButtons()}
        <Undo onClick={this.props.onUndo}>Undo</Undo>
      </Container>
    );
  }
}
