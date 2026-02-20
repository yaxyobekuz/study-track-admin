// Redux Store
import { configureStore } from "@reduxjs/toolkit";

// Slices
import { modalReducer } from "@/features/modal";
import arrayStoreReducer from "@/shared/store/arrayStore.slice";
import objectStoreReducer from "@/shared/store/objectStore.slice";

export default configureStore({
  reducer: {
    modal: modalReducer,
    arrayStore: arrayStoreReducer,
    objectStore: objectStoreReducer,
  },
});
