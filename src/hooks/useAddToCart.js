/**
 * Created by Dima Portenko on 14.05.2020
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart, addToCartLoading } from '../actions';

export const useAddToCart = ({
  product,
  cart,
  customer,
  currentProduct,
  itemCount,
  region,
}) => {
  const dispatch = useDispatch();
  const onPressAddToCart = () => {
    const {
      // qtyInput: qty,
      selectedOptions,
      selectedCustomOptions,
    } = currentProduct;
    const options = [];
    selectedOptions &&
      Object.keys(selectedOptions).forEach((key) => {
        options.push({
          optionId: key,
          optionValue: selectedOptions[key],
          extensionAttributes: {},
        });
      });

    const customOptions = [];
    selectedCustomOptions &&
      Object.keys(selectedCustomOptions).forEach((key) => {
        console.log(selectedCustomOptions[key]);
        customOptions.push({
          optionId: key,
          optionValue: selectedCustomOptions[key],
          extensionAttributes: {},
        });
      });

    let productOptions = {};
    if (options.length) {
      productOptions = {
        productOption: {
          extensionAttributes: {
            configurableItemOptions: options,
          },
        },
      };
    }

    if (
      productOptions.productOption &&
      productOptions.productOption.extensionAttributes
    ) {
      productOptions.productOption.extensionAttributes.customOptions =
        customOptions;
    } else {
      productOptions = {
        productOption: {
          extensionAttributes: {
            customOptions,
          },
        },
      };
    }

    dispatch(addToCartLoading(true));
    dispatch(
      addToCart({
        cartId: cart.cartId,
        item: {
          cartItem: {
            sku: product.sku,
            qty: itemCount,
            quoteId: cart.cartId,
            ...productOptions,
          },
        },
        customer,
        region,
      })
    );
  };

  return {
    onPressAddToCart,
  };
};
