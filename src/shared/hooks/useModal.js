// Redux Store
import { useDispatch, useSelector } from "react-redux";
import { open, close, updateData, updateLoading } from "@/features/modal";

/**
 * Hook for accessing and controlling modal state in the Redux store.
 * @param {string} defaultModal - Modal key to select from state.
 * @returns {{data: any, isOpen: boolean, isLoading: boolean, dispatch: Function, openModal: Function, closeModal: Function, updateModalData: Function, updateModalLoading: Function}} Modal state and action helpers.
 */
const useModal = (defaultModal) => {
  const dispatch = useDispatch();

  /**
   * Selected modal slice with a fallback shape.
   * @type {{data: any, isOpen: boolean, isLoading: boolean}}
   */
  const modal = useSelector((state) => state.modal[defaultModal]) || {
    data: null,
    isOpen: false,
    isLoading: false,
  };

  /**
   * Opens a modal and optionally sets its data.
   * @param {string} name - Modal key to open.
   * @param {any} [data=null] - Payload for the modal.
   */
  const openModal = (name, data = null) => {
    dispatch(open({ modal: name, data }));
  };

  /**
   * Closes a modal and optionally updates its data.
   * @param {string} name - Modal key to close.
   * @param {any} [data=null] - Payload for the modal.
   */
  const closeModal = (name, data = null) => {
    dispatch(close({ modal: name, data }));
  };

  /**
   * Updates the loading state for a modal.
   * @param {string} name - Modal key to update.
   * @param {boolean} value - Loading state.
   */
  const updateModalLoading = (name, value) => {
    dispatch(updateLoading({ modal: name, value }));
  };

  /**
   * Updates the data for a modal.
   * @param {string} name - Modal key to update.
   * @param {any} data - Payload for the modal.
   */
  const updateModalData = (name, data) => {
    dispatch(updateData({ modal: name, data }));
  };

  return {
    ...modal,
    dispatch,
    openModal,
    closeModal,
    updateModalData,
    updateModalLoading,
  };
};

export default useModal;
