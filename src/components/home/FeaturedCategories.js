import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, ScrollView } from 'react-native';
import FastImage from 'react-native-fast-image';
import Swiper from 'react-native-swiper';
import { Text } from '../common';
import { magento } from '../../magento';
import { ThemeContext } from '../../theme';
import { TouchableOpacity } from 'react-native-gesture-handler';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_CATEGORY_DRILL_PATH,
  NAVIGATION_FEATURED_CATEGORIES,
} from '../../navigation/routes';
import {
  getFeaturedCategoryProducts,
  setCurrentCategory,
  resetFilters,
} from '../../actions';
import place_holder2 from '../../assets/productDetails/place_holder2.png';
import {
  getCategoryThumbnailFromAttributes,
  getProductThumbnailFromAttributes,
} from '../../helper/product';
import { useDispatch } from 'react-redux';
import { BASE_URL } from '../../constant/constant';

const FeaturedCategories = ({ homeCategories, style }) => {
  const theme = useContext(ThemeContext);
  const image = require('../../../resources/images/new.jpg');
  const image1 = require('../../../resources/images/category-icon-01.png');
  const image2 = require('../../../resources/images/category-icon-02.png');
  const image3 = require('../../../resources/images/category-icon-03.png');
  const image4 = require('../../../resources/images/category-icon-04.png');
  const image5 = require('../../../resources/images/category-icon-05.png');
  const image6 = require('../../../resources/images/category-icon-06.png');
  const arrow = require('../../../resources/images/dropdown.png');
  const dispatch = useDispatch();
  const productCategories = [
    {
      image: require('../../../resources/categories/soft_drinks.jpeg'),
      name: 'Beverages',
      id: '375',
    },
    {
      image: require('../../../resources/categories/meat.jpg'),
      name: 'Meat',
      id: '373',
    },
    {
      image: require('../../../resources/categories/bakery.jpeg'),
      name: 'Bakery',
      id: '383',
    },
    {
      image: require('../../../resources/categories/appetizer.jpeg'),
      name: 'Appetizers',
      id: '380',
    },
    {
      image: require('../../../resources/categories/dairy.jpeg'),
      name: 'Dairy',
      id: '387',
    },
    {
      image: require('../../../resources/categories/ready_meals.png'),
      name: 'Ready Meals',
      id: '401',
    },
  ];

  return (
    <>
      <View>
        <Text
          style={{
            width: 229,
            marginLeft: 14,
            fontSize: 17,
            paddingTop: 15,
            color: '#1A051D',
            fontWeight: 'bold',
          }}
        >
          {'Featured Categories'}
        </Text>
        {/* <FastImage
          style={{
            width: 10,
            height: 13,
            alignSelf: 'flex-end',
            marginTop: -13,
            marginRight: 15,
            fontSize: 12,
          }}
          source={arrow}
        /> */}
      </View>
      <ScrollView
        contentContainerStyle={[styles.container, style]}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        {homeCategories?.map((item) => {
          // const custom_attributes = item.custom_attributes;
          // var imageData = custom_attributes.filter(el =>{
          //   return el['attribute_code'] === "cat_image_thumbnail";
          // });
          // var filename = imageData[0]?.value.replace(/^.*[\\\/]/, '');
          // const imageUrl = magento.getMediaUrl() + 'catalog/category/' + filename;
          // const imageUrl = getCategoryThumbnailFromAttributes(item);
          return (
            <TouchableOpacity
              style={styles.fullImage}
              onPress={() => {
                getFeaturedCategoryProducts(item.id, (result) => {
                  //  alert("resultsssss==>", result);

                  // if(result && result.payload && result.payload.products && result.payload.products.items.length>0 )
                  // {
                  let products = result.payload.products;
                  let title = item.name;
                  // console.log('featured categories >>>>', item);
                  dispatch(resetFilters());
                  dispatch(setCurrentCategory({ category: item }));
                  // alert(JSON.stringify(item));
                  NavigationService.navigate(NAVIGATION_CATEGORY_DRILL_PATH, {
                    title: item.name,
                    selectedCategory: { ...item, children_data: [] },
                  });
                  // }
                  // else
                  // {
                  //   alert("No data found!")
                  // }
                });
              }}
            >
              <FastImage
                style={{ width: 150, height: 150, borderRadius: 20 }}
                resizeMode={'contain'}
                source={{ uri: BASE_URL + item.custom_attributes[0].value }}
              />
              <View>
                <Text
                  type="subheading"
                  //style={themeStyles.text}
                  style={styles.text}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        {/* <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image6} />
        </View>
        <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image5} />
        </View>
        <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image4} />
        </View>
        <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image3} />
        </View>
        <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image2} />
        </View>
        <View style={styles.fullImage}>
          <FastImage style={{ width: 46, height: 46 }} source={image1} />
        </View> */}
      </ScrollView>
    </>
  );
};
// const styles = StyleSheet.create({
//   container1: {
//     width: 229,
//     height: 24,
//     marginLeft: 14,
//     marginTop: 300,
//     fontFamily: 'Inter',
//     fontStyle: 'normal',
//     fontWeight: 600,
//     fontSize: 17,
//     lineHeight: 22

//   },
// });

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent:'space-around',

    paddingTop: 25,
    // borderBottomColor: '#C7F092',
    // borderBottomWidth: 2,
    // paddingBottom: 30,
    marginLeft: 15,
    marginRight: 16,
  },
  fullImage: {
    paddingRight: 10,
    // alignItems:'center',
  },
  text: {
    fontSize: 14,
    // fontWeight:'bold',
    alignSelf: 'center',
    color: '#181725',
    fontFamily: 'Inter-Medium',
  },
});

export default FeaturedCategories;
