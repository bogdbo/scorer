import * as _ from 'lodash';
import * as React from 'react';
import {
  BackButton,
  Fab,
  Icon,
  Page,
  Tab,
  TabbarRenderTab,
  Toolbar
} from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';

import { SelectPlayers } from '../../../common/SelectPlayers';
import TabbarWrapper from '../../../common/TabBarWrapper';
import { Service, User } from '../../../service';
import { X01GameSettings } from '../models';
import { X01Settings } from './X01Settings';

interface Props {}

interface State {
  tabIndex: number;
  settings: X01GameSettings;
  selectedPlayers: User[];
}

export class X01SettingsPageInternal extends React.Component<
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

  handleSettingsChanged = (settings: X01GameSettings) => {
    Service.setX01Settings(settings);
    this.setState({ settings });
  };

  renderTabs = (): TabbarRenderTab[] => [
    {
      content: (
        <SelectPlayers
          key="selectPlayers"
          onPlayersChanged={selectedPlayers =>
            this.setState({ selectedPlayers })
          }
        />
      ),
      tab: (
        <Tab key="selectPlayersTab" label="Select players" icon="md-accounts" />
      )
    },
    {
      content: (
        <X01Settings
          key="x01Settings"
          settings={this.state.settings}
          onSettingsChanged={this.handleSettingsChanged}
        />
      ),
      tab: <Tab key="x01SettingsTab" label="Settings" icon="md-settings" />
    }
  ];

  renderStartGameButton = () => {
    return (
      <Fab
        disabled={this.state.selectedPlayers.length < 2}
        position="bottom center"
        onClick={() =>
          this.props.history.push('/x01/play', {
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
        <div className="center">X01 game settings</div>
      </Toolbar>
    );
  };

  render() {
    return (
      <Page
        renderToolbar={this.renderToolbar}
        renderFixed={this.renderStartGameButton}
      >
        <TabbarWrapper
          swipeable={true}
          position="auto"
          animation="none"
          index={this.state.tabIndex}
          renderTabs={this.renderTabs}
        />
      </Page>
    );
  }
}

export const X01SettingsPage = withRouter(X01SettingsPageInternal);
