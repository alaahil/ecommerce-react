/**
 * Created by Dima Portenko on 14.05.2020
 */
import React, { useContext, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import HTML from 'react-native-render-html';
import { Button, Price, Spinner, Text } from '../common';
import { translate } from '../../i18n';
import { ThemeContext } from '../../theme';
import { getConfigurableProductOptions, getCustomOptions } from '../../actions';

import { ProductMediaContainer } from './ProductMediaContainer';
import { finalPrice } from '../../helper/price';
import { ProductOptions } from './ProductOptions';
import { ProductCustomOptions } from './ProductCustomOptions';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useProductDescription } from '../../hooks/useProductDescription';

import { ProductReviews } from './reviews/ProductReviews';
import { ReviewFormContainer } from './reviews/ReviewFormContainer';
import { magentoOptions } from '../../config/magento';

import { Card } from 'react-native-shadow-cards';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../constant/constant';

export const ProductScreen = (props) => {
  const [defaultRating, setDefaultRating] = useState(4);
  const [maxRating, setMaxRating] = useState([1, 2, 3, 4, 5]);

  const starImageField =
    'https://raw.githubusercontent.com/tranhonghan/images/main/star_filled.png';
  const starImageCorner =
    'https://raw.githubusercontent.com/tranhonghan/images/main/star_corner.png';

  const { cart, currencyRate, currencySymbol, customer, current, brandObj } =
    useSelector((state) => mapStateToProps(state));

  const dispatch = useDispatch();
  const params = props.navigation?.state?.params
    ? props.navigation?.state?.params
    : {};
  const theme = useContext(ThemeContext);
  const [product] = useState(params.product);
  const [currentProduct, setCurProduct] = useState(current[product.id]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemCount, setItemCount] = useState(1);
  const [isInStock, setInStock] = useState('false');
  const [region, setRegion] = useState('');
  const productBrand = product?.custom_attributes?.filter(
    (item) => item.attribute_code === 'product_brand'
  );
  const brand = productBrand?.length ? productBrand[0] : {};
  const brandValue = brand?.value || null;

  const { onPressAddToCart } = useAddToCart({
    product,
    cart,
    customer,
    currentProduct,
    itemCount,
    region,
  });
  const { shortdescription, description } = useProductDescription({
    product,
  });

  const showReview = false;

  useEffect(() => {
    AsyncStorage.getItem('store').then((res) => {
      //  console.log("Product", "Product ==> " + JSON.stringify(product));
      // console.log(" product.extension_attributes['is_in_stock_s44']",  product.extension_attributes['is_in_stock_s44'])
      // console.log(" product.extension_attributes['is_in_stock_s45']",  product.extension_attributes['is_in_stock_s45'])
      // console.log(" product.extension_attributes['is_in_stock']",  product.extension_attributes['is_in_stock'])

      if (
        res === 's44' &&
        product.extension_attributes.is_in_stock_s44 == true
      ) {
        setInStock('true');
      } else if (
        res === 's45' &&
        product.extension_attributes.is_in_stock_s45 == true
      ) {
        setInStock('true');
      } else if (product.extension_attributes.is_in_stock == true) {
        setInStock('true');
      } else {
        setInStock('false');
      }
      setRegion(res);
    });

    // "is_in_stock": false,
    // "is_in_stock_s44": false,
    // "is_in_stock_s45": false

    //   ['Dubai']: 's44',
    // ['Abu Dhabi']: 's45',
    // ['Al Ain']: 's45',
    // ['Ajman']: 's44',
    // ['Sharjah']: 's44',
    // ['Fujairah']: 's44',
    // ['Ras Al Khaimah']: 's44',
    // ['Umm Al Quwain']: 's44',

    if (product.type_id === 'configurable') {
      dispatch(getConfigurableProductOptions(product.sku, product.id));
    }
    dispatch(
      getCustomOptions(product.sku, product.id)
    ); /*The custom options are available on all product types. */
  }, []); // eslint-disable-line

  const quantityIncrement = () => {
    axios
      .get(`${BASE_URL}/${region}/rest/V1/stockStatuses/${product.sku}`, {
        headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
      })
      .then((response) => {
        if (response.data.qty >= itemCount + 1) {
          setItemCount(itemCount + 1);
        } else {
          alert('not enough quantity');
        }
      });
  };
  useEffect(() => {
    setCurProduct(current[product.id]);
  }, [current, product.id]);

  const toggleDrawer = () => {
    props.navigation.toggleDrawer();
  };

  useEffect(() => {
    props.navigation.setParams({ toggleDrawer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPrice = () => {
    if (selectedProduct) {
      return (
        <Price
          basePrice={finalPrice(selectedProduct.price)}
          discountPrice={selectedProduct.extension_attributes.price_with_vat}
          currencySymbol={currencySymbol}
          currencyRate={currencyRate}
        />
      );
    }
    return (
      <Price
        style={styles.priceContainer}
        basePrice={finalPrice(product.price)}
        discountPrice={product.extension_attributes.price_with_vat}
        currencySymbol={currencySymbol}
        currencyRate={currencyRate}
      />
    );
  };

  const renderAddToCartButton = () => {
    if (cart.addToCartLoading) {
      return <Spinner />;
    }
    return (
      <Button
        style={styles.buttonStyle(theme)}
        onPress={onPressAddToCart}
        disabled={isInStock === 'true' ? false : true}
      >
        {translate('product.addToCartButton')}
      </Button>
    );
  };

  return (
    <ScrollView
      style={styles.container(theme)}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#37474F',
            textAlign: 'center',
            paddingTop: 15,
            paddingBottom: 0,
          }}
        >
          {''}
        </Text>
      </View>
      <View
        style={{
          backgroundColor: '#fffffff5',
        }}
      >
        <Card
          style={{
            marginLeft: 20,
            marginVertical: 10,
            borderRadius: 10,
            borderBottomRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ProductMediaContainer
            product={product}
            key={selectedProduct?.sku}
            selectedProductSku={selectedProduct?.sku}
          />
        </Card>
        {renderAddToCartButton()}
      </View>
      <View
        style={
          (styles.textDerection,
          {
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
          })
        }
      >
        <View
          style={{
            width: '60%',
          }}
        >
          <Text
            type="heading"
            style={{
              color: '#37474F',
              fontWeight: '700',
              padding: 10,
              fontSize: 15,
              lineHeight: 20,
            }}
          >
            {product.name}
          </Text>
        </View>
        <View
          style={{
            width: '40%',
            paddingTop: 20,
          }}
        >
          <Text style={styles.priceContainer}>{renderPrice()}</Text>
        </View>
      </View>
      {/* Rating Option */}
      {/* <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          paddingHorizontal: 10,
        }}>
        {maxRating.map((item, key) => {
          return (
            <TouchableOpacity activeOpacity={0.7} key={item}>
              <Image
                style={styles.star}
                source={
                  item <= defaultRating
                    ? { uri: starImageField }
                    : { uri: starImageCorner }
                }
              />
            </TouchableOpacity>
          );
        })}
        <View style={styles.flexBox}>
          <Text
            style={{
              color: '#999',
              fontWeight: '700',
              paddingLeft: 5,
              fontSize: 16,
            }}>
            4.27
          </Text>
          <Image
            source={bar}
            style={{
              height: 25,
              width: 20,
              resizeMode: 'contain',
            }}
          />
          <Text
            style={{
              color: '#8BC63E',
              fontWeight: '600',
              fontSize: 16,
            }}>
            11 Ratings
          </Text>
        </View>
      </View> */}

      {/* Shipping Icon */}
      {/* <View
        style={
          (styles.flexBox,
          {
            marginHorizontal: 10,
            paddingHorizontal: 8,
            height: 40,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: '#8BC63E',
            width: 160,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 15,
          })
        }>
        <Image
          source={truck}
          style={{
            width: 30,
            height: 30,
            resizeMode: 'contain',
          }}
        />
        <Text
          style={{
            paddingLeft: 8,
            color: '#8BC63E',
          }}>
          Free Shipping
        </Text>
      </View> */}
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.itemCountContainer}>
          <TouchableOpacity
            style={styles.counter}
            onPress={() => {
              itemCount !== 1 ? setItemCount(itemCount - 1) : null;
            }}
          >
            <Icon
              style={{ alignSelf: 'center' }}
              name="minus"
              color="#8BC63E"
              size={20}
            />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text>{itemCount}</Text>
          </View>
          <TouchableOpacity style={styles.counter} onPress={quantityIncrement}>
            <Icon
              name="plus"
              color="#8BC63E"
              size={20}
              style={{ alignSelf: 'center' }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginLeft: 18 }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Text style={{ fontWeight: 'bold', color: 'black' }}>
              {'Brand name : '}
            </Text>
            <Text style={{ color: '#8BC63E', fontWeight: 'bold' }}>
              {brandObj[brandValue]}
            </Text>
          </View>
          <View
            style={{
              marginTop: 6,
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Text style={{ fontWeight: 'bold', color: 'black' }}>SKU : </Text>
            <Text style={{ color: '#8BC63E', fontWeight: 'bold' }}>
              {product.sku}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              flex: 1,
              marginTop: 6,
            }}
          >
            <Text style={{ fontWeight: 'bold', color: 'black' }}>
              {'Availability '}
            </Text>
            <Text style={{ color: '#8BC63E', fontWeight: 'bold' }}>
              {isInStock === 'true' ? 'In stock' : 'Out of Stock'}
            </Text>
          </View>
        </View>
      </View>

      {/* Details Part */}
      <View>
        <Card style={styles.shadowProp}>
          <View
            style={
              (styles.flexBox,
              {
                // justifyContent:"space-around",
                flexDirection: 'row',
                borderWidth: 1,
                borderBottomColor: '#1023',
                borderRightWidth: 0,
                borderLeftWidth: 0,
                borderTopWidth: 0,
                width: '100%',
              })
            }
          >
            <TouchableOpacity>
              <Text
                style={{
                  padding: 8,
                  marginLeft: 10,
                  color: '#8BC63E',
                }}
              >
                Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description..Brother here use useEffect hook I am not doing this */}
          {description !== '' ? (
            <View style={styles.descriptionStyle}>
              <Text bold type="subheading" style={styles.productDetailTitle}>
                {translate('product.productDetailLabel')}
              </Text>
              <HTML html={description} />
            </View>
          ) : (
            <Text style={styles.descriptionStyle}>
              {translate('product.noProductDetail')}
            </Text>
          )}
        </Card>
      </View>
      {/* <Input
         containerStyle={styles.inputContainer(theme)}
         inputStyle={{ textAlign: 'center' }}
         autoCorrect={false}
         keyboardType="numeric"
         value={`${currentProduct.qtyInput}`}
         onChangeText={qty => dispatch(updateProductQtyInput(qty, product.id))}
       /> */}
      <ProductOptions
        product={product}
        currentProduct={currentProduct}
        setSelectedProduct={setSelectedProduct}
      />
      {magentoOptions.reviewEnabled && (
        <>
          <ProductReviews product={product} />
          <ReviewFormContainer product={product} />
        </>
      )}
      <ProductCustomOptions product={product} currentProduct={currentProduct} />
      <Text style={styles.errorStyle(theme)}>{cart.errorMessage}</Text>
      {/* <RelatedProducts
         product={product}
         currencyRate={currencyRate}
         currencySymbol={currencySymbol}
         navigation={props.navigation}
       />  */}
    </ScrollView>
  );
};

ProductScreen.navigationOptions = ({ navigation }) => {
  // return {
  //   header: (
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         alignItems: 'center',
  //         height: 53,
  //         justifyContent: 'space-around',
  //         backgroundColor: 'white',
  //       }}>
  //       <TouchableOpacity>
  //         <MaterialHeaderButtons>
  //           <Item
  //             style={styles.drawerMenu}
  //             title="menu"
  //             iconName="menu"
  //             onPress={navigation.getParam('toggleDrawer')}
  //           />
  //         </MaterialHeaderButtons>
  //       </TouchableOpacity>
  //       <View>
  //         <TopSearch />
  //       </View>
  //       <TouchableOpacity
  //         onPress={() => navigation.navigate(NAVIGATION_CART_PATH)}>
  //         <CartBadgeTop />
  //       </TouchableOpacity>
  //     </View>
  //   ),
  // };
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    //  backgroundColor: theme.colors.background,

    backgroundColor: '#fffffff5',
  }),
  textStyle: (theme) => ({
    padding: theme.spacing.small,
    textAlign: 'center',
  }),

  inputContainer: (theme) => ({
    width: 40,
    alignSelf: 'center',
    marginBottom: theme.spacing.extraLarge,
  }),
  buttonStyle: (theme) => ({
    alignSelf: 'center',
    marginTop: 10,
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    borderColor: '#8BC63E',
    borderRadius: 5,
    fontSize: 20,
  }),

  textDerection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    textAlign: 'center',
    paddingLeft: 20,
    width: 350,
  },
  descriptionStyle: {
    padding: 16,
  },
  flexBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadowProp: {
    width: '100%',
    height: 300,
    marginVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  productDetailTitle: {
    marginBottom: 4,
  },
  errorStyle: (theme) => ({
    textAlign: 'center',
    padding: theme.spacing.small,
    color: theme.colors.error,
  }),
  priceContainer: {
    alignSelf: 'flex-end',
    paddingRight: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#8BC63E',
  },
  star: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  itemCountContainer: {
    borderWidth: 1,
    borderColor: '#8BC63E',
    flexDirection: 'row',
    height: 40,
    width: '30%',
    marginTop: 14,
    marginLeft: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  counter: {
    padding: 8,
  },
});

const mapStateToProps = (state) => {
  const {
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
    brandObj,
  } = state.magento;

  const { cart, account } = state;

  return {
    cart,
    brandObj: brandObj || {},
    currencyRate,
    currencySymbol,
    customer: account.customer,
    current: state.product.current,
  };
};
