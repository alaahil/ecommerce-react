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

const Category = ({
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
}) => {
  const theme = useContext(ThemeContext);
  const selector = useRef(null);
  const dispatch = useDispatch();
  const listTypeGrid = false; //useSelector(({ ui }) => ui.listTypeGrid);
  const [selectedMoreFilter, setSelectedMoreFilter] = useState(null);

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

  const categories = (categoryTree && categoryTree.children_data)? categoryTree.children_data.filter(
    data => data.name === 'Categories',
  ):[];

  const flashCategory = featuredProducts[FLASH_CATEGORY_ID];

  const filterData = (categories.length>0)?getCategoriesChildrenWithData(categories[0]):[];

  useEffect(() => {
    const categories = categoryTree.children_data.filter(
      data => data.name === 'Categories',
    );

    dispatch(resetFilters());
    dispatch(setCurrentCategory({ category: categories[0] }));
  }, [categoryTree.children_data, dispatch]);

  useEffect(() => {
    _addFilterData({ categoryScreen: true });
    _getProductsForCategoryOrChild(category);
  }, [_addFilterData, _getProductsForCategoryOrChild, category]);

  useEffect(() => {
    _getCategoryTree();
  }, [_getCategoryTree]);

  const onRowPress = product => {
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
        priceFilter,
      );
    }
  };

  const renderAllCategoriesFilters = () => {
    return (
      <FlatList
        style={{ width: '100%', flex: 1, paddingLeft: 10, maxHeight: 160 }}
        data={filterData}
        renderItem={renderCategoryHorizontalList}
        scrollEnabled={false}
      />
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
      style={[
        styles.moreFilterPillStyle,
        { backgroundColor: isSelected ? '#759744' : undefined },
      ]}
      onPress={onPressFilter}>
      <Text
        style={[
          styles.moreFilterText,
          { color: isSelected ? '#fff' : '#759744' },
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryHorizontalList = ({ item }) => {
    if (!item.isActive) {
      return null;
    }
    return (
      <View
        style={{ flexDirection: 'row', marginTop: 15, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>
          {item.name}
        </Text>
        {
          <FlatList
            data={item.data}
            horizontal
            contentContainerStyle={{ alignItems: 'center' }}
            style={{ flex: 1 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.is_active) {
                return (
                  <MoreFilter
                    title={item.name}
                    onPressFilter={() => setSelectedMoreFilter(item)}
                    isSelected={
                      selectedMoreFilter
                        ? selectedMoreFilter.id === item.id
                        : false
                    }
                  />
                );
              }
              return null;
            }}
          />
        }
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.topButtonContainer}>
        <TouchableOpacity
          style={styles.flashSalesContainer}
          onPress={onFlashSalePress}>
          <Text style={styles.flashSalePillText}>Flash Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setSelectedMoreFilter(null);
          }}
          style={[
            styles.resetFilterContainer,
            {
              borderColor: selectedMoreFilter === null ? 'grey' : '#8BC63E',
              backgroundColor:
                selectedMoreFilter === null ? undefined : '#8BC63E',
            },
          ]}
          disabled={selectedMoreFilter === null}>
          <Text
            style={{
              color: selectedMoreFilter === null ? 'grey' : 'white',
              fontWeight: 'bold',
              textAlign: 'center',
            }}>
            Reset Filters
          </Text>
        </TouchableOpacity>
      </View>
      {renderAllCategoriesFilters()}
    </>
  );

  const renderSortingBar = () => (
    <View style={{ flexDirection: 'row' }}>
      <ModalSelector
        style={styles.iconWrapper(theme)}
        data={sortData}
        ref={component => {
          selector.current = component;
        }}
        customSelector={
          <TouchableOpacity
            style={styles.iconWrapper(theme)}
            onPress={() => selector.current.open()}>
            <Icon name="filter-outline" size={20} color="#759744" />
            <Text style={styles.headerTextStyle(theme)}>
              {translate('common.sort')}
            </Text>
          </TouchableOpacity>
        }
        onChange={option => performSort(option.key)}
      />
      <TouchableOpacity
        style={styles.iconWrapper(theme)}
        onPress={() => navigation.toggleFilterDrawer()}>
        <Icon name="tune-vertical" size={20} color="#759744" />
        <Text style={styles.headerTextStyle(theme)}>
          {translate('common.filter')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const performSort = _sortOrder => {
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

Category.navigationOptions = ({ navigation }) => ({
  title: navigation.state.params?.title.toUpperCase(),
  headerBackTitle: ' ',
  headerRight: () => '',
});

const styles = StyleSheet.create({
  containerStyle: theme => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  iconWrapper: theme => ({
    flex: 1,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  headerTextStyle: theme => ({
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#759744',
    minWidth: 64,
    marginRight: 10,
  },
  moreFiltersContainer: { flexDirection: 'row', paddingVertical: 20 },
  moreFilterText: {
    fontSize: 14,
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

Category.propTypes = {
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
};

Category.defaultProps = {};

const mapStateToProps = state => {
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
  const canLoadMoreContent = products.length < totalCount;

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
})(Category);
