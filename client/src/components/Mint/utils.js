import { TYPE } from "utils";

export function stateReducer(state, { type, payload }) {
  switch (type) {
    case TYPE.pending: {
      return {
        ...state,
        blockHash: "",
        message: "",
        status: TYPE.pending,
      };
    }
    case TYPE.success: {
      return {
        ...state,
        ...payload,
        status: TYPE.success,
      };
    }
    case TYPE.error: {
      return {
        ...state,
        message: payload.message,
        status: TYPE.error,
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
}
