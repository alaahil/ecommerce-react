import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import { magento } from '../magento';
import { magentoOptions } from '../config/magento';
import {
  MAGENTO_INIT,
  MAGENTO_INIT_ERROR,
  MAGENTO_GET_CATEGORY_TREE,
  MEGENTO_CLEAR_CATEGORY_TREE,
  MAGENTO_CURRENT_CATEGORY,
  MAGENTO_GET_CATEGORY_PRODUCTS,
  MAGENTO_UPDATE_CONF_PRODUCT,
  MAGENTO_GET_CONF_OPTIONS,
  MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS,
  MAGENTO_RESET_CATEGORY_PRODUCTS,
  MAGENTO_PRODUCT_ATTRIBUTE_OPTIONS,
  MAGENTO_CURRENT_PRODUCT,
  MAGENTO_GET_PRODUCT_MEDIA,
  MAGENTO_CREATE_CART,
  MAGENTO_ADD_TO_CART_LOADING,
  MAGENTO_ADD_CART_BILLING_ADDRESS,
  MAGENTO_GET_CART_SHIPPING_METHODS,
  MAGENTO_GET_CART_PAYMENT_METHODS,
  MAGENTO_PLACE_GUEST_CART_ORDER,
  MAGENTO_ADD_SHIPPING_TO_CART,
  MAGENTO_ADD_TO_CART,
  MAGENTO_GET_CART,
  MAGENTO_CART_ITEM_PRODUCT,
  MAGENTO_GET_COUNTRIES,
  MAGENTO_GET_CURRENCY,
  MAGENTO_CREATE_CUSTOMER,
  UI_CHECKOUT_ACTIVE_SECTION,
  UI_CHECKOUT_CUSTOMER_NEXT_LOADING,
  HOME_SCREEN_DATA,
  MAGENTO_GET_FEATURED_PRODUCTS,
  MAGENTO_UPDATE_FEATURED_CONF_PRODUCT,
  MAGENTO_REMOVE_FROM_CART,
  MAGENTO_REMOVE_FROM_CART_LOADING,
  MAGENTO_GET_SEARCH_PRODUCTS,
  MAGENTO_UPDATE_SEARCH_CONF_PRODUCT,
  MAGENTO_LOAD_MORE_SEARCH_PRODUCTS,
  MAGENTO_RESET_SEARCH_PRODUCTS,
  MAGENTO_STORE_CONFIG,
  MAGENTO_GET_ORDERS,
  MAGENTO_ORDER_PRODUCT_DETAIL,
  MAGENTO_UPDATE_CATEGORY_PRODUCTS,
  MAGENTO_UPDATE_REFRESHING_CATEGORY_PRODUCTS,
  MAGENTO_UPDATE_REFRESHING_HOME_DATA,
  MAGENTO_UPDATE_REFRESHING_CATEGORY_TREE,
  MAGENTO_UPDATE_REFRESHING_CART_ITEM_PRODUCT,
  MAGENTO_ADD_ACCOUNT_ADDRESS,
  MAGENTO_ADD_New_ADDRESS,
  RESET_ACCOUNT_ADDRESS_UI,
  MAGENTO_ERROR_MESSAGE_CART_ORDER,
  MAGENTO_GET_FILTERED_PRODUCTS,
  MAGENTO_UPDATE_REFRESHING_ORDERS_DATA,
  ADD_FILTER_DATA,
  RESET_FILTERS_DATA,
  MAGENTO_ADD_ACCOUNT_ADDRESS_ERROR,
  MAGENTO_GET_CUSTOM_OPTIONS,
  MAGENTO_CART_RESET,
  UI_CHECKOUT_SHIPPING_SELECTED,
  MAGENTO_ACCOUNT_SET_USER_EMIRATES,
  MAGENTO_DELETE_ADDRESS,
  MAGENTO_GET_HOME_PAGE_TEXT,
  MAGENTO_GET_HOME_PAGE_BANNERS,
  MAGENTO_GET_PRODUCT_BY_SKU,
  MAGENTO_GET_HOME_CATEGORIES,
  MAGENTO_GET_BRANDS,
  MAGENTO_ADD_NEW_ADDRESS_ERROR,
} from './types';
import { logError } from '../helper/logger';
import { priceSignByCode } from '../helper/price';
import { checkoutSetActiveSection } from './UIActions';
import NavigationService from '../navigation/NavigationService';
import axios from 'axios';
import { Platform } from 'react-native';
import { BASE_URL } from '../constant/constant';

