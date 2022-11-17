import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Text } from '../common';
import FeaturedProductItem from './FeaturedProductItem';
import { ThemeContext } from '../../theme';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_CATEGORY_DRILL_PATH,
  NAVIGATION_FEATURED_CATEGORIES,
} from '../../navigation/routes';
import { connect } from 'react-redux';
import {
  getCategoryTree,
  getProductsForCategoryOrChild,
  updateProductsForCategoryOrChild,
  setCurrentProduct,
  addFilterData,
  resetFilters,
  setCurrentCategory,
} from '../../actions';

const FeaturedProducts = ({
  style,
  title,
  products,
  currencySymbol,
  currencyRate,
  onPress,
  setCurrentProduct: _setCurrentProduct,
  headerCategoryData,
}) => {
  const theme = useContext(ThemeContext);

  const keyExtractor = (item) => item.id.toString();
  const arrow = require('../../../resources/images/dropdown.png');

  const onRowPress = () => {
    console.log('Category', headerCategoryData);
    if (headerCategoryData) {
      resetFilters();
      setCurrentCategory({ category: headerCategoryData });
      NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
        title: headerCategoryData.name,
        selectedCategory: headerCategoryData,
      });
    }

    // NavigationService.navigate(NAVIGATION_FEATURED_CATEGORIES, {
    //   products,
    //   title,
    // });
  };

  return (
    <View style={[styles.container(theme), style]}>
      <TouchableOpacity
        onPress={onRowPress}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 18,
          marginTop: 8,
        }}
      >
        <Text type="heading" style={styles.title}>
          {title}
        </Text>
        <FastImage
          style={{
            width: 10,
            height: 13,
            // marginRight: 15,
            fontSize: 12,
            alignSelf: 'center',
          }}
          source={arrow}
        />
      </TouchableOpacity>
      <FlatList
        horizontal
        data={products}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <FeaturedProductItem
            product={item}
            currencySymbol={currencySymbol}
            currencyRate={currencyRate}
            onPress={onPress}
          />
        )}
      />
    </View>
  );
};

FeaturedProducts.propTypes = {
  products: PropTypes.object,
  onPress: PropTypes.func,
  title: PropTypes.string,
  style: PropTypes.object,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
};

FeaturedProducts.defaultProps = {
  products: {},
  style: {},
};

const styles = StyleSheet.create({
  container: (theme) => ({
    //height: theme.dimens.WINDOW_HEIGHT * 0.3,
    paddingTop: 10,
    borderWidth: 0,
  }),
  title: {
    width: 229,
    // marginLeft: 14,
    fontSize: 17,
    // paddingTop: 15,
    color: '#1A051D',
    fontFamily: 'Inter-Medium',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});

const mapStateToProps = (state) => {
  const { category } = state.category.current;
  const categoryTree = state.categoryTree;
  return { category, categoryTree };
};

export default connect(mapStateToProps, {
  getProductsForCategoryOrChild,
  updateProductsForCategoryOrChild,
  setCurrentProduct,
  addFilterData,
  getCategoryTree,
  resetFilters,
  setCurrentCategory,
})(FeaturedProducts);
