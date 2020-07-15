// import { v1 as uuid } from "uuid";
import { SET_ALERT, REMOVE_ALERT } from "./types";

export const setAlert = (msg, alertType) => (dispatch) => {
  const id = Date.now();
  console.log(id);
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });
};