export const initMagento = () => {
  magento.setOptions(magentoOptions);

  return async (dispatch) => {
    try {
      magento.init();
      dispatch({ type: MAGENTO_INIT, payload: magento });
      const storeToUse = await AsyncStorage.getItem('store');
      storeToUse ? magento.setStore(storeToUse) : magento.setStore('s44');
      const storeConfig = await magento.admin.getStoreConfig();
      const storeInCache = await AsyncStorage.getItem('store');

      if (storeInCache === 's44' || !storeInCache) {
        dispatch({ type: MAGENTO_STORE_CONFIG, payload: storeConfig[0] });
      } else {
        dispatch({ type: MAGENTO_STORE_CONFIG, payload: storeConfig[1] });
      }

      const customerToken = await AsyncStorage.getItem('customerToken');
      magento.setCustomerToken(customerToken);
      getHomePageText(dispatch);
      getHomePageBanners(dispatch);
      getHomeCategories(dispatch);
      getCurrency(dispatch);
      getBrands(dispatch);
    } catch (error) {
      logError(error);
      dispatch({
        type: MAGENTO_INIT_ERROR,
        payload: { errorMessage: error?.message },
      });
    }
  };
};

const getCurrency = async (dispatch) => {
  try {
    const data = await magento.guest.getCurrency();
    const displayCurrency = await getCurrencyToBeDisplayed(data);
    dispatch({
      type: MAGENTO_GET_CURRENCY,
      payload: {
        displayCurrency,
        currencyData: data,
      },
    });
  } catch (error) {
    logError(error);
  }
};

const getHomePageText = async (dispatch) => {
  try {
    const data = await magento.admin.getHomePageText();
    dispatch({
      type: MAGENTO_GET_HOME_PAGE_TEXT,
      payload: {
        homePageText: data,
      },
    });
  } catch (error) {
    logError(error);
  }
};

const getHomePageBanners = async (dispatch) => {
  try {
    const data = await magento.admin.getHomePageBanners();
    // console.log('TIBU Banners : ' + JSON.stringify(data))
    dispatch({
      type: MAGENTO_GET_HOME_PAGE_BANNERS,
      payload: {
        homePageBanners: data,
      },
    });
  } catch (error) {
    logError(error);
  }
};

const getBrands = async (dispatch) => {
  try {
    const data = await magento.admin.getBrands();
    let brandObj = {};
    if (Array.isArray(data) && data.length) {
      for (let i = 0; i < data.length; i++) {
        const brandId = data[i].brand_id;
        const brandName = data[i].name;
        if (brandId && brandName) {
          brandObj[brandId] = brandName;
        }
      }
    }
    dispatch({
      type: MAGENTO_GET_BRANDS,
      payload: {
        brands: data,
        brandObj,
      },
    });
  } catch (error) {
    logError(error);
  }
};

const getHomeCategories = async (dispatch) => {
  try {
    const data = await magento.admin.getHomeCategories();
    // console.log('TIBU Categories : ' + JSON.stringify(data))
    dispatch({
      type: MAGENTO_GET_HOME_CATEGORIES,
      payload: {
        homeCategories: data.items,
      },
    });
  } catch (error) {
    logError(error);
  }
};

async function getCurrencyToBeDisplayed(currencyData) {
  let code = currencyData.default_display_currency_code;
  let symbol =
    currencyData.default_display_currency_symbol || priceSignByCode(code);
  let rate = 1;

  if (
    'available_currency_codes' in currencyData &&
    currencyData.available_currency_codes.length > 0
  ) {
    const previousSelectedCurrencyCode = await AsyncStorage.getItem(
      'currency_code'
    );
    if (
      previousSelectedCurrencyCode &&
      previousSelectedCurrencyCode !== code &&
      currencyData.available_currency_codes.includes(
        previousSelectedCurrencyCode
      )
    ) {
      code = previousSelectedCurrencyCode;
      symbol = priceSignByCode(code);
    }
    // TODO: If not and currency get from RNLocalize is supported, then set that and update AsyncStorage
  }

  const exchangeRate = currencyData.exchange_rates.find(
    (_exchangeRate) => _exchangeRate.currency_to === code
  );
  if (exchangeRate && 'rate' in exchangeRate) {
    rate = exchangeRate.rate;
  }

  return {
    code,
    symbol,
    rate,
  };
}

export const getHomeData = (refreshing) => async (dispatch) => {
  if (refreshing) {
    dispatch({ type: MAGENTO_UPDATE_REFRESHING_HOME_DATA, payload: true });
  }

  try {
    const storeConfig = await magento.admin.getStoreConfig();
    const config = storeConfig.find(
      (conf) => conf.code === magentoOptions.store
    );
    magento.setStoreConfig(config);

    const value = await magento.getHomeData();

    // console.log("cmsBlock===> ", value)

    if (!value) {
      dispatch({ type: MAGENTO_UPDATE_REFRESHING_HOME_DATA, payload: false });
      return;
    }
    logError(value);
    const payload = JSON.parse(value.content.replace(/<\/?[^>]+(>|$)/g, ''));
    dispatch({ type: HOME_SCREEN_DATA, payload });
    dispatch({ type: MAGENTO_UPDATE_REFRESHING_HOME_DATA, payload: false });

    _.forEach(payload.featuredCategories, (details, categoryId) =>
      getFeaturedCategoryProducts(categoryId, dispatch)
    );
  } catch (e) {
    logError(e);
  }
};

