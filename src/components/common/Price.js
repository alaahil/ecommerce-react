import React, { useContext } from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from './Text';
import { ThemeContext } from '../../theme';

const formatPrice = (price, currencyRate) => (price * currencyRate).toFixed(2);

/**
 * Component to display price of the product. If discount price is
 * available, then base price will be crossed off
 *
 * @param {Object} props                             - props of the component
 * @param {number} [props.basePrice = 0]             - default selling price of the product
 * @param {number} [props.discountPrice = 0]         - special or discount price for the product
 * @param {string} props.currencySymbol              - currency symbol to append before price
 * @param {string} props.currencyRate                - currency rate which must be multiply with the actual price.
 * @param {string} props.style                       - style related to price container
 *
 * @return React component
 */
const Price = ({
  currencySymbol,
  currencyRate,
  basePrice,
  discountPrice,
  hasInvertedPrice = false,
  style,
}) => {
  const theme = useContext(ThemeContext);
  const isBold = () =>
    Math.round(parseFloat(discountPrice) * 1000000) <
    Math.round(parseFloat(basePrice) * 1000000);
  const renderDiscountPrice = () =>
    Math.round(parseFloat(discountPrice) * 1000000) ===
    Math.round(parseFloat(basePrice) * 1000000) ? null : (
      <Text
        type="label"
        bold={isBold()}
        style={styles.discountPriceText(theme)}
      >{`${currencySymbol} ${formatPrice(discountPrice, currencyRate)} `}</Text>
    );

  return (
    <View style={[styles.container]}>
      {discountPrice && parseFloat(discountPrice) < parseFloat(basePrice)
        ? renderDiscountPrice()
        : null}
      <Text
        type="label"
        bold={!isBold()}
        style={[styles.basePriceText(basePrice, discountPrice)]}
      >
        {!hasInvertedPrice
          ? `${currencySymbol} ${formatPrice(basePrice, currencyRate)}`
          : `${formatPrice(basePrice, currencyRate)} ${currencySymbol}`}
      </Text>
    </View>
  );
};

const styles = {
  container: {
    // flexDirection: 'row',
  },
  discountPriceText: (basePrice) => ({
    color: '#8BC63E',
    fontSize: basePrice.length > 5 ? 11 : 13,
    marginRight: 2,
  }),

  basePriceText: (basePrice, discountPrice) => ({
    textDecorationLine:
      discountPrice &&
      Math.round(parseFloat(discountPrice) * 1000000) <
        Math.round(parseFloat(basePrice) * 1000000)
        ? 'line-through'
        : 'none',
    fontSize: discountPrice.length >= 5 ? 16 : 14,
  }),
};

Price.propTypes = {
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  basePrice: PropTypes.number,
  discountPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  style: ViewPropTypes.style,
};

Price.defaultProps = {
  basePrice: 0,
  discountPrice: 0,
  style: {},
};

export { Price };
