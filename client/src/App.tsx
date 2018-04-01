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
import withTracker from './common/withTracker';

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
          <Route
            path="/x01/settings"
            component={withTracker(X01SettingsPageInternal)}
          />
          <Route
            path="/x01/play"
            component={withTracker(X01GamePageInternal)}
          />
          <Redirect from="/x01" to="/x01/settings" />
          <Route
            path="/cricket/settings"
            component={withTracker(CricketSettingsPage)}
          />
          <Route
            path="/cricket/play"
            component={withTracker(CricketGamePageInternal)}
          />
          <Redirect from="/cricket" to="/cricket/settings" />
          <Route path="/" component={withTracker(LandingPage)} />
        </Switch>
      </BrowserRouter>
    );
  }
}
