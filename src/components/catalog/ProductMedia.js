import React, { useContext } from 'react';
import Swiper from 'react-native-swiper';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { magento } from '../../magento';
import { Spinner } from '../common';
import { ThemeContext } from '../../theme';

const ProductMedia = props => {
  const theme = useContext(ThemeContext);

  const renderMedia = () => {
    const { media } = props;

    if (!media) {
      return <Spinner />;
    }
    return (
      <Swiper showsPagination pagingEnabled autoplay={false}>
        {renderMediaItems()}
      </Swiper>
    );
  };

  const renderMediaItems = () => {
    const { media } = props;

    return media.map(item => {
      return (
        <View style={styles.fullImage}>
          <FastImage
            key={item.id}
            style={styles.imageStyle(theme)}
            resizeMode="contain"
            source={{ uri: magento.getProductMediaUrl() + item.file }}
          />
        </View>
      );
    });
  };

  return <View style={styles.imageContainer(theme)}>{renderMedia()}</View>;
};

const styles = {
  imageContainer: theme => ({
    height: theme.dimens.productDetailImageHeight,
  }),
  imageStyle: theme => ({
    height: theme.dimens.productDetailImageHeight - 10,
    width: '100%',
    // height:275,
    flexDirection: 'row',
    justifyContent: 'center',
    aliignItems: 'center',
    resizeMode: 'contain',
  }),
  fullImage: {
    backgroundColor: '#fff',
    width: 320,
    height: 300,
    borderRadius: 10,
    // flexDirection:'row',
    alignSelf: 'center',
    flex: 1,
    // borderRadius:25,
  },
};

export default ProductMedia;
