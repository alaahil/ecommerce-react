import React, { useContext } from 'react';
import { View, Image, Text } from 'react-native';
import PropTypes from 'prop-types';
import { ThemeContext } from '../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HeaderTop = ({ size, style }) => {
  const theme = useContext(ThemeContext);
  const { top } = useSafeAreaInsets();
  const logo = require('../../../resources/icons/bidcorp_logo.png');
  return (
    <View style={[styles.container(top), style]}>
      {/* <Image
        source={{
          uri: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
        }}
        style={{ width: 34, height: 34, borderRadius: 50, marginLeft: 16 }}
      /> */}
      <Image source={logo} style={{ width: 80, height: 40 }} />
      {/* <Text style={[styles.point, style]}>
        <Text style={[styles.pointBload, style]}>$</Text> 23 points
      </Text> */}
    </View>
  );
};
const styles = {
  container: (top) => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 43,
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginRight: 15,
    marginTop: top,
  }),
  point: {
    width: 89,
    height: 35,
    paddingBottom: 9,
    paddingTop: 5,
    paddingLeft: 12,
    borderRadius: 50,
    backgroundColor: '#C7F092',
    fontSize: 12,
    color: '#91B460',
    letterSpacing: -0.165,
  },
  pointBload: {
    fontWeight: 'bold',
    fontSize: 15,
    paddingLeft: 10,
  },
};

export { HeaderTop };
