import React, { useContext, useEffect, useState } from 'react';
import { View, TouchableOpacity, Alert, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Icon } from 'react-native-elements';
import { connect, useDispatch, useSelector } from 'react-redux';
import { finalPrice } from '../../helper/price';
import { getProductThumbnailFromAttribute } from '../../helper/product';
import { ProductCustomOptions } from '../catalog/ProductCustomOptions';
import { useAddToCart } from '../../hooks/useAddToCart';
import { Spinner, Text, Price, Button, Input } from '../common';
import {
  removeFromCartLoading,
  removeFromCart,
  getCustomOptions,
  updateProductQtyInput,
  cartItemProduct,
  refreshCart,
} from '../../actions';
import { theme, ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { TextInput } from 'react-native';
import NavigationService from '../../navigation/NavigationService';
import PropTypes from 'prop-types';
import {
  NAVIGATION_CHECKOUT_PATH,
  NAVIGATION_HOME_PRODUCT_PATH,
} from '../../navigation/routes';
import deleteIcon from '../../assets/cart/delete.png';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../constant/constant';

const CartListItem = ({
  item,
  cart,
  cartId,
  products,
  currencyRate,
  currencySymbol,
  removeFromCartLoading: _removeFromCartLoading,
  removeFromCart: _removeFromCart,
  onDeleteItem,
}) => {
  const theme = useContext(ThemeContext);
  const dispatch = useDispatch();
  const [tempcustomer, setTempcustomer] = useState(null);
  const [store, setStore] = useState('');
  const [quantity, setQuantity] = useState(item.qty);

  useEffect(() => {
    AsyncStorage.getItem('store').then((res) => {
      setStore(res);
    });
  }, []);
  const increaseQuantity = () => {
    axios
      .get(`${BASE_URL}/${store}/rest/V1/stockStatuses/${item.sku}`, {
        headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
      })
      .then((response) => {
        if (response.data.qty >= quantity + 1) {
          setQuantity(quantity + 1);
          performRemoveItem('update', quantity + 1);
        } else {
          alert('the requested quantity is not available ');
        }
      });
  };

  const decraseQuantity = () => {
    if (quantity <= 1) {
      return;
    }
    setQuantity(quantity - 1);
    performRemoveItem('update', quantity - 1);
  };

  // const [currentProduct, setCurProduct] = useState(current[products.id]);

  const product = products[item.sku];

  const attributes = {};
  var currentProduct = { product: product };
  currentProduct.qtyInput = 1;
  currentProduct.attributes = {};
  currentProduct.customOptions = [];
  currentProduct.medias = {};
  currentProduct.selectedCustomOptions = {};
  currentProduct.selectedOptions = {};

  // const { onPressAddToCart } = useAddToCart({
  //   product,
  //   cart,
  //   tempcustomer,
  //   currentProduct,
  // });

  //  const renderAddToCartButton = () => {
  //   if (cart.addToCartLoading) {
  //     return <Spinner />;
  //   }
  //   return (
  //     <Button  onPress={onPressAddToCart}>
  //       {translate('product.addToCartButton')}
  //     </Button>
  //   );
  // };

  const image = () => {
    if (products && products[item.sku]) {
      return getProductThumbnailFromAttribute(products[item.sku]);
    }
  };
  const DiscountParentage = () => {
    if (products && products[item.sku]) {
      let discountPrice =
        products[item.sku].extension_attributes.price_with_vat;
      let basePrice = finalPrice(products[item.sku].price);
      if (discountPrice < basePrice) {
        const savingPercent = Math.round(
          ((basePrice - discountPrice) / basePrice) * 100
        );
        return (
          <Text style={styles.textStyle(theme)}>
            {savingPercent} % <Text style={styles.textStyle(theme)}>OFF</Text>
          </Text>
        );
      }
    }
  };

  const renderPrice = () => {
    if (products && products[item.sku]) {
      let basePrice = finalPrice(products[item.sku].price);
      let discountPrice =
        products[item.sku].extension_attributes.price_with_vat;
      if (!discountPrice) {
        return (
          <Price
            style={{
              fontSize: 16,
              color: '#F37A20',
              fontWeight: '700',
              marginLeft: 10,
            }}
            basePrice={finalPrice(product.price)}
            discountPrice={product.extension_attributes.price_with_vat}
            currencySymbol={currencySymbol}
            currencyRate={currencyRate}
          />
        );
      }
      return (
        <Price
          style={{
            fontSize: 16,
            color: '#F37A20',
            fontWeight: '700',
            marginLeft: 10,
          }}
          basePrice={finalPrice(product.price)}
          discountPrice={product.extension_attributes.price_with_vat}
          currencySymbol={currencySymbol}
          currencyRate={currencyRate}
        />
      );
    }
  };

  const onPressRemoveItem = () => {
    const type = 'delete';
    Alert.alert(
      translate('cartListItem.removeItemDialogTitle'),
      `${translate('cartListItem.removeItemDialogMessage')}: ${item.name}`,
      [
        {
          text: translate('common.cancel'),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: translate('common.ok'),
          onPress: () => performRemoveItem(type, quantity),
        },
      ],
      { cancelable: true }
    );
  };

  const performRemoveItem = async (type, quantity) => {
    await _removeFromCartLoading(item.item_id);
    await _removeFromCart({
      cart,
      item,
      type,
      quantity,
      cartId,
    });
    // refreshes cart
    setTimeout(() => {
      onDeleteItem();
    }, 1000);
  };

  const imageUri = image();

  return (
    <View>
      <View style={styles.container(theme)}>
        <View style={styles.image}>
          <Image
            style={styles.imageStyle(theme)}
            resizeMode="contain"
            source={{ uri: imageUri }}
          />
          {/* <View         //DicountPercentage tag for later use.
            style={{
              width: 45,
              height: 45,
              backgroundColor: '#F37A20',
              borderRadius: 50,
              borderWidth: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              left: -5,
              top: -5,
            }}>
            <Text style={{ fontSize: 13, color: '#fff' }}>
              {DiscountParentage()}
            </Text>
          </View> */}
        </View>

        <View style={styles.infoStyle}>
          <Text style={styles.textStyle2(theme)}>{item.name}</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={styles.textStyle2(theme)}>
              {/* <Text style={{
           fontSize:16,
           color:"#F37A20",
           fontWeight:"700",
           marginLeft:10
         }}>{item.price} AED</Text> */}
              {renderPrice()}
            </View>
            {/* quantity */}
            {/* <Price
            basePrice={item.price}
            currencySymbol={currencySymbol}
            currencyRate={currencyRate}
          /> */}
            {/* Quantity box */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                style={[
                  styles.incrementDecrement,
                  { backgroundColor: '#DBDBDB' },
                ]}
                onPress={decraseQuantity}
              >
                <Text style={styles.incrementDecrementText}>-</Text>
              </TouchableOpacity>
              <Text> {quantity} </Text>
              <TouchableOpacity
                style={[
                  styles.incrementDecrement,
                  { backgroundColor: '#8BC63E' },
                ]}
                onPress={increaseQuantity}
              >
                <Text
                  style={[styles.incrementDecrementText, { color: 'white' }]}
                >
                  +
                </Text>
              </TouchableOpacity>
              {cart.removingItemId === item.item_id ? (
                <View style={styles.spinnerWrapper(theme)}>
                  <Spinner />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onPressRemoveItem}
                  style={{ marginLeft: 10 }}
                >
                  <Image
                    source={deleteIcon}
                    style={{ width: 22, height: 22 }}
                    resizeMode={'contain'}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: 5,
          paddingRight: 8,
        }}
      >
        <Text
          style={{
            color: '#8BC63E',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Total: AED{' '}
          {products && products[item.sku]
            ? (
                products[item.sku].extension_attributes.price_with_vat *
                quantity
              ).toFixed(2)
            : item.extension_attributes.price_with_vat * quantity}
        </Text>
      </View>
    </View>
  );
  Ω;
};

const styles = {
  container: (theme) => ({
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    borderColor: '#f2eded',
    borderBottomWidth: 1,
    backgroundColor: theme.colors.surface,
  }),

  infoStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 2,
  },
  textStyle: (theme) => ({
    flex: 1,
    padding: theme.spacing.small,
    color: '#fff',
    fontSize: 12,
  }),
  textStyle2: (theme) => ({
    flex: 1,
    padding: theme.spacing.small,
  }),
  button: {
    borderRadius: 10,
  },
  imageStyle: (theme) => ({
    width: 100,
    height: 95,
    resizeMode: 'contain',
    position: 'relative',
  }),
  percentageStyle: (theme) => ({
    fontSze: 15,
    color: '#8BC63E',
    paddingHorizontal: 5,
  }),
  removeContainer: {
    backgroundColor: 'red',
  },
  spinnerWrapper: (theme) => ({
    marginRight: theme.spacing.small,
  }),
  incrementDecrement: {
    height: 32,
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  incrementDecrementText: {
    fontSize: 14,
  },
};

CartListItem.propTypes = {
  products: PropTypes.object,
  item: PropTypes.object.isRequired,
  cart: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  removeFromCartLoading: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

CartListItem.defaultProps = {
  products: {},
};

const mapStateToProps = ({ cart }) => {
  const { products, cartId } = cart;
  return {
    cart,
    products,
    cartId,
  };
};

export default connect(mapStateToProps, {
  removeFromCartLoading,
  removeFromCart,
})(CartListItem);
