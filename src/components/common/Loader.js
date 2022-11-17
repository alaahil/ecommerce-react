import React, { useContext } from 'react';
import { View, ActivityIndicator, Modal } from 'react-native';
import { ThemeContext } from '../../theme';

const Loader = ({ isVisible }) => {
  const theme = useContext(ThemeContext);
  return (
    <Modal visible={isVisible} transparent={true} style={{ flex: 1 }}>
      <View style={[styles.mainViewStyle]}>
        <ActivityIndicator size={'large'} color={theme.colors.secondary} />
      </View>
    </Modal>
  );
};

const styles = {
  mainViewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.7)',
  },
};

export { Loader };
