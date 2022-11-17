import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../theme';
import { WishlistItem } from '../common/WishlistItem';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_SEARCH_PRODUCT_PATH } from '../../navigation/routes';
import { setCurrentProduct } from '../../actions';
import { getWishlistData } from '../../actions/WishlistAction';
import { Spinner, Text } from '../common';

export default function Wishlist({ navigation }) {
  const items = useSelector((state) => state.wishlist.items);
  const isLoading = useSelector((state) => state.wishlist.addToWishlistLoading);
  const {
    displayCurrencySymbol: currencySymbol,
    displayCurrencyExchangeRate: currencyRate,
  } = useSelector((state) => state.magento?.currency);
  const dispatch = useDispatch();

  useEffect(() => {
    // if (navigation.isFocused()) { getCustomerInfo(); }
    const focusListener = navigation.addListener('didFocus', () => {
      dispatch(getWishlistData());
    });
    return () => {
      focusListener.remove();
    };
  }, [dispatch, navigation]);

  const onRowPress = (product) => {
    dispatch(setCurrentProduct({ product }));
    NavigationService.navigate(NAVIGATION_SEARCH_PRODUCT_PATH, {
      product,
      title: product.name,
    });
  };
  const renderItem = ({ item, index }) => {
    return (
      <WishlistItem
        viewContainerStyle={{
          width: theme.dimens.WINDOW_WIDTH / 2,
          // borderRightColor: theme.colors.border,
          borderRightColor: 0,
          borderRightWidth:
            index % 2 !== 2 - 1
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
  };

  if (isLoading && !items?.length) {
    return (
      <View style={styles.container}>
        <Spinner />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        // style={styles.container}
        data={items}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.contentContainerStyle}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text>No Item found in wishlist</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  columnContainerStyle: {
    flexDirection: 'column',
  },
  infoStyle: {
    flexDirection: 'column',
  },
  emptyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Inter-Medium',
    fontWeight: '700',
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  textStyle: {
    flexDirection: 'column',
    marginTop: 0,
    padding: 0,
  },
});
