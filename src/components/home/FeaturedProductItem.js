import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text, Price } from '../common';
import {
  getProductThumbnailFromAttribute,
  getProductThumbnailFromAttributes,
} from '../../helper/product';
import { ThemeContext } from '../../theme';
import { finalPrice } from '../../helper/price';
import { useSelector } from 'react-redux';
import { useAddToCart } from '../../hooks/useAddToCart';
import place_holder2 from '../../assets/productDetails/place_holder2.png';
import frozen from '../../assets/productDetails/frozen.png';
import chilled from '../../assets/productDetails/chilled.png';
import wishlistDone from '../../../resources/images/wishlist_done.png';
import wishlistAdd from '../../../resources/images/wishlist_add.png';
import { useAddToWishlist } from '../../hooks/useAddToWishlist';
import { magento } from '../../magento';

const FeaturedProductItem = ({
  onPress,
  currencySymbol,
  currencyRate,
  product,
}) => {
  const theme = useContext(ThemeContext);
  const [themeStyles, setThemeStyle] = useState({});
  const [imageURI, setImageURI] = useState('');
  const [itemCount, setItemCount] = useState(1);
  const [region, setRegion] = useState('');
  const { cart, customer, wishlistItemsIds } = useSelector((state) =>
    mapStateToProps(state)
  );

  const [currentProduct, setCurProduct] = useState(product);
  const [isInStock, setIsInStock] = useState(false);

  useEffect(() => {
    setImageURI(getProductThumbnailFromAttributes(product));
    if (product?.extension_attributes?.is_in_stock) {
      setIsInStock(true);
    } else if (product?.extension_attributes?.is_in_stock_s44) {
      setIsInStock(true);
    } else if (product?.extension_attributes?.is_in_stock_s45) {
      setIsInStock(true);
    }
  }, [product]);
  useEffect(
    () =>
      setThemeStyle({
        image: styles.imageStyle(theme),
        text: styles.textStyle(theme),
      }),
    [theme]
  );

  useEffect(() => {
    setCurProduct(product);
  }, [product]);

  const { onPressAddToCart } = useAddToCart({
    product,
    cart,
    customer,
    currentProduct,
    itemCount,
    region,
  });
  const { onPressAddToWishlist, onPressRemoveToWishlist } = useAddToWishlist({
    productId: product.id,
    customerId: customer?.id,
  });
  const localWishListIds = wishlistItemsIds || [];

  const star = require('../../../resources/icons/star.png');
  const addToCartImg = require('../../../resources/images/add-to-cart.png');
  const arrow = require('../../../resources/images/dropdown.png');
  const discountPrice = product.extension_attributes.price_with_vat;
  const basePrice = finalPrice(product.price);
  const organicArray = product?.custom_attributes?.filter(
    (item) => item.attribute_code === 'organic'
  );

  const vgArray = product.custom_attributes.filter(
    (item) => item.attribute_code === 'vg'
  );
  const organic = organicArray?.length ? organicArray[0] : {};
  const vg = vgArray?.length ? vgArray[0] : {};

  const onPressWishlist = useCallback(() => {
    if (localWishListIds.includes(product.id?.toString())) {
      onPressRemoveToWishlist();
    } else {
      onPressAddToWishlist();
    }
  }, [
    localWishListIds,
    onPressAddToWishlist,
    onPressRemoveToWishlist,
    product,
  ]);

  return (
    <View style={styles.container(theme)}>
      <TouchableOpacity
        style={styles.containerStyle(theme)}
        onPress={() => {
          onPress(product);
        }}
      >
        {Math.round(parseFloat(discountPrice) * 1000000) !==
          Math.round(parseFloat(basePrice) * 1000000) && (
          <View style={styles.saleView}>
            <Text style={styles.saleText}>Sale</Text>
          </View>
        )}
        <View style={styles.rightAbsoluteView}>
          {organic.value === '1' && (
            <FastImage source={frozen} style={styles.rightImage} />
          )}
          {vg?.value === '1' && (
            <FastImage source={chilled} style={styles.rightImage} />
          )}
          {magento.isCustomerLogin() && (
            <TouchableOpacity onPress={onPressWishlist} style={styles.Image}>
              <FastImage
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                source={
                  localWishListIds.includes(product?.id?.toString())
                    ? wishlistDone
                    : wishlistAdd
                }
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.productImg}>
          <FastImage
            style={{ width: 160, height: 130 }}
            // resizeMode="contain"
            source={
              imageURI === 'place_holder' ? place_holder2 : { uri: imageURI }
            }
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoWeightRating}>
          {/* <Text style={styles.infoWeightRatingTxtLeft}> 200gm </Text> */}
          {/* <View style={styles.rating}>
            <FastImage style={{ width: 10, height: 10 }} source={star} />
            <Text style={styles.infoWeightRatingTxtRight}> 4.8 </Text>
          </View> */}
        </View>
        <View style={styles.infoStyle}>
          <Text
            type="subheading"
            //style={themeStyles.text}
            style={styles.text}
            ellipsizeMode="tail"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <View style={styles.priceBox}>
            <Price
              style={styles.priceTxtStyle}
              discountPrice={product.extension_attributes.price_with_vat}
              basePrice={finalPrice(product.price)}
              currencySymbol={currencySymbol}
              currencyRate={currencyRate}
            />
            <TouchableOpacity
              onPress={
                isInStock
                  ? onPressAddToCart
                  : () => {
                      Alert.alert('Bidfoodhome', 'Product Out of Stock!');
                    }
              }
            >
              <FastImage
                style={{ width: 32, height: 32 }}
                source={addToCartImg}
              />
            </TouchableOpacity>
          </View>
        </View>
        {!isInStock && <Text style={styles.outOfStockText}>Out of Stock</Text>}
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: (theme) => ({
    padding: theme.spacing.tiny,
    width: theme.dimens.WINDOW_WIDTH * 0.45,
    marginTop: 8,
    borderWidth: 0,
  }),
  containerStyle: (theme) => ({
    flexDirection: 'column',
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#F3F3F3', // theme.colors.surface,
    borderRadius: theme.dimens.borderRadius,
    padding: 5,
  }),
  infoStyle: {
    flexDirection: 'column',
  },
  infoWeightRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  infoWeightRatingTxtLeft: {
    fontSize: 11,
    textAlign: 'left',
  },
  infoWeightRatingTxtRight: {
    fontSize: 11,
    textAlign: 'right',
    color: '#FFFFFF',
  },
  productImg: {
    alignItems: 'center',
  },
  rating: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    padding: 2,
  },
  textStyle: (theme) => ({
    justifyContent: 'center',
    textAlign: 'center',
    flexDirection: 'column',
    marginTop: theme.spacing.small,
  }),
  priceStyle: {
    textAlign: 'center',
  },
  outOfStockText: {
    color: 'red',
    position: 'absolute',
    bottom: 3,
    left: 3,
    marginTop: 3,
    fontSize: 10,
  },
  imageStyle: (theme) => ({
    height: theme.dimens.homeProductImageHeight,
    width: theme.dimens.homeProductImageWidth,
  }),
  priceTxtStyle: {
    textAlign: 'left',
    fontSize: 10,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181725',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    // fontWeight:'bold',
    color: '#181725',
    fontFamily: 'Inter-Medium',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginTop: 20,
  },
  saleView: {
    padding: 4,
    position: 'absolute',
    left: 10,
    top: 10,
    backgroundColor: 'red',
    borderRadius: 8,
    zIndex: 9999,
  },
  saleText: {
    fontWeight: '400',
    fontSize: 12,
    color: 'white',
  },
  rightAbsoluteView: {
    position: 'absolute',
    right: 10,
    top: 6,
    zIndex: 9999,
    flexDirection: 'row',
  },
  rightImage: {
    height: 32,
    width: 32,
    resizeMode: 'contain',
  },
});
FeaturedProductItem.propTypes = {
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  onPress: PropTypes.func,
  product: PropTypes.object,
};
FeaturedProductItem.defaultProps = {};

const mapStateToProps = (state) => {
  const {
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
  } = state.magento;

  const { cart, account, wishlist } = state;

  return {
    cart,
    wishlistItemsIds: wishlist?.itemsIds || [],
    currencyRate,
    currencySymbol,
    customer: account.customer,
  };
};

export default FeaturedProductItem;
