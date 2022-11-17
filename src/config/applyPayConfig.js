import { PaymentRequest } from 'react-native-payments';
import { MERCHANT_ID } from '../constant/constant';

const METHOD_DATA = [
  {
    supportedMethods: ['apple-pay'],
    data: {
      merchantIdentifier: MERCHANT_ID,
      supportedNetworks: ['visa', 'mastercard', 'amex'],
      countryCode: 'AE',
      currencyCode: 'AED',
    },
  },
];
const DETAILS = {
  id: 'basic-example',
  displayItems: [
    {
      label: 'Movie Ticket',
      amount: { currency: 'AED', value: '15.00' },
    },
  ],
  total: {
    label: 'Merchant Name',
    amount: { currency: 'AED', value: '15.00' },
  },
};
const OPTIONS = {
  requestPayerName: true,
};
export function getPaymentRequest(paymentDetails) {
  return new PaymentRequest(METHOD_DATA, paymentDetails || DETAILS);
}
