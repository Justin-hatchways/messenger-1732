import React from "react";
import { Box, Badge } from "@material-ui/core";
import { BadgeAvatar, ChatContent, UnreadMessages } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab"
    }
  },
  badge: {
    backgroundColor: "#3f92ff",
    color: "#ffffff"
  }
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation } = props;
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    await props.setActiveChat(conversation.otherUser.id);
  };

  const getUnreadMessages = (convo) => {
    return convo.messages.filter(
      (msg) => 
      (convo.lastViewed === null || msg.id > convo.lastViewed) && 
      msg.senderId === convo.otherUser.id
    ).length;
  };

  const unreadMessages = getUnreadMessages(conversation);

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent conversation={conversation} />
      <Badge badgeContent={unreadMessages} classes={{badge: classes.badge}} visibility={unreadMessages === 0} />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setActiveChat: (id) => {
      dispatch(setActiveChat(id));
    }
  };
};

export default connect(null, mapDispatchToProps)(Chat);