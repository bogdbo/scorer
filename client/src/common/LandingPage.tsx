import * as Ons from 'onsenui';
import * as moment from 'moment';
import * as React from 'react';
import {
  BottomToolbar,
  Button,
  Icon,
  Page,
  ProgressCircular,
  Toolbar
} from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { About, MedalsType } from '../games/darts/models';
import { Service } from '../service';
import { Medal } from './Medal';

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
  flex-flow: row;
  align-content: center;
  justify-content: center;
  margin: 20px;
  > select {
    font-weight: bold;
    height: 30px;
    display: flex;
    flex: 1;
    > option {
      direction: ltr;
    }
  }
  > div {
    display: flex;
    align-items: center;
  }
`;

const StyledBottomToolbar = styled(BottomToolbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  font-family: monospace;
  > div:last-child {
    font-weight: bold;
  }
`;

interface Props {}

interface State {
  users?: any;
  identitySelected?: boolean;
  about?: About;
  medals?: MedalsType;
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
    const usersResult = await Service.getUsers();
    this.setState({
      users: usersResult.data,
      identitySelected: Service.getCurrentIdentity() != null
    });

    this.refreshStats();

    // Get version info async to not lock landing page
    Service.getAboutInfo()
      .then(result => this.setState({ about: result.data }))
      .catch(() => null);
  }

  refreshStats = async (ignoreCache: boolean = false) => {
    try {
      this.setState({ medals: undefined });
      const result = await Service.getAllMedals(ignoreCache);
      this.setState({ medals: result.data });
    } catch (ex) {
      Ons.notification.toast('Cannot retrieve stats', { timeout: 3000 });
    }
  };

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
          dir="rtl"
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

  renderBottomToolbar = () => {
    if (this.state.about == null) {
      return null;
    }

    const relativeFrom = moment(this.state.about.from).fromNow();
    return (
      <StyledBottomToolbar>
        <div className="left">Released {relativeFrom}</div>
        <div className="right">{this.state.about.version}</div>
      </StyledBottomToolbar>
    );
  };

  renderMedals = () => {
    if (this.state.medals && this.state.identitySelected) {
      return (
        <div>
          {Object.keys(
            this.state.medals[Service.getCurrentIdentity() as string] || {}
          ).map((e, i) => (
            <Medal
              key={'medal' + i}
              type={parseInt(e, 0)}
              count={
                this.state.medals &&
                this.state.medals[Service.getCurrentIdentity() as string][e]
              }
            />
          ))}
        </div>
      );
    }

    return null;
  };

  render() {
    return (
      <Page
        renderToolbar={this.renderToolbar}
        renderBottomToolbar={this.renderBottomToolbar}
      >
        <IdentityContainer>
          {this.renderMedals()}
          {this.renderCurrentIdentity()}
        </IdentityContainer>
        <Container>
          <GameButton
            disabled={!this.state.identitySelected}
            onClick={() => this.props.history.push('/x01/settings')}
          >
            <Icon icon="bullseye" />
            &nbsp; x01
          </GameButton>
          <GameButton
            disabled={!this.state.identitySelected}
            onClick={() => this.props.history.push('/cricket/settings')}
          >
            <Icon icon="table" />
            &nbsp;
            {(Service.getCurrentIdentity() || '')
              .toLowerCase()
              .includes('antonio')
              ? 'Crocket'
              : 'Cricket'}
          </GameButton>
          <GameButton onClick={() => this.props.history.push('/stats')}>
            <Icon icon="bar-chart" />
            &nbsp; Stats
          </GameButton>
        </Container>
      </Page>
    );
  }
}

export const LandingPage = withRouter(LandingPageInternal);
