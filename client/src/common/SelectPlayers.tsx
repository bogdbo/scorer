import * as Ons from 'onsenui';
import * as React from 'react';
import { List, ListItem, Page } from 'react-onsenui';
import { Service, User } from '../service';
import { Progress } from './Progress';
import { MedalsType } from '../games/darts/models';
import { Medal } from './Medal';

interface Props {
  onPlayersChanged: (selectedUsers: User[]) => void;
}

interface State {
  users?: User[];
  selectedUsers: User[];
  medals?: MedalsType;
}
export class SelectPlayers extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const previouslySelectedUsers = Service.getSelectedPlayers();
    this.state = { selectedUsers: previouslySelectedUsers };
    if (previouslySelectedUsers.length > 0) {
      this.notifyPlayersChanged(previouslySelectedUsers);
    }
  }

  async componentDidMount() {
    const result = await Service.getUsers();
    const users = result.data.filter(
      (u: User) => u.username !== Service.getCurrentIdentity()
    );
    this.setState({ users });
    this.refreshStats();
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
      Service.setSelectedPlayers(selectedUsers); // remember selected players
      this.notifyPlayersChanged(selectedUsers);
    };
  };

  notifyPlayersChanged = (selectedUsers: User[]) => {
    this.props.onPlayersChanged(
      selectedUsers.concat({
        username: Service.getCurrentIdentity() as string
      })
    );
  };

  renderUserRow = (user: User) => {
    return (
      <ListItem key={user.username} tappable={true}>
        <label className="left">
          <input
            type="checkbox"
            id={`checkbox-${user.username}`}
            checked={this.state.selectedUsers.some(
              u => u.username === user.username
            )}
            onChange={this.getUserClickHandler(user)}
          />
        </label>
        <label htmlFor={`checkbox-${user.username}`} className="center">
          {user.username}
        </label>
        {this.state.medals && (
          <label htmlFor={`checkbox-${user.username}`} className="right">
            {this.state.medals[user.username] &&
              Object.keys(this.state.medals[user.username]).map((k, i) => (
                <Medal
                  key={user.username + k + 'medal'}
                  type={parseInt(k, 0)}
                  count={
                    this.state.medals && this.state.medals[user.username][k]
                  }
                />
              ))}
          </label>
        )}
      </ListItem>
    );
  };

  refreshStats = async (ignoreCache: boolean = false) => {
    try {
      this.setState({ medals: undefined });
      const result = await Service.getAllMedals(ignoreCache);
      this.setState({ medals: result.data });
    } catch (ex) {
      Ons.notification.toast('Cannot retrieve stats', { timeout: 3000 });
    }
  };

  renderCurrentlySelectedUsers() {
    return (
      this.state.selectedUsers.length > 0 && (
        <>
          <label className="list-header">Currently selected users</label>
          <List
            dataSource={this.state.selectedUsers}
            renderRow={this.renderUserRow}
          />{' '}
        </>
      )
    );
  }

  render() {
    if (!this.state.users) {
      return (
        <Page>
          <Progress />
        </Page>
      );
    }

    return (
      <Page>
        {this.renderCurrentlySelectedUsers()}
        <label className="list-header">Select users</label>
        <List dataSource={this.state.users} renderRow={this.renderUserRow} />
      </Page>
    );
  }
}
