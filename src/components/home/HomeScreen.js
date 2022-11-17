import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  DeviceEventEmitter,
  Modal,
  Dimensions,
  TextInput

} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { MaterialHeaderButtons, Text, Item, HeaderTop } from '../common';
import {
  NAVIGATION_HOME_PRODUCT_PATH,
  NAVIGATION_CART_PATH,
  NAVIGATION_CATEGORY_DRILL_PATH,
} from '../../navigation/routes';
import {
  getHomeData,
  setCurrentProduct,
  getCategoryTree,
  resetFilters,
  setCurrentCategory,
} from '../../actions';
import HomeSlider from './HomeSlider';
import CurrencyPicker from './CurrencyPicker';
import FeaturedProducts from './FeaturedProducts';
import FeaturedCategories from './FeaturedCategories';
import DailyRecipes from './DailyRecipes';
import NavigationService from '../../navigation/NavigationService';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import CartBadgeTop from '../cart/CartBadgeTop';
import TopSearch from '../search/TopSearch';
import FaIcon from 'react-native-vector-icons/FontAwesome5';
import flash_sales from '../../assets/flash_sales.png';
import FastImage from 'react-native-fast-image';
import { BASE_URL } from '../../constant/constant';




class HomeScreen extends Component {
  static contextType = ThemeContext;
  state = {
    showText: true,
    scrollOffset: 0,
    categories: [],
    bestSellers: [],
    newProducts: [],
    currentSurveyIndex: 0,
    rating: 2
  };

