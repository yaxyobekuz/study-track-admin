// React
import { useState } from "react";

const useObjectState = (initialState = {}) => {
  const [state, setState] = useState(initialState);

  // Update single key
  const setField = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  // Update multiple keys
  const setFields = (updates = {}) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Reset all state
  const resetState = () => {
    setState(initialState);
  };

  return { ...state, state, setField, setFields, resetState };
};

export default useObjectState;
