import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import { cartItemProduct, refreshCart } from '../../actions';
import CartListItem from './CartListItem';
import NavigationService from '../../navigation/NavigationService';
// import MyModal from '../common/Modal';
import { Modal } from 'react-native';
import {
  NAVIGATION_CHECKOUT_PATH,
  NAVIGATION_HOME_PRODUCT_PATH,
  NAVIGATION_HOME_SCREEN_PATH,
  NAVIGATION_LOGIN_PATH,
} from '../../navigation/routes';
import { Button, Text, Price } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Pressable } from 'react-native';
import cartIcon from '../../assets/cart/cart.png';
import { store } from '../../store';
import { finalPrice } from '../../helper/price';

class Cart extends Component {
  state = {
    modalVisible: false,
    cart: this.props.cart,
  };

  static contextType = ThemeContext;

  static navigationOptions = {
    title: translate('cart.title'),

    headerBackTitle: ' ',
  };

  static propTypes = {
    cart: PropTypes.object,
    products: PropTypes.object,
    cartItemProduct: PropTypes.func,
    refreshCart: PropTypes.func,
    refreshing: PropTypes.bool,
  };

  static defaultProps = {
    cart: {},
    products: {},
    refreshing: false,
  };

  componentDidMount() {
    // console.log(this.props.customerToken)

    this.updateCartItemsProducts();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.cart.items &&
      this.props.cart.items &&
      prevProps.cart.items.length !== this.props.cart.items.length
    ) {
      this.updateCartItemsProducts();
    }
  }

  onPressAddToCheckout = () => {
    console.log('cart item==>', this.props.cart);
    NavigationService.navigate(NAVIGATION_CHECKOUT_PATH, {
      title: translate('cart.title'),
      cart: this.props.cart,
    });
  };

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  toggleModal = () => {
    this.setState(!modalVisible);
  };

  homeScreen = () => {
    NavigationService.navigate(NAVIGATION_HOME_SCREEN_PATH, {});
  };

  onPressSignin = () => {
    NavigationService.navigate(NAVIGATION_LOGIN_PATH),
      {
        title: translate('Login'),
      };
  };

  onRefresh = () => {
    this.props.refreshCart();
  };

  updateCartItemsProducts = () => {
    const { items } = this.props.cart;
    if (!items) {
      return;
    }

    const { products } = this.props;
    console.log('Product', products);

    items.forEach((item) => {
      if (!item.thumbnail) {
        if (!products[item.sku]) {
          this.props.cartItemProduct(item.sku);
        }
      }
    });
  };

  renderTotals() {
    const theme = this.context;
    const { items } = this.props.cart;
    const { totals } = styles;

    let sum = 0;
    if (items) {
      items.forEach((item) => {
        sum += item.extension_attributes.price_with_vat * item.qty;
      });
    }

    if (sum > 0) {
      return (
        <View style={styles.totalPriceContainer}>
          {/* /<Text type="heading">{`${translate('common.total')} : `}</Text> */}
          <Text
            style={{
              color: '#8BC63E',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {sum} AED
          </Text>
        </View>
      );
    }
  }

  renderEmptyCart = () => {
    const theme = this.context;
    const { navigate } = this.props.navigation;
    const { containerStyle, totals, buttonTextStyle } = styles;

    return (
      <View style={[containerStyle(theme), { flex: 1 }]}>
        <View>
          <Image
            source={cartIcon}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />
        </View>
        <Text type="heading" style={totals(theme)}>
          No Items Added To Cart
        </Text>
        <TouchableOpacity onPress={() => navigate(NAVIGATION_HOME_SCREEN_PATH)}>
          <Text type="heading" bold style={buttonTextStyle(theme)}>
            {translate('common.continueShopping')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderItem = (items) => (
    <CartListItem
      expanded={false}
      item={items.item}
      currencyRate={this.props.currencyRate}
      currencySymbol={this.props.currencySymbol}
      onDeleteItem={this.onRefresh}
    />
  );

  renderCart = () => {
    const theme = this.context;
    const { items } = this.props.cart;

    return (
      <View style={styles.container(theme)}>
        <Modal
          visible={this.state.modalVisible}
          // animationType="slide"
          transparent={true}
        >
          <View
            style={{
              flex: 0.3,
              width: '80%',
              marginTop: '60%',
              justifyContent: 'center',
              alignItems: 'center',
              height: 100,
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: '#8BC63E',
              alignSelf: 'center',
            }}
          >
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              {/* <TouchableOpacity onPress={() => { this.setModalVisible(false);console.log('props cart',this.props.cart); NavigationService.navigate(NAVIGATION_LOGIN_PATH) }}>
                <Text style={{ color: '#8BC63E' }}>
                  Do you want to login?
                </Text>
              </TouchableOpacity> */}
              <Text style={{ color: '#000', textAlign: 'center' }}>
                You need to be logged in to continue
              </Text>
              <TouchableOpacity
                style={{
                  ...styles.centerOnBothAxis,
                  ...styles.addProductButton,
                  paddingHorizontal: 50,
                  marginTop: 40,
                }}
                onPress={() => {
                  this.setModalVisible(false);
                  console.log('props cart', this.props.cart);
                  NavigationService.navigate(NAVIGATION_LOGIN_PATH);
                }}
              >
                <Text style={styles.addProductsText}>Login</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
              style
                onPress={
                  () => {
                    this.setModalVisible(false);
                    // this.onPressAddToCheckout
                    NavigationService.navigate(NAVIGATION_CHECKOUT_PATH, {
                      // title: translate('cart.title'),
                      cart:this.props.cart
                    }
                      )
                  }}>
                <Text style={{ color: '#8BC63E' }}>Login now</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </Modal>
        <Text style={styles.productsTitle}>Products</Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.props.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          data={items ? items : []}
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.contentContainerStyle,
            !items?.length ? { ...styles.centerOnBothAxis, flex: 1 } : [],
          ]}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={this.renderEmptyCart()}
        />
        {!!items?.length && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity
              style={[
                styles.centerOnBothAxis,
                styles.addProductButton,
                { marginBottom: 10 },
              ]}
              onPress={this.homeScreen}
            >
              <Text style={styles.addProductsText}>Add More Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.centerOnBothAxis, styles.addProductButton]}
              // onPress={this.onPressAddToCheckout}>

              onPress={
                this.props.customerToken
                  ? this.onPressAddToCheckout
                  : () => {
                      this.setModalVisible(true);
                    }
              }

              // () => {
              //   this.setModalVisible(true)

              // }}
            >
              <Text style={styles.addProductsText}>Go To Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  render() {
    return this.renderCart();
  }
}

Cart.navigationOptions = {
  title: translate('cart.title'),
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  }),
  containerStyle: (theme) => ({
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  totals: (theme) => ({
    paddingTop: theme.spacing.small,
  }),
  totalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonTextStyle: (theme) => ({
    padding: theme.spacing.large,
    top: 0,
    color: '#8BC63E',
  }),
  totalPrice: {},
  footer: (theme) => ({
    flexDirection: 'row',
    justifyContent: 'space-around',
  }),
  buttonStyle: (theme) => ({
    width: '85%',
    height: 45,
    backgroundColor: '#8BC63E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderRadius: 5,
  }),
  bottomButtonContainer: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#8BC63E',
  },
  productsTitle: {
    color: '#000',
    fontWeight: '700',
    opacity: 0.7,
    paddingHorizontal: 10,
    fontSize: 16,
    margin: 5,
  },
  addProductsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  addProductButton: {
    width: '90%',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#8BC63E',
  },
  centerOnBothAxis: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainerStyle: {
    paddingBottom: 30,
    paddingTop: 20,
    width: '100%',
  },
});

const mapStateToProps = ({ cart, magento, customerAuth }) => {
  const { products } = cart;
  const {
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
  } = magento;
  const { token } = customerAuth;
  return {
    products,
    currencyRate,
    currencySymbol,
    cart: cart.quote,
    refreshing: cart.refreshing,
    cartComplete: cart,
    customerToken: token,
  };
};

export default connect(mapStateToProps, { cartItemProduct, refreshCart })(Cart);
