import { REHYDRATE } from 'redux-persist/es/constants';
import {
  MAGENTO_INIT,
  MAGENTO_INIT_ERROR,
  UI_CHANGE_CURRENCY,
  MAGENTO_STORE_CONFIG,
  MAGENTO_GET_CURRENCY,
  MAGENTO_GET_COUNTRIES,
  MAGENTO_GET_HOME_PAGE_TEXT,
  MAGENTO_GET_HOME_PAGE_BANNERS,
  MAGENTO_GET_HOME_CATEGORIES,
  MAGENTO_GET_BRANDS,
} from '../actions/types';
import { magento } from '../magento';

const INITIAL_STATE = {
  magento: null,
  storeConfig: null,
  countries: null,
  brandObj: {},
  currency: {
    default_display_currency_code: '',
    default_display_currency_symbol: '',
    /**
     * Below three keys will be used in the APP
     */
    displayCurrencyCode: '',
    displayCurrencySymbol: '',
    displayCurrencyExchangeRate: 1,
  },
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case REHYDRATE: {
      if (
        action.payload &&
        action.payload.magento &&
        action.payload.magento.storeConfig
      ) {
        magento.setStoreConfig(action.payload.magento.storeConfig);
      }
      return state;
    }
    case MAGENTO_STORE_CONFIG: {
      return { ...state, errorMessage: null, storeConfig: action.payload };
    }
    case MAGENTO_GET_CURRENCY: {
      const {
        currencyData,
        displayCurrency: { code, symbol, rate },
      } = action.payload;
      return {
        ...state,
        errorMessage: null,
        currency: {
          ...state.currency,
          ...currencyData,
          displayCurrencyCode: code,
          displayCurrencySymbol: symbol,
          displayCurrencyExchangeRate: rate,
        },
      };
    }
    case MAGENTO_GET_HOME_PAGE_TEXT: {
      return {
        ...state,
        errorMessage: null,
        homePageText: action.payload.homePageText,
      };
    }
    case MAGENTO_GET_HOME_PAGE_BANNERS: {
      return {
        ...state,
        errorMessage: null,
        homePageBanners: action.payload.homePageBanners,
      };
    }
    case MAGENTO_GET_BRANDS: {
      return {
        ...state,
        errorMessage: null,
        brands: action.payload.brands,
        brandObj: action.payload.brandObj,
      };
    }
    case MAGENTO_GET_HOME_CATEGORIES: {
      return {
        ...state,
        errorMessage: null,
        homeCategories: action.payload.homeCategories,
      };
    }
    case UI_CHANGE_CURRENCY:
      return {
        ...state,
        currency: {
          ...state.currency,
          displayCurrencyCode: action.payload.currencyCode,
          displayCurrencySymbol: action.payload.currencySymbol,
          displayCurrencyExchangeRate: action.payload.currencyRate,
        },
      };
    case MAGENTO_GET_COUNTRIES: {
      return { ...state, countries: action.payload };
    }
    case MAGENTO_INIT:
      return { ...state, magento: action.payload };
    case MAGENTO_INIT_ERROR:
      return { ...state, errorMessage: action.payload.errorMessage };
    default:
      return state;
  }
};
