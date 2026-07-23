import { createContext } from "react";

/**
 * Two contexts on purpose:
 * - state changes on every open/close (its consumers re-render)
 * - actions are stable for the app's lifetime (consumers never re-render from them)
 *
 * Consume these through the `useModal` hook — don't read them directly.
 */
export const ModalStateContext = createContext({});
export const ModalActionsContext = createContext(null);
