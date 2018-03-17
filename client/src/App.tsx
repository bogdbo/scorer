import * as React from 'react';
import { Navigator, Toolbar, BackButton, Page, Button } from 'react-onsenui';
import 'onsenui/css/onsenui.min.css';
import 'onsenui/css/onsenui-core.min.css';
import 'onsenui/css/dark-onsen-css-components.min.css';
import 'onsenui/css/onsenui-fonts.css';
import { DartsGame } from './games/darts/Darts';

interface GamesProps {
  navigator: Navigator;
}
const Games: React.SFC<GamesProps> = (props: GamesProps) => {
  return (
    <Page
      renderToolbar={() => {
        return (
          <Toolbar>
            <div className="left">
              <BackButton />
            </div>
            <div className="center">Stateless Navigator</div>
          </Toolbar>
        );
      }}
    >
      <Button
        onClick={() =>
          props.navigator.pushPage({ comp: DartsGame }, { animation: 'slide' })
        }
      >
        Darts
      </Button>
      <Button onClick={() => props.navigator.pushPage({ comp: DartsGame })}>
        Foosball
      </Button>
      <Button onClick={() => props.navigator.pushPage({ comp: DartsGame })}>
        Fifa
      </Button>
    </Page>
  );
};

export default class App extends React.Component {
  renderPage = (route: any, navigator: Navigator) => {
    route.props = route.props || {};
    route.props.navigator = navigator;
    return React.createElement(route.comp, route.props);
  };

  render() {
    return (
      <Navigator initialRoute={{ comp: Games }} renderPage={this.renderPage} />
    );
  }
}
