import React from 'react';
import {
  StyleSheet,
  Platform,
  Text,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { DrawerActions } from 'react-navigation-drawer';
import Category from '../components/catalog/Category';
import CategoryDrill from '../components/catalog/CategoryDrill';
import CategoryTree from '../components/catalog/CategoryTree';
import Cart from '../components/cart/Cart';
import Checkout from '../components/checkout/Checkout';
import Login from '../components/account/Login';
import Signin from '../components/account/Signin';
import Account from '../components/account/Account';
import AuthLoading from '../components/account/AuthLoading';
import PasswordReset from '../components/account/PasswordReset';
import HomeScreen from '../components/home/HomeScreen';
import FeaturedScreen from '../components/home/FeaturedScreen';
import SearchScreen from '../components/search/SearchScreen';
import OrdersScreen from '../components/account/OrdersScreen';
import OrderScreen from '../components/account/OrderScreen';
import AddressScreen from '../components/account/AddressScreen';
import DrawerScreen from '../components/catalog/DrawerScreen';
import EmiratesSelection from '../components/emiratesSelection/EmiratesSelection';
import ContactUs from '../components/contactUs/ContactUs';
import CartBadge from '../components/cart/CartBadge';
import MyAddreess from '../MyAddress/MyAddreess';
import CreateNewAddressForm from '../components/account/CreateNewAddressForm';
import * as routes from './routes';
import { theme } from '../theme';
import { ProductScreen } from '../components/catalog/ProductScreen';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Entypo';
import CreateNewAddress from '../components/account/CreateNewAddress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-community/async-storage';
import DeleteAccount from '../components/deleteAccount/DeleteAccount';
import NavigationService from './NavigationService';
import { NAVIGATION_HOME_STACK_PATH } from './routes';
import Wishlist from '../components/account/Wishlist';
import EditProfile from '../components/account/EditProfile';
import ChangePassword from '../components/account/ChangePassword';

const styles = StyleSheet.create({
  drawerMenu: {
    borderWidth: 1,
    borderColor: '#CACACA',
    borderRadius: 10,
    paddingVertical: 10,
    color: '#000000',
    marginLeft: 10,
  },
});

const defaultHeader = {
  headerStyle: {
    backgroundColor: theme.colors.primary,
  },
  headerTitleStyle: {
    ...theme.typography.titleTextSemiBold,
    alignSelf: 'center',
    fontWeight: '200',
    fontSize: 15,
  },
  headerBackTitle: null,
  headerTintColor: theme.colors.appbarTint,
  headerBackTitleVisible: false,
  headerTitleAlign: 'center',
};
const favorite = require('../../resources/images/favorite_icon.png');
const search_icon = require('../../resources/images/search_icon.png');
const home_icon = require('../../resources/images/home_icon.png');

const HomeStack = createStackNavigator(
  {
    [routes.NAVIGATION_HOME_SCREEN_PATH]: HomeScreen,

    [routes.NAVIGATION_FEATURED_CATEGORIES]: {
      screen: FeaturedScreen,
      navigationOptions: (props) => {
        const title = props.navigation.getParam('title');
        return {
          headerTitle: title.toUpperCase(),
          headerTitleAlign: 'center',
        };
      },
    },
    [routes.NAVIGATION_CATEGORY_DRILL_PATH]: {
      screen: CategoryDrill,
      navigationOptions: (props) => {
        const title = props.navigation.getParam('title');
        return {
          headerTitle: title.toUpperCase(),
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '200',
            fontSize: 15,
          },
        };
      },
    },
    [routes.NAVIGATION_HOME_PRODUCT_PATH]: {
      screen: ProductScreen,
      navigationOptions: () => ({
        headerTitle: 'PRODUCT',
        headerTitleAlign: 'center',
      }),
    },
    [routes.NAVIGATION_EMIRATES_SELECTION_SCREEN]: {
      screen: EmiratesSelection,
      navigationOptions: () => ({
        headerTitle: 'SELECT STORE',
        headerTitleAlign: 'center',
      }),
    },
    [routes.NAVIGATION_CONTACT_US_SCREEN]: {
      screen: ContactUs,
      navigationOptions: () => ({
        headerTitle: 'CONTACT US',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '200',
          fontSize: 15,
        },
      }),
    },
    [routes.NAVIGATION_DELETE_ACCOUNT]: {
      screen: DeleteAccount,
      navigationOptions: () => ({
        headerTitle: 'Delete Account',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: '200',
          fontSize: 15,
        },
      }),
    },
  },
  {
    initialRouteName: routes.NAVIGATION_HOME_SCREEN_PATH,
    defaultNavigationOptions: defaultHeader,
  }
);

