import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { resetFilters, setCurrentCategory } from '../../actions';
import NavigationService from '../../navigation/NavigationService';
import { NAVIGATION_CATEGORY_DRILL_PATH } from '../../navigation/routes';
import { getCategoriesChildrenWithData } from '../common/utils';
import place_holder from '../../assets/productDetails/place_holder.png';
const imageData = [
  { name: 'All Items', image: require('../../assets/allcategory/Alltems.png') },
  { name: 'Flash Sales', image: require('../../assets/allcategory/FlashSale.png') },
  { name: 'Ready Meals', image: require('../../assets/allcategory/readymeals.png') },
  { name: 'Appetizers', image: require('../../assets/allcategory/appetizers.png') },
  { name: 'Canned Product', image: require('../../assets/allcategory/CannedProducts.png') },
  { name: 'Traditional Food', image: require('../../assets/allcategory/TraditionalFood.png') },
  { name: 'Protein', image: require('../../assets/allcategory/Protein.png') },
  { name: 'Bakery', image: require('../../assets/allcategory/bakery.png') },
  { name: 'Dairy', image: require('../../assets/allcategory/Dairy.png') },
  { name: 'Desserts', image: require('../../assets/allcategory/desserts.png') },
  { name: 'Water', image: require('../../assets/allcategory/water.png') },
  { name: 'Plant Based', image: require('../../assets/allcategory/PlantBased.png') },
  { name: 'Frozen Potato Products', image: require('../../assets/allcategory/FrozenPotato.png') },
  { name: 'Chocolate and Nuts', image: require('../../assets/allcategory/ChocolateandNuts.png') },
  { name: 'Beverages', image: require('../../assets/allcategory/Beverages.png') },
  { name: 'Pantry Items', image: require('../../assets/allcategory/PantryItems.png') },
  { name: 'Pasta and Rice', image: require('../../assets/allcategory/PastaandRice.png') },
  { name: 'New Products', image: require('../../assets/allcategory/NewProducts.png') },
  { name: 'Best Sellers', image: require('../../assets/allcategory/BestSellers.png') },
]
const arrayForCategoryImage = [
  371, 381, 382, 383, 385, 387, 389, 391, 393, 401, 409,
];
const Category = ({ categoryTree }) => {
  const dispatch = useDispatch();

  const [categories, setCategories] = useState([]);

  const filterCategories = (data, isMain) => {
    let clubbedData = isMain
      ? [
        {
          id: 91,
          parent_id: 87,
          name: 'All Items',
          is_active: true,
          position: 1,
          level: 2,
          product_count: 1121,
          children_data: [],
        },
        {
          id: 196,
          parent_id: 87,
          name: 'Flash Sales',
          is_active: true,
          position: 10,
          level: 4,
          product_count: 53,
          children_data: [],
        },
      ]
      : [];
    const newProductData = isMain
      ? [
        {
          id: 195,
          parent_id: 87,
          name: 'New Products',
          is_active: true,
          position: 2,
          level: 2,
          product_count: 100,
          children_data: [],
        },
        {
          id: 198,
          parent_id: 87,
          name: 'Best Sellers',
          is_active: true,
          position: 5,
          level: 2,
          product_count: 57,
          children_data: [],
        },
      ]
      : [];
    data.map((item) => {
      if (item.isActive || item.is_active) {
        clubbedData = [...clubbedData, item];
      }
    });
    clubbedData = [...clubbedData, ...newProductData];
    setCategories(clubbedData);
  };
  useEffect(() => {
    const categories =
      categoryTree && categoryTree.children_data
        ? categoryTree.children_data.filter(
          (data) => data.name === 'Categories'
        )
        : [];
    const fifaDetails =
      categoryTree && categoryTree.children_data
        ? categoryTree.children_data.filter((data) => data.id === 2197)
        : [];
    let fifa = [];
    if (fifaDetails.length) {
      const fifaData = fifaDetails[0] || {};
      if (fifaData?.is_active) {
        fifa.push(fifaData);
      }
    }

    const filterData =
      categories.length > 0 ? getCategoriesChildrenWithData(categories[0]) : [];
    filterCategories([...fifa, ...filterData], true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(categories)

  const renderAllCategoriesFilters = () => {
    return (
      <FlatList
        style={{ width: '100%', flex: 1, marginVertical: 15 }}
        data={categories}
        numColumns={3}
        renderItem={renderCategory}
        scrollEnabled={true}
      />
    );
  };

  const renderCategory = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => onCategoryPress(item)}
        style={{
          flexDirection: 'column',
          marginTop: 15,
          alignItems: 'center',
          width: Dimensions.get('screen').width / 3,
        }}
      >
        <Image
          source={imageData[index].name == item.name ? imageData[index].image : place_holder}
          style={{ height: 104, width: 108, borderRadius: 8 }}
          resizeMode={'contain'}
        />
        <Text style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const onCategoryPress = (item) => {
    if (item?.data?.length > 0) {
      const payload = item?.data[0];
      if (payload) {
        dispatch(resetFilters());
        dispatch(setCurrentCategory({ category: payload }));
        NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
          title: payload.name,
          selectedCategory: payload,
        });
      }
    } else {
      dispatch(resetFilters());
      dispatch(setCurrentCategory({ category: item }));
      NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
        title: item.name,
        selectedCategory: item,
      });
    }
  };

  return <View style={styles.wrapper}>
    {renderAllCategoriesFilters()}
  </View>;
};

const styles = StyleSheet.create({
  containerStyle: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }),
  iconWrapper: (theme) => ({
    flex: 1,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  headerTextStyle: (theme) => ({
    textTransform: 'capitalize',
    color: '#759744',
    marginLeft: theme.spacing.small,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  }),
  flashSalesContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#8BC63E',
  },
  topButtonContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  wrapper: {
    backgroundColor: 'white',
    flex: 1,
  },
  flashSalePillText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  moreFilterPillStyle: {
    padding: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#759744',
    minWidth: 64,
    marginRight: 10,
  },
  moreFiltersContainer: { flexDirection: 'row', paddingVertical: 20 },
  moreFilterText: {
    fontSize: 14,
  },
  resetFilterContainer: {
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    width: '30%',
    alignSelf: 'flex-end',
    padding: 3,
  },
});

const mapStateToProps = (state) => {
  const categoryTree = state.categoryTree;

  return {
    categoryTree,
  };
};

export default connect(mapStateToProps, {})(Category);