export const getFeaturedCategoryProducts = async (categoryId, dispatch) => {
  try {
    const products = await magento.admin.getProducts(categoryId);
    dispatch({
      type: MAGENTO_GET_FEATURED_PRODUCTS,
      payload: { categoryId, products },
    });
    updateConfigurableProductsPrices(
      products.items,
      dispatch,
      MAGENTO_UPDATE_FEATURED_CONF_PRODUCT
    );
  } catch (e) {
    logError(e);
    return null;
  }
};

export const getProductBySKU = async (sku, dispatch) => {
  try {
    const product = await magento.admin.getProductBySku(sku);
    dispatch({
      type: MAGENTO_GET_PRODUCT_BY_SKU,
      payload: { product },
    });
  } catch (e) {
    logError(e);
    return null;
  }
};

export const getCategoryTree = (refreshing) => async (dispatch) => {
  if (refreshing) {
    dispatch({ type: MAGENTO_UPDATE_REFRESHING_CATEGORY_TREE, payload: true });
  }

  try {
    const data = await magento.admin.getCategoriesTree();
    dispatch({ type: MAGENTO_GET_CATEGORY_TREE, payload: data });
    dispatch({ type: MAGENTO_UPDATE_REFRESHING_CATEGORY_TREE, payload: false });
  } catch (error) {
    logError(error);
  }
};

export const resetCategoryTree = () => ({
  type: MEGENTO_CLEAR_CATEGORY_TREE,
});

export const resetAccountAddressUI = () => ({
  type: RESET_ACCOUNT_ADDRESS_UI,
});

export const getProductsForCategory =
  ({ id, offset }) =>
  (dispatch) => {
    if (offset) {
      dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: true });
    }
    magento.admin
      .getProducts(id, 10, offset)
      .then((payload) => {
        dispatch({ type: MAGENTO_GET_CATEGORY_PRODUCTS, payload });
        dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: false });
        updateConfigurableProductsPrices(payload.items, dispatch);
      })
      .catch((error) => {
        logError(error);
      });
  };

export const addFilterData = (data) => ({
  type: ADD_FILTER_DATA,
  payload: data,
});

export const resetFilters = () => ({
  type: RESET_FILTERS_DATA,
});

export const getProductsForCategoryOrChild =
  (category, offset, sortOrder, filter) => async (dispatch) => {
    if (offset) {
      dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: true });
    }

    if (
      !offset &&
      (typeof sortOrder === 'number' || typeof filter !== 'undefined')
    ) {
      dispatch({ type: MAGENTO_RESET_CATEGORY_PRODUCTS });
    }

    try {
      const payload = await magento.admin.getSearchCriteriaForCategoryAndChild(
        category,
        10,
        offset,
        sortOrder,
        filter
      );
      // console.log('pro',payload);

      dispatch({
        type: MAGENTO_GET_CATEGORY_PRODUCTS,
        payload: {
          ...payload,
          items: payload.items.filter((item) => item.status === 1),
        },
      });
      dispatch({ type: MAGENTO_LOAD_MORE_CATEGORY_PRODUCTS, payload: false });
      updateConfigurableProductsPrices(payload.items, dispatch);
    } catch (e) {
      logError(e);
    }
  };

export const updateProductsForCategoryOrChild =
  (category, refreshing) => async (dispatch) => {
    if (refreshing) {
      dispatch({
        type: MAGENTO_UPDATE_REFRESHING_CATEGORY_PRODUCTS,
        payload: true,
      });
    }

    try {
      const payload = await magento.admin.getSearchCriteriaForCategoryAndChild(
        category,
        10
      );
      dispatch({ type: MAGENTO_UPDATE_CATEGORY_PRODUCTS, payload });
      dispatch({
        type: MAGENTO_UPDATE_REFRESHING_CATEGORY_PRODUCTS,
        payload: false,
      });
      updateConfigurableProductsPrices(payload.items, dispatch);
    } catch (e) {
      logError(e);
    }
  };

export const getSearchProducts =
  (searchInput, offset, sortOrder, filter) => async (dispatch) => {
    if (offset) {
      dispatch({ type: MAGENTO_LOAD_MORE_SEARCH_PRODUCTS, payload: true });
    }

    if (
      !offset &&
      (typeof sortOrder === 'number' || typeof filter !== 'undefined')
    ) {
      dispatch({ type: MAGENTO_RESET_SEARCH_PRODUCTS });
    }

    try {
      const data = await magento.admin.getProductsWithAttribute(
        'search_keywords',
        searchInput,
        10,
        offset,
        sortOrder,
        filter,
        'like',
        true
      );
      dispatch({
        type: MAGENTO_GET_SEARCH_PRODUCTS,
        payload: { searchInput, data },
      });
      dispatch({ type: MAGENTO_LOAD_MORE_SEARCH_PRODUCTS, payload: false });
      updateConfigurableProductsPrices(
        data.items,
        dispatch,
        MAGENTO_UPDATE_SEARCH_CONF_PRODUCT
      );
    } catch (e) {
      logError(e);
    }
  };

