import AsyncStorage from '@react-native-community/async-storage';
import { magento } from '../magento';
import { getCart } from './RestActions';
import {
  MAGENTO_PASSWORD_RESET_LOADING,
  MAGENTO_PASSWORD_RESET_SUCCESS,
  MAGENTO_PASSWORD_RESET_ERROR,
  MAGENTO_CURRENT_CUSTOMER,
  MAGENTO_CREATE_CUSTOMER_LOADING,
  MAGENTO_CREATE_CUSTOMER_SUCCESS,
  MAGENTO_CREATE_CUSTOMER_ERROR,
  MAGENTO_AUTH_LOADING,
  MAGENTO_AUTH,
  MAGENTO_LOGOUT,
  MAGENTO_AUTH_ERROR,
  MAGENTO_LOGIN_SUCCESS,
  RESET_WISHLIST,
} from './types';
import NavigationService from '../navigation/NavigationService';
import {
  NAVIGATION_ACCOUNT_STACK_PATH,
  NAVIGATION_LOGIN_STACK_PATH,
} from '../navigation/routes';
import { logError } from '../helper/logger';
import { getWishlistData } from './WishlistAction';

export const signIn = (customer) => async (dispatch) => {
  try {
    dispatch({ type: MAGENTO_CREATE_CUSTOMER_LOADING, payload: true });
    const response = await magento.guest.createCustomer(customer);
    //console.log('Register output: ', JSON.stringify(response));

    dispatch({ type: MAGENTO_CREATE_CUSTOMER_SUCCESS, payload: response });
    if (response.id && response.group_id) {
      const token = await magento.guest.auth(
        customer.customer.email,
        customer.password
      );
      //console.log('token values==>', token);
      if (token.message) {
        authFail(dispatch, token?.message);
      } else {
        magento.setCustomerToken(token);
        authSuccess(dispatch, token);
      }
    } else if (response?.message) {
      authFail(dispatch, response?.message);
    } else {
      authFail(dispatch, 'Something went wrong. Pleas try again later.');
    }
  } catch (e) {
    console.log('catch error==>', JSON.stringify(e));
    if (
      e?.message &&
      e?.message.startsWith('A customer with the same email address')
    ) {
      const token = await magento.guest.auth(
        customer.customer.email,
        customer.password
      );
      // console.log('token values==>', token);
      if (token?.message) {
        authFail(dispatch, token?.message);
      } else {
        magento.setCustomerToken(token);
        authSuccess(dispatch, token);
      }
    } else {
      logError(e);
      authFail(dispatch, e?.message);
    }
  }
};

export const auth = (username, password) => async (dispatch, getState) => {
  try {
    dispatch({ type: MAGENTO_AUTH_LOADING, payload: true });
    const response = await magento.guest.auth(username, password);
    // console.log('Tibu ===> ' + JSON.stringify(response));
    magento.setCustomerToken(response);
    if (response?.message) {
      authFail(dispatch, response?.message);
    } else {
      authSuccess(dispatch, response);
      dispatch({ type: MAGENTO_LOGIN_SUCCESS });
    }
  } catch (e) {
    logError(e);
    authFail(dispatch, e?.message);
  }
};

const authSuccess = async (dispatch, token) => {
  dispatch({ type: MAGENTO_AUTH, payload: token });

  try {
    await AsyncStorage.setItem('customerToken', token);
    console.log('authTOkem', token);
    dispatch({ type: MAGENTO_AUTH_LOADING, payload: false });
    dispatch(getCart());
    setTimeout(() => {
      dispatch(getWishlistData());
    }, 2000);
    NavigationService.navigate(NAVIGATION_ACCOUNT_STACK_PATH);
  } catch (e) {
    logError(e);
    authFail(dispatch, 'Something went wrong. Pleas try again later.');
  }
};

const authFail = (dispatch, message) => {
  dispatch(errorMessage(message));
  dispatch({ type: MAGENTO_AUTH_LOADING, payload: false });
};

export const errorMessage = (error) => ({
  type: MAGENTO_AUTH_ERROR,
  payload: error,
});

export const logout = () => (dispatch) => {
  dispatch({ type: MAGENTO_AUTH, payload: '' });
  dispatch({ type: MAGENTO_LOGOUT });
  dispatch({ type: RESET_WISHLIST });
  dispatch(getCart());
  NavigationService.navigate(NAVIGATION_LOGIN_STACK_PATH);
  AsyncStorage.setItem('customerToken', '');
  magento.setCustomerToken(false);
};

export const initiatePasswordReset = (email) => async (dispatch) => {
  try {
    dispatch({ type: MAGENTO_PASSWORD_RESET_LOADING, payload: true });
    await magento.guest.initiatePasswordReset(email);
    const message = `If there is an account associated with ${email} you will
        receive an email with a link to reset your password.`;
    dispatch({ type: MAGENTO_PASSWORD_RESET_SUCCESS, payload: message });
  } catch (e) {
    logError(e);
    dispatch({
      type: MAGENTO_PASSWORD_RESET_ERROR,
      payload: { errorMessage: e?.message },
    });
  }
};

/**
 * This action will reset all the state varaibales related to
 * password_reset in the CustomerAuthReducer.
 */
export const updatePasswordResetUI = () => async (dispatch) => {
  dispatch({ type: MAGENTO_PASSWORD_RESET_LOADING, payload: false });
};

export const currentCustomer = () => async (dispatch) => {
  try {
    const customer = await magento.customer.getCurrentCustomer();
    dispatch({
      type: MAGENTO_CURRENT_CUSTOMER,
      payload: customer,
    });
  } catch (error) {
    logError(error);
  }
};

export const setCurrentCustomer = (customer) => ({
  type: MAGENTO_CURRENT_CUSTOMER,
  payload: customer,
});
