import * as React from 'react';
import styled from 'styled-components';
import { Link, BrowserRouter, Route, Switch } from 'react-router-dom';
import { Darts } from './Games/Darts/Board';

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
`;

const GameList = styled.div`
  display: flex; 
  flex-flow: column;
  flex: 1 1 auto; 
  background-color: blue;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Game = styled(Link)`
 color:red;
 display: block;
 font-size: 5em;
 padding: 5px;
 color: gray;
 text-decoration: none;
 background-color: green;
 display: flex;
 flex: 1 1 auto;
 width: 100%;
 align-self: center;
 justify-content: center;
 margin-bottom: 2px;
`;

const Games: React.SFC<{}> = () => {
  return (
  <GameList>
    <Game to="/darts">Darts</Game>
    <Game to="/foosball">Foosball</Game>
    <Game to="/fifa">Fifa</Game>
  </GameList>);
};

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Container>
          <Switch>
            <Route exact={true} path="/" component={Games}/>
            <Route path="/darts" component={Darts} />
            <Route path="/foosball" component={Darts} />
            <Route path="/fifa" component={Darts} />
          </Switch>
        </Container>
      </BrowserRouter>
    );
  }
}

export default App;