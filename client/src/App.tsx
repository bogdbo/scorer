import * as React from 'react';
import { Navigator, Page, Button, Toolbar, ProgressCircular } from 'react-onsenui';
import 'onsenui/css/onsenui.min.css';
import 'onsenui/css/onsenui-core.min.css';
import 'onsenui/css/onsen-css-components.min.css';
import 'onsenui/css/onsenui-fonts.css';
import { DartsGame } from './games/darts/Darts';
import styled from 'styled-components';
import { Service } from './service';

const Container = styled.div`
  display: flex;
  flex-flow: column;
  margin: 20px;
`;

const GameButton = styled(Button) `
  height: 80px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  justify-content: center;
`;

const IdentityContainer = styled.div`
  display: flex;
  align-content: center;
  justify-content: center;
  > select {
    height: 30px;
    display: flex;
    flex: 1;
    margin: 20px;
  }
`;

interface GamesProps {
  navigator: Navigator;
}

interface GamesState {
  users?: any;
}

class Games extends React.Component<GamesProps, GamesState> {
  constructor(props: GamesProps) {
    super(props);
    this.state = {};
  }

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="center">Scorer</div>
      </Toolbar>);
  };

  async componentDidMount() {
    const result = await Service.getUsers();
    this.setState({ users: result.data });
  }

  handleIdentityChange = (e: any) => {
    Service.setCurrentIdentity(e.target.value);
  };

  renderCurrentIdentity = () => {
    const currentIdentity = Service.getCurrentIdentity() || '';
    if (this.state.users) {
      return (
        <select defaultValue={currentIdentity} onChange={this.handleIdentityChange}>
          {(this.state.users || []).map((u: any) => (<option key={u.username}>{u.username}</option>))}
        </select>
      );
    } else {
      return <ProgressCircular indeterminate={true} />;
    }
  };

  render() {
    return (
      <Page renderToolbar={this.renderToolbar}>
        <IdentityContainer>
          {this.renderCurrentIdentity()}
        </IdentityContainer>
        <Container>
          <GameButton onClick={() => this.props.navigator.pushPage({ comp: DartsGame })}>
            Darts
      </GameButton>
          <GameButton onClick={() => this.props.navigator.pushPage({ comp: DartsGame })}>
            Foosball
      </GameButton>
          <GameButton onClick={() => this.props.navigator.pushPage({ comp: DartsGame })}>
            Fifa
      </GameButton>
        </Container>
      </Page >
    );
  }
}

export default class App extends React.Component {
  renderPage = (route: any, navigator: Navigator) => {
    route.props = route.props || {};
    route.props.key = route.comp.name;
    route.props.navigator = navigator;
    return React.createElement(route.comp, route.props);
  };

  render() {
    return (
      <Navigator initialRoute={{ comp: Games, hasBackButton: false }} renderPage={this.renderPage} />
    );
  }
}
