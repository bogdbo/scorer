import * as _ from 'lodash';
import * as React from 'react';
import { BackButton, Fab, Icon, Page, Toolbar } from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import { SelectPlayers } from '../../../common/SelectPlayers';
import { Service, User } from '../../../service';
import { X01GameSettings } from '../models';

interface Props {}

interface State {
  tabIndex: number;
  settings: X01GameSettings;
  selectedPlayers: User[];
}

class CricketSettingsPageInternal extends React.Component<
  Props & RouteComponentProps<{}>,
  State
> {
  constructor(props: Props & RouteComponentProps<{}>) {
    super(props);
    this.state = {
      tabIndex: 0,
      selectedPlayers: [],
      settings: Service.getX01Settings()
    };
  }

  renderStartGameButton = () => {
    return (
      <Fab
        disabled={this.state.selectedPlayers.length < 2}
        position="bottom center"
        onClick={() =>
          this.props.history.push('/cricket/play', {
            players: _.shuffle(this.state.selectedPlayers),
            settings: this.state.settings
          })
        }
      >
        <Icon icon="md-play" />
      </Fab>
    );
  };

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="left">
          <BackButton onClick={() => this.props.history.goBack()} />
        </div>
        <div className="center">
          <Icon icon="table" />
          &nbsp;
          {(Service.getCurrentIdentity() || '')
            .toLowerCase()
            .includes('antonio')
            ? 'Crocket'
            : 'Cricket'}{' '}
          settings
        </div>
      </Toolbar>
    );
  };

  render() {
    return (
      <Page
        renderToolbar={this.renderToolbar}
        renderFixed={this.renderStartGameButton}
      >
        <SelectPlayers
          key="selectPlayers"
          onPlayersChanged={selectedPlayers =>
            this.setState({ selectedPlayers })
          }
        />
      </Page>
    );
  }
}

export const CricketSettingsPage = withRouter(CricketSettingsPageInternal);
