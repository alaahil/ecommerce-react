import AsyncStorage from '@react-native-community/async-storage';
import { magento } from '../magento';
import { initMagento, getCart, setCurrentCustomer } from '../actions';
import { logError } from './logger';
import {getWishlistData} from "../actions/WishlistAction";

export const onAppStart = async store => {
  store.dispatch(initMagento());

  const customerToken = await AsyncStorage.getItem('customerToken');
  console.log("customerToken", customerToken)
  const storeToUse = await AsyncStorage.getItem('store');
  magento.setCustomerToken(customerToken);
  storeToUse ? magento.setStore(storeToUse) : magento.setStore('s44');

  if (customerToken) {
    try {
      const customer = await magento.customer.getCurrentCustomer();
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(getWishlistData());
    } catch (error) {
      console.log('onAppStart -> unable to retrieve current customer', error);
      logError(error);
    }
  }
  store.dispatch(getCart());
};