export const getCustomOptions = (sku, id) => async (dispatch) => {
  try {
    const data = await magento.admin.getProductOptions(sku);

    // console.log('getCustomOptions', JSON.stringify(data));

    dispatch({ type: MAGENTO_GET_CUSTOM_OPTIONS, payload: { data, id } });
  } catch (e) {
    logError(e);
  }
};

export const getConfigurableProductOptions = (sku, id) => (dispatch) => {
  magento.admin
    .getConfigurableProductOptions(sku)
    .then((data) => {
      dispatch({ type: MAGENTO_GET_CONF_OPTIONS, payload: { data, id } });
      data.forEach((option) => {
        magento.admin
          .getAttributeByCode(option.attribute_id)
          .then((attributeOptions) => {
            dispatch({
              type: MAGENTO_PRODUCT_ATTRIBUTE_OPTIONS,
              payload: {
                productId: id,
                attributeId: option.attribute_id,
                options: attributeOptions.options,
                attributeCode: attributeOptions.attribute_code,
              },
            });
          })
          .catch((error) => {
            logError(error);
          });
      });
    })
    .catch((error) => {
      logError(error);
    });
};

export const updateConfigurableProductsPrices = (products, dispatch, type) => {
  products.forEach((product) => {
    if (product.type_id === 'configurable') {
      updateConfigurableProductPrice(product, dispatch, type);
    }
  });
};

const updateConfigurableProductPrice = async (
  product,
  dispatch,
  type = MAGENTO_UPDATE_CONF_PRODUCT
) => {
  const { sku, id } = product;
  try {
    const data = await magento.admin.getConfigurableChildren(sku);
    dispatch({ type, payload: { sku, children: data, id } });
  } catch (e) {
    logError(e);
  }
};

export const getProductMedia =
  ({ sku, id }) =>
  (dispatch) => {
    magento.admin
      .getProductMedia(sku)
      .then((media) => {
        dispatch({
          type: MAGENTO_GET_PRODUCT_MEDIA,
          payload: { sku, media, id },
        });
      })
      .catch((error) => {
        logError(error);
      });
  };

export const setCurrentCategory = (category) => ({
  type: MAGENTO_CURRENT_CATEGORY,
  payload: category,
});

export const setCurrentProduct = (product) => ({
  type: MAGENTO_CURRENT_PRODUCT,
  payload: product,
});

export const createCustomerCart = (customerId) => async (dispatch) => {
  if (customerId) {
    try {
      const cartId = await magento.admin.getCart(customerId);
      dispatch({ type: MAGENTO_CREATE_CART, payload: cartId });
      dispatch(getCart());
    } catch (error) {
      logError(error);
    }
  }
};

export const resetCart = () => {
  return async (dispatch) => {
    try {
      await AsyncStorage.removeItem('cartId');
    } catch (error) {
      logError(error);
    }
    return dispatch({
      type: MAGENTO_CART_RESET,
    });
  };
};

export const getCart =
  (refreshing = false) =>
  async (dispatch, getState) => {
    if (refreshing) {
      dispatch({
        type: MAGENTO_UPDATE_REFRESHING_CART_ITEM_PRODUCT,
        payload: true,
      });
    }

    try {
      let cart;
      let cartId = await AsyncStorage.getItem('cartId');
      let region = await AsyncStorage.getItem('store');
      if (magento.isCustomerLogin()) {
        let guest_cart = cartId ? await magento.guest.getGuestCart(cartId) : [];
        AsyncStorage.removeItem('cartId');
        cart = await magento.customer.getCustomerCart();
        console.log('Cart details', cart);
        if (cart?.id) {
          dispatch({ type: MAGENTO_CREATE_CART, payload: cart?.id });
        }
        for (let i = 0; i < guest_cart?.items?.length || 0; i++) {
          const item = guest_cart?.items[i];
          await dispatchAddToCart(
            dispatch,
            cart?.id,
            {
              cartItem: {
                sku: item.sku,
                qty: item.qty,
                quoteId: cart.id,
                productOption: { extensionAttributes: { customOptions: [] } },
              },
            },
            region
          );
        }
        cart = await magento.customer.getCustomerCart();
      } else {
        if (cartId) {
          try {
            cart = await magento.guest.getGuestCart(cartId);
          } catch (err) {
            logError('Cart id ' + cartId + ' is no longer exist');
          }
        }

        if (!cartId || !cart) {
          cartId = await magento.guest.createGuestCart();
          AsyncStorage.setItem('cartId', cartId);
          cart = await magento.guest.getGuestCart(cartId);
        }
        dispatch({ type: MAGENTO_CREATE_CART, payload: cartId });
      }

      // console.log('cart for redux',cart)
      dispatch({ type: MAGENTO_GET_CART, payload: cart });
      dispatch({
        type: MAGENTO_UPDATE_REFRESHING_CART_ITEM_PRODUCT,
        payload: false,
      });
    } catch (error) {
      logError('Error in cart get CART', error);
      // if (
      //   error.message &&
      //   error.message.includes('No such entity with customerId')
      // ) {

      // }
      const { customer } = getState().account;
      if (customer && customer.id) {
        dispatch(createCustomerCart(customer.id));
      }
    }
  };

