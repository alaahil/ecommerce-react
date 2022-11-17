/**
 * Magento Settings for the app,
 *
 * url                     : Base url of the magento website
 * home_cms_block_id       : Block id which contain json data,
 *                           which will be shown in Home screen
 * access_token            : Token to access magento API, without it
 *                           app won't work
 */
import { BASE_URL } from '../constant/constant';

export const magentoOptions = {
  url: BASE_URL + '/s44/', // make sure you have trail slash in the end
  home_cms_block_id: '44',
  store: 's44', // store code // Stores > All Stores > Store View > Code
  authentication: {
    integration: {
      access_token: 'wb2s1euayoz8sszqdktjxxxd8ud7jwp1',
    },
  },
  reviewEnabled: false,
};
/**
 * Magento 2 REST API doesn't return currency symbol,
 * so manually specify all currency symbol(that your store support)
 * along side their currency code.
 */
export const currencySymbols = Object.freeze({
  USD: '$',
  EUR: '€',
  AUD: 'A$',
  GBP: '£',
  CAD: 'CA$',
  CNY: 'CN¥',
  JPY: '¥',
  SEK: 'SEK',
  CHF: 'CHF',
  INR: '₹',
  KWD: 'د.ك',
  RON: 'RON',
});
