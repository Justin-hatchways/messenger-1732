import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignContent: "center"
  },
  bubble: {
    flexGrow: 0.1,
    backgroundColor: "#3f92ff",
    borderRadius: "25px 25px 25px 25px"
  },
  counter: {
    letterSpacing: -0.2,
    fontSize: "10px",
    color: "#ffffff",
    margin: "0px 5px 0px 5px"
  }
}));

const getUnreadMessages = (convo) => {
  return convo.messages.filter(
    (msg) => 
    (convo.lastViewed === null || msg.id > convo.lastViewed) && 
    msg.senderId === convo.otherUser.id
  ).length;
};

function UnreadMessages(props) {
  const classes = useStyles();

  const { conversation } = props;

  const unreadMessages = getUnreadMessages(conversation);

  return (unreadMessages > 0) && (
    <Box className={classes.root}>
      <Box className={classes.bubble}>
        <Typography className={classes.counter}>
          { unreadMessages }
        </Typography>
      </Box>
    </Box>
  )
}

export default UnreadMessages;
