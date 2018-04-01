import * as React from 'react';
import * as ReactGA from 'react-ga';
import { Service } from '../service';

ReactGA.initialize('UA-116721511-1', {
  titleCase: false
});

const withTracker = (WrappedComponent: React.ComponentClass, options = {}) => {
  const trackPage = (page: string) => {
    ReactGA.set({
      page,
      username: Service.getCurrentIdentity(),
      ...options
    });
    ReactGA.pageview(page);
  };

  const HOC = class extends React.Component<any, any> {
    componentDidMount() {
      const page = this.props.location.pathname;
      trackPage(page);
    }

    componentWillReceiveProps(nextProps: any) {
      const currentPage = this.props.location.pathname;
      const nextPage = nextProps.location.pathname;

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
};

export default withTracker;
