// React
import { useMemo, useReducer } from "react";

// Registry + contexts
import { MODAL_NAMES } from "./modal.names";
import { ModalStateContext, ModalActionsContext } from "./modal.context";

const KNOWN = new Set(MODAL_NAMES);

/** Shape of a single modal's state before it has ever been opened. */
const EMPTY_ENTRY = { isOpen: false, data: {}, isLoading: false };

/**
 * Merges `incoming` onto `base` only when it's a real object.
 * Radix's `onOpenChange` passes a boolean, so guard against non-objects
 * (mirrors the old slice's `data || {}` behaviour — a plain close keeps data).
 */
const mergeData = (base, incoming) =>
  incoming && typeof incoming === "object"
    ? { ...base, ...incoming }
    : base;

const reducer = (state, action) => {
  const { type, name } = action;

  if (import.meta.env.DEV && !KNOWN.has(name)) {
    console.warn(
      `[modal] Unknown modal name "${name}". Register it in features/modal/modal.names.js`,
    );
  }

  const current = state[name] || EMPTY_ENTRY;

  switch (type) {
    case "open":
      return {
        ...state,
        [name]: {
          isOpen: true,
          isLoading: current.isLoading,
          data: mergeData(current.data, action.data),
        },
      };

    case "close":
      return {
        ...state,
        [name]: {
          ...current,
          isOpen: false,
          data: mergeData(current.data, action.data),
        },
      };

    case "updateData":
      return {
        ...state,
        [name]: { ...current, data: mergeData(current.data, action.data) },
      };

    case "updateLoading":
      return {
        ...state,
        [name]: { ...current, isLoading: action.value },
      };

    default:
      return state;
  }
};

/**
 * Provides global modal state without Redux. Wrap the app once (in main.jsx).
 * Consume via the `useModal` hook — never touch these contexts directly.
 */
const ModalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {});

  const actions = useMemo(
    () => ({
      openModal: (name, data = null) => dispatch({ type: "open", name, data }),
      closeModal: (name, data = null) => dispatch({ type: "close", name, data }),
      updateModalData: (name, data) => dispatch({ type: "updateData", name, data }),
      updateModalLoading: (name, value) =>
        dispatch({ type: "updateLoading", name, value }),
    }),
    [],
  );

  return (
    <ModalActionsContext.Provider value={actions}>
      <ModalStateContext.Provider value={state}>
        {children}
      </ModalStateContext.Provider>
    </ModalActionsContext.Provider>
  );
};

export default ModalProvider;
