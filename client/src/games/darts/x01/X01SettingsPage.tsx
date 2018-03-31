import * as React from 'react';
import {
  Tab,
  TabbarRenderTab,
  Page,
  Toolbar,
  BackButton,
  Fab,
  Icon,
  Navigator
} from 'react-onsenui';
import { X01GamePage } from './X01GamePage';
import * as _ from 'lodash';
import { X01GameSettings } from '../models';
import { User, Service } from '../../../service';
import { SelectPlayers } from '../../../common/SelectPlayers';
import { X01Settings } from './X01Settings';
import TabbarWrapper from '../../../common/TabBarWrapper';

interface Props {
  navigator: Navigator;
}

interface State {
  tabIndex: number;
  settings: X01GameSettings;
  selectedPlayers: User[];
}

export class X01SettingsPage extends React.Component<Props, State> {
  constructor(props: Props) {
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
          this.props.navigator.pushPage({
            comp: X01GamePage,
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
