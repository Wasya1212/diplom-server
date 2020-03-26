const initialState = {
  user: {
    username: "hui"
  }
};

export default function(state = initialState, action) {
  switch (action.type) {
    case "ADD_USER": {
      return {
        ...state,
        user: action.payload
      };
    }
  }

  return state;
}
