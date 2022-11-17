import {
  SET_WISHLIST_DATA,
  SET_WISHLIST_ERROR,
  SET_WISHLIST_ITEM,
  SET_WISHLIST_LOADING,
} from './types';
import { magento } from '../magento';

export const addToWishlist =
  (customerId, productId) => async (dispatch, getState) => {
    try {
      const itemsIds = getState().wishlist.itemsIds;
      const filterItem = itemsIds.filter((subitem) => subitem !== productId);
      const data = [...filterItem, productId?.toString()];
      dispatch({ type: SET_WISHLIST_ITEM, payload: data });
      if (customerId && productId) {
        const resp = await magento.customer.addItemToCustomerWishlist(
          customerId,
          productId
        );
        console.log('Reponsee', resp);
        dispatch(getWishlistData());
      }
    } catch (e) {
      console.error('Error in adding wishlist', e);
      dispatch(setWishlistError(e.message));
      dispatch(getWishlistData());
    }
  };

export const removeFromWishlist =
  (customerId, productId) => async (dispatch, getState) => {
    try {
      const itemsIds = getState().wishlist.itemsIds;
      const items = getState().wishlist.items;
      console.log('Itemnsss', items);
      const filterItemsIds = itemsIds.filter(
        (subitem) => subitem !== productId.toString()
      );
      const filterItems = items.filter(
        (subitem) => subitem.entity_id !== productId.toString()
      );

      const payload = {
        ids: filterItemsIds,
        items: filterItems,
      };
      console.log('Payloadd', payload);
      dispatch({ type: SET_WISHLIST_DATA, payload });

      if (customerId && productId) {
        const resp = await magento.customer.removeItemToCustomerWishlist(
          customerId,
          productId
        );
        console.log('Reponsee of remove wishlist', resp);
        dispatch(getWishlistData());
      }
    } catch (e) {
      console.error('Error in removing wishlist', e);
      dispatch(setWishlistError(e.message));
      dispatch(getWishlistData());
    }
  };

export const getWishlistData = () => async (dispatch, getState) => {
  try {
    const customerId = getState()?.account?.customer?.id;
    if (customerId) {
      dispatch(setWishlistLoading(true));
      const resp = await magento.customer.getCustomerWishlist(customerId);
      if (resp) {
        const ids = resp?.map((item) => item?.product_id || '');
        const items = resp?.map((item) => item?.product || '');
        const payload = {
          ids,
          items,
        };
        dispatch({ type: SET_WISHLIST_DATA, payload });
        console.log('Payloaddddd', payload);
      }
      console.log('Reponsee of get wishlist', resp);
    }
  } catch (e) {
    console.error('Error in get wishlist', e);
    dispatch(setWishlistError(e.message));
  }
};

export const setWishlistLoading = (isLoading) => {
  return { type: SET_WISHLIST_LOADING, payload: isLoading };
};

export const setWishlistError = (isLoading) => {
  return { type: SET_WISHLIST_ERROR, payload: isLoading };
};
