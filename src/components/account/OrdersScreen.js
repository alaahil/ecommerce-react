import React, { useEffect, useContext, useState, useRef } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { TouchableOpacity, View, FlatList, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';
import { addToCart, getOrdersForCustomer } from '../../actions';
import { Spinner, Text } from '../common';
import OrderListItem from './OrderListItem';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';

import {
  NAVIGATION_CART_PATH,
  NAVIGATION_HOME_SCREEN_PATH,
} from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
import { Loader } from '../common/Loader';

const OrdersScreen = ({
  cartId,
  cartErrorMessage,
  cartItems,
  orders,
  customerId,
  customer,
  refreshing,
  getOrdersForCustomer: _getOrdersForCustomer,
  navigation,
  addToCart: _addToCart,
}) => {
  const theme = useContext(ThemeContext);
  const [isLoading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setLoading(true);
    _getOrdersForCustomer(customerId).then(() => {
      setLoading(false);
    });
  }, [_getOrdersForCustomer, customerId]);

  const onRefresh = () => {
    _getOrdersForCustomer(customerId, true);
  };
  const onPressReorder = async (order) => {
    setIsSubmitting(true);
    const OrderItems = order.items;
    for (let i = 0; i < OrderItems?.length; i++) {
      const item = {
        cartItem: {
          sku: OrderItems[i].sku,
          quoteId: cartId,
          qty: OrderItems[i]?.qty_ordered || 1,
          productOption: { extensionAttributes: { customOptions: [] } },
        },
      };
      const payload = {
        cartId: cartId,
        item: item,
        customer,
        region: '',
        showErrorMessage: true,
      };
      await _addToCart(payload);
    }
    setIsSubmitting(false);
    NavigationService.navigate(NAVIGATION_CART_PATH);
  };

  const renderItem = (orderItem) => (
    <OrderListItem item={orderItem.item} onPressReorder={onPressReorder} />
  );

  const renderOrderList = () => {
    const data = orders.sort((b, a) => moment(a.created_at).diff(b.created_at));
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={renderEmptyOrderList}
        />
        <Loader isVisible={isSubmitting} />
      </View>
    );
  };

  const renderEmptyOrderList = () => {
    const { navigate } = navigation;
    return (
      <View style={styles.emptyListContainerStyle(theme)}>
        <Text type="heading" style={styles.textStyle(theme)}>
          {translate('ordersScreen.noOrderMessage')}
        </Text>
        <TouchableOpacity onPress={() => navigate(NAVIGATION_HOME_SCREEN_PATH)}>
          <Text type="heading" bold style={styles.buttonTextStyle(theme)}>
            {translate('common.continueShopping')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // if (orders && orders.length) {
  return isLoading ? (
    <Spinner />
  ) : (
    <View style={styles.container(theme)}>{renderOrderList()}</View>
  );
  // }
  // return renderEmptyOrderList();
};

OrdersScreen.navigationOptions = () => ({
  title: translate('ordersScreen.title'),
  headerBackTitle: ' ',
});

const styles = {
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  emptyListContainerStyle: (theme) => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  }),
  textStyle: (theme) => ({
    paddingTop: theme.spacing.small,
  }),
  buttonTextStyle: (theme) => ({
    padding: theme.spacing.large,
    top: 0,
    color: theme.colors.secondary,
  }),
};

OrdersScreen.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object),
  customerId: PropTypes.number,
  refreshing: PropTypes.bool,
  getOrdersForCustomer: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

OrdersScreen.defaultProps = {
  orders: null,
  customerId: null,
};

const mapStateToProps = ({ account, cart }) => {
  const customer = account.customer || null;
  const customerId = account.customer ? account.customer.id : null;
  const orders = account.orderData ? account.orderData.items : [];
  const { cartId, errorMessage, quote } = cart;
  return {
    cartItems: quote,
    customer,
    customerId,
    orders,
    refreshing: account.refreshing,
    cartId,
    cartErrorMessage: errorMessage,
  };
};

export default connect(mapStateToProps, {
  getOrdersForCustomer,
  addToCart,
})(OrdersScreen);
