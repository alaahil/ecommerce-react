import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Button } from 'react-native';
import FastImage from 'react-native-fast-image';
import Swiper from 'react-native-swiper';
import { Text } from '../common';
import { magento } from '../../magento';
import { ThemeContext } from '../../theme';

const DailyRecipes = ({ slider, style }) => {
  const theme = useContext(ThemeContext);
  const image = require('../../../resources/images/recipe.png');
  const more = require('../../../resources/icons/more.png');
  const star = require('../../../resources/icons/star.png');
  const arrow = require('../../../resources/images/dropdown.png');

  return (
    <>
      <View style={styles.headingConteiner}>
        <Text style={styles.heading}>Daily Recipes</Text>
        <FastImage
          style={{
            width: 10,
            height: 13,
            alignSelf: 'flex-end',
            marginTop: -14,
            marginRight: 15,
            fontSize: 12,
          }}
          source={arrow}
        />
      </View>

      <View style={styles.containerDR}>
        <View style={styles.recipeBox}>
          <View>
            <View style={styles.rating}>
              <FastImage style={{ width: 10, height: 10 }} source={star} />
              <Text style={styles.infoWeightRatingTxtRight}> 4.8 </Text>
            </View>
            <FastImage style={{ width: 160, height: 95 }} source={image} />
            <Text style={styles.timeCat}>20min . Breakfast </Text>
          </View>
          <View>
            <Text numberOfLines={2} style={styles.titleDR}>
              Bún truyền Vietnamese
            </Text>
            <FastImage style={styles.imageDR} source={more} />
          </View>
        </View>

        <View style={styles.recipeBox}>
          <View>
            <View style={styles.rating}>
              <FastImage style={{ width: 10, height: 10 }} source={star} />
              <Text style={styles.infoWeightRatingTxtRight}> 4.8 </Text>
            </View>
            <FastImage style={{ width: 160, height: 95 }} source={image} />
            <Text style={styles.timeCat}> 20min . Breakfast </Text>
          </View>
          <View>
            <Text numberOfLines={2} style={styles.titleDR}>
              Bún truyền Vietnamese
            </Text>
            <FastImage style={styles.imageDR} source={more} />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  containerDR: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // marginTop:30,
  },
  headingConteiner: {
    paddingBottom: 25,
  },
  heading: {
    width: 229,
    marginLeft: 14,
    fontSize: 17,
    paddingTop: 15,
    color: '#1A051D',
    fontWeight: 'bold',
  },
  timeCat: {
    fontSize: 11,
    color: '#B6B6B6',
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleDR: {
    fontSize: 13,
    color: '#000000',
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  recipeBox: theme => ({
    padding: theme.spacing.tiny,
    width: theme.dimens.WINDOW_WIDTH * 0.38,
    margin: 5,
    position: 'relative',
  }),

  imageDR: {
    paddingTop: 15,
    width: 32,
    height: 32,
    alignSelf: 'flex-end',
  },
  rating: {
    backgroundColor: '#F6D798',
    position: 'absolute',
    marginTop: -1,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    padding: 2,
    width: 50,
    alignSelf: 'flex-end',
  },
  infoWeightRatingTxtRight: { color: '#ffffff' },
});

export default DailyRecipes;
