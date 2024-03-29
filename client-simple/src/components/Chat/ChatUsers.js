import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { SidebarArea, SidebarItem } from "../Sidebar/Sidebar";
import Loader from "../Loader/Loader";
import withSocket from "../../components/withSocket";
import _ from "lodash";
import withUserContext from "../withUserContext";

class ChatUsers extends Component {
  state = {
    chatroomUsers: null
  };

  componentDidUpdate = async () => await this.handleJoiningToChannelMutation();

  handleJoiningToChannelMutation = () => {
    const {chatroomUsers} = this.state;
    const {mutate, loggedUserId} = this.props;
    const isCurrentUserPresentInChannelUsersArray = !!_.find(chatroomUsers, (user) => user._id === loggedUserId);

    if (!isCurrentUserPresentInChannelUsersArray && loggedUserId) {
      return mutate()
        .then(({ data }) => {
          const {joinToChatroom: mutationResponse} = data;
          this.setState({chatroomUsers: mutationResponse && mutationResponse.users || []});
        })
        .catch((e) => console.log(`e: `, e));
    }
    return null;
  };

  usersList() {
    const {chatroomUsers: chatRoomUsersFromState} = this.state;
    const {users: chatRoomUsersFromProps} = this.props.chatroom;

    const _properChatroomUsersArr = chatRoomUsersFromState || chatRoomUsersFromProps;
    if (!_properChatroomUsersArr) return <Loader>Loading users...</Loader>;

    if (_properChatroomUsersArr && _properChatroomUsersArr.length) {
      return _properChatroomUsersArr.map(({_id, profile}) => <SidebarItem key={_id} title={`${profile.firstName}`} url={`/profile/${_id}`}/>);
    } else {
      return <SidebarItem title="Seems like chat is empty?" />;
    }
  }
  
  render() {
    return (
      <SidebarArea heading="Users In This Channel">
        {this.usersList()}
      </SidebarArea>
    );
  }
}

const JOIN_TO_CHANNEL = gql`
  mutation ($chatroom: String!) {
    joinToChatroom(chatroom: $chatroom){
      _id
      name
      users {
        _id
        profile {
          firstName
        }
      }
    }
  }
`;

const withJoinToChannel = graphql(JOIN_TO_CHANNEL, {options: (props) => ({ variables: { chatroom: props.match.params.chatId }})});

export default compose(withJoinToChannel)(withUserContext(withSocket(ChatUsers)));