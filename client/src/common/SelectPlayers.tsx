import * as React from 'react';
import { Service, User } from '../service';
import { Page, ProgressCircular, List, ListItem } from 'react-onsenui';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

interface Props {
  onPlayersChanged: (selectedUsers: User[]) => void;
}

interface State {
  users?: User[];
  selectedUsers: User[];
}
export class SelectPlayers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { selectedUsers: [] };
  }

  async componentWillMount() {
    const result = await Service.getUsers();
    const users = result.data.filter(
      (u: User) => u.username !== Service.getCurrentIdentity()
    );
    this.setState({ users });
  }

  getUserClickHandler = (user: User) => {
    return (e: any) => {
      let selectedUsers: User[] = [];
      if (e.target.checked) {
        selectedUsers = this.state.selectedUsers.concat(user);
      } else {
        selectedUsers = this.state.selectedUsers.filter(
          u => u.username !== user.username
        );
      }
      this.setState({ selectedUsers });
      // todo: Get current identity User object in a cleaner way
      this.props.onPlayersChanged(
        selectedUsers.concat({
          username: Service.getCurrentIdentity() as string
        })
      );
    };
  };

  renderUserPicker = (user: User) => {
    return (
      <ListItem key={user.username} tappable={true}>
        <label className="left">
          <input
            type="checkbox"
            id={`checkbox-${user.username}`}
            onChange={this.getUserClickHandler(user)}
          />
        </label>
        <label htmlFor={`checkbox-${user.username}`} className="center">
          {user.username}
        </label>
      </ListItem>
    );
  };

  render() {
    if (!this.state.users) {
      return (
        <Page>
          <ProgressContainer>
            <ProgressCircular indeterminate={true} />
          </ProgressContainer>
        </Page>
      );
    }

    return (
      <Page>
        <List dataSource={this.state.users} renderRow={this.renderUserPicker} />
      </Page>
    );
  }
}