export const addToCartLoading = (isLoading) => ({
  type: MAGENTO_ADD_TO_CART_LOADING,
  payload: isLoading,
});

export const addToCart =
  ({ cartId, item, customer, region, showErrorMessage }) =>
  async (dispatch) => {
    try {
      if (cartId) {
        return dispatchAddToCart(
          dispatch,
          cartId,
          item,
          region,
          showErrorMessage
        );
      }

      const updatedItem = item;
      if (magento.isCustomerLogin()) {
        const customerCartId = await magento.admin.getCart(customer.id);
        dispatch({ type: MAGENTO_CREATE_CART, payload: customerCartId });
        updatedItem.cartItem.quoteId = customerCartId;
        return dispatchAddToCart(
          dispatch,
          customerCartId,
          updatedItem,
          '',
          showErrorMessage
        );
      } else {
        let guestCartId = await AsyncStorage.getItem('cartId');
        if (!cartId) {
          guestCartId = await magento.guest.createGuestCart();
          dispatch({ type: MAGENTO_CREATE_CART, payload: guestCartId });
          updatedItem.cartItem.quoteId = guestCartId;
        }
        return dispatchAddToCart(
          dispatch,
          guestCartId,
          updatedItem,
          '',
          showErrorMessage
        );
      }
    } catch (error) {
      logError(error);
    }
  };

const dispatchAddToCart = async (
  dispatch,
  cartId,
  item,
  region,
  showErrorMessage?
) => {
  try {
    let result;
    if (magento.isCustomerLogin()) {
      console.log('ITemss', item);
      // console.log("addToCartItem==> ", JSON.stringify(item));
      //alert(JSON.stringify(item));
      result = await magento.customer.addItemToCart(item, region);
      // console.log("addToCartOption==> ", JSON.stringify(result));
    } else {
      result = await magento.guest.addItemToCart(cartId, item, region);
    }
    dispatch(checkoutSetActiveSection(1));
    dispatch({ type: MAGENTO_ADD_TO_CART, payload: result });
    if (cartId) {
      dispatchGetGuestCart(dispatch, cartId);
    }
  } catch (e) {
    console.error('Error in add  cart', e);
    if (showErrorMessage && e.message) {
      alert(e.message);
    }
    // console.log("addToCartOption==> ", JSON.stringify(e));
    //alert(JSON.stringify(e));
    dispatch({ type: MAGENTO_ADD_TO_CART, payload: e });
  }
};

const dispatchGetGuestCart = async (dispatch, cartId) => {
  try {
    let data;
    if (magento.isCustomerLogin()) {
      data = await magento.customer.getCustomerCart();
    } else {
      if (cartId) {
        data = await magento.guest.getGuestCart(cartId);
      }
    }
    dispatch({ type: MAGENTO_GET_CART, payload: data });
  } catch (e) {
    logError(e);
  }
};

export const cartItemProduct = (sku) => async (dispatch) => {
  try {
    const data = await magento.admin.getProductBySku(sku);
    dispatch({ type: MAGENTO_CART_ITEM_PRODUCT, payload: data });
  } catch (error) {
    logError(error);
  }
};

export const getOrdersForCustomer =
  (customerId, refreshing) => async (dispatch) => {
    if (refreshing) {
      dispatch({ type: MAGENTO_UPDATE_REFRESHING_ORDERS_DATA, payload: true });
    }

    try {
      const data = await magento.admin.getOrderList(customerId);
      const orders = data.items.map((order) => {
        const { items } = order;
        if (items != null && items != undefined) {
          const simpleItems = items.filter((i) => i.product_type === 'simple');
          const simpleItemsWithPriceAndName = simpleItems.map((simpleItem) => {
            if (simpleItem.parent_item) {
              simpleItem.price =
                simpleItem.parent_item.extension_attributes.price_with_vat;
              simpleItem.row_total = simpleItem.parent_item.row_total;
              simpleItem.name = simpleItem.parent_item.name || simpleItem.name;
            }
            return simpleItem;
          });
          order.items = simpleItemsWithPriceAndName;
        }

        return order;
      });
      data.items = orders;
      dispatch({ type: MAGENTO_GET_ORDERS, payload: data });
      dispatch({ type: MAGENTO_UPDATE_REFRESHING_ORDERS_DATA, payload: false });
    } catch (error) {
      logError(error);
    }
  };

// Fetch product_data for product in OrderScreen
export const orderProductDetail = (sku) => async (dispatch) => {
  try {
    const product = await magento.admin.getProductBySku(sku);
    dispatch({
      type: MAGENTO_ORDER_PRODUCT_DETAIL,
      payload: {
        sku,
        product,
      },
    });
  } catch (error) {
    logError(error);
  }
};

