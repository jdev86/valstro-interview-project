import types from "../types/";

export const AppReducer = (state: any, action: { type: string; value: any; }) => {
    switch (action.type) {
      case types.MESSAGES:
        return { ...state, messages: action.value }
      case types.USERPROFILE:
        return { ...state, userProfile: action.value }
      case types.MESSAGEVALUE:
        return { ...state, messageValue: action.value }
    }
  }