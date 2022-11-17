import React, { useContext } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import IconBadge from 'react-native-icon-badge';
import { Text } from '../common';
import { ThemeContext } from '../../theme';
import FastImage from 'react-native-fast-image';

const CartBadge = ({ tintColor, itemsCount }) => {
  const theme = useContext(ThemeContext);
  const cart_icon = require('../../../resources/images/cart_icon.png');
  return (
    <IconBadge
      MainElement={
        <View style={styles.iconWrapper}>
          <FastImage
            style={{ width: 23, height: 23 }}
            source={cart_icon}
            tintColor={tintColor}
          />
        </View>
      }
      BadgeElement={<Text style={styles.textStyle(theme)}>{itemsCount}</Text>}
      IconBadgeStyle={styles.iconBadgeStyle}
      Hidden={itemsCount === 0}
    />
  );
};

const styles = {
  textStyle: theme => ({
    color: theme.colors.white,
    fontSize: 9,
    textAlign: 'center',
  }),
  iconWrapper: {
    marginTop: 5,
    marginRight: 10,
  },
  ionicon: {
    backgroundColor: 'red',
  },
  iconBadgeStyle: {
    minWidth: 18,
    height: 18,
    backgroundColor: 'red',
  },
};

CartBadge.propTypes = {
  color: PropTypes.string.isRequired,
  itemsCount: PropTypes.number,
};

CartBadge.defaultProps = {
  itemsCount: 0,
};

const mapStateToProps = ({ cart }) => {
  const itemsCount =
    cart.quote && cart.quote.items_qty ? cart.quote.items_qty : 0;
  return { itemsCount };
};

export default connect(mapStateToProps)(CartBadge);
