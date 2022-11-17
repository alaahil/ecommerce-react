import React, { Component } from 'react';
import { View, Text, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Spinner } from '../common';
import {
  checkoutSelectedPaymentChanged,
  checkoutSetActiveSection,
  getGuestCartPaymentMethods,
  checkoutCustomerNextLoading,
  setCustomerPaymentInfoBoolean,
  checkoutSetDeliveryTime,
  checkoutSetDeliveryDate,
} from '../../actions';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Pressable } from 'react-native';
import PaymentOption from './PaymentOption.js';
import moment from 'moment';
import { getPaymentRequest } from '../../config/applyPayConfig';
import { NativeModules } from 'react-native';
// import { isGooglePayAvailable } from '../../config/googlePayConfig';
const { ReactNativePayments } = NativeModules;

console.log('Supported sdlk', ReactNativePayments.supportedGateways);

class CheckoutPaymentMethod extends Component {
  static contextType = ThemeContext;

  state = {
    success: false,
    isMobilePayAvailable: false,
  };

  componentDidMount() {
    const { payments, selectedPayment } = this.props;
    this.props.setCustomerPaymentInfoBoolean(false);
    if (!selectedPayment && payments?.length) {
      this.props.checkoutSelectedPaymentChanged(payments[0]);
    }
    if (Platform.OS === 'ios') {
      const paymentRequest = getPaymentRequest();
      paymentRequest.canMakePayments().then((available) => {
        this.setState({ isMobilePayAvailable: available });
      });
    } else {
      // isGooglePayAvailable().then((available) => {
      //   this.setState({ isMobilePayAvailable: available });
      // });
    }
  }

  onPaymentSelect(payment) {
    this.props.checkoutSelectedPaymentChanged(payment);
  }

  onNextPressed = () => {
    const { cartId, checkoutSetDeliveryTime, checkoutSetDeliveryDate } =
      this.props;
    const tomorrowDate = moment().add(1, 'days');
    const formattedTomorrowDate = moment(tomorrowDate).format('DD/MM/YY HH:mm');
    checkoutSetDeliveryDate({
      rawDate: tomorrowDate,
      formattedDate: formattedTomorrowDate,
    });

    checkoutSetDeliveryTime({
      time: '8Am - 11Am',
      id: 1,
    });
    this.props.checkoutCustomerNextLoading(true);
    this.props.getGuestCartPaymentMethods(cartId);
    this.props.setCustomerPaymentInfoBoolean(true);
  };

  renderPaymentMethods() {
    const theme = this.context;
    const { payments } = this.props;

    if (!payments || (Array.isArray(payments) && !payments?.length)) {
      return <Text>{translate('checkout.noPaymentMethod')}</Text>;
    }

    return (
      <View style={{ width: '100%' }}>
        <PaymentOption
          onPaymentSelect={(value) => {
            this.onPaymentSelect(value);
          }}
          payments={payments}
          selectedPayment={this.props.selectedPayment}
          onSuccess={this.onNextPressed}
          customerBillingData={this.props.customerBillingData}
          customerPersonalData={this.props.customerPersonalData}
          isMobilePayAvailable={this.state.isMobilePayAvailable}
        />
      </View>
    );
  }

  renderButton() {
    const theme = this.context;
    const { payments, selectedPayment } = this.props;
    if (!payments?.length) {
      return <View />;
    }

    if (this.props.loading) {
      return (
        <View style={styles.nextButtonStyle}>
          <Spinner size="large" />
        </View>
      );
    }

    return (
      <View style={styles.nextButtonStyle}>
        <Pressable
          onPress={this.onNextPressed}
          style={styles.buttonStyle(theme)}
        >
          <Text style={{ color: '#fff', fontSize: 19 }}>
            {translate('common.next')}
          </Text>
        </Pressable>
      </View>
    );
  }

  render() {
    const theme = this.context;
    return (
      <View style={styles.container(theme)}>
        {this.renderPaymentMethods()}
        {this.renderButton()}
      </View>
    );
  }
}

const styles = {
  container: (theme) => ({
    margin: theme.spacing.large,
    alignItems: 'flex-start',
  }),
  radioWrap: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  nextButtonStyle: {
    flex: 1,
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
};

const mapStateToProps = ({ cart, checkout, account }) => {
  const { cartId } = cart;
  const { payments, selectedPayment, deliveryDate, deliveryTime } = checkout;
  const { loading } = checkout.ui;

  return {
    cartId,
    payments,
    selectedPayment,
    loading,
    customerBillingData: account.ui,
    customerPersonalData: account.customer,
    deliveryDate,
    deliveryTime,
  };
};

export default connect(mapStateToProps, {
  checkoutSelectedPaymentChanged,
  checkoutSetActiveSection,
  getGuestCartPaymentMethods,
  checkoutCustomerNextLoading,
  setCustomerPaymentInfoBoolean,
  checkoutSetDeliveryTime,
  checkoutSetDeliveryDate,
})(CheckoutPaymentMethod);
