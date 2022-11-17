import React, { useContext, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { View, FlatList, StyleSheet, Text, SafeAreaView } from 'react-native';
import { setCurrentCategory, resetFilters } from '../../actions/index';
import { ProductListItem } from './ProductListItem';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Spinner } from './Spinner';

const COLUMN_COUNT = 2;

const ProductListComp = ({
  onRowPress,
  currencySymbol,
  currencyRate,
  canLoadMoreContent,
  products,
  onEndReached,
  refreshControl,
  gridColumnsValue,
  searchIndicator,
  categoryTree,
  selectedFilter,
}) => {
  const theme = useContext(ThemeContext);
  const dispatch = useDispatch();

  const categories =
    categoryTree && categoryTree.children_data
      ? categoryTree.children_data.filter((data) => data.name === 'Categories')
      : [];
  const renderItemRow = ({ item, index }) => (
    <ProductListItem
      imageStyle={styles.imageStyle}
      viewContainerStyle={{ flex: 1 }}
      product={item}
      onRowPress={onRowPress}
      currencySymbol={currencySymbol}
      currencyRate={currencyRate}
    />
  );

  useEffect(() => {
    if (selectedFilter !== null) {
      dispatch(resetFilters());
      dispatch(setCurrentCategory({ category: selectedFilter }));
    } else {
      dispatch(resetFilters());
      dispatch(setCurrentCategory({ category: categories[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedFilter]);

  const renderItemColumn = ({ item, index }) => (
    <ProductListItem
      viewContainerStyle={{
        width: theme.dimens.WINDOW_WIDTH / COLUMN_COUNT,
        // borderRightColor: theme.colors.border,
        borderRightColor: 0,
        borderRightWidth:
          index % COLUMN_COUNT !== COLUMN_COUNT - 1
            ? theme.dimens.productListItemInBetweenSpace
            : 0,
      }}
      columnContainerStyle={styles.columnContainerStyle}
      textStyle={styles.textStyle}
      infoStyle={styles.infoStyle}
      product={item}
      onRowPress={onRowPress}
      currencySymbol={currencySymbol}
      currencyRate={currencyRate}
    />
  );

  const renderFooter = () => {
    if (canLoadMoreContent) {
      return <Spinner style={{ padding: theme.spacing.large }} />;
    }

    return null;
  };

  const renderItemSeparator = () => (
    <View style={styles.itemSeparator(theme)} />
  );

  const renderContent = () => {
    if (!products) {
      return <Spinner />;
    }
    if (products.length) {
      return (
        <FlatList
          refreshControl={refreshControl}
          data={products}
          renderItem={gridColumnsValue ? renderItemRow : renderItemColumn}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          contentContainerStyle={styles.contentContainerStyle}
          ListFooterComponent={renderFooter}
          numColumns={gridColumnsValue ? 1 : 2}
          key={gridColumnsValue ? 'ONE COLUMN' : 'TWO COLUMNS'}
          ItemSeparatorComponent={renderItemSeparator}
          showsVerticalScrollIndicator={false}
        />
      );
    }
    if (!searchIndicator) {
      return (
        <View style={styles.notFoundTextWrap}>
          <Text style={styles.notFoundText}>
            {translate('errors.noProduct')}
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container(theme)}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemSeparator: (theme) => ({
    height: theme.dimens.productListItemInBetweenSpace,
    flex: 1,
  }),
  container: (theme) => ({
    flex: 1,

    width: theme.dimens.WINDOW_WIDTH,
  }),

  notFoundTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  notFoundText: {
    textAlign: 'center',
  },
  infoStyle: {
    flexDirection: 'column',
  },
  textStyle: {
    flexDirection: 'column',
    marginTop: 0,
    padding: 0,
  },
  imageStyle: {
    flex: 1,
  },
  columnContainerStyle: {
    flexDirection: 'column',
  },
  contentContainerStyle: { paddingBottom: 20 },
  separator: (theme) => ({
    width: 1,
  }),
});

ProductListComp.propTypes = {
  onRowPress: PropTypes.func,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  performSort: PropTypes.func,
  navigation: PropTypes.object.isRequired,
  canLoadMoreContent: PropTypes.bool.isRequired,
  products: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.bool,
  ]),
  onEndReached: PropTypes.func,
  refreshControl: PropTypes.element,
  gridColumnsValue: PropTypes.bool.isRequired,
  searchIndicator: PropTypes.bool,
};

ProductListComp.defaultProps = {
  onRowPress: () => {},
  performSort: () => console.log('Perform Sort function not sent in props'),
  onEndReached: () => {},
  refreshControl: <></>,
  searchIndicator: false,
};

const mapStateToProps = ({ categoryTree, home }) => ({
  categoryTree,
  refreshing: categoryTree.refreshing,
  featuredProducts: home.featuredProducts,
});

const ProductList = connect(mapStateToProps)(ProductListComp);

export { ProductList };
