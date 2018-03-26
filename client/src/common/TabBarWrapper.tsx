import * as React from 'react';
import {
  Tabbar as _Tabbar,
  TabbarRenderTab,
  AnimationOptions
} from 'react-onsenui';

interface Props {
  position?: 'bottom' | 'top' | 'auto';
  swipeable?: boolean;
  ignoreEdgeWidth?: number;
  animation?: 'none' | 'slide';
  animationOptions?: AnimationOptions;
  tabBorder?: boolean;
  index: number;
  renderTabs(): TabbarRenderTab[];
  onPreChange?(): void;
  onPostChange?(): void;
  onReactive?(): void;
  onSwipe?(index: number, animationOptions: AnimationOptions): void;
}

// NOTE: Required because Onsen's Tabbar does not handle componentWillReceiveProps
class TabbarWrapper extends React.Component<Props, any> {
  constructor(props: any) {
    super(props);
    this.render = this.render.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
    this.updateIndex = this.updateIndex.bind(this);

    this.state = {
      index: props.index ? props.index : 0
    };
  }
  updateIndex(e: any) {
    this.setState((s: any, p: any) => {
      return Object.assign({}, s, {
        index: e.index
      });
    });
    if (this.props.onPostChange) {
      this.props.onPostChange();
    }
  }

  componentWillReceiveProps(nextProps: any) {
    if (nextProps.index !== this.props.index) {
      this.setState((s: any, p: any) => {
        return Object.assign({}, s, {
          index: nextProps.index
        });
      });
    }
  }

  render() {
    const useProps = Object.assign({}, this.props, {
      onPostChange: this.updateIndex,
      index: this.state.index
    });
    return <_Tabbar {...useProps}>{this.props.children}</_Tabbar>;
  }
}

export default TabbarWrapper;
