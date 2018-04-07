import * as Ons from 'onsenui';
import * as React from 'react';
import { Page, Toolbar, BackButton } from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import { Service } from '../service';
import { Progress } from './Progress';
import styled from 'styled-components';
import { StatCollection } from '../games/darts/models';

interface Props {}
interface State {
  stats?: StatCollection[];
}

const StatsList = styled.ol`
  > li {
    &:nth-child(even) {
      background-color: #ececec;
    }

    > span:last-child {
      float: right;
    }
  }
`;

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
      <div className="card" key={title}>
        <h2 className="card__title">{title}</h2>
        <div className="card__content">{content}</div>
      </div>
    );
  };

  renderStats = (statCollection: StatCollection) => {
    const statList = (
      <StatsList>
        {statCollection.values.map((a: any) => (
          <li key={statCollection.title + a._id}>
            <span>{a._id}</span>
            <span>{isNaN(a.value) ? a.value : a.value.toFixed(2)}</span>
          </li>
        ))}
      </StatsList>
    );

    return this.renderStatsCard(statCollection.title, statList);
  };

  render() {
    return (
      <Page renderToolbar={this.renderToolbar}>
        {!this.state.stats && <Progress />}
        {this.state.stats && this.state.stats.map(this.renderStats)}
      </Page>
    );
  }
}

export const StatsLandingPage = withRouter(StatsLandingPageInternal);
