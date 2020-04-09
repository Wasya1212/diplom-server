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
        auth_token: action.payload
      };
    } break;
  }

  return state;
}