  // static navigationOptions = ({ navigation }) => ({
  //   title: <TopSearch />,
  //   headerBackTitle: ' ',
  //   headerLeft: () => (
  //     <MaterialHeaderButtons>
  //       <Item style={styles.drawerMenu}
  //         title="menu"
  //         iconName="menu"
  //         onPress={navigation.getParam('toggleDrawer')}
  //       />
  //     </MaterialHeaderButtons>
  //   ),
  //   headerRight: () => <CartBadgeTop />,
  // });
  static navigationOptions = ({ navigation }) => {
    //return header with Custom View which will replace the original header

    return {
      header: (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
          }}
        >
          <View>
            <MaterialHeaderButtons>
              <Item
                style={styles.drawerMenu}
                title="menu"
                iconName="menu"
                onPress={navigation.getParam('toggleDrawer')}
              />
            </MaterialHeaderButtons>
          </View>
          <View>
            <TopSearch />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate(NAVIGATION_CART_PATH)}
          >
            <CartBadgeTop />
          </TouchableOpacity>
        </View>
      ),
      // headerLeft: () => (
      //   <MaterialHeaderButtons>
      //     <Item
      //       style={styles.drawerMenu}
      //       title="menu"
      //       iconName="menu"
      //       onPress={navigation.getParam('toggleDrawer')}
      //     />
      //   </MaterialHeaderButtons>
      // ),
      // headerRight: () => (
      //   <TouchableOpacity
      //     onPress={() => navigation.navigate(NAVIGATION_CART_PATH)}>
      //     <CartBadgeTop />
      //   </TouchableOpacity>
      // ),
      // headerTitle: () => <TopSearch />,
    };
  };

  constructor(props) {
    super(props);
    this.flatListRef = React.createRef();
  }
  componentWillUnmount() {
    DeviceEventEmitter.removeListener('HomeScrollToTop', this.scrollToTop);
  }

  componentDidMount() {

    const { navigation } = this.props;
    // commented this line for home issue
    // if (this.props.slider.length === 0) {
    //   this.props.getHomeData();
    // }
    DeviceEventEmitter.addListener('HomeScrollToTop', this.scrollToTop);
    let category_idList = [];
    axios
      .get(BASE_URL + '/rest/all/V1/cmsBlock/11', {
        headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
      })
      .then((response) => {
        let { content } = response.data;
        let temp = content.slice(
          content.search('category_id') + 13,
          content.indexOf('"', content.search('category_id') + 14)
        );
        category_idList = temp.split(',');
        for (let i = 0; i < category_idList.length; i++) {
          axios
            .get(BASE_URL + '/rest/V1/categories/' + category_idList[i], {
              headers: {
                Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1',
              },
            })
            .then((response) => {
              this.setState((prevState) => {
                return { categories: [...prevState.categories, response.data] };
              });
              console.log(this.state.categories);
            });
        }
      })
      .catch((error) => console.log(error));
    axios
      .get(BASE_URL + '/rest/all/V1/cmsBlock/44', {
        headers: { Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1' },
      })
      .then((response) => {
        //this.setState(prevState=>{return{products:[...prevState.products,response.data]}});
        let { content } = response.data;
        let temp = content.slice(
          content.search('FlashSales') + 14,
          content.indexOf('"', content.search('FlashSales') + 15)
        );
        category_idList = temp.split(',');
        console.log(category_idList);
        for (let i = 0; i < category_idList.length; i++) {
          axios
            .get(BASE_URL + '/rest/V1/products/' + category_idList[i], {
              headers: {
                Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1',
              },
            })
            .then((res) => {
              this.setState((prevState) => {
                return { bestSellers: [...prevState.bestSellers, res.data] };
              });
              // console.log('best selllerssf ssssssss',res.data);
            });
        }
        temp = content.slice(
          content.search('BestSellers') + 15,
          content.indexOf('"', content.search('BestSellers') + 16)
        );
        category_idList = temp.split(',');
        for (let i = 0; i < category_idList.length; i++) {
          axios
            .get(BASE_URL + '/rest/V1/products/' + category_idList[i], {
              headers: {
                Authorization: 'Bearer wb2s1euayoz8sszqdktjxxxd8ud7jwp1',
              },
            })
            .then((res) => {
              this.setState((prevState) => {
                return { newProducts: [...prevState.newProducts, res.data] };
              });
              // console.log('best selllerssf ssssssss',res.data);
            });
        }
      })
      .catch((error) => console.log(error));

    this.props.getHomeData(); // added this line
    if (!this.props.categoryTree) {
      this.props.getCategoryTree();
    }
    navigation.setParams({ toggleDrawer: this.toggleDrawer });
    // setInterval(
    //   () => {
    //     this.setState(previousState => {
    //       return { showText: !previousState.showText };
    //     });
    //   },
    //   // Define blinking time in milliseconds
    //   1000,
    // );
  }

  toggleDrawer = () => {
    const { navigation } = this.props;
    navigation.toggleDrawer();
  };

  onProductPress = (product) => {
    this.props.setCurrentProduct({ product });
    NavigationService.navigate(NAVIGATION_HOME_PRODUCT_PATH, {
      product,
      title: product.name,
    });
  };

  onCategoryPress = () => {
    let item = {
      id: 196,
      parent_id: 87,
      name: 'Flash Sales',
      is_active: true,
      position: 10,
      level: 4,
      product_count: 53,
      children_data: [],
    };
    console.log('Flash Sale ', item);
    NavigationService.dispatch(resetFilters());
    NavigationService.dispatch(setCurrentCategory({ category: item }));
    NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
      title: item.name,
      selectedCategory: item,
    });
  };

  onRefresh = () => {
    this.props.getHomeData(true);
  };

  scrollToTop = () => {
    this.flatListRef.current.scrollTo({ x: 0, y: 0, animated: true });
  };

  renderBestSellers() {
    return (
      <FeaturedProducts
        key={'featuredBestSellers'}
        products={this.state.bestSellers}
        title={'Best Sellers'} //.replace(/([A-Z])/g, ' $1').trim()
        onPress={this.onProductPress}
        currencySymbol={this.props.currencySymbol}
        currencyRate={this.props.currencyRate}
        headerCategoryData={{
          id: 198,
          parent_id: 87,
          name: 'Best Sellers',
          is_active: true,
          position: 5,
          level: 2,
          product_count: 57,
          children_data: [],
        }}
      />
    );
  }
  renderNewProducts() {
    return (
      <FeaturedProducts
        key={'featuredNewProducts'}
        products={this.state.newProducts}
        title={'New Products'} //.replace(/([A-Z])/g, ' $1').trim()
        onPress={this.onProductPress}
        currencySymbol={this.props.currencySymbol}
        currencyRate={this.props.currencyRate}
        headerCategoryData={{
          id: 195,
          parent_id: 87,
          name: 'New Products',
          is_active: true,
          position: 2,
          level: 2,
          product_count: 100,
          children_data: [],
        }}
      />
    );
  }

  renderFlashSale() {
    return (
      <TouchableOpacity
        onPress={this.onCategoryPress}
        key={'touchableFlashSale'}
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 15,
          height: 120,
        }}
      >
        <FastImage
          style={{
            width: '100%',
            height: 120,
            alignSelf: 'center',
            resizeMode: 'contain',
          }}
          resizeMode={'contain'}
          source={flash_sales}
        />
      </TouchableOpacity>
    );
  }

  render() {
    const theme = this.context;

    if (this.props.errorMessage) {
      return (
        <View style={styles.errorContainer}>
          <Text>{this.props.errorMessage}</Text>
        </View>
      );
    }

    return (
      <>
        {this.state.scrollOffset > 0 && (
          <TouchableOpacity
            onPress={this.scrollToTop}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              zIndex: 100,
              width: 50,
              height: 50,
              borderRadius: 50,
              backgroundColor: '#8BC63E',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <FaIcon
              style={{
                color: '#FFFFFF',
                fontSize: 20,
              }}
              name="angle-double-up"
            />
          </TouchableOpacity>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            this.setState({ scrollOffset: e.nativeEvent.contentOffset.y });
          }}
          ref={this.flatListRef}
          style={styles.container(theme)}
          refreshControl={
            <RefreshControl
              refreshing={this.props.refreshing}
              onRefresh={this.onRefresh}
            />
          }
        >
          <View
            style={{
              backgroundColor: '#18244c',
              marginTop: 3,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontWeight: 'bold',
                // opacity: this.state.showText ? 0.6 : 1,
                padding: 2,
              }}
            >
              {/* Free Shipping on Order Above AED 100 */}
              {this.props.homePageText}
            </Text>
          </View>
          <View style={styles.Slider}>
            <HomeSlider
              key={'homeSlider'}
              slider={this.props.slider}
              setCurrentProduct={this.props.setCurrentProduct}
            />
          </View>
          <FeaturedCategories
            key={'featuredCategories'}
            homeCategories={this.state.categories}
          />

          {this.renderFlashSale()}
          {this.renderNewProducts()}
          {this.renderBestSellers()}
          {/* <ScrollView style={styles.container(theme)}> // Daily Recipe View for later use
          <DailyRecipes />
        </ScrollView> */}
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Slider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F3F3',
  },
  drawerMenu: {
    borderWidth: 1,
    borderColor: '#CACACA',
    borderRadius: 10,
    paddingVertical: 10,
    color: '#000000',
    marginLeft: 10,
  },
});

HomeScreen.propTypes = {
  slider: PropTypes.array,
  getHomeData: PropTypes.func,
  navigation: PropTypes.object,
  featuredProducts: PropTypes.object,
  featuredCategories: PropTypes.object,
  setCurrentProduct: PropTypes.func,
  currencySymbol: PropTypes.string.isRequired,
  currencyRate: PropTypes.number.isRequired,
  refreshing: PropTypes.bool,
};

HomeScreen.defaultProps = {
  slider: [],
};

const mapStateToProps = (state) => {
  const { refreshing } = state.home;

  const {
    errorMessage,
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
    homePageText,
    homePageBanners,
    homeCategories,
  } = state.magento;
  // var filterdHomeCategories = homeCategories.filter(el => {
  //   return el['name'] != "Root Catalog";
  // });
  return {
    ...state.home,
    refreshing,
    errorMessage,
    currencySymbol,
    currencyRate,
    categoryTree: state.categoryTree,
    homePageText,
    slider: homePageBanners,
    // homeCategories: filterdHomeCategories,
  };
};

export default connect(mapStateToProps, {
  getHomeData,
  setCurrentProduct,
  getCategoryTree,
})(HomeScreen);
