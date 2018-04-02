import * as React from 'react';
import styled from 'styled-components';
import * as Ons from 'onsenui';
import { Icon } from 'react-onsenui';
import { Button } from '../../../common/PointButton';

const Container = styled.div`
  display: grid;
  grid-gap: 5px;
  margin: 5px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-areas: 'double double tripple tripple next';
  border-collapse: collapse;
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

const NextPlayerButton = styled(Button)`
  grid-area: next;
  background-color: #e0c070;
`;

const Undo = styled(Button)`
  grid-row: 6;
  grid-column: 2 / 5;
  background-color: #e6c1b3;

  > span {
    padding-left: 5px;
  }
`;

const Miss = styled(Button)`
  grid-row: 6;
  grid-column: 5 / 6;
  background-color: #c77474;
  flex-flow: column-reverse;
`;

interface State {
  multiplier: 1 | 2 | 3;
}

interface Props {
  onPoints: (hit: number, multiplier: number) => void;
  onUndo: () => void;
  onSkipPlayer: () => void;
}

export class X01Points extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { multiplier: 1 };
  }

  getButton(text: string | JSX.Element, value: number) {
    return (
      <Button
        key={value}
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

    elems.push(this.getButton(<Icon icon="bullseye" size={40} />, 25));
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
        <NextPlayerButton onClick={() => this.props.onSkipPlayer()}>
          Skip
        </NextPlayerButton>
      </>
    );
  }

  render() {
    return (
      <Container>
        {this.renderMultipliers()}
        {this.renderButtons()}
        <Undo onClick={this.props.onUndo}>
          <Icon icon="undo" />
          <span>Undo</span>
        </Undo>
        <Miss
          onClick={() => {
            this.props.onPoints(0, 1);
            this.setState({ multiplier: 1 });
          }}
        >
          <Icon icon="md-arrow-missed" />
          <span>Miss</span>
        </Miss>
      </Container>
    );
  }
}
