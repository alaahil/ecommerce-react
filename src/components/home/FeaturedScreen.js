import React, { useContext, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { Spinner } from '../common/Spinner';
import FeaturedProductItem from './FeaturedProductItem';
import { setCurrentProduct } from '../../actions';
import { NAVIGATION_HOME_PRODUCT_PATH } from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
import { ProductListItem } from '../common/ProductListItem';
import { ThemeContext } from '../../theme';

const FeaturedScreen = ({
  navigation,
  canLoadMoreContent,
  refreshControl,
  gridColumnsValue,
  onEndReached,
  categoryTree,
  onRowPress,
  currencySymbol,
  currencyRate,
  setCurrentProduct,
}) => {
  const products = navigation.getParam('products');

  const theme = useContext(ThemeContext);

  const renderItemSeparator = () => (
    <View style={styles.itemSeparator(theme)} />
  );

  const renderFooter = () => {
    if (canLoadMoreContent) {
      return <Spinner style={{ padding: theme.spacing.large }} />;
    }
    return null;
  };

  const onPress = (product) => {
    setCurrentProduct({ product });
    NavigationService.navigate(NAVIGATION_HOME_PRODUCT_PATH, {
      product,
      title: product.name,
    });
  };

  const renderItem = ({ item, index }) => (
    <FeaturedProductItem
      product={item}
      currencySymbol={currencySymbol}
      currencyRate={currencyRate}
      onPress={() => onPress(item)}
    />
  );

  return (
    <FlatList
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      data={products}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      numColumns={2}
      style={{ backgroundColor: '#fff' }}
      columnWrapperStyle={{ justifyContent: 'center', flexWrap: 'wrap' }}
      ItemSeparatorComponent={renderItemSeparator}
    />
  );
};

const styles = StyleSheet.create({
  itemSeparator: (theme) => ({
    height: theme.dimens.productListItemInBetweenSpace,
    flex: 1,
  }),
  infoStyle: {
    flexDirection: 'column',
  },
  imageStyle: {
    flex: 1,
  },
  columnContainerStyle: {
    flexDirection: 'column',
  },
  textStyle: {
    flexDirection: 'column',
    marginTop: 0,
    padding: 0,
  },
  container: (theme) => ({
    flex: 1,
    width: theme.dimens.WINDOW_WIDTH,
  }),
});

const mapStateToProps = ({ categoryTree, magento }) => ({
  categoryTree,
  refreshing: categoryTree.refreshing,
  currencySymbol: magento.currency.displayCurrencySymbol,
  currencyRate: magento.currency.displayCurrencyExchangeRate,
});

export default connect(mapStateToProps, { setCurrentProduct })(FeaturedScreen);
