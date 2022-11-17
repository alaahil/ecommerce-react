import { currencySymbols } from '../config/magento';

export function finalPrice(price) {
  const numberPrice = parseFloat(price);
  if (isNaN(numberPrice)) {
    return 0;
  }
  return parseFloat((numberPrice * 1.05).toFixed(2));
}

export const priceSignByCode = (code) => {
  const sign = currencySymbols[code];
  if (sign) {
    return sign;
  }
  // If no currency symbol specified for currency code, return currency code
  return code;
};

export const currencyExchangeRateByCode = (code, exchangeRates) => {
  const result = exchangeRates.find(
    (exchangeRate) => exchangeRate.currency_to === code
  );
  if (result) {
    return result.rate;
  }
  return 1;
};
