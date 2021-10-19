import axios from "axios";
import socket from "../../socket";
import store from '../../store';
import {
  gotConversations,
  addConversation,
  setNewMessage,
  setViewedMessages,
  setSearchedUsers,
} from "../conversations";
import { gotUser, setFetchingStatus } from "../user";

axios.interceptors.request.use(async function (config) {
  const token = await localStorage.getItem("messenger-token");
  config.headers["x-access-token"] = token;

  return config;
});

// USER THUNK CREATORS

export const fetchUser = () => async (dispatch) => {
  dispatch(setFetchingStatus(true));
  try {
    const { data } = await axios.get("/auth/user");
    dispatch(gotUser(data));
    if (data.id) {
      socket.emit("go-online", data.id);
    }
  } catch (error) {
    console.error(error);
  } finally {
    dispatch(setFetchingStatus(false));
  }
};

export const register = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/register", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const login = (credentials) => async (dispatch) => {
  try {
    const { data } = await axios.post("/auth/login", credentials);
    await localStorage.setItem("messenger-token", data.token);
    dispatch(gotUser(data));
    socket.emit("go-online", data.id);
  } catch (error) {
    console.error(error);
    dispatch(gotUser({ error: error.response.data.error || "Server Error" }));
  }
};

export const logout = (id) => async (dispatch) => {
  try {
    await axios.delete("/auth/logout");
    await localStorage.removeItem("messenger-token");
    dispatch(gotUser({}));
    socket.emit("logout", id);
  } catch (error) {
    console.error(error);
  }
};

// CONVERSATIONS THUNK CREATORS

export const fetchConversations = () => async (dispatch) => {
  try {
    const { data } = await axios.get("/api/conversations");
    dispatch(gotConversations(data));
  } catch (error) {
    console.error(error);
  }
};

const saveMessage = async (body) => {
  const { data } = await axios.post("/api/messages", body);
  return data;
};

const sendMessage = (data, body) => {
  socket.emit("new-message", {
    message: data.message,
    recipientId: body.recipientId,
    sender: data.sender,
  });
};

// message format to send: {recipientId, text, conversationId}
// conversationId will be set to null if its a brand new conversation
export const postMessage = (body) => async (dispatch) => {
  try {
      const data = await saveMessage(body)
      
      if (!body.conversationId) {
        dispatch(addConversation(body.recipientId, data.message));
      } else {
        dispatch(setNewMessage(data.message, store.getState('activeConversation')));
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
};

const saveViewedState = async (body) => {
  const { data } = await axios.patch("/api/conversations", body);
  return data;
};

const sendUpdatedView = (data) => {
  socket.emit("update-viewed-messages", data);
};

const getLastViewed = (messages, otherUser) =>{
  // find the last message sent by the other user
  const messagesLength = messages.length - 1;
  let lastViewedIndex = 0;
  let lastViewedId = null;

  while( (lastViewedIndex <= messagesLength) && lastViewedId === null){
    const message = messages[messagesLength - lastViewedIndex];
    if(message.senderId === otherUser.id){
      lastViewedId = message.id;
    }
    lastViewedIndex++;
  }
  return lastViewedId;
};

export const patchUpdateViewed = (conversationId, messages, currentLastViewedId, otherUser) => async (dispatch) => {
  try {
    const lastViewedId = getLastViewed(messages, otherUser);
    if( lastViewedId && lastViewedId > currentLastViewedId ){
      const data = await saveViewedState({conversationId, lastViewedMsgId: lastViewedId});

      dispatch(setViewedMessages(data));
      
      sendUpdatedView(data);
    }
  } catch (error) {
    console.error(error);
  }
};

export const searchUsers = (searchTerm) => async (dispatch) => {
  try {
    const { data } = await axios.get(`/api/users/${searchTerm}`);
    dispatch(setSearchedUsers(data));
  } catch (error) {
    console.error(error);
  }
};
