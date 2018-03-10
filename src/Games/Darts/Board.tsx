import * as React from 'react';
import styled from 'styled-components';
import { Player } from './Player';
import { Points } from './Points';

const Container = styled.div`
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 4fr;
`;

export class Darts extends React.Component<{}, {}> {
  render() {
    return (
      <Container>
        <Player />
        <Points />
      </Container>
    );
  }
}
