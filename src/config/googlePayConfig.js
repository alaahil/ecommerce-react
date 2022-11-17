// import { GooglePay } from 'react-native-google-pay';
// import { CHECKOUT_PK } from '../constant/constant';
// import { Platform } from 'react-native';
//
// const allowedCardNetworks = [
//   'AMEX',
//   'DISCOVER',
//   'INTERAC',
//   'JCB',
//   'MASTERCARD',
//   'MIR',
//   'VISA',
// ];
// const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
//
// export const googlePayRequestData = {
//   cardPaymentMethod: {
//     tokenizationSpecification: {
//       type: 'PAYMENT_GATEWAY',
//       // stripe (see Example):
//       gateway: 'checkoutltd',
//       gatewayMerchantId: CHECKOUT_PK,
//     },
//     allowedCardNetworks,
//     allowedCardAuthMethods,
//   },
//   transaction: {
//     totalPrice: '500',
//     totalPriceStatus: 'FINAL',
//     currencyCode: 'AED',
//   },
//   merchantName: 'BidfoodHome',
// };
//
// // Set the environment before the payment request
// if (Platform.OS === 'android') {
//   GooglePay.setEnvironment(GooglePay.ENVIRONMENT_PRODUCTION);
// }
//
// // Check if Google Pay is available
// export const isGooglePayAvailable = async () => {
//   return await GooglePay.isReadyToPay(
//     allowedCardNetworks,
//     allowedCardAuthMethods
//   );
// };
