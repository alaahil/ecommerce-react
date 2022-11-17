import React, { useContext, useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  View,
  RefreshControl,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  addFilterData,
  getProductsForCategoryOrChild,
  setCurrentProduct,
  updateProductsForCategoryOrChild,
  getCategoryTree,
  resetFilters,
  setCurrentCategory,
} from '../../actions';
import { ProductList } from '../common';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_HOME_PRODUCT_PATH,
  NAVIGATION_FEATURED_CATEGORIES,
} from '../../navigation/routes';
import { ThemeContext } from '../../theme';
import { getCategoriesChildrenWithData } from '../common/utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { translate } from '../../i18n';
import ModalSelector from 'react-native-modal-selector';

const CategoryDrill = ({
  canLoadMoreContent,
  loadingMore,
  products,
  totalCount,
  categoryTree,
  sortOrder, // Add its validation in prop-types
  priceFilter, // Add its validation in prop-types
  category,
  refreshing,
  navigation,
  currencySymbol,
  currencyRate,
  addFilterData: _addFilterData,
  getProductsForCategoryOrChild: _getProductsForCategoryOrChild,
  getCategoryTree: _getCategoryTree,
  setCurrentProduct: _setCurrentProduct,
  updateProductsForCategoryOrChild: _updateProductsForCategoryOrChild,
  featuredProducts,
  selectedCategory,
}) => {
  const theme = useContext(ThemeContext);
  const selector = useRef(null);
  const flatlistRef = useRef();
  const dispatch = useDispatch();
  const listTypeGrid = false; //useSelector(({ ui }) => ui.listTypeGrid);
  const [selectedMoreFilter, setSelectedMoreFilter] = useState(
    navigation.state.params.selectedCategory
  );
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const FLASH_CATEGORY_ID = '196';

  const sortData = [
    {
      label: translate('common.sortOption.aToZ'),
      key: 0,
    },
    {
      label: translate('common.sortOption.zToA'),
      key: 1,
    },
    {
      label: translate('common.sortOption.priceLowToHigh'),
      key: 2,
    },
    {
      label: translate('common.sortOption.priceHighToLow'),
      key: 3,
    },
  ];

  const categories =
    categoryTree && categoryTree.children_data
      ? categoryTree.children_data.filter((data) => data.name === 'Categories')
      : [];

  const flashCategory = featuredProducts[FLASH_CATEGORY_ID];

  const filterData =
    categories.length > 0 ? getCategoriesChildrenWithData(categories[0]) : [];

  useEffect(() => {
    dispatch(resetFilters());
    if (
      navigation?.state?.params?.selectedCategory?.id === 195 ||
      navigation?.state?.params?.selectedCategory?.id === 198
    ) {
      flatlistRef.current?.scrollToEnd();
    }
    dispatch(
      setCurrentCategory({
        category: navigation.state.params.selectedCategory,
      })
    );
    // if(navigation.state.params.selectedCategory.id === 91){
    //   setSelectedMoreFilter(null);
    //   setSelectedIndex(0);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryTree.children_data, dispatch]);

  useEffect(() => {
    _addFilterData({ categoryScreen: true });
    _getProductsForCategoryOrChild(category);
  }, [_addFilterData, _getProductsForCategoryOrChild, category]);

  // useEffect(() => {
  //   _getCategoryTree();
  // }, [_getCategoryTree]);

  const onRowPress = (product) => {
    _setCurrentProduct({ product });
    NavigationService.navigate(NAVIGATION_HOME_PRODUCT_PATH, {
      title: product.name,
      product: product,
    });
  };

  const onRefresh = () => {
    _updateProductsForCategoryOrChild(category, true);
  };

  const onEndReached = () => {
    if (!loadingMore && canLoadMoreContent) {
      _getProductsForCategoryOrChild(
        category,
        products.length,
        sortOrder,
        priceFilter
      );
    }
  };

  const renderAllCategoriesFilters = (navigation) => {
    let clubbedData = [];
    const selectedId = selectedMoreFilter.id;
    const selectedParentId = selectedMoreFilter.parent_id;
    const fifaDetails =
      categoryTree && categoryTree.children_data
        ? categoryTree.children_data.filter((data) => data.id === 2197)
        : [];
    let fifa = [];
    if (fifaDetails.length) {
      const fifaData = fifaDetails[0] || {};
      if (fifaData?.is_active) {
        fifa.push(fifaData);
      }
    }
    if (selectedId === 91) {
      clubbedData = [
        {
          id: 91,
          parent_id: 87,
          name: 'All Items',
          is_active: true,
          position: 0,
          level: 1,
          product_count: 100,
          children_data: categories[0].children_data,
        },
      ];
    }
    if (selectedId === 91 || selectedId === 196) {
      clubbedData = [
        ...clubbedData,
        {
          id: 196,
          parent_id: 87,
          name: 'Flash Sales',
          is_active: true,
          position: 10,
          level: 4,
          product_count: 53,
          children_data: [],
        },
      ];
    }
    if (fifa.length && (selectedId === 91 || selectedId === 2197)) {
      clubbedData = [...clubbedData, ...fifa];
    }
    let newProductData = [];
    if (selectedId === 91 || selectedId === 195) {
      newProductData = [
        {
          id: 195,
          parent_id: 87,
          name: 'New Products',
          is_active: true,
          position: 2,
          level: 2,
          product_count: 100,
          children_data: [],
        },
      ];
    }
    if (selectedId === 91 || selectedId === 198) {
      newProductData = [
        ...newProductData,
        {
          id: 198,
          parent_id: 87,
          name: 'Best Sellers',
          is_active: true,
          position: 5,
          level: 2,
          product_count: 57,
          children_data: [],
        },
      ];
    }
    if (selectedId === 91) {
      filterData.map((item) => {
        if (item.isActive) {
          clubbedData = [...clubbedData, ...item.data];
        }
      });
    } else if (selectedId !== 195 && selectedId !== 196 && selectedId !== 198) {
      filterData?.map((item) => {
        item?.data?.map((subItem) => {
          if (
            (subItem?.isActive || subItem?.is_active) &&
            subItem?.parent_id === selectedMoreFilter.parent_id
          ) {
            clubbedData = [...clubbedData, subItem];
          }
        });
      });
    }
    clubbedData = [...clubbedData, ...newProductData];

    return (
      <View>
        <FlatList
          data={clubbedData}
          ref={flatlistRef}
          initialNumToRender={50}
          maxToRenderPerBatch={50}
          horizontal
          contentContainerStyle={{ alignItems: 'center' }}
          style={{ paddingHorizontal: 10, marginVertical: 10 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            if (item.is_active) {
              return (
                <MoreFilter
                  title={item.name}
                  onPressFilter={() => {
                    navigation.setParams({ title: item.name });
                    setSelectedIndex(index);
                    if (item.id === -1) {
                      setSelectedMoreFilter(null);
                    } else {
                      setSelectedMoreFilter(item);
                    }
                  }}
                  isSelected={
                    selectedMoreFilter
                      ? selectedMoreFilter.id === item.id
                      : selectedIndex === 0 && item.id === 91
                      ? true
                      : false
                  }
                />
              );
            }
            return null;
          }}
        />
      </View>
    );
  };

  const onFlashSalePress = () => {
    NavigationService.navigate(NAVIGATION_FEATURED_CATEGORIES, {
      products: flashCategory,
      title: 'Flash Sales',
    });
  };

  const MoreFilter = ({ isSelected, onPressFilter, title }) => (
    <TouchableOpacity
      style={[styles.moreFilterPillStyle]}
      onPress={onPressFilter}
    >
      <Text
        style={[
          styles.moreFilterText,
          { color: isSelected ? '#759744' : '#000000' },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* <View style={styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.flashSalesContainer}
          onPress={onFlashSalePress}>
          <Text style={styles.flashSalePillText}>Flash Sales</Text>
        </TouchableOpacity>
      </View> */}
      {renderAllCategoriesFilters(navigation)}
    </>
  );

  const renderSortingBar = () => (
    <View style={{ flexDirection: 'row' }}>
      <ModalSelector
        style={styles.iconWrapper(theme)}
        data={sortData}
        ref={(component) => {
          selector.current = component;
        }}
        customSelector={
          <TouchableOpacity
            style={styles.iconWrapper(theme)}
            onPress={() => selector.current.open()}
          >
            <Icon name="filter-outline" size={20} color="#759744" />
            <Text style={styles.headerTextStyle(theme)}>
              {translate('common.sort')}
            </Text>
          </TouchableOpacity>
        }
        onChange={(option) => performSort(option.key)}
      />
      <TouchableOpacity
        style={styles.iconWrapper(theme)}
        onPress={() => navigation.toggleFilterDrawer()}
      >
        <Icon name="tune-vertical" size={20} color="#759744" />
        <Text style={styles.headerTextStyle(theme)}>
          {translate('common.filter')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const performSort = (_sortOrder) => {
    _addFilterData(_sortOrder);
    _getProductsForCategoryOrChild(category, null, _sortOrder, priceFilter);
  };

  return (
    <View style={styles.wrapper}>
      {renderHeader()}

      <View style={styles.containerStyle(theme)}>
        {renderSortingBar()}
        <ProductList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          products={products}
          onEndReached={onEndReached}
          canLoadMoreContent={canLoadMoreContent}
          onRowPress={onRowPress}
          navigation={navigation}
          gridColumnsValue={listTypeGrid}
          performSort={performSort}
          sortOrder={sortOrder}
          currencySymbol={currencySymbol}
          currencyRate={currencyRate}
          selectedFilter={selectedMoreFilter}
        />
      </View>
    </View>
  );
};

CategoryDrill.navigationOptions = ({ navigation }) => ({
  title: navigation.state.params?.title.toUpperCase(),
  headerBackTitle: ' ',
  headerRight: () => '',
});

const styles = StyleSheet.create({
  containerStyle: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  iconWrapper: (theme) => ({
    flex: 1,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  headerTextStyle: (theme) => ({
    textTransform: 'capitalize',
    color: '#759744',
    marginLeft: theme.spacing.small,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  }),
  flashSalesContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#8BC63E',
  },
  topButtonContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  wrapper: {
    backgroundColor: 'white',
    flex: 1,
  },
  flashSalePillText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  moreFilterPillStyle: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 64,
    marginRight: 10,
  },
  moreFiltersContainer: { flexDirection: 'row', paddingVertical: 20 },
  moreFilterText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetFilterContainer: {
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    width: '30%',
    alignSelf: 'flex-end',
    padding: 3,
  },
});

CategoryDrill.propTypes = {
  canLoadMoreContent: PropTypes.bool.isRequired,
  loadingMore: PropTypes.bool.isRequired,
  products: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.bool,
  ]),
  totalCount: PropTypes.number.isRequired,
  category: PropTypes.object,
  refreshing: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  addFilterData: PropTypes.func.isRequired,
  getProductsForCategoryOrChild: PropTypes.func.isRequired,
  setCurrentProduct: PropTypes.func.isRequired,
  updateProductsForCategoryOrChild: PropTypes.func.isRequired,
  selectedCategory: PropTypes.object,
};

CategoryDrill.defaultProps = {};

const mapStateToProps = (state) => {
  const { category } = state.category.current;
  const categoryTree = state.categoryTree;
  const featuredProducts = state.home.featuredProducts;
  const { products, totalCount, loadingMore, refreshing } = state.category;
  const {
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
  } = state.magento;
  const { priceFilter, sortOrder } = state.filters;
  const productLength = products.length || 0;
  const canLoadMoreContent = productLength < totalCount;
  return {
    category,
    categoryTree,
    products,
    totalCount,
    canLoadMoreContent,
    loadingMore,
    refreshing,
    priceFilter,
    sortOrder,
    currencySymbol,
    currencyRate,
    featuredProducts,
  };
};

export default connect(mapStateToProps, {
  getProductsForCategoryOrChild,
  updateProductsForCategoryOrChild,
  setCurrentProduct,
  addFilterData,
  getCategoryTree,
})(CategoryDrill);
