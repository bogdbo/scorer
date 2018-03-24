import * as React from 'react';
import {
  Navigator,
  Page,
  Button,
  Toolbar,
  ProgressCircular,
  BottomToolbar
} from 'react-onsenui';
import 'onsenui/css/onsenui.min.css';
import 'onsenui/css/onsenui-core.min.css';
import 'onsenui/css/onsen-css-components.min.css';
import 'onsenui/css/onsenui-fonts.css';
import styled from 'styled-components';
import { Service } from './service';
import { DartsSettingsPage } from './games/darts/DartsSettingsPage';
import * as Ons from 'onsenui';

const Container = styled.div`
  display: flex;
  flex-flow: column;
  margin: 20px;
`;

const GameButton = styled(Button)`
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

const VersionContainer = styled.div`
  float: right;
  padding: 15px;
`;

interface GamesProps {
  navigator: Navigator;
}

interface GamesState {
  users?: any;
  identitySelected?: boolean;
}

class Games extends React.Component<GamesProps, GamesState> {
  constructor(props: GamesProps) {
    super(props);
    this.state = {};
  }

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="center">
          <img height="20" src="favicon.png" />
          <b> Scorer</b>
        </div>
      </Toolbar>
    );
  };

  async componentDidMount() {
    const result = await Service.getUsers();
    this.setState({
      users: result.data,
      identitySelected: Service.getCurrentIdentity() != null
    });
  }

  handleIdentityChange = (e: any) => {
    if (e.target.value === 'none') {
      this.setState({ identitySelected: false });
    } else {
      Service.setCurrentIdentity(e.target.value);
      this.setState({ identitySelected: true });
    }
  };

  renderCurrentIdentity = () => {
    const currentIdentity = Service.getCurrentIdentity();
    if (this.state.users) {
      return (
        <select
          className="select-input"
          defaultValue={currentIdentity || 'none'}
          onChange={this.handleIdentityChange}
        >
          <option value="none">Select your identity...</option>
          {this.state.users.map((u: any) => (
            <option key={u.username}>{u.username}</option>
          ))}
        </select>
      );
    } else {
      return <ProgressCircular indeterminate={true} />;
    }
  };

  renderVersionToolbar = () => {
    return (
      <BottomToolbar>
        <VersionContainer>
          <span>Alpha version</span>
        </VersionContainer>
      </BottomToolbar>
    );
  };
  render() {
    return (
      <Page
        renderToolbar={this.renderToolbar}
        renderBottomToolbar={this.renderVersionToolbar}
      >
        <IdentityContainer>{this.renderCurrentIdentity()}</IdentityContainer>
        <Container>
          <GameButton
            disabled={!this.state.identitySelected}
            onClick={() =>
              this.props.navigator.pushPage({ comp: DartsSettingsPage })
            }
          >
            Darts
          </GameButton>
          <GameButton disabled={true}>Foosball</GameButton>
          <GameButton disabled={true}>Fifa</GameButton>
        </Container>
      </Page>
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

  componentDidMount() {
    Ons.ready(() => {
      Ons.disableAnimations();
    });

    window.onbeforeunload = (e: any) => {
      var dialogText = 'Are you sure you want to leave the page?';
      e.returnValue = dialogText;
      return dialogText;
    };
  }

  render() {
    return (
      <Navigator
        initialRoute={{ comp: Games, hasBackButton: false }}
        renderPage={this.renderPage}
        animation="slide"
      />
    );
  }
}