export const addAccountAddress =
  (id, customer, callback) => async (dispatch) => {
    try {
      const data = await magento.admin.updateCustomerData(id, customer);
      dispatch({ type: MAGENTO_ADD_ACCOUNT_ADDRESS, payload: data });
      callback(true);
    } catch (error) {
      logError(error);
      const message = error?.message
        ? error?.message
        : 'Sorry, something went wrong. Please check your internet connection and try again';
      dispatch({ type: MAGENTO_ADD_ACCOUNT_ADDRESS_ERROR, payload: message });

      callback(false);
    }
  };

export const addNewAddress = (id, data, callback) => async (dispatch) => {
  try {
    console.log('addNewAddress', JSON.stringify(data));

    const result = await magento.admin.addNewCustomerAddress(id, data);

    console.log('addNewAddress Result', result);

    dispatch({ type: MAGENTO_ADD_New_ADDRESS, payload: result });
    callback(true);
  } catch (error) {
    logError(error);
    const message = error?.message
      ? error?.message
      : 'Sorry, something went wrong. Please check your internet connection and try again';
    dispatch({ type: MAGENTO_ADD_NEW_ADDRESS_ERROR, payload: message });
    callback(false);
  }
};

export const deleteCustomerAddress = (id) => async (dispatch) => {
  try {
    console.log('delete addess ', 'deleteCustomerAddress');

    const result = await magento.admin.deleteCustomerAddress(id);

    console.log('delete addess ', result);

    dispatch({ type: MAGENTO_DELETE_ADDRESS, payload: result });
  } catch (error) {
    logError(error);
    const message = error?.message
      ? error?.message
      : 'Sorry, something went wrong. Please check your internet connection and try again';
    dispatch({ type: MAGENTO_ADD_NEW_ADDRESS_ERROR, payload: message });
  }
};
//

export const addGuestCartBillingAddress =
  (cartId, address) => async (dispatch) => {
    try {
      let data;
      if (magento.isCustomerLogin()) {
        // Submits logged in user's address to magento
        data = await magento.customer.addCartBillingAddress(address);
      } else {
        // Submits guest user's address to magento
        data = await magento.guest.addGuestCartBillingAddress(cartId, address);
      }
      dispatch({ type: MAGENTO_ADD_CART_BILLING_ADDRESS, payload: data });
    } catch (error) {
      logError(error);
    }

    try {
      let data;
      if (magento.isCustomerLogin()) {
        // Returns shipping methods for logged in user (Free Shipping/Flat Rate)
        data = await magento.customer.cartEstimateShippingMethods(address);
      } else {
        // Returns shipping methods for guest user (Free Shipping/Flat Rate)
        data = await magento.guest.guestCartEstimateShippingMethods(
          cartId,
          address
        );
      }

      const customisedData = data[0];

      dispatch({
        type: MAGENTO_GET_CART_SHIPPING_METHODS,
        payload: [customisedData],
      });
      dispatch({
        type: UI_CHECKOUT_SHIPPING_SELECTED,
        payload: customisedData,
      });
      dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 2 });
      dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
    } catch (error) {
      // dispatch({ type: MAGENTO_GET_CART_SHIPPING_METHODS, payload: "data" });
      // dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 2 });
      // dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
      console.log('errorr from==========', error);
      logError(error);
    }
  };

export const addcustomCartBillingAddress = (address) => async (dispatch) => {
  try {
    let data;
    data = await magento.customer.addCartBillingAddress(address);

    dispatch({ type: MAGENTO_ADD_CART_BILLING_ADDRESS, payload: data });
  } catch (error) {
    logError(error);
  }

  try {
    let data;
    data = await magento.customer.cartEstimateShippingMethods(address);

    const customisedData = data[0];

    dispatch({
      type: MAGENTO_GET_CART_SHIPPING_METHODS,
      payload: [customisedData],
    });
    dispatch({
      type: UI_CHECKOUT_SHIPPING_SELECTED,
      payload: customisedData,
    });
    dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 2 });
    dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
  } catch (error) {
    // dispatch({ type: MAGENTO_GET_CART_SHIPPING_METHODS, payload: "data" });
    // dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 2 });
    // dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
    console.log('errorr from==========', error);
    logError(error);
  }
};

export const getGuestCartShippingMethods = (cartId) => async (dispatch) => {
  try {
    let data;
    if (magento.isCustomerLogin()) {
      data = await magento.customer.getCartShippingMethods();
    } else {
      if (cartId) {
        data = await magento.guest.getGuestCartShippingMethods(cartId);
      }
    }
    dispatch({ type: MAGENTO_GET_CART_SHIPPING_METHODS, payload: data });
  } catch (error) {
    logError(error);
  }
};

