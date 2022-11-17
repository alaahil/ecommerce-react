import React, { useContext, useEffect } from 'react';
import { magento } from '../../../src/magento';
import {
  RefreshControl,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { connect } from 'react-redux';
import { Spinner } from '../common/index';
import {
  initMagento,
  getCategoryTree,
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
} from '../../actions/index';
import CategoryTreeList from './CategoryTreeList';
import { ThemeContext } from '../../theme';
import customer from '../../magento/lib/customer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import GlobeIcon from 'react-native-vector-icons/FontAwesome';
import LocationIcon from 'react-native-vector-icons/Entypo';
import {
  NAVIGATION_ORDERS_PATH,
  NAVIGATION_EMIRATES_SELECTION_SCREEN,
  NAVIGATION_LOGIN_PATH,
  NAVIGATION_ADDRESS_SCREEN_PATH,
  NAVIGATION_CONTACT_US_SCREEN,
  NAVIGATION_MY_ADDRESSES,
  NAVIGATION_DELETE_ACCOUNT,
} from '../../navigation/routes';

const CategoryTree = ({
  categoryTree,
  refreshing,
  getCategoryTree: _getCategoryTree,
  customer,
  phone,
  logout: _logout,
  navigation,
}) => {
  const theme = useContext(ThemeContext);

  useEffect(() => {
    _getCategoryTree();
  }, [_getCategoryTree]);

  const onRefresh = () => {
    _getCategoryTree(true);
  };

  const renderContent = () => {
    if (categoryTree) {
      return (
        <CategoryTreeList
          categories={categoryTree.children_data}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          isParentList={true}
        />
      );
    }
    return <Spinner />;
  };

  // const { firstname, lastname } = customer;
  const firstname = customer?.firstname;
  const lastname = customer?.lastname;
  const telephone = phone?.telephone;
  const isLoggedIn = magento.isCustomerLogin();

  const onLogoutPress = () => {
    _logout();
  };

  const onPressOrders = () => {
    navigation.navigate(NAVIGATION_ORDERS_PATH);
  };

  const onPressRegion = () => {
    navigation.navigate(NAVIGATION_EMIRATES_SELECTION_SCREEN);
  };

  const onSignInPress = () => {
    navigation.navigate(NAVIGATION_LOGIN_PATH);
  };

  const onPressAddress = () => {
    navigation.navigate(NAVIGATION_MY_ADDRESSES);
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#8BC63E' }}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={styles.nameContainer}>
        {firstname && lastname ? (
          <Text style={styles.nameTitle}>
            {firstname} {lastname}
          </Text>
        ) : null}
        <Text style={styles.telephoneTitle}>{telephone}</Text>
        {isLoggedIn && (
          <TouchableOpacity
            onPress={onPressOrders}
            style={[styles.container, { marginTop: 40 }]}
          >
            <Icon
              name="cart"
              size={22}
              color="#ffff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.textStyle}>My Orders</Text>
          </TouchableOpacity>
        )}
        {isLoggedIn && (
          <TouchableOpacity onPress={onPressAddress} style={styles.container}>
            <LocationIcon
              name="location-pin"
              size={22}
              color="#ffff"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.textStyle}>My Addresses</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onPressRegion} style={styles.container}>
          <GlobeIcon
            name="globe"
            size={22}
            color="#ffff"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.textStyle}>{'Select Emirates'}</Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={() => navigation.navigate(NAVIGATION_CONTACT_US_SCREEN)}
          style={{
            flexDirection: 'row',
            marginTop: 40,
          }}
        >
          <Icon
            name="phone"
            size={22}
            color="#ffff"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.textStyle}>Contact Us</Text>
        </TouchableOpacity>
        {isLoggedIn ? (
          <TouchableOpacity
            onPress={() => navigation.navigate(NAVIGATION_DELETE_ACCOUNT)}
            style={{
              flexDirection: 'row',
              marginTop: 40,
            }}
          >
            <Icon
              name="delete-forever"
              size={22}
              color="#ffff"
              style={{ marginRight: 12 }}
            />
            <Text style={styles.textStyle}>Delete Account</Text>
          </TouchableOpacity>
        ) : null}
        {/* <View
          style={styles.container}>
            <Icon                           //rate us view for later use
            name="star"
            size={22}
            color="#ffff"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.textStyle}>
            Rate Us
          </Text>
        </View> */}
        {isLoggedIn ? (
          <View style={styles.logoutContainer}>
            <TouchableOpacity onPress={onLogoutPress} style={styles.container}>
              <Icon
                name="logout"
                size={22}
                color="#ffff"
                style={{ marginRight: 12 }}
              />
              <Text style={{ color: '#fff', fontSize: 16 }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onSignInPress}
            style={[styles.container, { marginTop: 25 }]}
          >
            <Icon
              name="login"
              size={22}
              color="#ffff"
              style={{ marginRight: 12 }}
            />
            <Text style={{ color: '#fff', fontSize: 16 }}>Sign in</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

CategoryTree.navigationOptions = {
  title: 'Categories'.toUpperCase(),
  headerBackTitle: ' ',
};

const styles = StyleSheet.create({
  nameContainer: {
    flex: 1,
    // backgroundColor: '#8BC63E',
    paddingHorizontal: 40,
  },
  nameTitle: {
    color: '#fff',
    fontSize: 18,
    marginTop: 80,
    marginBottom: 5,
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  telephoneTitle: {
    color: '#d9d9d9',
    fontSize: 18,
    marginBottom: 15,
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  textStyle: {
    color: '#fff',
    alignSelf: 'center',
    fontSize: 16,
  },
  spacer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    marginTop: 25,
    opacity: 0.5,
  },
  logoutContainer: {
    alignItems: 'flex-end',
    flex: 0.65,
    flexDirection: 'row',
    paddingLeft: 10,
  },
});

const mapStateToProps = ({ categoryTree, account }) => ({
  categoryTree,
  refreshing: categoryTree.refreshing,
  customer: account.customer,
  phone: account.ui,
});

export default connect(mapStateToProps, {
  initMagento,
  getCategoryTree,
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
})(CategoryTree);
