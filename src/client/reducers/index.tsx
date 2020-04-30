const initialState = {

};

export default function(state = initialState, action) {
  switch (action.type) {
    case "ADD_USER": {
      return {
        ...state,
        user: action.payload
      };
    } break;
    case "AUTHENTICATE": {
      return {
        ...state,
        auth_token: action.payload.auth_token,
        web_socket: action.payload.web_socket
      };
    } break;
    case "CHOOSE_PROJECT": {
      return {
        ...state,
        current_project: action.payload
      };
    } break;
  }

  return state;
}
