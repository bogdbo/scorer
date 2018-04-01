import * as React from 'react';
import {
  BottomToolbar,
  Button,
  Navigator,
  Page,
  ProgressCircular,
  Toolbar
} from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';

import { Service } from '../service';

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

interface Props {
  navigator: Navigator;
}

interface State {
  users?: any;
  identitySelected?: boolean;
}

class LandingPageInternal extends React.Component<
  Props & RouteComponentProps<{}>,
  State
> {
  constructor(props: Props & RouteComponentProps<{}>) {
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
            onClick={() => this.props.history.push('/x01/settings')}
          >
            x01
          </GameButton>
          <GameButton
            disabled={!this.state.identitySelected}
            onClick={() => this.props.history.push('/cricket/settings')}
          >
            {(Service.getCurrentIdentity() || '')
              .toLowerCase()
              .includes('antonio')
              ? 'Crocket'
              : 'Cricket'}
          </GameButton>
          <GameButton disabled={true}>Stats</GameButton>
        </Container>
      </Page>
    );
  }
}

export const LandingPage = withRouter(LandingPageInternal);
