import React, { useState } from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import { SearchBar } from 'react-native-elements';
import { translate } from '../../i18n';
import { ModalSelect } from '../common';
import {
  priceSignByCode,
  currencyExchangeRateByCode,
} from '../../helper/price';
import { changeCurrency } from '../../actions';

const TopSearch = () => {
  return (
    <View>
      <SearchBar placeholder={translate('search.searchPlaceholderText')} />
    </View>
  );
};

export default TopSearch;
