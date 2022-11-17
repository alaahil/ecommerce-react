import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import Swiper from 'react-native-swiper';
import { Text } from '../common';
import { magento } from '../../magento';
import { ThemeContext } from '../../theme';
import {
  addFilterData,
  getFeaturedCategoryProducts,
  getFilteredProducts,
  getProductBySKU,
  resetFilters,
  setCurrentCategory,
} from '../../actions';
import { result } from 'lodash';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_CATEGORY_DRILL_PATH,
  NAVIGATION_FEATURED_CATEGORIES,
  NAVIGATION_HOME_PRODUCT_PATH,
} from '../../navigation/routes';
import { getQueryParamsFromString } from '../../helper/queryParams';
import { useDispatch } from 'react-redux';

const HomeSlider = ({ slider, style, setCurrentProduct }) => {
  const theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const renderMediaItems = () =>
    slider.map((slide, index) => {
      return (
        <View key={index} style={styles.slide}>
          <TouchableOpacity
            onPress={() => {
              // magento.getProductsByCategoryId
              const param = getQueryParamsFromString(slide.slide_link);
              if (param?.brand) {
                const allItems = {
                  id: 91,
                  parent_id: 87,
                  name: 'All Items',
                  is_active: true,
                  position: 1,
                  level: 2,
                  product_count: 1121,
                  children_data: [],
                };
                dispatch(resetFilters());
                dispatch(setCurrentCategory({ category: allItems }));
                NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
                  title: allItems.name,
                  selectedCategory: allItems,
                });
                const priceFilter = {
                  price: {
                    condition: 'gteq,lteq',
                    value: '0.00',
                  },
                  product_brand: {
                    condition: 'like',
                    value: `%${param?.brand}%`,
                  },
                };
                setTimeout(() => {
                  dispatch(addFilterData(priceFilter));
                  dispatch(getFilteredProducts(91, '', '', param.brand, false));
                }, 1000);
              } else if (param?.sku) {
                getProductBySKU(param.sku, (result) => {
                  const product = result.payload.product;
                  setCurrentProduct({ product });
                  NavigationService.navigate(NAVIGATION_HOME_PRODUCT_PATH, {
                    product,
                    title: product.name,
                  });
                });
              } else if (param?.cat) {
                magento.admin.getCategory(param.cat).then((resp) => {
                  if (resp) {
                    const foundCategory = {
                      id: resp?.id,
                      parent_id: resp?.parent_id,
                      name: resp?.name,
                      is_active: resp.is_active,
                      position: resp?.position,
                      level: resp.level,
                      product_count: 1121,
                      children_data: [],
                    };
                    dispatch(resetFilters());
                    dispatch(setCurrentCategory({ category: foundCategory }));
                    NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
                      title: foundCategory.name,
                      selectedCategory: foundCategory,
                    });
                  }
                });
              }
              // getFeaturedCategoryProducts(slide.cid,(result)=>{
              //   // console.log("result==>", JSON.stringify(result));

              //   let products = result.payload.products;
              //   let title = "Featured Products"

              //   NavigationService.navigate(NAVIGATION_FEATURED_CATEGORIES, {
              //     products,
              //     title,
              //   });

              // })
            }}
          >
            <FastImage
              style={styles.imageStyle(theme)}
              resizeMode="stretch"
              source={{ uri: magento.getMediaUrl() + slide.slide_image_mobile }}
            />
          </TouchableOpacity>
          {/* <Text style={styles.slideTitle(theme)}>{slide.title}</Text> */}
        </View>
      );
    });

  return (
    <View style={[styles.imageContainer(theme), style]}>
      <Swiper
        showsPagination={false}
        pagingEnabled
        autoplay={true}
        loop={true}
        autoplayTimeout={6}
      >
        {renderMediaItems()}
      </Swiper>
    </View>
  );
};

HomeSlider.propTypes = {
  slider: PropTypes.array,
  style: PropTypes.object,
};

HomeSlider.defaultProps = {
  slider: [],
  style: {},
};

const styles = StyleSheet.create({
  imageContainer: (theme) => ({
    height: theme.dimens.WINDOW_HEIGHT * 0.3,
  }),
  imageStyle: (theme) => ({
    height: theme.dimens.WINDOW_HEIGHT * 0.3,
    width: theme.dimens.WINDOW_WIDTH,
    top: 0,
  }),
  slide: {
    alignItems: 'center',
  },
  slideTitle: (theme) => ({
    marginTop: theme.dimens.WINDOW_HEIGHT * 0.1,
    marginLeft: theme.dimens.WINDOW_WIDTH * 0.2,
    marginRight: theme.dimens.WINDOW_WIDTH * 0.2,
    position: 'absolute',
    fontSize: 24,
    color: theme.colors.white,
    textAlign: 'center',
  }),
});

export default HomeSlider;
