import React, { useContext } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon } from 'react-native-elements';
import IconBadge from 'react-native-icon-badge';
import { Text } from '../common';
import FastImage from 'react-native-fast-image';
import { ThemeContext } from '../../theme';
const CartBadgeTop = ({ color, itemsCount }) => {

  const theme = useContext(ThemeContext);
  const carIcon = require('../../../resources/icons/cart-icon.png');

  return (
    <IconBadge
      MainElement={
        <View style={styles.iconWrapper}>
          <FastImage style={{ width: 23, height: 23 }} source={carIcon} />
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
    color: 'white',
    fontSize: 9,
    textAlign: 'center',
  }),
  iconWrapper: {
    marginTop: 5,
    marginRight: 10,
    width:25,
    height:25,
    
  },
  ionicon: {
    backgroundColor: 'red',
    color: 'red',
    
  },
  iconBadgeStyle: {
    minWidth: 18,
    height: 18,
    backgroundColor: 'red',
  },
};

CartBadgeTop.propTypes = {
  // color: PropTypes.string.isRequired,
  itemsCount: PropTypes.number,
};

CartBadgeTop.defaultProps = {
  itemsCount: 0,
};

const mapStateToProps = ({ cart }) => {
  const itemsCount =
    cart.quote && cart.quote.items_qty ? cart.quote.items_qty : 0;
  return { itemsCount };
};

export default connect(mapStateToProps)(CartBadgeTop);
