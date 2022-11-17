import React, {
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { connect, useSelector } from 'react-redux';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import {
  getProductsForCategoryOrChild,
  addFilterData,
  getSearchProducts,
  getFilteredProducts,
} from '../../actions';
import { Button, Text, Input } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Pressable } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

const DrawerScreen = (props) => {
  const [maxValue, setMaxValue] = useState('');
  const [minValue, setMinValue] = useState('');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(props.brands);
  const [avaiableInStock, setAvailableInStock] = useState(false);
  const theme = useContext(ThemeContext);
  const priceFilter = useSelector((state) => state?.filters?.priceFilter);
  let bouncyCheckboxRef = null;
  const brandId = priceFilter?.product_brand?.value?.replace(/%/gi, '') || '';
  const [brandValue, setBrandValue] = useState(brandId);
  const matchIndex = props.brands.findIndex(
    (item) => item.brand_id === brandId
  );
  const [value, setValue] = useState(
    matchIndex ? props.brands[matchIndex] : null
  );

  // useEffect(() => {
  //   const { brands } = props;

  // }, [props]);
  useEffect(() => {
    const matchIndex = props.brands.findIndex(
      (item) => item.brand_id == brandId
    );
    const brandName =
      priceFilter?.product_brand?.value?.replace(/%/gi, '') || '';
    if (matchIndex) {
      setValue({
        ...items[matchIndex],
        label: items[matchIndex]?.name,
        value: items[matchIndex]?.name,
      });
    }
    setBrandValue(brandName);
  }, [brandId, items, priceFilter, props.brands]);

  const onApplyPressed = () => {
    const { currencyRate } = props;

    const priceFilter = {
      price: {
        condition: 'gteq,lteq',
        value: `${(minValue / currencyRate).toFixed(2)},${(
          maxValue / currencyRate
        ).toFixed(2)}`,
      },
    };
    if (brandValue != '') {
      priceFilter.product_brand = {
        condition: 'like',
        value: `%${brandValue}%`,
      };
    }
    props.addFilterData(priceFilter);

    if (props && props.filters && props.filters.categoryScreen) {
      props.getProductsForCategoryOrChild(
        props.category,
        null,
        props.filters.sortOrder,
        priceFilter
      );
      props.addFilterData({ categoryScreen: false });
    } else {
    }
    props.getFilteredProducts(
      props.category.id,
      minValue,
      maxValue,
      brandValue,
      avaiableInStock
    );

    props.navigation.closeDrawer();
  };

  const onSetItem = (item) => {
    setValue(item);
    setOpen(false);
    setBrandValue(item.brand_id);
  };
  const resetOnPress = () => {
    setValue('');
    setBrandValue('');
    setMinValue('');
    setMaxValue('');
    setAvailableInStock(false);
  };

  const {
    container,
    InputContainer,
    textStyle,
    minInputStyle,
    maxInputStyle,
    brandInputStyle,
    dashTextStyle,
  } = styles;

  return (
    <SafeAreaView style={{ flex: 1, marginHorizontal: 10 }}>
      <View style={container(theme)}>
        <View style={InputContainer(theme)}>
          <View>
            <Text>Min Price</Text>
            <Input
              containerStyle={minInputStyle}
              placeholder={translate('common.min')}
              value={minValue}
              keyboardType="numeric"
              onChangeText={(minValue) => setMinValue(minValue)}
            />
          </View>
          <View>
            <Text>Max Price</Text>
            <Input
              containerStyle={styles.maxInputStyle}
              value={maxValue}
              placeholder={translate('common.max')}
              keyboardType="numeric"
              onChangeText={(maxValue) => setMaxValue(maxValue)}
            />
          </View>
        </View>
        <View>
          {/* <Input
            containerStyle={brandInputStyle}
            placeholder={translate('common.brand')}
            value={brandValue}
            keyboardType="default"
            onChangeText={brandValue => setBrandValue(brandValue)}
          /> */}
          <View style={{ minHeight: open ? 300 : 0 }}>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              placeholder={value?.name ? value.name : 'Brand Name'}
              setOpen={setOpen}
              setValue={setValue}
              onSelectItem={(item) => {
                onSetItem(item);
              }}
              setItems={setItems}
              containerStyle={brandInputStyle}
              schema={{
                label: 'name',
                value: 'url_key',
              }}
            />
          </View>
          <BouncyCheckbox
            onPress={(isChecked) => {
              setAvailableInStock(!avaiableInStock);
            }}
            text="Only show in stock items"
            ref={(ref) => (bouncyCheckboxRef = ref)}
            textStyle={{ textDecorationLine: 'none' }}
            isChecked={avaiableInStock}
            disableBuiltInState
            style={{ marginTop: 10 }}
            fillColor="green"
            innerIconStyle={{ borderRadius: 10 }}
          />
        </View>

        <View style={styles.buttonStyleWrap}>
          <Pressable
            onPress={resetOnPress}
            style={[styles.buttonStyle, { backgroundColor: '#fff' }]}
          >
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>
              {'Clear'}
            </Text>
          </Pressable>

          <Pressable onPress={onApplyPressed} style={styles.buttonStyle}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
              {'Submit'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  }),
  InputContainer: (theme) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.large,
  }),
  brandInputStyle: {
    width: '100%',
  },
  minInputStyle: {
    width: 100,
  },
  maxInputStyle: {
    width: 100,
  },
  textStyle: (theme) => ({
    paddingLeft: 50,
    paddingRight: theme.spacing.large,
    color: '#000',
    opacity: 0.7,
    alignSelf: 'center',
  }),
  dashTextStyle: (theme) => ({
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.large,
  }),
  buttonStyle: {
    width: '40%',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8BC63E',
    borderRadius: 10,
  },
  buttonStyleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginTop: 50,
  },
});

DrawerScreen.propTypes = {
  currencyRate: PropTypes.number,
  brands: PropTypes.array,
};

DrawerScreen.defaultProps = {
  currencyRate: 1,
  brands: [],
};

const mapStateToProps = ({ category, filters, search, magento }) => {
  const currentCategory = category.current.category;
  const { searchInput } = search;
  const {
    currency: { displayCurrencyExchangeRate: currencyRate },
    brands,
  } = magento;
  return {
    filters,
    searchInput,
    currencyRate,
    category: currentCategory,
    brands,
  };
};

export default connect(mapStateToProps, {
  getProductsForCategoryOrChild,
  addFilterData,
  getFilteredProducts,
  getSearchProducts,
})(DrawerScreen);
