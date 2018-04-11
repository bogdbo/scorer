import * as Ons from 'onsenui';
import * as React from 'react';
import { BackButton, Icon, Page, Toolbar, ToolbarButton } from 'react-onsenui';
import { RouteComponentProps, withRouter } from 'react-router';
import styled from 'styled-components';
import { StatCollection } from '../../../src/StatsController';
import { Service } from '../service';
import { Progress } from './Progress';

type StatsCardProps = {
  bgColor?: string;
};

const StatsCard = styled.div`
  background-color: ${(p: StatsCardProps) => p.bgColor || 'white'};
`;

const StatsList = styled.ol`
  font-family: monospace;
  list-style: decimal inside none;
  padding: 0;
  > li {
    &:nth-child(even) {
      background-color: #ecececee;
    }
    &:nth-child(1) {
      line-height: 2;
      background-color: #f6d600aa;
      font-weight: bold;
    }
    &:nth-child(2) {
      background-color: #cdcdcd;
    }
    &:nth-child(3) {
      background-color: #cd611daa;
    }

    > span:last-child {
      float: right;
    }
  }
`;

interface Props {}
interface State {
  stats?: StatCollection[];
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
    this.refreshStats();
  }

  refreshStats = async (ignoreCache: boolean = false) => {
    try {
      this.setState({ stats: undefined });
      const result = await Service.getAllStats(ignoreCache);
      this.setState({ stats: result.data });
    } catch (ex) {
      Ons.notification.toast('Cannot retrieve stats', { timeout: 3000 });
    }
  };

  renderToolbar = () => {
    return (
      <Toolbar>
        <div className="left">
          <BackButton onClick={() => this.props.history.goBack()} />
        </div>
        <div className="center">
          <Icon icon="bar-chart" />
          &nbsp;
          <span>Stats</span>
        </div>
        <div className="right">
          <ToolbarButton onClick={() => this.refreshStats(true)}>
            <Icon icon="refresh" spin={this.state.stats == null} />
          </ToolbarButton>
        </div>
      </Toolbar>
    );
  };

  renderStatsCard = (title: string, content: JSX.Element) => {
    return (
      <StatsCard
        className="card"
        key={title}
        bgColor={title.includes('loses') ? '#00000017' : 'white'}
      >
        <h2 className="card__title">{title}</h2>
        <div className="card__content">{content}</div>
      </StatsCard>
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
