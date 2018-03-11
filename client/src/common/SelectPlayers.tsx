import * as React from 'react';
import { Service, User } from '../service';

interface Props {
  onStart?: (selectedUsers: User[]) => void;
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
    const users = await Service.getUsers();
    this.setState({ users: users.data });
  }

  render() {
    if (!this.state.users) {
      return 'Loading';
    }
    return (
      <div>
        <h1
          onClick={() =>
            this.state.selectedUsers.length >= 2 &&
            this.props.onStart &&
            this.props.onStart(this.state.selectedUsers)
          }
        >
          Start
        </h1>
        {this.state.users.map(this.renderUserPicker)}
      </div>
    );
  }

  renderUserPicker = (user: User) => {
    return (
      <div key={user.username}>
        <input
          id={user.username}
          type="checkbox"
          value={user.username}
          disabled={
            this.state.selectedUsers.filter(u => u.username === user.username)
              .length === 0 && this.state.selectedUsers.length === 4
          }
          onChange={e => {
            let selectedUsers: User[] = [];
            if (e.target.checked) {
              selectedUsers = this.state.selectedUsers.concat(user);
            } else {
              selectedUsers = this.state.selectedUsers.filter(
                u => u.username !== user.username
              );
            }
            this.setState({ selectedUsers });
          }}
        />
        <label htmlFor={user.username}>{user.username}</label>
      </div>
    );
  };
}
