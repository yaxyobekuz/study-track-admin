// React
import { useContext } from "react";

// Modal contexts
import {
  ModalStateContext,
  ModalActionsContext,
} from "@/features/modal/modal.context";

/** Fallback for a modal that has never been opened (or an unknown name). */
const EMPTY = { isOpen: false, data: null, isLoading: false };

/**
 * Access and control global modal state (Context-backed, no Redux).
 *
 * @param {string} [name] - Modal key to read state for. Omit it when you only
 *   need to open/close other modals (e.g. a page firing `openModal("createUser")`).
 * @returns {{
 *   data: any, isOpen: boolean, isLoading: boolean,
 *   openModal: (name: string, data?: any) => void,
 *   closeModal: (name: string, data?: any) => void,
 *   updateModalData: (name: string, data: any) => void,
 *   updateModalLoading: (name: string, value: boolean) => void,
 * }}
 */
const useModal = (name) => {
  const state = useContext(ModalStateContext);
  const actions = useContext(ModalActionsContext);

  const modal = (name && state[name]) || EMPTY;

  return { ...modal, ...actions };
};

export default useModal;
