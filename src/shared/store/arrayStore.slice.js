// Redux Store
import { createSlice } from "@reduxjs/toolkit";

// Data structure example
/*
  {
    links: {
      pagination: true,
      metadata: {
        total: 100,
        totalPages: 10,
        currentPage: 1,
        limit: 10,
      },
      pages: {
        1: {
          data: [...items],
          error: null,
          isLoading: false,
          hasNextPage: true,
          hasPrevPage: false,
        },
        2: {
          data: [...items],
          error: null,
          isLoading: false,
          hasNextPage: true,
          hasPrevPage: true,
        }
      }
    },

    images: {
      pagination: false,
      data: [...items],
      error: null,
      isLoading: false,
    }
  }
*/

// Initial state - stores different collections of items by category
const initialState = {
  latestTests: {
    data: [],
    error: null,
    isLoading: true,
    pagination: false,
  },
};

export const arrayStoreSlice = createSlice({
  initialState,
  name: "arrayStore",
  reducers: {
    // Initialize collection
    initializeCollection: (state, action) => {
      const { collectionName, pagination = false } = action.payload;

      if (state[collectionName]) {
        console.warn(
          `[ArrayStore] Collection "${collectionName}" already exists`
        );
        return;
      }

      if (pagination) {
        state[collectionName] = {
          pagination: true,
          metadata: {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 10,
          },
          pages: {},
        };
      } else {
        state[collectionName] = {
          pagination: false,
          data: [],
          error: null,
          isLoading: false,
        };
      }
    },

    // Set loading state for paginated collection
    setPageLoading: (state, action) => {
      const { collectionName, page, isLoading } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      if (!collection.pages[page]) {
        collection.pages[page] = {
          data: [],
          error: null,
          isLoading: false,
        };
      }

      collection.pages[page].isLoading = isLoading;
    },

    // Set loading state for non-paginated collection
    setCollectionLoading: (state, action) => {
      const { collectionName, isLoading } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use setPageLoading instead`
        );
        return;
      }

      collection.isLoading = isLoading;
    },

    // Set page data for paginated collection
    setPageData: (state, action) => {
      const {
        collectionName,
        page,
        data,
        error = null,
        metadata = null,
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      // Update metadata if provided
      if (metadata) {
        collection.metadata = {
          total: metadata.total || 0,
          totalPages: metadata.totalPages || 0,
          currentPage: metadata.page || page,
          limit: metadata.limit || 10,
        };
      }

      collection.pages[page] = {
        data: Array.isArray(data) ? data : [],
        error,
        isLoading: false,
        hasNextPage: metadata?.hasNextPage ?? true,
        hasPrevPage: metadata?.hasPrevPage ?? page > 1,
      };
    },

    // Set data for non-paginated collection
    setCollectionData: (state, action) => {
      const { collectionName, data, error = null } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use setPageData instead`
        );
        return;
      }

      collection.data = Array.isArray(data) ? data : [];
      collection.error = error;
      collection.isLoading = false;
    },

    // Set error for page
    setPageError: (state, action) => {
      const { collectionName, page, error } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      if (!collection.pages[page]) {
        collection.pages[page] = {
          data: [],
          error: null,
          isLoading: false,
        };
      }

      collection.pages[page].error = error;
      collection.pages[page].isLoading = false;
    },

    // Set error for collection
    setCollectionError: (state, action) => {
      const { collectionName, error } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use setPageError instead`
        );
        return;
      }

      collection.error = error;
      collection.isLoading = false;
    },

    // Add item to non-paginated collection
    addItemToCollection: (state, action) => {
      const { collectionName, item } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, cannot add items directly`
        );
        return;
      }

      collection.data.push(item);
    },

    // Add item to page in paginated collection
    addItemToPage: (state, action) => {
      const { collectionName, page, item } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      if (!collection.pages[page]) {
        collection.pages[page] = {
          data: [],
          error: null,
          isLoading: false,
        };
      }

      collection.pages[page].data.push(item);
    },

    // Update item in non-paginated collection by ID
    updateItemInCollection: (state, action) => {
      const {
        collectionName,
        itemId,
        itemData,
        idField = "_id",
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use updateItemInPage instead`
        );
        return;
      }

      const itemIndex = collection.data.findIndex(
        (item) => item[idField] === itemId
      );

      if (itemIndex === -1) {
        console.error(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in collection "${collectionName}"`
        );
        return;
      }

      // Merge existing item with new data
      collection.data[itemIndex] = {
        ...collection.data[itemIndex],
        ...itemData,
      };
    },

    // Update item in page by ID
    updateItemInPage: (state, action) => {
      const {
        collectionName,
        page,
        itemId,
        itemData,
        idField = "_id",
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      const pageData = collection.pages[page];

      if (!pageData) {
        console.error(
          `[ArrayStore] Page ${page} does not exist in collection "${collectionName}"`
        );
        return;
      }

      const itemIndex = pageData.data.findIndex(
        (item) => item[idField] === itemId
      );

      if (itemIndex === -1) {
        console.error(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in page ${page} of collection "${collectionName}"`
        );
        return;
      }

      // Merge existing item with new data
      pageData.data[itemIndex] = {
        ...pageData.data[itemIndex],
        ...itemData,
      };
    },

    // Update item by ID from all pages (searches through all pages)
    updateItemByIdInPages: (state, action) => {
      const {
        collectionName,
        itemId,
        itemData,
        idField = "_id",
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      let itemFound = false;
      const pages = collection.pages;

      // Search through all pages
      for (const pageNum in pages) {
        const pageData = pages[pageNum];
        const itemIndex = pageData.data.findIndex(
          (item) => item[idField] === itemId
        );

        if (itemIndex !== -1) {
          // Merge existing item with new data
          pageData.data[itemIndex] = {
            ...pageData.data[itemIndex],
            ...itemData,
          };
          itemFound = true;
          console.log(
            `[ArrayStore] Item with ${idField}="${itemId}" updated in page ${pageNum} of collection "${collectionName}"`
          );
          break; // Stop after finding and updating the item
        }
      }

      if (!itemFound) {
        console.warn(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in any page of collection "${collectionName}"`
        );
      }
    },

    // Remove item from non-paginated collection by ID
    removeItemFromCollection: (state, action) => {
      const { collectionName, itemId, idField = "_id" } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use removeItemFromPage instead`
        );
        return;
      }

      const itemIndex = collection.data.findIndex(
        (item) => item[idField] === itemId
      );

      if (itemIndex === -1) {
        console.error(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in collection "${collectionName}"`
        );
        return;
      }

      collection.data.splice(itemIndex, 1);
    },

    // Remove item from page by ID
    removeItemFromPage: (state, action) => {
      const { collectionName, page, itemId, idField = "_id" } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      const pageData = collection.pages[page];

      if (!pageData) {
        console.error(
          `[ArrayStore] Page ${page} does not exist in collection "${collectionName}"`
        );
        return;
      }

      const itemIndex = pageData.data.findIndex(
        (item) => item[idField] === itemId
      );

      if (itemIndex === -1) {
        console.error(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in page ${page} of collection "${collectionName}"`
        );
        return;
      }

      pageData.data.splice(itemIndex, 1);
    },

    // Remove item by ID from all pages (searches through all pages)
    removeItemByIdFromPages: (state, action) => {
      const { collectionName, itemId, idField = "_id" } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      let itemFound = false;
      const pages = collection.pages;

      // Search through all pages
      for (const pageNum in pages) {
        const pageData = pages[pageNum];
        const itemIndex = pageData.data.findIndex(
          (item) => item[idField] === itemId
        );

        if (itemIndex !== -1) {
          pageData.data.splice(itemIndex, 1);
          itemFound = true;
          console.log(
            `[ArrayStore] Item with ${idField}="${itemId}" removed from page ${pageNum} in collection "${collectionName}"`
          );
          break; // Stop after finding and removing the item
        }
      }

      if (!itemFound) {
        console.warn(
          `[ArrayStore] Item with ${idField}="${itemId}" not found in any page of collection "${collectionName}"`
        );
      }
    },

    // Clear page data
    clearPage: (state, action) => {
      const { collectionName, page } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      delete collection.pages[page];
    },

    // Clear all pages
    clearAllPages: (state, action) => {
      const { collectionName } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is not paginated`
        );
        return;
      }

      collection.pages = {};
      console.log(
        `[ArrayStore] All pages cleared in collection "${collectionName}"`
      );
    },

    // Invalidate cache and clear all pages (useful after add/delete operations)
    invalidateCollection: (state, action) => {
      const { collectionName, isLoading } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        // Clear all cached pages
        collection.pages = {};
        console.log(
          `[ArrayStore] Collection "${collectionName}" cache invalidated - all pages cleared`
        );
      } else {
        // Clear non-paginated collection data
        collection.data = [];
        collection.error = null;
        collection.isLoading = !!isLoading;
        console.log(
          `[ArrayStore] Collection "${collectionName}" cache invalidated - data cleared`
        );
      }
    },

    // Clear collection data
    clearCollectionData: (state, action) => {
      const { collectionName } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (collection.pagination) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" is paginated, use clearAllPages instead`
        );
        return;
      }

      collection.data = [];
      collection.error = null;
    },

    // Delete entire collection
    deleteCollection: (state, action) => {
      const { collectionName } = action.payload;

      if (!state[collectionName]) {
        console.error(
          `[ArrayStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      delete state[collectionName];
    },
  },
});

// Export actions
export const {
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
  addItemToCollection,
  removeItemFromPage,
  clearCollectionData,
  invalidateCollection,
  setCollectionLoading,
  initializeCollection,
  updateItemByIdInPages,
  updateItemInCollection,
  removeItemByIdFromPages,
  removeItemFromCollection,
} = arrayStoreSlice.actions;

// Export reducer
export default arrayStoreSlice.reducer;
