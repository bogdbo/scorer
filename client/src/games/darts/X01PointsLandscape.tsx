import * as React from 'react';
import styled from 'styled-components';
import * as Ons from 'onsenui';

const Container = styled.div`
  display: grid;
  grid-gap: 2px;
  margin: 5px;
  grid-template-areas: 'l l s s s s d d d d t t t t r r';
  border-collapse: collapse;
`;

const Button = styled.div`
  font-size: 1.1rem;
  display: flex;
  flex: 1 1 auto;
  vertical-align: middle;
  align-self: center;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  color: #5c5e5f;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  background-color: ${(props: { odd?: boolean }) =>
    props.odd ? '#B9C6C9' : '#C6D2D4'};
`;

const MultiplierGroupBase = styled.div`
  display: grid;
  grid-template: repeat(4, 1fr) / repeat(5, 1fr);
  grid-gap: 2px;
`;

const Singles = styled(MultiplierGroupBase)`
  grid-area: s;
`;

const Doubles = styled(MultiplierGroupBase)`
  grid-area: d;
`;

const Triples = styled(MultiplierGroupBase)`
  grid-area: t;
`;

interface MultiplierProps {
  type: string;
  selected?: boolean;
}
const Multiplier = styled(Button)`
  grid-area: ${(props: MultiplierProps) => props.type};
  color: ${(props: MultiplierProps) =>
    props.selected ? '#E9F9C2' : '#5c5e5f'};
`;

const Double = styled(Multiplier)`
  background-color: ${(props: MultiplierProps) =>
    props.selected ? '#72AC4A' : '#E9F9C2'};
`;

const Tripple = styled(Multiplier)`
  background-color: ${(props: MultiplierProps) =>
    props.selected ? '#72AC4A' : '#D8FA86'};
`;

// const Undo = styled(Button)`
//   grid-row: 6;
//   grid-column: 2;
//   grid-column-end: 5;
//   background-color: #e6c1b3;
// `;

// const Miss = styled(Button)`
//   grid-row: 6;
//   grid-column: 5;
//   grid-column-end: 6;
//   background-color: #c77474;
// `;

interface State {
  multiplier: 1 | 2 | 3;
}

interface Props {
  onPoints: (hit: number, multiplier: number) => void;
  onUndo: () => void;
}

export class X01PointsLandscape extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { multiplier: 1 };
  }

  getButton(text: string, value: number) {
    return (
      <Button
        key={text}
        onClick={() => {
          const points = value * this.state.multiplier;
          if (points <= 60) {
            this.props.onPoints(value, this.state.multiplier);
          } else {
            Ons.notification.toast('Tripple bull is not a valid hit.', {
              timeout: 1500
            });
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

    // elems.push(this.getButton('BULL', 25));
    return elems;
  }

  renderMultipliers() {
    return (
      <>
        <Double
          key="double"
          type="double"
          selected={this.state.multiplier === 2}
          onClick={() => {
            window.navigator.vibrate(50);
            this.setState({ multiplier: this.state.multiplier === 2 ? 1 : 2 });
          }}
        >
          Double
        </Double>
        <Tripple
          key="triple"
          type="tripple"
          selected={this.state.multiplier === 3}
          onClick={() => {
            window.navigator.vibrate(50);
            this.setState({ multiplier: this.state.multiplier === 3 ? 1 : 3 });
          }}
        >
          Triple
        </Tripple>
      </>
    );
  }

  render() {
    return (
      <Container>
        {/* {this.renderMultipliers()} */}
        <Singles>{this.renderButtons()}</Singles>
        <Doubles>{this.renderButtons()}</Doubles>
        <Triples>{this.renderButtons()}</Triples>

        {/* <Undo onClick={this.props.onUndo}>Undo</Undo>
        <Miss
          onClick={() => {
            this.props.onPoints(0, 1);
            this.setState({ multiplier: 1 });
          }}
        >
          Miss
        </Miss> */}
      </Container>
    );
  }
}
