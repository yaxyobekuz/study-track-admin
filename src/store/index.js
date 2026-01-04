// Redux Store
import { configureStore } from "@reduxjs/toolkit";

// Slices
import modalSlice from "./slices/modal.slice";
import arrayStoreSlice from "./slices/arrayStore.slice";
import objectStoreSlice from "./slices/objectStore.slice";

export default configureStore({
  reducer: {
    modal: modalSlice,
    arrayStore: arrayStoreSlice,
    objectStore: objectStoreSlice,
  },
});
