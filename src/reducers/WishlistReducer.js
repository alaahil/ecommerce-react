import {
  SET_WISHLIST_ERROR,
  SET_WISHLIST_LOADING,
  SET_WISHLIST_ITEM,
  RESET_WISHLIST,
  SET_WISHLIST_DATA,
} from '../actions/types';

const INITIAL_STATE = {
  addToWishlistLoading: true,
  items: [],
  itemsIds: [],
  errorMessage: false,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_WISHLIST_LOADING:
      return { ...state, addToWishlistLoading: action.payload };
    case SET_WISHLIST_ITEM:
      return {
        ...state,
        itemsIds: action.payload,
        errorMessage: false,
        addToWishlistLoading: false,
      };
    case SET_WISHLIST_DATA:
      return {
        ...state,
        itemsIds: action.payload?.ids,
        items: action.payload?.items,
        errorMessage: false,
        addToWishlistLoading: false,
      };

    case SET_WISHLIST_ERROR: {
      return {
        ...state,
        errorMessage: action.payload,
        addToWishlistLoading: false,
      };
    }
    case RESET_WISHLIST: {
      return INITIAL_STATE;
    }
    default:
      return state;
  }
};
