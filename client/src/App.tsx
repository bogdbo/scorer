import 'onsenui/css/onsenui-core.min.css';
import 'onsenui/css/onsenui-fonts.css';
import 'onsenui/css/onsenui.min.css';
import 'src/common/custom-theme.css';

import * as Ons from 'onsenui';
import * as React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter, Redirect } from 'react-router-dom';

import { LandingPage } from './common/LandingPage';
import { CricketGamePageInternal } from './games/darts/cricket/CricketGamePage';
import { CricketSettingsPage } from './games/darts/cricket/CricketSettingsPage';
import { X01GamePageInternal } from './games/darts/x01/X01GamePage';
import { X01SettingsPageInternal } from './games/darts/x01/X01SettingsPage';

export default class App extends React.Component {
  componentDidMount() {
    Ons.ready(() => {
      Ons.disableAnimations();
    });
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/x01/settings" component={X01SettingsPageInternal} />
          <Route path="/x01/play" component={X01GamePageInternal} />
          <Redirect from="/x01" to="/x01/settings" />
          <Route path="/cricket/settings" component={CricketSettingsPage} />
          <Route path="/cricket/play" component={CricketGamePageInternal} />
          <Redirect from="/cricket" to="/cricket/settings" />
          <Route path="/" component={LandingPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}
