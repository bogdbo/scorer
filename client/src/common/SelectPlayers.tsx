import * as React from 'react';
import { Service, User } from '../service';
import { Checkbox, Page, Fab, Icon, ProgressCircular } from 'react-onsenui';
import styled from 'styled-components';

const PlayerCheckbox = styled.div`
  margin: 5px 5px 5px 20px;
  display: flex;
  align-items: center;

  > label {
    margin-left: 5px;
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

interface Props {
  onStart: (selectedUsers: User[]) => void;
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

  renderFab = () => {
    return (
      <Fab
        disabled={this.state.selectedUsers.length < 1}
        position="bottom right"
        onClick={() => this.props.onStart(this.state.selectedUsers)}
      >
        <Icon icon="md-play" />
      </Fab>
    );
  };

  render() {
    if (!this.state.users) {
      return (
        <ProgressContainer>
          <ProgressCircular indeterminate={true} />
        </ProgressContainer>
      );
    }

    return (
      <Page renderFixed={this.renderFab}>
        {(this.state.users || []).map(this.renderUserPicker)}
      </Page>
    );
  }

  renderUserPicker = (user: User) => {
    return (
      <PlayerCheckbox key={user.username}>
        <Checkbox
          inputId={user.username}
          value={user.username}
          disabled={
            this.state.selectedUsers.filter(u => u.username === user.username)
              .length === 0 && this.state.selectedUsers.length === 3
          }
          onChange={(e: any) => {
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
      </PlayerCheckbox>
    );
  };
}
