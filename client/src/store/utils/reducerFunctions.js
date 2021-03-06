export const addMessageToStore = (state, payload) => {
  const { message, sender, activeConversation} = payload;

  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      lastViewed: null,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  return state.map((convo) => {
    if (convo.id === message.conversationId) {
      const convoCopy = {...convo, latestMessageText: message.text};
      convoCopy.messages.push(message);

      // we've seen the message if the current the sender is the activeChat and the tab is in focus
      if (activeConversation === message.senderId && message.senderId === convoCopy.otherUser.id && document.hasFocus()){
        convoCopy.lastViewed = message.id;
      }
      
      return convoCopy;
    } else {
      return convo;
    }
  });
};

const updateConvoLastViewed = (convo, lastViewed, callback) => {
  const convoCopy = {...convo};
  callback(convoCopy, lastViewed);
  return convoCopy;
}

export const updateViewedMessagesInStore = (state, payload) => {
  const { conversationId, viewerId, lastViewed } = payload;

  return state.map((convo) => {
    if ( convo.id === conversationId ){
      if( viewerId === convo.otherUser.id && convo.otherUser.lastViewed < lastViewed ) { // update the which message bubble the other user has seen
        return updateConvoLastViewed(convo, lastViewed, (convo, lastViewed) => convo.otherUser.lastViewed = lastViewed );
      } else if( viewerId !== convo.otherUser.id && convo.lastViewed < lastViewed ){ // update this users unseen count
        return updateConvoLastViewed(convo, lastViewed, (convo, lastViewed) => convo.lastViewed = lastViewed );
      }
      return convo;
    } else {
      return convo;
    }
  });
}

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map((convo) => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = {...convo, id: message.conversationId, latestMessageText: message.text};
      convoCopy.messages.push(message);
      return convoCopy;
    } else {
      return convo;
    }
  });
};
