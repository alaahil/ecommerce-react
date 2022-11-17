import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import moneyIcon from '../../assets/cart/money.png';
import cardIcon from '../../assets/cart/card.png';
import appleIcon from '../../assets/cart/apple_pay.png';
import googleIcon from '../../assets/cart/GPay_Icon.png';

const PaymentOption = ({
  onPaymentSelect,
  selectedPayment,
  payments,
  isMobilePayAvailable,
}) => {
  return (
    <View style={{ width: '100%' }}>
      <TouchableOpacity
        style={[
          styles.cashOnDeliveryContainer,
          {
            borderColor:
              selectedPayment.title === payments[0].title ? 'blue' : undefined,
          },
        ]}
        onPress={() => {
          onPaymentSelect(payments[0]);
        }}
      >
        <Image
          source={moneyIcon}
          style={styles.moneyIcon}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 16, paddingLeft: 10 }}>
          {payments[0].title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.payByCardContainer,
          {
            borderColor:
              selectedPayment.title === payments[1].title ? 'blue' : undefined,
          },
        ]}
        onPress={() => {
          onPaymentSelect(payments[1]);
        }}
      >
        <Image source={cardIcon} style={styles.cardIcon} />
        <Text style={{ fontSize: 16, paddingLeft: 10 }}>
          {payments[1].title}
        </Text>
      </TouchableOpacity>
      {payments[2] && isMobilePayAvailable && (
        <TouchableOpacity
          style={[
            styles.payByCardContainer,
            {
              borderColor:
                selectedPayment.title === payments[2].title
                  ? 'blue'
                  : undefined,
            },
          ]}
          onPress={() => {
            onPaymentSelect(payments[2]);
          }}
        >
          <Image
            source={Platform.OS === 'ios' ? appleIcon : googleIcon}
            style={styles.googleAppleIcon}
          />
          <Text style={{ fontSize: 16, paddingLeft: 10, opacity: 1 }}>
            {payments[2].title}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PaymentOption;

const styles = StyleSheet.create({
  dateAndCode: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNumber: {
    fontSize: 18,
    height: 50,
    color: '#FEFFFF',
    backgroundColor: '#1B1C1E',
    borderColor: '#3A4452',
    borderRadius: 5,
    borderWidth: 0,
  },
  expiryDate: {
    fontSize: 18,
    height: 50,
    width: '48%',
    color: '#FEFFFF',
    backgroundColor: '#1B1C1E',
    borderWidth: 0,
  },
  cvv: {
    fontSize: 18,
    height: 50,
    width: '48%',
    color: '#FEFFFF',
    backgroundColor: '#1B1C1E',
    borderWidth: 0,
  },
  button: {
    height: 50,
    borderRadius: 5,
    marginTop: 20,
    justifyContent: 'center',
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  cashOnDeliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    height: 52,
    width: '100%',
    backgroundColor: '#F0F1F2',
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  moneyIcon: {
    width: 40,
    height: 25,
    marginLeft: 10,
    marginRight: 10,
  },
  payByCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    height: 45,
    width: '100%',
    backgroundColor: '#F0F1F2',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardIcon: {
    width: 40,
    height: 25,
    resizeMode: 'contain',
    marginLeft: 10,
    opacity: 1,
    marginRight: 10,
  },
  googleAppleIcon: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
    marginLeft: 10,
    opacity: 1,
  },
});
