// Slice
import {
  clearPage,
  setPageData,
  setPageError,
  addItemToPage,
  clearAllPages,
  setPageLoading,
  updateItemInPage,
  deleteCollection,
  setCollectionData,
  setCollectionError,
  removeItemFromPage,
  addItemToCollection,
  clearCollectionData,
  invalidateCollection,
  setCollectionLoading,
  initializeCollection,
  updateItemByIdInPages,
  updateItemInCollection,
  removeItemByIdFromPages,
  removeItemFromCollection,
} from "@/shared/store/arrayStore.slice";

// React
import { useCallback, useMemo } from "react";

// Redux
import { useSelector, useDispatch } from "react-redux";

/**
 * Custom hook for managing array store collections with pagination support
 * @param {string} defaultCollectionName - Default collection name to use
 * @returns {Object} Array store utilities
 */

const useArrayStore = (defaultCollectionName = "") => {
  const dispatch = useDispatch();

  // Get the entire array store state
  const arrayStore = useSelector((state) => state.arrayStore);

  // Get a specific collection
  const getCollection = useCallback(
    (collectionName = defaultCollectionName) => {
      return arrayStore[collectionName] || null;
    },
    [arrayStore, defaultCollectionName]
  );

  // Check if collection exists
  const hasCollection = useCallback(
    (collectionName = defaultCollectionName) => {
      return Boolean(arrayStore[collectionName]);
    },
    [arrayStore, defaultCollectionName]
  );

  // Check if collection is paginated
  const isPaginated = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      return collection?.pagination || false;
    },
    [arrayStore, defaultCollectionName]
  );

  // Initialize collection
  const initialize = useCallback(
    (pagination = false, collectionName = defaultCollectionName) => {
      dispatch(
        initializeCollection({
          collectionName,
          pagination,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Get page data (for paginated collections)
  const getPageData = useCallback(
    (page, collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return null;
      return collection.pages[page] || null;
    },
    [arrayStore, defaultCollectionName]
  );

  // Get all pages data (for paginated collections)
  const getAllPages = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return null;
      return collection.pages || {};
    },
    [arrayStore, defaultCollectionName]
  );

  // Get pagination metadata (for paginated collections)
  const getMetadata = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return null;
      return collection.metadata || null;
    },
    [arrayStore, defaultCollectionName]
  );

  // Get all items from all pages as a single array
  const getAllItemsFromPages = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return [];

      const pages = collection.pages || {};
      return Object.keys(pages)
        .sort((a, b) => Number(a) - Number(b))
        .flatMap((pageNum) => pages[pageNum].data || []);
    },
    [arrayStore, defaultCollectionName]
  );

  // Get collection data (for non-paginated collections)
  const getCollectionData = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (collection?.pagination) return null;
      return collection?.data || [];
    },
    [arrayStore, defaultCollectionName]
  );

  // Get collection error (for non-paginated collections)
  const getCollectionError = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (collection?.pagination) return null;
      return collection?.error || null;
    },
    [arrayStore, defaultCollectionName]
  );

  // Get page error (for paginated collections)
  const getPageError = useCallback(
    (page, collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return null;
      return collection.pages[page]?.error || null;
    },
    [arrayStore, defaultCollectionName]
  );

  // Check if collection is loading (for non-paginated collections)
  const isCollectionLoading = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (collection?.pagination) return false;
      return collection?.isLoading || false;
    },
    [arrayStore, defaultCollectionName]
  );

  // Check if page is loading (for paginated collections)
  const isPageLoading = useCallback(
    (page, collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return false;
      return collection.pages[page]?.isLoading || false;
    },
    [arrayStore, defaultCollectionName]
  );

  // Set page loading state
  const setPageLoadingState = useCallback(
    (page, isLoading, collectionName = defaultCollectionName) => {
      dispatch(
        setPageLoading({
          collectionName,
          page,
          isLoading,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Set collection loading state
  const setCollectionLoadingState = useCallback(
    (isLoading, collectionName = defaultCollectionName) => {
      dispatch(
        setCollectionLoading({
          collectionName,
          isLoading,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Set page data
  const setPage = useCallback(
    (
      page,
      data,
      error = null,
      metadata = null,
      collectionName = defaultCollectionName
    ) => {
      dispatch(
        setPageData({
          collectionName,
          page,
          data,
          error,
          metadata,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Set collection data
  const setCollection = useCallback(
    (data, error = null, collectionName = defaultCollectionName) => {
      dispatch(
        setCollectionData({
          collectionName,
          data,
          error,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Set page error
  const setPageErrorState = useCallback(
    (page, error, collectionName = defaultCollectionName) => {
      dispatch(
        setPageError({
          collectionName,
          page,
          error,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Set collection error
  const setCollectionErrorState = useCallback(
    (error, collectionName = defaultCollectionName) => {
      dispatch(
        setCollectionError({
          collectionName,
          error,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Add item to collection
  const addItem = useCallback(
    (item, collectionName = defaultCollectionName) => {
      dispatch(
        addItemToCollection({
          collectionName,
          item,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Add item to page
  const addItemToPageData = useCallback(
    (page, item, collectionName = defaultCollectionName) => {
      dispatch(
        addItemToPage({
          collectionName,
          page,
          item,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Update item in collection by ID
  const updateItem = useCallback(
    (
      itemId,
      itemData,
      idField = "_id",
      collectionName = defaultCollectionName
    ) => {
      dispatch(
        updateItemInCollection({ itemId, itemData, collectionName, idField })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Update item in page by ID
  const updateItemInPageData = useCallback(
    (
      page,
      itemId,
      itemData,
      idField = "_id",
      collectionName = defaultCollectionName
    ) => {
      dispatch(
        updateItemInPage({
          collectionName,
          page,
          itemId,
          itemData,
          idField,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Update item by ID (searches all pages)
  const updateItemById = useCallback(
    (
      itemId,
      itemData,
      idField = "_id",
      collectionName = defaultCollectionName
    ) => {
      dispatch(
        updateItemByIdInPages({
          collectionName,
          itemId,
          itemData,
          idField,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Remove item from collection by ID
  const removeItem = useCallback(
    (itemId, idField = "_id", collectionName = defaultCollectionName) => {
      dispatch(
        removeItemFromCollection({
          collectionName,
          itemId,
          idField,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Remove item from page by ID
  const removeItemFromPageData = useCallback(
    (page, itemId, idField = "_id", collectionName = defaultCollectionName) => {
      dispatch(
        removeItemFromPage({
          collectionName,
          page,
          itemId,
          idField,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Remove item by ID from all pages
  const removeItemById = useCallback(
    (itemId, idField = "_id", collectionName = defaultCollectionName) => {
      dispatch(
        removeItemByIdFromPages({
          itemId,
          idField,
          collectionName,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Clear page
  const clearPageData = useCallback(
    (page, collectionName = defaultCollectionName) => {
      dispatch(
        clearPage({
          collectionName,
          page,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Clear all pages
  const clearAllPagesData = useCallback(
    (collectionName = defaultCollectionName) => {
      dispatch(
        clearAllPages({
          collectionName,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Clear collection data
  const clearCollection = useCallback(
    (collectionName = defaultCollectionName) => {
      dispatch(
        clearCollectionData({
          collectionName,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Delete collection
  const deleteCollectionData = useCallback(
    (collectionName = defaultCollectionName) => {
      dispatch(
        deleteCollection({
          collectionName,
        })
      );
    },
    [dispatch, defaultCollectionName]
  );

  // Invalidate collection cache (clear all pages/data)
  const invalidateCache = useCallback(
    (collectionName = defaultCollectionName, isLoading = true) => {
      dispatch(invalidateCollection({ isLoading, collectionName }));
    },
    [dispatch, defaultCollectionName]
  );

  const invalidateCacheByStartsName = useCallback(
    (startsName = defaultCollectionName, isLoading = true) => {
      Object.keys(arrayStore).forEach((name) => {
        if (!name?.startsWith(startsName)) return;
        dispatch(invalidateCollection({ isLoading, collectionName: name }));
      });
    },
    [dispatch]
  );

  // Get total item count
  const getTotalItemCount = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection) return 0;

      if (collection.pagination) {
        return getAllItemsFromPages(collectionName).length;
      } else {
        return collection.data?.length || 0;
      }
    },
    [arrayStore, defaultCollectionName, getAllItemsFromPages]
  );

  // Get page count
  const getPageCount = useCallback(
    (collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection?.pagination) return 0;
      return Object.keys(collection.pages || {}).length;
    },
    [arrayStore, defaultCollectionName]
  );

  // Check if collection/page has data
  const hasData = useCallback(
    (page = null, collectionName = defaultCollectionName) => {
      const collection = arrayStore[collectionName];
      if (!collection) return false;

      if (collection.pagination) {
        if (page !== null) {
          return (collection.pages[page]?.data?.length || 0) > 0;
        }
        return getAllItemsFromPages(collectionName).length > 0;
      } else {
        return (collection.data?.length || 0) > 0;
      }
    },
    [arrayStore, defaultCollectionName, getAllItemsFromPages]
  );

  // Memoized values for default collection
  const collection = useMemo(
    () => getCollection(defaultCollectionName),
    [getCollection, defaultCollectionName]
  );

  const data = useMemo(() => {
    const col = arrayStore[defaultCollectionName];
    if (!col) return [];
    return col.pagination
      ? getAllItemsFromPages(defaultCollectionName)
      : col.data || [];
  }, [arrayStore, defaultCollectionName, getAllItemsFromPages]);

  const error = useMemo(
    () => getCollectionError(defaultCollectionName),
    [getCollectionError, defaultCollectionName]
  );

  const isLoading = useMemo(
    () => isCollectionLoading(defaultCollectionName),
    [isCollectionLoading, defaultCollectionName]
  );

  const paginated = useMemo(
    () => isPaginated(defaultCollectionName),
    [isPaginated, defaultCollectionName]
  );

  const totalCount = useMemo(
    () => getTotalItemCount(defaultCollectionName),
    [getTotalItemCount, defaultCollectionName]
  );

  const pageCount = useMemo(
    () => getPageCount(defaultCollectionName),
    [getPageCount, defaultCollectionName]
  );

  const metadata = useMemo(
    () => getMetadata(defaultCollectionName),
    [getMetadata, defaultCollectionName]
  );

  return {
    // State
    data,
    error,
    metadata,
    isLoading,
    paginated,
    pageCount,
    arrayStore,
    collection,
    totalCount,

    // Collection Management
    initialize,
    isPaginated,
    hasCollection,
    invalidateCache,
    deleteCollectionData,
    invalidateCacheByStartsName,

    // Page Operations (for paginated collections)
    setPage,
    getMetadata,
    getPageData,
    getAllPages,
    getPageError,
    isPageLoading,
    clearPageData,
    removeItemById,
    updateItemById,
    setPageErrorState,
    addItemToPageData,
    clearAllPagesData,
    setPageLoadingState,
    getAllItemsFromPages,
    updateItemInPageData,
    removeItemFromPageData,

    // Collection Operations (for non-paginated collections)
    addItem,
    updateItem,
    removeItem,
    setCollection,
    clearCollection,
    getCollectionData,
    getCollectionError,
    isCollectionLoading,
    setCollectionErrorState,
    setCollectionLoadingState,

    // Utility
    hasData,
    getPageCount,
    getCollection,
    getTotalItemCount,
  };
};

export default useArrayStore;
