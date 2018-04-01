import * as React from 'react';
import { Page, Toolbar, BackButton, Fab, Icon, Navigator } from 'react-onsenui';
import * as _ from 'lodash';
import { X01GameSettings } from '../models';
import { User, Service } from '../../../service';
import { SelectPlayers } from '../../../common/SelectPlayers';
import { CricketGamePage } from './CricketGamePage';

interface Props {
  navigator: Navigator;
}

interface State {
  tabIndex: number;
  settings: X01GameSettings;
  selectedPlayers: User[];
}

export class CricketSettingsPage extends React.Component<Props, State> {
  constructor(props: Props) {
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
          this.props.navigator.pushPage({
            comp: CricketGamePage,
            props: {
              players: _.shuffle(this.state.selectedPlayers),
              settings: this.state.settings
            }
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
          <BackButton />
        </div>
        <div className="center">
          {(Service.getCurrentIdentity() || '')
            .toLowerCase()
            .includes('antonio')
            ? 'Crocket'
            : 'Cricket'}{' '}
          game settings
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
