import React, { useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  AsyncStorage,
} from 'react-native';
import PropTypes from 'prop-types';
import { Button, Text } from '../common';
import {
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
} from '../../actions';
import {
  NAVIGATION_ORDERS_PATH,
  NAVIGATION_ADDRESS_SCREEN_PATH,
  NAVIGATION_MY_ADDRESSES,
  NAVIGATION_WISHLIST,
  NAVIGATION_EDIT_PROFILE,
} from '../../navigation/routes';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Image } from 'react-native';
import Bidcorp_logo from '../../assets/Icons/Bidcorp_logo.png';
import editIcon from '../../assets/Profile/editIcon.png';
import profileNameIcon from '../../assets/Profile/profileNameIcon.png';
import callIcon from '../../assets/Profile/call.png';

const Account = ({
  customer,
  telephone,
  ui,
  navigation,
  currentCustomer: _currentCustomer,
  logout: _logout,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
}) => {
  const theme = useContext(ThemeContext);

  useEffect(() => {
    // console.log('hello 1')
    // ComponentDidMount
    if (!customer) {
      // console.log('hello 2')
      _currentCustomer();
    }
  }, [_currentCustomer, customer]);

  useEffect(() => {
    if (!ui || !ui?.telephone) {
      getCountries();

      if (customer && customer.addresses && !!customer.addresses.length) {
        const address = customer.addresses[0];
        const regionData = address.region;
        const region = {
          regionCode: regionData.region_code,
          region: regionData.region,
          regionId: regionData.region_id,
        };
        console.log('eeeee', JSON.stringify(address));
        updateAccountAddressUI('region', region);
        updateAccountAddressUI('countryId', address.country_id);
        updateAccountAddressUI(
          'street',
          address.street.length ? address.street[0] : ''
        );
        updateAccountAddressUI('city', address.city);
        updateAccountAddressUI('postcode', address.postcode);
        updateAccountAddressUI('telephone', address.telephone);
      }
    }
  }, [
    customer,
    getCountries,
    resetAccountAddressUI,
    updateAccountAddressUI,
    ui,
  ]);

  const onLogoutPress = () => {
    AsyncStorage.removeItem('cardNumber');
    AsyncStorage.removeItem('cardDate');
    AsyncStorage.removeItem('cvv');
    _logout();
  };

  const renderCustomerData = () => {
    if (!customer) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.secondary}
          style={styles.activity(theme)}
        />
      );
    }

    const { email, firstname, lastname } = customer;
    return (
      <View style={styles.textContainer(theme)}>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={Bidcorp_logo}
            resizeMode="contain"
            style={{
              width: 130,
              height: 130,
              // borderRadius: 65,
            }}
          />
          {/* <View
            style={{
              width: 80,
              height: 32,
              borderRadius: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#EBFFD2',
              marginTop: -20,
            }}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#74B422', fontSize: 16, paddingRight: 3 }}>
                Edit
              </Text>
              <Image source={editIcon} />
            </TouchableOpacity>
          </View> */}
        </View>
        <View
          style={
            {
              // paddingTop: 30,
            }
          }
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 8,
              borderBottomColor: '#E1E1E1',
              borderBottomWidth: 1,
            }}
          >
            <Image source={profileNameIcon} resizeMode={'contain'} />
            <Text
              style={{
                color: '#000',
                opacity: 0.7,
                paddingLeft: 10,
                fontSize: 17,
              }}
            >
              {firstname} {lastname}
            </Text>
          </View>
          {telephone ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
              }}
            >
              <Image source={callIcon} resizeMode="contain" />
              <Text
                style={{
                  color: '#000',
                  opacity: 0.7,
                  paddingLeft: 10,
                  fontSize: 16,
                }}
              >
                {telephone}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const openOrders = () => {
    navigation.navigate(NAVIGATION_ORDERS_PATH);
  };

  const openAddAddress = () => {
    navigation.navigate(NAVIGATION_MY_ADDRESSES);
  };
  const openWishlist = () => {
    navigation.navigate(NAVIGATION_WISHLIST);
  };

  const openEditProfile = () => {
    navigation.navigate(NAVIGATION_EDIT_PROFILE);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'white' }}
      contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}
    >
      <View style={styles.container(theme)}>
        {renderCustomerData()}
        <Button onPress={onLogoutPress} style={styles.buttonMargin(theme)}>
          {translate('account.logoutButton')}
        </Button>
        <Button onPress={openEditProfile} style={styles.buttonMargin(theme)}>
          {'Edit Profile'}
        </Button>
        <Button onPress={openOrders} style={styles.buttonMargin(theme)}>
          {translate('account.myOrdersButton')}
        </Button>
        <Button onPress={openAddAddress} style={styles.buttonMargin(theme)}>
          {'My Addresses'}
        </Button>
        <Button onPress={openWishlist} style={styles.buttonMargin(theme)}>
          {'Wishlist'}
        </Button>
      </View>
    </ScrollView>
  );
};

Account.navigationOptions = {
  title: translate('account.title'),
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    paddingTop: theme.spacing.large,
  }),
  activity: (theme) => ({
    padding: theme.spacing.large,
  }),
  center: {
    textAlign: 'center',
  },
  textContainer: (theme) => ({
    marginBottom: theme.spacing.large,
  }),
  buttonMargin: (theme) => ({
    marginTop: theme.spacing.large,
    backgroundColor: '#8BC63E',
    borderWidth: 0,
    borderRadius: 5,
  }),
});

Account.propTypes = {
  customer: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  currentCustomer: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
};

Account.defaultProps = {
  customer: null,
};

const mapStateToProps = ({ account }) => {
  const {
    customer,
    ui: { telephone },
  } = account;
  return { customer, telephone, ui: account.ui };
};

export default connect(mapStateToProps, {
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
})(Account);
