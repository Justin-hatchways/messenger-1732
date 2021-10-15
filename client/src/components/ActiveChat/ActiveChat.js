import { React, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import { patchUpdateViewed } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user } = props;
  const conversation = props.conversation || {};

  const onFocus = () => {
    if ( !(typeof conversation.messages === 'undefined' || typeof conversation.otherUser === 'undefined')){
      props.updateViewed(conversation.id, conversation.messages, conversation.lastViewed, conversation.otherUser);
    }
  };

  useEffect(() => {
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  });

  if ( document.hasFocus() && !(typeof conversation.messages === 'undefined' || typeof conversation.otherUser === 'undefined')){
    props.updateViewed(conversation.id, conversation.messages, conversation.lastViewed, conversation.otherUser);
  }

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};


const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        (conversation) => conversation.otherUser.id === state.activeConversation
      )
  };
};


const mapDispatchToProps = (dispatch) => {
  return {
    updateViewed: (conversationId, messages, currentLastViewedId, otherUser) => {
      dispatch(patchUpdateViewed(conversationId, messages, currentLastViewedId, otherUser));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActiveChat);