export const addGuestCartShippingInfo =
  (cartId, address) => async (dispatch) => {
    try {
      let data;
      if (magento.isCustomerLogin()) {
        // Returns shipping methods i.e COD/Pay by Card info
        data = await magento.customer.addCartShippingInfo(address);
      } else {
        // Returns shipping methods i.e COD/Pay by Card info
        if (cartId) {
          data = await magento.guest.getGuestCartShippingInformation(
            cartId,
            address
          );
        }
      }
      console.log('Data payment methodd', data.payment_methods);
      const removeName = [
        'checkoutcom_google_pay',
        'checkoutcom_apple_pay',
        'tamara_pay_now',
      ];
      data.payment_methods = data.payment_methods.filter(
        (item) => !removeName.includes(item.code)
      );
      if (Platform.OS === 'ios') {
        data.payment_methods.push({
          title: 'Apple Pay',
          code: 'checkoutcom_apple_pay',
        });
      } else {
        data.payment_methods.push({
          title: 'Google Pay',
          code: 'checkoutcom_google_pay',
        });
      }

      console.log('after payment methodd', data.payment_methods);
      dispatch({ type: MAGENTO_ADD_SHIPPING_TO_CART, payload: data });
      dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
      dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 3 });
    } catch (error) {
      dispatch({ type: MAGENTO_ADD_SHIPPING_TO_CART, payload: 'data' });
      dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
      dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 3 });
      logError(error);
    }
  };

export const getGuestCartPaymentMethods = (cartId) => async (dispatch) => {
  try {
    let data;
    if (magento.isCustomerLogin()) {
      data = await magento.customer.getCartPaymentMethods();
    } else {
      if (cartId) {
        data = await magento.guest.getGuestCartPaymentMethods(cartId);
      }
    }
    const removeName = [
      'checkoutcom_google_pay',
      'checkoutcom_apple_pay',
      'tamara_pay_now',
    ];
    data = data.filter((item) => !removeName.includes(item.code));
    if (Platform.OS === 'ios') {
      data.push({
        title: 'Apple Pay',
        code: 'checkoutcom_apple_pay',
      });
    } else {
      data.push({
        title: 'Google Pay',
        code: 'checkoutcom_google_pay',
      });
    }
    dispatch({ type: MAGENTO_GET_CART_PAYMENT_METHODS, payload: data });
    dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
    dispatch({ type: UI_CHECKOUT_ACTIVE_SECTION, payload: 4 });
  } catch (error) {
    logError(error);
  }
};

export const getCountries = () => (dispatch) => {
  magento.guest
    .getCountries()
    .then((data) => {
      console.log('Countries ===>  ' + JSON.stringify(data));
      dispatch({ type: MAGENTO_GET_COUNTRIES, payload: data });
    })
    .catch((error) => {
      logError(error);
    });
};