const CategoryStack = createStackNavigator(
  {
    [routes.NAVIGATION_CATEGORY_PATH]: {
      screen: Category,
      navigationOptions: (props) => {
        return {
          headerTitle: <Text>{'CATEGORIES'}</Text>,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '200',
            fontSize: 15,
          },
        };
      },
    },
    [routes.NAVIGATION_CATEGORY_DRILL_PATH]: {
      screen: CategoryDrill,
      navigationOptions: (props) => {
        const title = props.navigation.getParam('title');
        return {
          headerTitle: title.toUpperCase(),
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '200',
            fontSize: 15,
          },
        };
      },
    },
    [routes.NAVIGATION_FEATURED_CATEGORIES]: {
      screen: FeaturedScreen,
      navigationOptions: (props) => {
        const title = props.navigation.getParam('title');
        return {
          headerTitle: title.toUpperCase(),
          headerTitleAlign: 'center',
        };
      },
    },
    [routes.NAVIGATION_HOME_PRODUCT_PATH]: {
      screen: ProductScreen,
      navigationOptions: () => ({
        headerTitle: 'PRODUCT',
        headerTitleAlign: 'center',
      }),
    },
  },
  {
    defaultNavigationOptions: defaultHeader,
  }
);

const AuthStack = createStackNavigator(
  {
    [routes.NAVIGATION_LOGIN_PATH]: Login,
    [routes.NAVIGATION_SIGNIN_PATH]: Signin,
    [routes.NAVIGATION_RESET_PASSWORD_PATH]: PasswordReset,
  },
  {
    defaultNavigationOptions: defaultHeader,
    navigationOptions: {
      headerShown: false,
    },
  }
);

const AccountStack = createStackNavigator(
  {
    [routes.NAVIGATION_ACCOUNT_PATH]: Account,
    [routes.NAVIGATION_ORDERS_PATH]: OrdersScreen,
    [routes.NAVIGATION_ORDER_PATH]: {
      screen: OrderScreen,
      navigationOptions: () => ({
        headerShown: null,
      }),
    },
    [routes.NAVIGATION_ADDRESS_SCREEN_PATH]: AddressScreen,
    [routes.NAVIGATION_NEW_ADDRESS_PATH]: CreateNewAddress,
    [routes.NAVIGATION_MY_ADDRESSES]: MyAddreess,
    [routes.NAVIGATION_WISHLIST]: Wishlist,
    [routes.NAVIGATION_EDIT_PROFILE]: EditProfile,
    [routes.NAVIGATION_CHANGE_PASSWORD]: ChangePassword,
  },
  {
    defaultNavigationOptions: defaultHeader,
  }
);

const AccountSwitch = createSwitchNavigator({
  [routes.NAVIGATION_AUTH_LOADING_SWITCH]: AuthLoading,
  [routes.NAVIGATION_LOGIN_STACK_PATH]: AuthStack,
  [routes.NAVIGATION_ACCOUNT_STACK_PATH]: AccountStack,
});

const SearchStack = createStackNavigator(
  {
    [routes.NAVIGATION_SEARCH_SCREEN_PATH]: SearchScreen,

    [routes.NAVIGATION_SEARCH_PRODUCT_PATH]: {
      screen: ProductScreen,

      navigationOptions: () => ({
        headerTitle: 'PRODUCT',
        headerTitleAlign: 'center',
        headerShown: false,
        headerTitleStyle: {
          fontWeight: '200',
          fontSize: 15,
        },
      }),
    },
  },
  {
    defaultNavigationOptions: defaultHeader,
  }
);

const CartStack = createStackNavigator(
  {
    [routes.NAVIGATION_CART_PATH]: Cart,
  },
  {
    defaultNavigationOptions: defaultHeader,
  }
);

