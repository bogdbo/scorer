import * as Ons from 'onsenui';
import * as React from 'react';
import { Page, Toolbar, BackButton } from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import { Service } from '../service';
import { Progress } from './Progress';

interface Props {}
interface State {
  stats?: any;
}

export class StatsLandingPageInternal extends React.Component<
  Props & RouteComponentProps<{}>,
  State
> {
  constructor(props: Props & RouteComponentProps<{}>) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    try {
      var result = await Service.getAllStats();
      this.setState({ stats: result.data });
    } catch (ex) {
      Ons.notification.toast('Cannot retrieve stats', { timeout: 3000 });
    }
  }

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="left">
          <BackButton onClick={() => this.props.history.goBack()} />
        </div>
        <div className="center">Stats</div>
      </Toolbar>
    );
  };

  renderStatsCard = (title: string, content: JSX.Element) => {
    return (
      <div className="card">
        <h2 className="card__title">{title}</h2>
        <div className="card__content">{content}</div>
      </div>
    );
  };

  renderX01Stats = () => {
    const list = (
      <div>
        {this.state.stats.X01Averages.map((a: any, i: number) => (
          <div key={a._id}>
            {i + 1}. {a._id} - {a.average.toFixed(2)}
          </div>
        ))}
      </div>
    );

    return this.renderStatsCard('X01 Average Hit', list);
  };

  renderCricketStats = () => {
    const list = (
      <div>
        {this.state.stats.CricketWins.map((a: any, i: number) => (
          <div key={a._id}>
            {i + 1}. {a._id} - {a.wins}
          </div>
        ))}
      </div>
    );

    return this.renderStatsCard('Cricket wins', list);
  };

  renderStats = () => {
    return (
      <>
        {this.renderX01Stats()}
        {this.renderCricketStats()}
      </>
    );
  };

  render() {
    return (
      <Page renderToolbar={this.renderToolbar}>
        {!this.state.stats && <Progress />}
        {this.state.stats && this.renderStats()}
      </Page>
    );
  }
}

export const StatsLandingPage = withRouter(StatsLandingPageInternal);
