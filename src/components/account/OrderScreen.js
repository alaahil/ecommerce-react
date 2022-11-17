import React, { useEffect, useContext, useState } from 'react';
import moment from 'moment';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Text } from '../common';
import { orderProductDetail } from '../../actions';
import { getProductThumbnailFromAttribute } from '../../helper/product';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { priceSignByCode } from '../../helper/price';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { magento } from '../../magento';
import { store } from '../../store';
import moneyIcon from '../../assets/cart/money.png';
import cardIcon from '../../assets/cart/card.png';
import appleIcon from '../../assets/cart/apple_pay.png';
import googleIcon from '../../assets/cart/google_pay.png';
import StarRating from 'react-native-star-rating-widget';
import { NAVIGATION_HOME_SCREEN_PATH } from '../../navigation/routes';
import axios from 'axios';
import { BASE_URL } from '../../constant/constant';

const OrderScreen = ({
  products,
  navigation,
  orderProductDetail: _orderProductDetail,
}) => {
  const theme = useContext(ThemeContext);
  const currencySymbol = priceSignByCode(
    navigation.state.params.item.order_currency_code
  );
  const paymentMethod = navigation.state.params?.item?.payment?.method;
  const orderCreationDate = moment(
    navigation.state.params.item.created_at
  ).format('MMMM D, YYYY');
  const billingAddress = navigation.state.params?.item.billing_address;

  const [customerToken, setCustomerToken] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyData, setSurveyData] = useState([])
  const [currentSurveyIndex, setCurrentSurveyIndex] = useState(0)
  const [rating, setRating] = useState(0)
  const { street, city, postcode } = billingAddress;
  const [selectedOption, setSelectedOption] = useState(null)
  const [surveyError, setSurveyError] = useState(false)
  const [inputText, setInputText] = useState(null)
  const [isSubmit, setSubmit] = useState(false)
  const customer = useSelector((state) => state.account.customer);
  console.log("CUSTOMER", customer)

  useEffect(() => {

    // const customerTokenget = await AsyncStorage.getItem('customerToken');
    // setCustomerToken(customerTokenget)
    navigation.state.params.item.items.forEach((item) => {
      if (!(item.sku in products)) {
        _orderProductDetail(item.sku);
      }
    });
  }, [_orderProductDetail, navigation.state.params.item.items, products]);

  useEffect(() => {
    if (navigation.state.params.checkout) {
      getSurveyDetails()
    }
  }, [])

  function getSurveyDetails() {
    axios.get(BASE_URL + `/rest/V1/survey/question?email=${customer.email}`, {
      headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' }
    }).then((response) => {
      console.log('SURVEY', response)
      if (response.data == 'Servey Already Done by this user') {
        return
      }
      if (response.status == 200 && response.data.length > 1) {
        const tempData = response.data.map((item) => {
          item.ans = null
          return item
        })
        setSurveyData(tempData)
        setShowSurvey(true)
      }
    })
  }

  const image = (item) => {
    console.log('image', item.sku);
    if (products[item.sku]) {
      console.log(
        'image',
        getProductThumbnailFromAttribute(products[item.sku])
      );
      return getProductThumbnailFromAttribute(products[item.sku]);
    }
  };

  const renderItem = (item) => {
    console.log('testsaaaaa', JSON.stringify(item.item));
    return (
      <View style={[styles.itemContainer(theme), { marginVertical: 3 }]}>
        <View style={styles.row}>
          <View
            style={{
              width: '30%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FastImage
              style={styles.imageStyle(theme)}
              resizeMode="contain"
              source={{ uri: image(item.item) }}
            />
          </View>
          <View style={{ width: '70%', justifyContent: 'flex-start' }}>
            <Text
              style={{
                marginRight: 5,
                fontSize: 16,
                flexWrap: 'wrap',
                paddingLeft: 10,
              }}
            >
              {item.item.name}
            </Text>
            {/* <Text type="label">{`${translate('common.sku')}: ${
            item.item.sku
          }`}</Text> */}

            <Text style={{ fontSize: 16, paddingLeft: 10, color: '#F37A20' }}>
              Quantity : {item.item.qty_ordered || item.item.qty}
            </Text>
            <Text style={{ fontSize: 16, paddingLeft: 10, color: '#F37A20' }}>
              Total : AED{' '}
              {(
                item.item.price_incl_tax *
                (item.item.qty_ordered || item.item.qty)
              ).toFixed(2)}
            </Text>

            {/* <Text type="label">{`${translate('common.quantity')}: ${
            item.item.qty_ordered
          }`}</Text> */}
            {/* <View style={styles.row}> */}
            {/* <Text type="label">{`${translate('common.subTotal')}: `}</Text> */}
            {/* <Price
              basePrice={item.item.row_total}
              currencyRate={1}
              currencySymbol={currencySymbol}
            /> */}
            {/* </View> */}
          </View>
        </View>
      </View>
    );
  };

  const { item } = navigation.state.params;
  console.log('token====>', store.getState().customerAuth?.token);
  console.log('payment method====>', paymentMethod);

  const checkAuth = () => {
    if (
      store.getState().customerAuth?.token == '' ||
      store.getState().customerAuth?.token == null ||
      store.getState().customerAuth?.token == undefined
    ) {
      navigation.navigate(NAVIGATION_HOME_SCREEN_PATH);
    } else {
      navigation.goBack();
    }
  };

  // const payImage =
  //   paymentMethod === 'checkoutcom_card_payment'
  //     ? cardIcon
  //     : paymentMethod === 'checkoutcom_apple_pay'
  //     ? appleIcon
  //     : paymentMethod === 'checkoutcom_google_pay'
  //     ? googleIcon
  //     : moneyIcon;
  function _onSubmit() {

  }
  console.log(surveyData)

  useEffect(() => {
    setSurveyData(surveyData)
  }, [selectedOption])

  const _renderRadioButton = () => {
    return surveyData[currentSurveyIndex].option.map((item, index) => {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => {
            setSelectedOption(item.option)
            surveyData[currentSurveyIndex].ans = item.option
          }} style={{ borderColor: item.option == surveyData[currentSurveyIndex].ans ? 'lightgreen' : 'black', height: 30, width: 30, borderRadius: 15, borderWidth: 2, marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
            {item.option == surveyData[currentSurveyIndex].ans ?
              <View style={{ height: 20, width: 20, borderRadius: 20, backgroundColor: 'lightgreen' }} /> : null
            }
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Inter-Medium', left: 20 }}>{item.option}</Text>
        </View>
      )
    })
  }

  const renderOptions = () => {
    return (
      <View style={{ marginTop: 20 }}>
        {surveyData[currentSurveyIndex].question_type == 'option' ?
          _renderRadioButton() : surveyData[currentSurveyIndex].question_type == 'rate' ?
            <View style={{ alignSelf: 'center' }}>
              <StarRating
                starSize={50}
                enableHalfStar={false}
                rating={surveyData[currentSurveyIndex].ans ? surveyData[currentSurveyIndex].ans : 0}
                onChange={(value) => {
                  setRating(value)
                  surveyData[currentSurveyIndex].ans = value
                }}
              /></View> :
            surveyData[currentSurveyIndex].question_type == 'text' ?
              <TextInput
                returnKeyType={'done'}
                value={inputText}
                onChangeText={(value) => {
                  setInputText(value)
                  surveyData[currentSurveyIndex].ans = value
                }}
                multiline
                style={{ borderWidth: 0.5, height: 80, textAlignVertical: 'top', borderRadius: 10, fontFamily: 'Inter-Medium', color: 'black' }}
                placeholderTextColor='black'
                placeholder='Type here' />
              : null
        }
      </View>
    )
  }

  const _prev = () => {
    setSurveyError(false)
    if (currentSurveyIndex != 0) {
      setCurrentSurveyIndex(currentSurveyIndex - 1)
    }
  }

  const _next = () => {
    Keyboard.dismiss()
    setSurveyError(false)
    if (surveyData[currentSurveyIndex].ans) {
      if (surveyData.length - 1 != currentSurveyIndex) {
        setCurrentSurveyIndex(currentSurveyIndex + 1)
      } else {
        _SubmitSurvey()
      }
    } else {
      setSurveyError(true)
    }
  }

  useEffect(() => {
    if (surveyData.length > 0) {
      if (surveyData[currentSurveyIndex].question_type == 'text' && surveyData[currentSurveyIndex].ans) {
        setInputText(surveyData[currentSurveyIndex].ans)
      } else {
        setInputText(null)
      }
    }
  }, [currentSurveyIndex])

  const _SubmitSurvey = () => {
    Keyboard.dismiss()
    const result = surveyData.map((item, index) => {
      return `question${index + 1}=1&ans${index + 1}=${item.ans}`
    })
    console.log(result.join('&'))
    const tempResult = result.join('&')
    console.log(BASE_URL + `/rest/V1/survey/answer?user_id=${customer.id}&${tempResult}`)
    axios.post(BASE_URL + `/rest/V1/survey/answer?user_id=${customer.id}&${tempResult}`, {
      headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
    }).then((response) => {
      console.log('SURVEY', response)
      setSubmit(true)
    })
  }

  const SurveyPopup = () => {
    return (
      <Modal visible={showSurvey} transparent >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior='height'>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            {isSubmit ?
              <View style={{ padding: 15, width: Dimensions.get('window').width - 40, backgroundColor: 'white', borderRadius: 10 }}>
                <Text style={{ textAlign: 'center', fontFamily: 'Inter-Medium', fontSize: 14 }}>Thank you for helping us improve!{'\n'}Please use the followin promo code:{'\n'}
                  <Text style={{ fontFamily: 'Inter-ExtraBold', lineHeight: 40, fontSize: 24, color: '#8BC63E' }}> shokran {'\n'}</Text>on your next order to get AED 30 off!</Text>
                <TouchableOpacity onPress={() => setShowSurvey(false)}
                  style={{ width: '40%', alignSelf: 'center', alignItems: 'center', marginVertical: 20, backgroundColor: 'grey', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 8 }}>
                  <Text style={{ color: 'white', fontFamily: 'Inter-Bold' }}>Close</Text>
                </TouchableOpacity>
              </View> :
              <View style={{ width: Dimensions.get('window').width - 40, backgroundColor: 'white', borderRadius: 10 }}>
                {currentSurveyIndex == 0 &&
                  <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 18, fontFamily: 'Inter-SemiBold', fontSize: 25, color: 'lightgreen' }}>Survey</Text>
                }
                <ScrollView>
                  <View style={{ margin: 20 }}>
                    {currentSurveyIndex == 0 &&
                      <View style={{ paddingVertical: 10, alignSelf: 'center' }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter-Medium', textAlign: 'center' }}>Help us improve! Please fill the following one-time survey and get <Text style={{ color: '#8BC63E' }}>AED 30</Text> off your next order</Text>
                        <Text style={{ fontSize: 10, fontFamily: 'Inter-Regular', textAlign: 'center', marginTop: 10 }}>{'(A promo code will be given after filling this survey)'}</Text>
                      </View>
                    }
                    <Text style={{ fontSize: 18, fontFamily: 'Inter-Medium' }}>{surveyData[currentSurveyIndex].question}</Text>
                    {renderOptions()}
                  </View>
                </ScrollView>
                {surveyError ? <Text style={{ color: 'red', left: 30, fontFamily: 'Inter-Bold' }}>{'Please fill the answer'}</Text> : null}

                <View style={{ flexDirection: 'row', alignSelf: 'center', margin: 20 }}>
                  <TouchableOpacity onPress={() => _prev()}
                    style={{ right: 20, backgroundColor: 'grey', borderRadius: 10, paddingHorizontal: 15, alignItems: 'center', paddingVertical: 8 }}>
                    <Text style={{ color: 'white', fontFamily: 'Inter-Bold' }}>Previous</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => _next()}
                    style={{ left: 20, backgroundColor: 'grey', borderRadius: 10, paddingHorizontal: 22, paddingVertical: 8 }}>
                    <Text style={{ color: 'white', fontFamily: 'Inter-Bold' }}>{surveyData.length - 1 != currentSurveyIndex ? 'Next' : 'Submit'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          </View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }
  return (
    <View style={styles.container(theme)}>
      <View
        style={{
          height: 50,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            checkAuth();
          }}
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <Image
            style={{ height: 20, width: 20 }}
            source={require('../../../src/assets/Icons/back.png')}
          />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 20 }}>
            {'Order #' + navigation.state.params.item.increment_id}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }} />
      </View>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 1,
          borderColor: '#E1E1E1',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ opacity: 0.5, color: '#000', fontSize: 17 }}>
            Ordered on:
          </Text>
          <Text
            style={{
              opacity: 0.7,
              color: '#000',
              fontSize: 16,
              paddingLeft: 10,
            }}
          >
            {`${orderCreationDate}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ opacity: 0.5, color: '#000', fontSize: 17 }}>
            Payment method:
          </Text>
          {/*<Image style={styles.googleAppleIcon} source={payImage} />*/}
          <Text
            style={{
              opacity: 0.7,
              color: '#000',
              fontSize: 16,
              paddingLeft: 10,
            }}
          >
            {`${paymentMethod === 'checkoutcom_card_payment'
              ? 'Paid By Card'
              : paymentMethod === 'checkoutcom_apple_pay'
                ? 'Apple Pay'
                : paymentMethod === 'checkoutcom_google_pay'
                  ? 'Google Pay'
                  : 'Card On Delivery'
              }`}
          </Text>
        </View>
      </View>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 1,
          borderColor: '#E1E1E1',
        }}
      >
        <Text
          style={{ fontSize: 17, paddingTop: 10, color: '#000', opacity: 0.8 }}
        >
          Delivery Location
        </Text>
        <Text>{`${street}, ${city}, ${postcode}`}</Text>
      </View>
      <View
        style={{
          paddingBottom: 5,
          borderBottomWidth: 1,
          borderColor: '#E1E1E1',
        }}
      >
        <Text
          style={{ fontSize: 17, paddingTop: 10, color: '#000', opacity: 0.8 }}
        >
          {' '}
          Cart Items
        </Text>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={[...item.items]}
        renderItem={renderItem}
        keyExtractor={(_item, index) => index.toString()}
      />
      <View style={styles.totalContainer}>
        <Text
          style={{
            fontSize: 18,
          }}
        >
          Status
        </Text>
        <Text
          type="label"
          style={{ fontSize: 15, color: '#000', opacity: 0.6 }}
        >
          {item.status}
        </Text>
      </View>
      <View style={styles.totalContainer}>
        <Text
          type="label"
          style={{ fontSize: 18, color: '#000', opacity: 0.6 }}
        >{`${translate('common.subTotal')} `}</Text>
        <Text
          type="label"
          style={{ fontSize: 15, color: '#000', opacity: 0.6 }}
        >
          AED {item.subtotal.toFixed(2)}
        </Text>
      </View>
      <View style={styles.totalContainer}>
        <Text
          style={{
            fontSize: 18,
          }}
        >
          Delivery Fee
        </Text>
        <Text
          type="label"
          style={{ fontSize: 15, color: '#000', opacity: 0.6 }}
        >
          AED {item.base_shipping_incl_tax}
        </Text>
      </View>
      <View style={styles.totalContainer}>
        <Text
          style={{
            fontSize: 18,
          }}
        >
          Discount
        </Text>
        <Text
          type="label"
          style={{ fontSize: 15, color: '#000', opacity: 0.6 }}
        >
          AED {item.discount_amount.toFixed(2)}
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
        <Text
          type="label"
          style={{ fontSize: 15, color: '#000', opacity: 0.6 }}
        >
          AED {item.tax_amount.toFixed(2)}
        </Text>
      </View>
      <View style={styles.totalContainer}>
        <Text style={{ fontSize: 18, color: '#8BC63E' }}>Total</Text>
        <Text type="label" style={{ fontSize: 15, color: '#8BC63E' }}>
          AED {item.base_grand_total.toFixed(2)}
        </Text>
      </View>
      {surveyData.length > 0 && SurveyPopup()}
    </View>
  );
};

OrderScreen.navigationOptions = ({ navigation }) => ({
  title: `${translate('common.order')} #${navigation.state.params.item.increment_id
    }`,
});

const styles = StyleSheet.create({
  container: (theme) => ({
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
    flex: 1,
  }),
  itemContainer: (theme) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: theme.dimens.borderRadius,
    // padding: theme.spacing.small,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    flex: 1,
  }),
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  imageStyle: (theme) => ({
    width: theme.dimens.orderImageWidth,
    height: theme.dimens.orderImageHeight,
    marginRight: 10,
  }),
  googleAppleIcon: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
    marginLeft: 10,
    opacity: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 3,
  },
});

OrderScreen.propTypes = {
  products: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  orderProductDetail: PropTypes.func.isRequired,
};

OrderScreen.defaultProps = {};

const mapStateToProps = ({ account, magento }) => {
  const { products } = account;
  return {
    products,
  };
};

export default connect(mapStateToProps, {
  orderProductDetail,
})(OrderScreen);
