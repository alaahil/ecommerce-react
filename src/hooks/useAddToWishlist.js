/**
 * Created by Dima Portenko on 14.05.2020
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../actions/WishlistAction';

export const useAddToWishlist = ({ productId, customerId }) => {
  const dispatch = useDispatch();

  const onPressAddToWishlist = () => {
    dispatch(addToWishlist(customerId, productId));
  };
  const onPressRemoveToWishlist = () => {
    dispatch(removeFromWishlist(customerId, productId));
  };

  return {
    onPressAddToWishlist,
    onPressRemoveToWishlist,
  };
};
