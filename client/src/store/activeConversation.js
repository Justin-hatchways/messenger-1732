const SET_ACTIVE_CHAT = "SET_ACTIVE_CHAT";

export const setActiveChat = (id) => {
  return {
    type: SET_ACTIVE_CHAT,
    id
  };
};

const reducer = (state = "", action) => {
  switch (action.type) {
    case SET_ACTIVE_CHAT: {
      return action.id;
    }
    default:
      return state;
  }
};

export default reducer;
