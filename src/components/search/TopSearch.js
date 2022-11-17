import React, { Component } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Feather';
import {
  getSearchProducts,
  addFilterData,
  resetFilters,
  setCurrentProduct,
} from '../../actions';
import { ProductList, HeaderGridToggleIcon, HeaderTop } from '../common';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_SEARCH_PRODUCT_PATH,
  NAVIGATION_SEARCH_SCREEN_PATH,
} from '../../navigation/routes';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';

class TopSearch extends Component {
  static contextType = ThemeContext;

  static navigationOptions = ({ navigation }) => ({
    title: translate('search.title'),
    headerBackTitle: ' ',
    headerRight: () => <HeaderGridToggleIcon />,
  });

  constructor(props) {
    super(props);
    this.state = {
      input: '',
    };
    this.getSearchProducts = _.debounce(this.props.getSearchProducts, 1000);
  }

  onRowPress = product => {
    this.props.setCurrentProduct({ product });
    NavigationService.navigate(NAVIGATION_SEARCH_PRODUCT_PATH, {
      product,
      title: product.name,
    });
  };

  onSearchPressed = () => {
    NavigationService.navigate(NAVIGATION_SEARCH_SCREEN_PATH, {});
  };

  onEndReached = () => {
    const { canLoadMoreContent, loadingMore, products } = this.props;
    const { sortOrder, priceFilter } = this.props;

    if (!loadingMore && canLoadMoreContent) {
      this.props.getSearchProducts(
        this.state.input,
        products.length,
        sortOrder,
        priceFilter,
      );
    }
  };

  updateSearch = input => {
    this.setState({ input }, () => {
      this.props.resetFilters();
      this.getSearchProducts(
        input,
        null,
        this.props.sortOrder,
        this.props.priceFilter,
      );
    });
  };

  performSort = sortOrder => {
    this.props.addFilterData(sortOrder);
    this.props.getSearchProducts(
      this.state.input,
      null,
      sortOrder,
      this.props.priceFilter,
    );
  };

  renderContent = () => (
    <ProductList
      products={this.props.products}
      navigation={this.props.navigation}
      onEndReached={this.onEndReached}
      canLoadMoreContent={this.props.canLoadMoreContent}
      searchIndicator
      onRowPress={this.onRowPress}
      gridColumnsValue={this.props.listTypeGrid}
      performSort={this.performSort}
      currencySymbol={this.props.currencySymbol}
      currencyRate={this.props.currencyRate}
    />
  );

  render() {
    const theme = this.context;
    const { input } = this.state;

    return (
      <View style={styles.containerStyle(theme)}>
        {/* <SearchBar
          placeholder={translate('search.searchPlaceholderText')}
          onChangeText={this.updateSearch}
          value={input}
          containerStyle={styles.searchStyle(theme)}
          inputStyle={styles.inputStyle(theme)}
          inputContainerStyle={styles.inputContainerStyle(theme)}
          showLoading={this.props.loadingMore}
        /> */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <TouchableOpacity
            style={styles.searchBarContainer}
            onPress={() => this.onSearchPressed()}>
            <Icon name={'search'} size={20} color="#8BC63E" />
            <Text style={styles.searchText}>Search</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={{ position: 'absolute',top:50,
   width:'100%',backgroundColor:'#fff' }}>{this.renderContent()}</View> */}
      </View>
    );
  }
}

const styles = {
  containerStyle: theme => ({
    backgroundColor: theme.colors.background,
    width: theme.dimens.WINDOW_WIDTH - 100,
    flex: 1,
  }),
  searchStyle: theme => ({
    backgroundColor: theme.colors.background,
    alignSelf: 'center',
    borderBottomWidth: 0,
    borderTopWidth: 0,
    height: '90%',
    width: '100%',
  }),
  searchBarContainer: {
    width: '90%',
    borderRadius: 10,
    padding: 7,
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#8BC63E',
  },
  inputContainerStyle: theme => ({
    backgroundColor: '#F3F3F3', //theme.colors.surface,
    borderRadius: 30, //theme.dimens.searchBarBorderRadius,
    marginLeft: 0,
  }),
  inputStyle: theme => ({
    backgroundColor: '#F3F3F3', //theme.colors.surface,
    color: '#A8A8A8', //theme.colors.titleText,
    fontFamily: 'SFPRODISPLAYREGULAR',
    fontSize: 15,
  }),
  notFoundTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  searchText: { fontSize: 14, color: 'grey', marginLeft: 10 },
  notFoundText: {
    textAlign: 'center',
  },
};

const mapStateToProps = ({ search, filters, magento, ui }) => {
  const { sortOrder, priceFilter } = filters;
  const { products, totalCount, loadingMore } = search;
  const {
    currency: {
      displayCurrencySymbol: currencySymbol,
      displayCurrencyExchangeRate: currencyRate,
    },
  } = magento;
  const canLoadMoreContent = products.length < totalCount;
  const { listTypeGrid } = ui;

  return {
    products,
    sortOrder,
    totalCount,
    loadingMore,
    priceFilter,
    currencyRate,
    listTypeGrid,
    currencySymbol,
    canLoadMoreContent,
  };
};

export default connect(mapStateToProps, {
  getSearchProducts,
  setCurrentProduct,
  resetFilters,
  addFilterData,
})(TopSearch);
