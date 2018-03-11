import * as React from 'react';
import styled from 'styled-components';
import { Player } from './Player';
import { Points } from './Points';
import { SelectPlayers } from '../../common/SelectPlayers';
import { User } from '../../service';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
`;

interface Props {}
interface State {
  users?: User[];
}

export class Darts extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  render() {
    if (this.state.users) {
      return (
        <Container>
          <Player />
          <Points />
        </Container>
      );
    } else {
      return <SelectPlayers onFinished={users => this.setState({ users })} />;
    }
  }
}