export const postOrderToNetsuit = (orderId) => async (dispatch) => {
  const postToNetsuit = () =>
    fetch(
      `https://${magento.base_url}/netsuitemagentoconnect/ordersync?id=${orderId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        return json.orderId;
      })
      .catch((error) => {
        console.error(error);
      });
  await postToNetsuit();
};

export const placeOrder = (cartId, payment, customer) => async (dispatch) => {
  console.log('"Cartttid', cartId);
  console.log(
    '"comment',
    payment.paymentMethod.extension_attributes.rokanthemes_opc.order_comment
  );
  console.log('testssssssssssss', JSON.stringify(payment));
  try {
    let orderId;
    if (magento.isCustomerLogin()) {
      const comment = await axios.post(
        BASE_URL + '/rest/V1/ordercomment/addordercomment',
        {
          quoteid: cartId,
          comment:
            payment.paymentMethod.extension_attributes.rokanthemes_opc
              .order_comment,
        },
        {
          headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
        }
      );
      orderId = await magento.customer.placeCartOrder(payment);
    } else {
      orderId = await magento.guest.placeGuestCartOrder(cartId, payment);
      // await magento.guest.createCustomer(customer);
    }
    console.log('Order iddd', orderId);
    // await magento.customUrl(
    //   `netsuitemagentoconnect/ordersync?id=${orderId}`,
    //   'POST',
    // );
    dispatch({ type: MAGENTO_PLACE_GUEST_CART_ORDER, payload: orderId });
    dispatch({ type: UI_CHECKOUT_CUSTOMER_NEXT_LOADING, payload: false });
    return orderId;
  } catch (error) {
    console.error('Error in checkiyt', error);
    const message = error?.message ? error?.message : 'Place order error';
    dispatch({ type: MAGENTO_ERROR_MESSAGE_CART_ORDER, payload: message });
  }
};

export const createCustomer = (customer) => (dispatch) => {
  magento.guest
    .createCustomer(customer)
    .then((data) => {
      dispatch({ type: MAGENTO_CREATE_CUSTOMER, payload: data });
    })
    .catch((error) => {
      logError(error);
    });
};

export const removeFromCartLoading = (isLoading) => async (dispatch) =>
  dispatch({
    type: MAGENTO_REMOVE_FROM_CART_LOADING,
    payload: isLoading,
  });

export const setUserEmirates = (emirates) => async (dispatch) =>
  dispatch({
    type: MAGENTO_ACCOUNT_SET_USER_EMIRATES,
    payload: emirates,
  });

export const getFilteredProducts =
  (category_id, minPrice, maxPrice, brand_id, availableInStock) =>
  async (dispatch) => {
    let store = await AsyncStorage.getItem('store');
    if (store === 's44') {
      store = 'is_in_stock_s44';
    } else if (store === 's45') {
      store = 'is_in_stock_s45';
    }

    minPrice = minPrice ? minPrice : '0';
    maxPrice = maxPrice ? maxPrice : '10000';

    let path = `${BASE_URL}/s44/rest/V1/products/?searchCriteria[filter_groups][0][filters][0][field]=category_id&searchCriteria[filter_groups][0][filters][0][value]=${category_id}&searchCriteria[filter_groups][0][filters][0][condition_type]=eq`;
    if (minPrice && maxPrice) {
      path += `&searchCriteria[filter_groups][1][filters][0][field]=special_price&searchCriteria[filter_groups][1][filters][0][value]=${minPrice}&searchCriteria[filter_groups][1][filters][0][condition_type]=gteq&searchCriteria[filter_groups][1][filters][1][field]=price&searchCriteria[filter_groups][1][filters][1][value]=${minPrice}&searchCriteria[filter_groups][1][filters][1][condition_type]=gteq`;
      path += `&searchCriteria[filter_groups][2][filters][0][field]=special_price&searchCriteria[filter_groups][2][filters][0][value]=${maxPrice}&searchCriteria[filter_groups][2][filters][0][condition_type]=lteq&searchCriteria[filter_groups][2][filters][1][field]=price&searchCriteria[filter_groups][2][filters][1][value]=${maxPrice}&searchCriteria[filter_groups][2][filters][1][condition_type]=lteq`;
    }
    if (brand_id) {
      path += `&searchCriteria[filter_groups][3][filters][0][field]=product_brand&searchCriteria[filter_groups][3][filters][0][value]=${brand_id}&searchCriteria[filter_groups][3][filters][0][condition_type]=eq`;
    }
    let status =
      '&searchCriteria[filter_groups][4][filters][0][field]=status&searchCriteria[filter_groups][4][filters][0][condition_type]=eq&searchCriteria[filter_groups][4][filters][0][value]=1';
    path += status;
    axios
      .get(path, {
        headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
      })
      .then((response) => {
        console.log(JSON.stringify(response.data));
        if (availableInStock) {
          // alert(response.data.items[0].extension_attributes[store]);
          let avaiableItems = response.data.items.filter(
            (item) => item.extension_attributes[store] == true
          );
          console.log(JSON.stringify(avaiableItems));
          // alert(avaiableItems.length);
          let temp = {
            ...response.data,
            items: avaiableItems,
            total_count: avaiableItems.length,
          };

          dispatch({ type: MAGENTO_GET_FILTERED_PRODUCTS, payload: temp });
        } else {
          dispatch({
            type: MAGENTO_GET_FILTERED_PRODUCTS,
            payload: response.data,
          });
        }
      })
      .catch((e) => {
        alert(e);
      });
    // try {
    //    const data = await magento.admin.getFeaturedChildren({
    //      page,
    //      pageSize,
    //      filter,
    //    });
    //    dispatch({ type: MAGENTO_GET_FILTERED_PRODUCTS, payload: data });
    // } catch (error) {
    //   logError(error);
    // }
  };

export const removeFromCart =
  ({ cart, item, type, quantity, cartId }) =>
  async (dispatch) => {
    try {
      if (cart.quote) {
        dispatchRemoveFromCart(dispatch, cart, item, type, quantity, cartId);
        dispatch(checkoutSetActiveSection(1));
      }
    } catch (error) {
      logError(error);
      dispatch({ type: MAGENTO_REMOVE_FROM_CART, payload: error?.message });
    }
  };

const dispatchRemoveFromCart = async (
  dispatch,
  cart,
  item,
  type,
  quantity,
  cartId
) => {
  const isLoggedIn = magento.isCustomerLogin();
  try {
    const result = await magento.admin.removeItemFromCart(
      cart,
      item,
      type,
      quantity,
      isLoggedIn,
      cartId
    );
    dispatch({ type: MAGENTO_REMOVE_FROM_CART, payload: result });
    dispatchGetCart(dispatch, cart.cartId);
    dispatch({ type: MAGENTO_REMOVE_FROM_CART_LOADING, payload: false });
  } catch (e) {
    // TODO: handle error
    dispatch({ type: MAGENTO_REMOVE_FROM_CART, payload: e?.message });
    dispatch({ type: MAGENTO_REMOVE_FROM_CART_LOADING, payload: false });
    logError(e);
  }
};

const dispatchGetCart = async (dispatch, cartId) => {
  try {
    let data;
    if (magento.isCustomerLogin()) {
      data = await magento.customer.getCustomerCart();
    } else {
      if (cartId) {
        data = await magento.guest.getGuestCart(cartId);
      }
    }
    dispatch({ type: MAGENTO_GET_CART, payload: data });
  } catch (e) {
    logError(e);
  }
};
