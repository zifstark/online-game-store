import { useReducer, useCallback } from 'react';
import useSafeDispatch from './use_safe_dispatch';

function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return { status: 'pending', data: null, error: null };
    }
    case 'resolved': {
      return { status: 'resolved', data: action.data, error: null };
    }
    case 'rejected': {
      return { status: 'rejected', data: null, error: action.error };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

export default function useAsync(initialState) {
  const [state, unsafeDispatch] = useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  });
  const dispatch = useSafeDispatch(unsafeDispatch);
  const { status, data, error } = state;

  const run = useCallback(
    (promise) => {
      if (!promise) {
        return;
      }
      dispatch({ type: 'pending' });
      promise.then(
        (data) => {
          dispatch({ type: 'resolved', data });
        },
        (error) => {
          dispatch({ type: 'rejected', error });
        }
      );
    },
    [dispatch]
  );

  return { status, data, error, run };
}
