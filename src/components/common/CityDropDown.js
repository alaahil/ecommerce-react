import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Cities = [
  'Dubai',
  'Abu Dhabi',
  'Al Ain',
  'Ajman',
  'Sharjah',
  'Fujairah',
  'Ras Al Khaimah',
  'Umm Al Quwain',
];

const CityDropDown = ({
  selectedCity = 'Select your city',
  onPressCity,
  hasError,
  style,
}) => {
  const [visible, setVisible] = useState(false);

  const renderDropdown = () => {
    return Cities.map(city => (
      <TouchableOpacity
        style={styles.cityOptionContainer}
        onPress={() => {
          onPressCity(city);
          setVisible(false);
        }}>
        <Text>{city}</Text>
        {selectedCity === city ? (
          <Icon name="check" size={24} color="#8BC63E" />
        ) : null}
      </TouchableOpacity>
    ));
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.buttonContainer,
          style,
          hasError ? { borderWidth: 2, borderColor: 'red' } : undefined,
        ]}
        onPress={() => setVisible(!visible)}>
        <View style={styles.buttonHeader}>
          <Text style={styles.buttonText}>{selectedCity}</Text>
          <Icon name="chevron-down" size={24} />
        </View>
      </TouchableOpacity>
      {visible && renderDropdown()}
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: '#E5E5E5',
    height: 48,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 16,
    borderRadius: 6,
    zIndex: 1,
  },
  cityOptionContainer: {
    backgroundColor: '#fff',
    height: 48,
    width: '100%',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    flex: 1,
    color: 'grey',
  },
});

export { CityDropDown, Cities };
