import firebase from "@firebase/app";
import { AsyncStorage } from "react-native";
import "@firebase/auth";
import { Actions } from "react-native-router-flux";
import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  NAME_CHANGED,
  LOGIN_USER,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  RESETER,
  CREATE_USER_FAIL,
  FAIL_PASSWORD,
  FAIL_NAME,
  CREATE_USER_SUCCESS
} from "../actions/type";
import { getNotifToken } from "../actions";

export const emailChanged = text => {
  return {
    type: EMAIL_CHANGED,
    payload: text
  };
};

export const passwordChanged = text => {
  return {
    type: PASSWORD_CHANGED,
    payload: text
  };
};

export const nameChanged = text => {
  return {
    type: NAME_CHANGED,
    payload: text
  };
};

export const loginUser = ({ email, password }) => {
  return dispatch => {
    dispatch({ type: LOGIN_USER });
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(user => loginUserSuccess(dispatch, user, email, password))
      .catch(() => {
        loginUserFail(dispatch);
      });
  };
};

export const createAccount = ({ email, password, name }) => {
  if (name.length < 4) {
    return dispatch => {
      dispatch({ type: FAIL_NAME });
    };
  } else {
    return dispatch => {
      dispatch({ type: LOGIN_USER });
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => CreateUsers(email, password, name));
        })
        .catch(() => {
          if (password.length < 6) {
            return dispatch({
              type: FAIL_PASSWORD
            });
          } else {
            createUserFail(dispatch);
          }
        });
    };
  }
};

export const reseter = () => {
  return dispatch => {
    dispatch({
      type: RESETER
    });
    Actions.pop();
  };
};

export const loginUserFail = dispatch => {
  return dispatch({ type: LOGIN_USER_FAIL });
};

export const createUserFail = dispatch => {
  return dispatch({ type: CREATE_USER_FAIL });
};

export const reseterLogin = () => {
  return dispatch => {
    dispatch({
      type: RESETER
    });
    Actions.newUser();
  };
};

export const createUserOk = () => {
  return dispatch => {
    dispatch({
      type: LOGIN_USER_SUCCESS
    });
  };
};

//crear usuario y guardar datos en el móvil
export const CreateUsers = (emailV, passwordV, name) => {
  const { currentUser } = firebase.auth();
  firebase
    .database()
    .ref()
    .child("Users")
    .child(currentUser.uid)
    .set({
      nameOfUser: name,
      uriPhoto:
        "https://res.cloudinary.com/dfir4b1pq/image/upload/q_auto:good/v1550940285/nophoto.jpg",
      status: "Bronce"
    })
    .then(() => {
      let obj = {
        email: emailV,
        password: passwordV
      };
      var valueId;
      getNotifToken()
        .then(function(result) {
          valueId = result;
        })
        .catch(function() {
          deviceId = "undefined";
        });
      AsyncStorage.setItem("user", JSON.stringify(obj)).then(() => {
        Actions.tabsBottom({ type: "reset" })
        firebase
          .database()
          .ref()
          .child("Notification")
          .child(currentUser.uid)
          .set({
            deviceId:valueId,
            status: false,
            uid: currentUser.uid,
            topics: ["Frutas & Vegetales","Carne y Pescado","Dulces","Lácteos","Bebidas"]
          });
      });
    });
};

export const loginUserSuccess = (dispatch, user, emailV, passwordV) => {
  let obj = {
    email: emailV,
    password: passwordV
  };
  
  AsyncStorage.setItem("user", JSON.stringify(obj)).then(() => {
    dispatch({
      type: LOGIN_USER_SUCCESS,
      payload: user
    });
    Actions.tabsBottom({ type: "reset" })
  });
};
