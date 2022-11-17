import React, { Component } from 'react';
import {
  Frames,
  CardNumber,
  ExpiryDate,
  Cvv,
  SubmitButton,
} from 'frames-react-native';
import {
  Alert,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import { connect } from 'react-redux';
import NavigationService from '../../navigation/NavigationService';
import {
  checkoutSelectedPaymentChanged,
  checkoutCustomerNextLoading,
  checkoutOrderPopupShown,
  placeOrder,
  getCart,
  resetCart,
  checkoutSetActiveSection,
  removeCouponFromCart,
  addCouponToCart,
  addToCart,
} from '../../actions';
import {
  NAVIGATION_HOME_STACK_PATH,
  NAVIGATION_ORDER_PATH,
  NAVIGATION_ORDERS_PATH,
  NAVIGATION_LOGIN_PATH,
} from '../../navigation/routes';
import OrderScreen from '../account/OrderScreen';
import { Spinner, Text, Price } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { priceSignByCode } from '../../helper/price';
import { Pressable } from 'react-native';
import TimeToogle from './TimeToogle';
import OrderLocation from './OrderLocation';
import { magento } from '../../magento';
import moment from 'moment';
import axios from 'axios';
import { getPaymentRequest } from '../../config/applyPayConfig';
// import { GooglePay } from 'react-native-google-pay';
// import { googlePayRequestData } from '../../config/googlePayConfig';
import {
  CHECKOUT_BASE_URL,
  CHECKOUT_PK,
  CHECKOUT_SK,
} from '../../constant/constant';
import { bugfenderError, bugfenderLog } from '../../helper/bugfender.log';

class CheckoutTotals extends Component {
  static contextType = ThemeContext;

  paymentToken = '';
  appleToken = '';
  completedOrderId = '';
  transactionId = '';
  state = {
    couponCodeInput: '',
    isProcessingOrder: false,
    orderCommentInput: '',
    error: '',
    selectedDate: false,
    number: '',
    cardDate: '',
    cvv: '',
    cardLoading: true,
  };

  verifyGooglePayment = async (paymentDetails) => {
    try {
      const jsonPaymentDetails = JSON.parse(paymentDetails);
      const payload = {
        type: 'googlepay',
        token_data: {
          protocolVersion: jsonPaymentDetails?.protocolVersion,
          signature: jsonPaymentDetails?.signature,
          signedMessage: jsonPaymentDetails?.signedMessage,
        },
      };
      console.log('google pay Payload', JSON.stringify(payload));
      const resp = await axios.post(CHECKOUT_BASE_URL + '/tokens', payload, {
        headers: {
          Authorization: CHECKOUT_PK,
        },
      });
      console.log('google pay verify responsee', resp);
      return { status: resp.status, data: resp.data };
    } catch (e) {
      console.error('Error in verify apple pay', JSON.stringify(e));
      console.error('Error message', e.message);
      return Promise.reject(e);
    }
  };

  verifyApplePayment = async (paymentDetails) => {
    try {
      const payload = {
        type: 'applepay',
        token_data: {
          version: paymentDetails?.version,
          data: paymentDetails?.data,
          signature: paymentDetails?.signature,
          header: paymentDetails.header,
        },
      };
      console.log('apple pay Payload', JSON.stringify(payload));
      const resp = await axios.post(CHECKOUT_BASE_URL + '/tokens', payload, {
        headers: {
          Authorization: CHECKOUT_PK,
        },
      });
      console.log('apple verify responsee', resp);
      return { status: resp.status, data: resp.data };
    } catch (e) {
      console.error('Error in verify apple pay', JSON.stringify(e));
      console.error('Error message', e.message);
      return Promise.reject(e);
    }
  };

  onPlacePressed = async () => {
    try {
      if (this.state.selectedDate == false) {
        this.props.checkoutCustomerNextLoading(false);
        this.setState({ isProcessingOrder: false });
        this.setState({ error: 'Please Select Date' });
      } else {
        this.props.checkoutCustomerNextLoading(true);
        this.setState({ isProcessingOrder: true });
        const { cartId, selectedPayment, cartItems, totals } = this.props;
        console.log('Selected paymnent', selectedPayment?.code);
        // if (selectedPayment?.code === 'checkoutcom_google_pay') {
        //   const googleRequestPayload = {
        //     ...googlePayRequestData,
        //     transaction: {
        //       ...googlePayRequestData.transaction,
        //       amount: totals?.base_grand_total?.toString() || '',
        //     },
        //   };
        //
        //   const response = await GooglePay.requestPayment(googleRequestPayload);
        //   console.log('requwsrt Response ', response);
        //   const googlePayResponse = await this.verifyGooglePayment(response);
        //   if (googlePayResponse.status === 201) {
        //     const data = googlePayResponse.data;
        //     this.appleToken = data.token;
        //   } else {
        //     return;
        //   }
        // }
        if (selectedPayment?.code === 'checkoutcom_apple_pay') {
          console.log('Apple pay', cartItems);
          const displayItems = cartItems?.map((item) => ({
            label: item.name,
            amount: {
              currency: 'AED',
              value:
                item?.extension_attributes.price_with_vat?.toString() || '0',
            },
          }));
          displayItems.push({
            label: 'Delivery',
            amount: {
              currency: 'AED',
              value: totals.base_shipping_incl_tax || '0',
            },
          });
          displayItems.push({
            label: 'VAT',
            amount: {
              currency: 'AED',
              value: totals.tax_amount || '0',
            },
          });
          const finalObject = {
            id: cartId?.toString(),
            displayItems,
            total: {
              label: 'BidFood Home',
              amount: {
                currency: 'AED',
                value: totals?.base_grand_total?.toString(),
              },
            },
          };
          const paymentRequest = getPaymentRequest(finalObject);
          bugfenderLog('Apple Pay paymentRequest => ', paymentRequest);
          const paymentResponse = await paymentRequest.show();
          bugfenderLog('Apple Pay paymentResponse => ', paymentResponse);
          const resp = await this.verifyApplePayment(
            paymentResponse.details?.paymentData
          );
          bugfenderLog('Apple Pay verifyApplePaymentResponse => ', resp);
          if (resp.status === 201) {
            const data = resp.data;
            paymentResponse.complete('success').then();
            this.appleToken = data.token;
          } else {
            paymentResponse.complete('fail').then();
            return;
          }
        }
        this.state.error = '';
        const { rawDate } = this.props.deliveryDate;
        const { time } = this.props.deliveryTime;
        console.log('time', rawDate);

        const {
          email,
          countryId,
          region,
          street,
          telephone,
          postcode,
          city,
          firstname,
          lastname,
          saveInAddressBook,
          password,
          phoneNumber,
        } = this.props.customerBillingData;

        const customer = {
          customer: {
            email,
            firstname,
            lastname,
            addresses: [{ telephone: phoneNumber }],
          },
          password,
        };
        const address = {
          countryId,
          region: magento.isCustomerLogin() ? region.region : region,
          street: [
            `${this.props.customerBillingData?.address_type},${street},${this.props.customerBillingData?.building_name},${this.props.customerBillingData?.apartment_no},${this.props.customerBillingData?.landmark}`,
          ],
          telephone,
          postcode,
          city,
          firstname,
          lastname,
          saveInAddressBook: null,
        };
        const payment = {
          billingAddress: address,
          shippingAddress: address,
          paymentMethod: {
            method: selectedPayment.code,
            po_number: null,
            additional_data: null,
            extension_attributes: {
              rokanthemes_opc: {
                customer_shipping_date:
                  moment(rawDate).format('MM/DD/YYYY HH:mm'),
                customer_shipping_comments: time,
                order_comment: this.state.orderCommentInput
                  ? this.state.orderCommentInput
                  : '',
              },
            },
          },
          email,
        };
        console.log('order', JSON.stringify(payment));
        bugfenderLog('Customer =>', customer);
        bugfenderLog(
          'placeOrder API paylaod =>',
          cartId,
          'payment => ',
          payment
        );
        const order = await this.props.placeOrder(cartId, payment, customer);
        bugfenderLog('Place order response =>', order);
        this.completedOrderId = order;
        console.log('onPlacePressed ==> ', JSON.stringify(order));
        return order;
      }
    } catch (e) {
      bugfenderError('error in order place =>', e);
      Alert.alert(
        'Somethings Went wrong',
        e?.message || 'Please try again later',
        [
          {
            text: translate('common.ok'),
            onPress: () => {},
          },
        ],
        { cancelable: false }
      );
      this.setState({ isProcessingOrder: false });
      this.props.checkoutCustomerNextLoading(false);
      console.error('error in order pressed', e);
    }
  };

  renderTotals() {
    const {
      totals: {
        base_currency_code: baseCurrencyCode,
        base_subtotal: baseSubTotal,
        base_grand_total: grandTotal,
        base_shipping_incl_tax: shippingTotal,
        tax_amount: vatAmount,
      },
      baseCurrencySymbol,
      currencyCode,
      currencySymbol,
      currencyRate,
    } = this.props;

    return (
      <>
        <View style={[styles.totalContainer, { marginTop: 18 }]}>
          <Text
            style={{
              fontSize: 18,
            }}
          >{`${translate('common.subTotal')} `}</Text>
          <Text style={{ fontSize: baseSubTotal > 7 ? 15 : 17 }}>
            AED {baseSubTotal}
          </Text>
        </View>
        {!!this.props?.totals?.coupon_code && (
          <View style={styles.totalContainer}>
            <Text
              style={{
                fontSize: 18,
              }}
            >{`${translate('common.discount')} `}</Text>
            <Price
              basePrice={this.props?.totals?.discount_amount}
              currencySymbol={currencySymbol}
              currencyRate={currencyRate}
            />
          </View>
        )}
        <View style={styles.totalContainer}>
          <Text
            style={{
              fontSize: 18,
            }}
          >
            Delivery Fee
          </Text>
          <Text style={{ fontSize: baseSubTotal > 7 ? 15 : 17 }}>
            AED {shippingTotal}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text
            style={{
              fontSize: 18,
            }}
          >
            VAT
          </Text>
          <Text style={{ fontSize: baseSubTotal > 7 ? 15 : 17 }}>
            AED {vatAmount}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={{ fontSize: 18, color: '#8BC63E' }}>{`${translate(
            'common.total'
          )} `}</Text>
          <Text style={{ color: '#8BC63E' }}> AED {grandTotal}</Text>
        </View>
        {baseCurrencyCode !== currencyCode && (
          <View>
            <Text>{`${translate('checkout.youWillBeCharged')}: `}</Text>
            <Price
              basePrice={grandTotal}
              currencySymbol={
                baseCurrencySymbol || priceSignByCode(baseCurrencyCode)
              }
              currencyRate={1}
            />
          </View>
        )}
      </>
    );
  }

  componentDidMount() {
    console.log('last ======', JSON.stringify(this.props));
    this.saveCard();
    if (this.props?.totals?.coupon_code) {
      this.setState({
        couponCodeInput: this.props?.totals?.coupon_code,
      });
    }
  }
  async saveCard() {
    const numbers = await AsyncStorage.getItem('cardNumber');
    const date = await AsyncStorage.getItem('cardDate');
    const cvvNumber = await AsyncStorage.getItem('cvv');
    this.setState({ number: numbers, cardLoading: false });
  }

  componentDidUpdate(prevProps) {
    // console.log("this.props.", JSON.stringify(this.props));
    // console.log("prevProps", JSON.stringify(prevProps))
    if (this.props.orderId && this.props.orderId !== prevProps.orderId) {
      this.showPopup();
    }
    if (
      this.props.errorMessage &&
      this.props.errorMessage !== prevProps.errorMessage
    ) {
      this.showPopu(translate('errors.error'), this.props.errorMessage);
    }
    if (this.props?.totals?.coupon_code !== prevProps?.totals?.coupon_code) {
      this.setState({
        couponCodeInput: this.props?.totals?.coupon_code,
      });
    }
  }
  // currencySymbol = priceSignByCode(item.order_currency_code);
  async postOnCheckout(orderId) {
    try {
      const { email, firstname, lastname } = this.props.customerBillingData;
      const { base_grand_total: grandTotal } = this.props.totals;
      let finalOrderId = orderId;
      while (finalOrderId.length < 9) {
        finalOrderId = '0' + finalOrderId;
      }
      console.log('Final order id', finalOrderId);
      console.log('Apple token', this.appleToken);
      const response = await fetch(CHECKOUT_BASE_URL + '/payments', {
        method: 'POST',
        headers: {
          Authorization: CHECKOUT_SK,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            type: 'token',
            token:
              this.props.selectedPayment.code === 'checkoutcom_apple_pay' ||
              this.props.selectedPayment.code === 'checkoutcom_google_pay'
                ? this.appleToken
                : this.paymentToken,
          },
          capture: false,
          amount: grandTotal * 100,
          currency: 'AED',
          reference: finalOrderId,
          customer: {
            email,
            name: `${firstname} ${lastname}`,
          },
        }),
      });
      const respJson = await response.json();
      console.log('Response json', respJson);
      if (!respJson?.approved) {
        Alert.alert(
          respJson?.response_summary || '',
          'Please check your card details properly',
          [
            {
              text: translate('common.ok'),
              onPress: () => {},
            },
          ],
          { cancelable: false }
        );
      }
      this.transactionId = respJson?.id || '';
      return respJson?.approved || false;
    } catch (e) {
      console.error('Error in checkout', e);
    }
  }

  navigateToOrderPage(incrementId) {
    bugfenderLog('order complete =>', incrementId);
    let item = {
      ...this.props.totals,
      billing_address: this.props.customerBillingData,
      increment_id: incrementId,
      payment: {
        method: this.props.selectedPayment.code,
      },
    };

    NavigationService.navigate(NAVIGATION_ORDER_PATH, { item: item,checkout:true });
  }

  async cancelOrder() {
    try {
      const resp = await magento.admin.cancelOrder(this.completedOrderId);
      console.log('Cancel order response', resp);
    } catch (e) {
      console.error('Cancel order failed', e);
    }
  }

  async updateLastOrder(orderId, transactionId) {
    try {
      bugfenderLog('Update last order =>', orderId, transactionId);
      console.log('Order id', orderId);
      console.log('transaction id', transactionId);
      if (!orderId || !transactionId) {
        return;
      }
      const resp = await magento.admin.updateOrder(orderId, transactionId);
      console.log('Update order response', resp);
    } catch (e) {
      console.error('Update order failed', e);
    }
  }

  async showPopup() {
    this.props.navigation.state.params?.cart?.items?.map((val) => {
      this.props?.totals?.items?.map((val2, index) => {
        if (val.item_id == val2.item_id) {
          let obj = {
            ...val2,
            sku: val.sku,
          };
          this.props.totals.items[index] = obj;
        }
      });
    });

    let params = {
      username: 'dev',
      password: 'admin@4321',
    };

    let responseToken = await magento.guest.placeOrdersToken(params);
    bugfenderLog('GUEST placeOrdersToken => ', responseToken);
    console.log('Response ssssss', responseToken);

    let responseVal = await magento.guestOrderRecord(
      responseToken,
      this.props.orderId
    );
    bugfenderLog('GUEST guestOrderRecord => ', responseVal);
    bugfenderLog('Payment code =>', this.props.selectedPayment.code);
    console.log('responseVal', responseVal);
    let checkoutResponse = false;
    console.log('responseVal body', responseVal.increment_id);
    if (
      this.props.selectedPayment.code === 'checkoutcom_card_payment' ||
      this.props.selectedPayment.code === 'checkoutcom_apple_pay' ||
      this.props.selectedPayment.code === 'checkoutcom_google_pay'
    ) {
      checkoutResponse = await this.postOnCheckout(responseVal.increment_id);
      bugfenderLog('Checkout payment response =>', checkoutResponse);
      if (!checkoutResponse) {
        this.cancelOrder();
        bugfenderLog('Cancel order call');
        const { cartItems } = this.props;
        const previousData = cartItems.map((cartItem) => ({
          cartItem: {
            sku: cartItem.sku,
            qty: cartItem.qty,
            productOption: { extensionAttributes: { customOptions: [] } },
          },
        }));
        await this.props.resetCart();
        for (let i = 0; i < previousData?.length; i++) {
          const newCartId = await AsyncStorage.getItem('cartId');
          await this.props.addToCart({
            cartId: newCartId,
            item: previousData[i],
            customer: this.props.customer,
            region: '',
            isNotUpdateCheckoutSession: true,
          });
        }
        this.props.checkoutCustomerNextLoading(false);
      } else {
        await this.updateLastOrder(this.completedOrderId, this.transactionId);
        this.navigateToOrderPage(responseVal.increment_id);
      }
    } else {
      this.navigateToOrderPage(responseVal.increment_id);
    }
    if (
      (this.props.selectedPayment.code !== 'checkoutcom_card_payment' &&
        this.props.selectedPayment.code !== 'checkoutcom_apple_pay' &&
        this.props.selectedPayment.code !== 'checkoutcom_google_pay') ||
      checkoutResponse
    ) {
      setTimeout(async () => {
        bugfenderLog('Reset cart');
        this.props.checkoutSetActiveSection(1);
        await this.props.resetCart();
      }, 3000);
    }
    setTimeout(() => {
      bugfenderLog('turn off loading');
      this.props.checkoutCustomerNextLoading(false);
      this.setState({ isProcessingOrder: false });
    }, 3000);

    // console.log('order id ',this.props.orderId)

    // let responseOrders = await magento.guest.placeOrders(this.props.orderId);

    // console.log('responseOrders',responseOrders)

    // this.props.checkoutOrderPopupShown();
    // Alert.alert(
    //   title,
    //   message,
    //   [{ text: translate('common.ok'), onPress: () => this.goHome() }],
    //   { cancelable: false },
    // );
  }

  showPopu(title, message) {
    this.setState({ isProcessingOrder: false });
    this.props.checkoutCustomerNextLoading(false);

    Alert.alert(
      (title = title || 'Bidfoodhome'),
      (message = message),
      [
        {
          text: translate('common.ok'),
          onPress: () => NavigationService.navigate(NAVIGATION_HOME_STACK_PATH),
        },
      ],
      { cancelable: false }
    );
  }

  onPressSignin = () => {
    NavigationService.navigate(NAVIGATION_LOGIN_PATH),
      {
        title: translate('Login'),
      };
  };

  couponAction = () => {
    if (this.props?.totals?.coupon_code) {
      this.props.removeCouponFromCart();
    } else {
      this.props.addCouponToCart(this.state.couponCodeInput);
    }
  };

  renderDateAndTime = () => (
    <View style={styles.spacingBetweenUI}>
      <TimeToogle
        error={this.state.error}
        onPress={() => {
          this.setState({ selectedDate: true, error: '' });
        }}
        customerBillingData={this.props.customerBillingData}
      />
    </View>
  );

  renderOrderLocation = () => (
    <OrderLocation customerBillingData={this.props.customerBillingData} />
  );

  renderOrderCommentBox = () => (
    <View style={styles.spacingBetweenUI}>
      <View
        style={{
          color: '#000',
          borderWidth: 1,
          borderColor: '#B9B9B9',
          borderRadius: 8,
          padding: Platform.OS === 'ios' ? 6 : 2,
          minHeight: 80,
        }}
      >
        <TextInput
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          maxLength={150}
          placeholder="Write Order Comments"
          placeholderTextColor="#000"
          selectionColor={'grey'}
          value={this.state.orderCommentInput}
          onChangeText={(value) => this.setState({ orderCommentInput: value })}
          color="black"
        />
      </View>
    </View>
  );

  renderPlaceOrderButton() {
    const theme = this.context;
    const { payments } = this.props;
    if (!payments.length) {
      return <View />;
    }

    if (this.props.loading || this.state.isProcessingOrder) {
      return (
        <View style={styles.nextButtonStyle}>
          <Spinner size="large" />
        </View>
      );
    }
    return (
      <View style={styles.nextButtonStyle}>
        <Pressable
          onPress={this.onPlacePressed}
          disable={this.props.loading}
          style={styles.buttonStyle(theme)}
        >
          <Text style={{ color: '#fff', fontSize: 19 }}>
            {translate('checkout.placeOrderButton')}
          </Text>
        </Pressable>
      </View>
    );
  }

  renderTokenUI = () => (
    <View style={[styles.totalsStyle, styles.spacingBetweenUI]}>
      <View style={[{ flexDirection: 'row', width: '100%' }]}>
        <TextInput
          editable={!this.props?.totals?.coupon_code}
          value={this.state.couponCodeInput}
          placeholder="Enter Discount Code"
          color="#000"
          placeholderTextColor="#000"
          selectionColor={'grey'}
          style={styles.inputBox}
          onChangeText={(value) => this.setState({ couponCodeInput: value })}
        />
        {this.props.couponLoading ? (
          <View style={{ width: 100 }}>
            <Spinner />
          </View>
        ) : (
          // <Pressable style={styles.coupounButton} onPress={this.couponAction}>

          // </Pressable>
          <TouchableOpacity
            onPress={this.couponAction}
            style={{
              flex: 1,
              backgroundColor: '#8BC63E',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12 }}>
              {this.props?.totals?.coupon_code ? 'Cancel' : 'Apply Discount'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {!!this.props.couponError?.length && (
        <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>
          {this.props.couponError}
        </Text>
      )}
    </View>
  );

  renderCardCheckout = () => {
    const theme = this.context;
    const {
      postcode,
      street,
      city,
      region,
      telephone,
      email,
      firstname,
      lastname,
    } = this.props.customerBillingData;
    const { base_grand_total: grandTotal } = this.props.totals;

    return (
      <View>
        <Frames
          config={{
            debug: true,
            publicKey: CHECKOUT_PK,
            cardholder: {
              name: `${firstname} ${lastname}`,
              phone: telephone,
              billingAddress: {
                zip: postcode,
                state: region.region,
                city,
                addressLine1: street,
                addressLine2: '',
              },
            },
          }}
          cardTokenized={async (e) => {
            await this.onPlacePressed();
            this.paymentToken = e.token;
          }}
          cardTokenizationFailed={(err) => {
            console.error('Error token', err);
            Alert.alert(
              'Error Processing Payment',
              'Something went wrong while processing your payment. Please try again. If the error persists, try again later.',
              [
                {
                  text: translate('common.ok'),
                  onPress: () => {
                    this.setState({ isProcessingOrder: false });
                    this.props.checkoutCustomerNextLoading(false);
                  },
                },
              ]
            );
          }}
        >
          <CardNumber
            style={styles.cardNumber}
            placeholderTextColor="#9898A0"
            onEndEditing={(value) => {
              this.setState({
                number: value._dispatchInstances.memoizedProps.text,
              });
            }}
            defaultValue={this.state.number}
          />

          <View style={styles.dateAndCode}>
            <ExpiryDate
              style={styles.expiryDate}
              placeholderTextColor="#9898A0"
              onEndEditing={(value) => {
                console.log(
                  'value:',
                  value._dispatchInstances.memoizedProps.value
                );
                this.setState({
                  cardDate: value._dispatchInstances.memoizedProps.value,
                });
              }}
              defaultValue={this.state.cardDate}
            />
            <Cvv
              style={styles.cvv}
              placeholderTextColor="#9898A0"
              onEndEditing={(value) => {
                console.log(
                  'value:',
                  value._dispatchInstances.memoizedProps.value
                );
                this.setState({
                  cvv: value._dispatchInstances.memoizedProps.value,
                });
              }}
              defaultValue={this.state.cvv}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              AsyncStorage.setItem('cardNumber', this.state.number);
              AsyncStorage.setItem('cardDate', this.state.cardDate);
              AsyncStorage.setItem('cvv', this.state.cvv);
              alert('Card is Saved!');
            }}
          >
            <Text style={styles.buttonText}>Save Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button1}
            onPress={() => {
              this.setState({ number: '' });
              this.setState({ cardDate: '' });
              this.setState({ cvv: '' });
              AsyncStorage.removeItem('cardNumber');
              AsyncStorage.removeItem('cardDate');
              AsyncStorage.removeItem('cvv');
              alert('Card is removed!');
            }}
          >
            <Text style={styles.buttonText}>Delete Card</Text>
          </TouchableOpacity>

          {this.renderDateAndTime()}

          {this.renderOrderLocation()}
          {this.renderOrderCommentBox()}

          {this.renderTokenUI()}

          {this.renderTotals()}
          {this.props.loading || this.state.isProcessingOrder ? (
            <View style={styles.nextButtonStyle}>
              <Spinner size="large" />
            </View>
          ) : !this.props.payments.length ? null : (
            <SubmitButton
              title="Place Order"
              style={styles.button}
              textStyle={styles.buttonText}
              onPress={() => {
                this.props.checkoutCustomerNextLoading(true);
                this.setState({ isProcessingOrder: true });
              }}
            />
          )}
        </Frames>
      </View>
    );
  };

  renderCODUI = () => {
    return (
      <View>
        {this.renderDateAndTime()}
        {this.renderOrderLocation()}
        {this.renderOrderCommentBox()}
        {this.renderTokenUI()}
        {this.renderTotals()}
        {this.renderPlaceOrderButton()}
      </View>
    );
  };

  render() {
    const theme = this.context;
    const { selectedPayment } = this.props;
    return (
      <View style={styles.container(theme)}>
        {selectedPayment.code === 'checkoutcom_card_payment' &&
        !this.state.cardLoading
          ? this.renderCardCheckout()
          : this.renderCODUI()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: (theme) => ({
    margin: theme.spacing.large,
    alignItems: 'flex-start',
  }),
  radioWrap: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  coupounButton: {
    backgroundColor: '#8BC63E',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    width: 100,
  },
  nextButtonStyle: {
    flex: 1,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spacingBetweenUI: { marginTop: 20 },
  totalsStyle: {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  inputBox: {
    color: '#000',
    borderWidth: 1,
    padding: 14,
    flex: 2,
    borderColor: '#B9B9B9',
  },
  cardNumber: {
    fontSize: 18,
    height: 50,
    color: '#000',
    backgroundColor: '#fff',
    borderColor: '#3A4452',
    borderRadius: 5,
    borderWidth: 1,
  },
  expiryDate: {
    fontSize: 18,
    height: 50,
    width: '48%',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  dateAndCode: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cvv: {
    fontSize: 18,
    height: 50,
    width: '48%',
    color: '#000',
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  button: {
    height: 45,
    borderRadius: 5,
    marginVertical: 20,
    justifyContent: 'center',
    backgroundColor: '#8BC63E',
  },
  button1: {
    height: 45,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#ff0000',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    alignSelf: 'center',
  },
  buttonStyle: (theme) => ({
    marginVertical: theme.spacing.large,
    alignSelf: 'center',
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  }),
  couponInputContainer: (theme) => ({
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  }),
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 4,
  },
});

const mapStateToProps = ({ cart, checkout, magento, account }) => {
  const { cartId, couponLoading, couponError, quote } = cart;
  const { items } = quote || {};
  const { loading } = checkout.ui;
  const {
    payments,
    selectedPayment,
    totals,
    orderId,
    errorMessage,
    deliveryDate,
    deliveryTime,
  } = checkout;
  const {
    base_currency_symbol: baseCurrencySymbol,
    displayCurrencyCode: currencyCode,
    displayCurrencySymbol: currencySymbol,
    displayCurrencyExchangeRate: currencyRate,
  } = magento.currency;
  return {
    cartItems: items || [],
    cartId,
    payments,
    selectedPayment,
    totals,
    loading,
    orderId,
    errorMessage,
    baseCurrencySymbol,
    currencyCode,
    currencySymbol,
    currencyRate,
    couponError,
    couponLoading,
    customerBillingData: checkout.ui,
    deliveryDate,
    deliveryTime,
    customer: account.customer,
  };
};

export default connect(mapStateToProps, {
  checkoutSelectedPaymentChanged,
  checkoutCustomerNextLoading,
  checkoutSetActiveSection,
  checkoutOrderPopupShown,
  placeOrder,
  getCart,
  resetCart,
  addCouponToCart,
  removeCouponFromCart,
  addToCart,
})(CheckoutTotals);
