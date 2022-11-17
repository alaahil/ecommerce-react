import React, { useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text } from './Text';
import { Price } from './Price';
import place_holder2 from '../../assets/productDetails/place_holder2.png';
import { ThemeContext } from '../../theme';
import { finalPrice } from '../../helper/price';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useSelector } from 'react-redux';
import chilled from '../../assets/productDetails/chilled.png';
import frozen from '../../assets/productDetails/frozen.png';
import wishlistAdd from '../../../resources/images/wishlist_add.png';
import wishlistDone from '../../../resources/images/wishlist_done.png';
import { useAddToWishlist } from '../../hooks/useAddToWishlist';
import { magento } from '../../magento';

const WishlistItem = ({
  product,
  onRowPress,
  currencySymbol,
  currencyRate,
  imageStyle,
  infoStyle,
  textStyle,
  priceStyle,
  viewContainerStyle,
  columnContainerStyle,
}) => {
  const theme = useContext(ThemeContext);
  const addToCartImg = require('../../../resources/images/add-to-cart.png');
  const [isInStock, setIsInStock] = useState(true);
  const [itemCount, setItemCount] = useState(1);
  const [region, setRegion] = useState('');
  const { cart, customer, current, wishlistItemsIds } = useSelector((state) =>
    mapStateToProps(state)
  );
  const localWishListIds = wishlistItemsIds || [];

  // useEffect(() => {
  //   if (product?.extension_attributes?.is_in_stock) {
  //     setIsInStock(true);
  //   } else if (product?.extension_attributes?.is_in_stock_s44) {
  //     setIsInStock(true);
  //   } else if (product?.extension_attributes?.is_in_stock_s45) {
  //     setIsInStock(true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [product]);

  const { onPressAddToCart } = useAddToCart({
    product,
    cart,
    customer,
    currentProduct: product,
    itemCount,
    region,
  });
  const { onPressAddToWishlist, onPressRemoveToWishlist } = useAddToWishlist({
    productId: product?.entity_id,
    customerId: customer?.id,
  });
  const discountPrice = finalPrice(product?.special_price);
  const basePrice = finalPrice(product.price);
  const organicArray = product?.custom_attributes?.filter(
    (item) => item.attribute_code === 'organic'
  );
  const vgArray = product?.vg;
  const organic = organicArray?.length ? organicArray[0] : {};
  const vg = vgArray?.length ? vgArray[0] : {};
  const onPressWishlist = useCallback(() => {
    if (localWishListIds.includes(product.entity_id?.toString())) {
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
    <View style={viewContainerStyle}>
      <TouchableOpacity
        style={[styles.containerStyle(theme), columnContainerStyle]}
        onPress={() => {
          onRowPress(product);
        }}
      >
        {Math.round(parseFloat(discountPrice) * 1000000) <
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
          <TouchableOpacity onPress={onPressWishlist} style={styles.Image}>
            <FastImage
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
              source={
                localWishListIds.includes(product?.entity_id?.toString())
                  ? wishlistDone
                  : wishlistAdd
              }
            />
          </TouchableOpacity>
        </View>
        <View>
          <FastImage
            style={[styles.imageStyle(theme), imageStyle]}
            resizeMode="contain"
            source={
              product?.thumbnail
                ? { uri: magento.getProductMediaUrl() + product?.thumbnail }
                : place_holder2
            }
          />
        </View>
        <View style={[styles.infoStyle, infoStyle]}>
          <Text
            type="subheading"
            style={{ ...styles.textStyle(theme), ...textStyle }}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View style={styles.priceBox}>
            <View style={styles.text}>
              <Price
                style={styles.textStyle(theme)}
                basePrice={basePrice}
                discountPrice={discountPrice}
                currencyRate={currencyRate}
                currencySymbol={currencySymbol}
              />
            </View>
            <TouchableOpacity
              onPress={
                isInStock
                  ? onPressAddToCart
                  : () => {
                      alert('Product Out of Stock!');
                    }
              }
              style={styles.Image}
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

WishlistItem.propTypes = {
  product: PropTypes.shape({
    name: PropTypes.string,
    sku: PropTypes.string.isRequired,
    type_id: PropTypes.string,
    price: PropTypes.number,
    custom_attributes: PropTypes.arrayOf(
      PropTypes.shape({
        attribute_code: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      })
    ),
  }).isRequired,
  onRowPress: PropTypes.func,
  imageStyle: PropTypes.object,
  infoStyle: PropTypes.object,
  textStyle: PropTypes.object,
  priceStyle: PropTypes.object,
  viewContainerStyle: PropTypes.object,
  columnContainerStyle: PropTypes.object,
  brandObj: PropTypes.object,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
};

WishlistItem.defaultProps = {
  onRowPress: () => {},
  imageStyle: {},
  infoStyle: {},
  textStyle: {},
  priceStyle: {},
  viewContainerStyle: {},
  columnContainerStyle: {
    borderColor: 0,
  },
  brandObj: {},
};

const styles = {
  viewContainerStyle: (theme) => ({
    padding: theme.spacing.tiny,

    paddingBottom: 0,
  }),
  containerStyle: (theme) => ({
    flexDirection: 'column',
    flex: 1,
    borderWidth: 0,

    backgroundColor: '#F3F3F3',

    padding: 5,
    paddingVertical: 12,
    borderRadius: 20,

    marginTop: 20,
    borderColor: 0,
    marginHorizontal: 11,
  }),
  brandTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181725',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
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
  saleText: {
    fontWeight: '400',
    fontSize: 12,
    color: 'white',
  },

  infoStyle: {
    flexDirection: 'column',
    marginTop: 10,
    textAlign: 'left',
  },

  outOfStockText: {
    color: '#8b0000',
    position: 'absolute',
    bottom: 3,
    left: 5,
    fontSize: 12,
    marginTop: 3,
  },

  productImg: {
    alignItems: 'center',
  },

  priceBox: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    paddingBottom: 10,
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 2,
  },

  textStyle: (theme) => ({
    fontSize: 14,
    fontWeight: 'bold',
  }),
  imageStyle: (theme) => ({
    height: theme.dimens.productListItemImageHeight,
    margin: theme.spacing.small,
  }),
};

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

export { WishlistItem };