const MainAppNavigator = createBottomTabNavigator(
  {
    [routes.NAVIGATION_HOME_STACK_PATH]: {
      screen: HomeStack,
      navigationOptions: () => ({
        tabBarOnPress: ({ navigation }) => {
          if (navigation.isFocused()) {
            DeviceEventEmitter.emit('HomeScrollToTop');
          }
          NavigationService.navigate(NAVIGATION_HOME_STACK_PATH);
        },
        tabBarLabel: 'Home',
        tabBarIcon: ({ tintColor }) => (
          <FastImage
            style={{ width: 24, height: 24 }}
            source={home_icon}
            tintColor={tintColor}
          />
        ),
      }),
    },
    [routes.NAVIGATION_CATEGORY_PATH]: {
      screen: CategoryStack,
      navigationOptions: () => ({
        tabBarLabel: 'Categories',
        tabBarIcon: ({ tintColor }) => (
          <Icon name="grid" size={26} color={tintColor} />
        ),
        title: 'CATEGORIES',
      }),
    },
    [routes.NAVIGATION_SEARCH_SCREEN_PATH]: {
      screen: SearchStack,
      navigationOptions: () => ({
        tabBarLabel: '',
        tabBarIcon: ({ tintColor }) => (
          <FastImage
            style={{
              width: Platform.OS === 'ios' ? 44 : 36,
              height: Platform.OS === 'ios' ? 44 : 36,
            }}
            source={search_icon}
          />
        ),
      }),
    },
    [routes.NAVIGATION_AUTH_STACK_PATH]: {
      screen: AccountSwitch,
      navigationOptions: () => ({
        tabBarLabel: 'Account',
        headerShown: false,
        tabBarIcon: ({ tintColor }) => (
          <FastImage
            style={{
              width: 24,
              height: 24,
            }}
            source={favorite}
            tintColor={tintColor}
          />
        ),
      }),
    },
    [routes.NAVIGATION_CART_PATH]: {
      screen: CartStack,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => <CartBadge tintColor={tintColor} />,
      }),
    },
  },
  {
    // initialRouteName: NAVIGATION_AUTH_STACK_PATH,

    tabBarOptions: {
      showLabel: true,
      activeTintColor: '#8BC63E', //theme.colors.secondary,
      inactiveTintColor: theme.colors.tabBarIconInactive,
      activeBackgroundColor: theme.colors.tabBarBackground,
      inactiveBackgroundColor: theme.colors.tabBarBackground,
      style: {
        height: 70,
        paddingVertical: 5,
      },
    },
  }
);

const Drawer = createDrawerNavigator(
  {
    [routes.BOTTOM_TAB_NAVIGATOR]: {
      screen: MainAppNavigator,
    },
    // [routes.NAVIGATION_DRAWER_SCREEN]: {
    //   screen: DrawerScreen,
    //   navigationOptions: { header: () => false },
    // },
  },
  {
    contentComponent: CategoryTree,
  }
);

export const DrawerNavigator = createDrawerNavigator(
  {
    Drawer,
  },
  {
    contentComponent: DrawerScreen,
    getCustomActionCreators: (route, stateKey) => ({
      toggleFilterDrawer: () => DrawerActions.toggleDrawer({ key: stateKey }),
    }),
  }
);

export const CheckoutStack = createStackNavigator(
  {
    [routes.NAVIGATION_CHECKOUT_PATH]: Checkout,
    [routes.NAVIGATION_ADDRESS_SCREEN_PATH]: AddressScreen,
  },
  {
    defaultNavigationOptions: defaultHeader,
  }
);

// const isLoggedIn =  AsyncStorage.getItem("IsRegionSelected")
// console.log("isLoggedIn", isLoggedIn);
// const defaultRoute = isLoggedIn?null: routes.NAVIGATION_EMIRATES_SELECTION_SCREEN
// const Nav = createStackNavigator(
//   {
//     [routes.NAVIGATION_DRAWER_NAVIGATOR]: DrawerNavigator,
//     [routes.NAVIGATION_CHECKOUT_STACK_PATH]: CheckoutStack,
//     [routes.NAVIGATION_EMIRATES_SELECTION_SCREEN]: {
//       screen: EmiratesSelection,
//       navigationOptions: () => ({
//         headerTitle: 'SELECT STORE',
//         headerTitleAlign: 'center',
//       }),
//     },
//   },
//   // {
//   //   defaultNavigationOptions: { header: () => null },
//   // },

//   {
//     initialRouteName: defaultRoute,
//     defaultNavigationOptions: { header: () => null },
//   },
// );

// export const Navigator = createAppContainer(Nav);
