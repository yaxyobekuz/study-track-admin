// React
import { useCallback } from "react";

// Redux Store
import {
  open,
  close,
  updateData,
  updateLoading,
} from "@/store/slices/modal.slice";
import { useDispatch, useSelector } from "react-redux";

const useModal = (name) => {
  const dispatch = useDispatch();

  const modal = useSelector((state) => state.modal[name]) || {
    data: null,
    isOpen: false,
    isLoading: false,
  };

  const openModal = useCallback(
    (modalName = name, data = null) => {
      dispatch(open({ modal: modalName, data }));
    },
    [dispatch, name]
  );

  const closeModal = useCallback(
    (modalName = name, data = null) => {
      dispatch(close({ modal: modalName, data }));
    },
    [dispatch, name]
  );

  const updateModalLoading = useCallback(
    (value) => {
      dispatch(updateLoading({ modal: name, value }));
    },
    [dispatch, name]
  );

  const updateModalData = useCallback(
    (data) => {
      dispatch(updateData({ modal: name, data }));
    },
    [dispatch, name]
  );

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
