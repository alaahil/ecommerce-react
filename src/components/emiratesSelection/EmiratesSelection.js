import React, { useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';
import RNRestart from 'react-native-restart';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { connect } from 'react-redux';
import { setUserEmirates, resetCategoryTree } from '../../actions';
import { Cities } from '../common/CityDropDown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationService from '../../navigation/NavigationService';

const storesPerEmirates = {
  ['Dubai']: 's44',
  ['Abu Dhabi']: 's45',
  ['Al Ain']: 's45',
  ['Ajman']: 's44',
  ['Sharjah']: 's44',
  ['Fujairah']: 's44',
  ['Ras Al Khaimah']: 's44',
  ['Umm Al Quwain']: 's44',
};

const EmiratesSelection = (props) => {
  const [selectedCity, setSelectedCity] = useState(props.emirates ?? 'Dubai');

  const renderCities = () => {
    return Cities.map((city) => (
      <TouchableOpacity
        style={styles.cityOptionContainer}
        onPress={() => setSelectedCity(city)}
      >
        <Text>{city}</Text>
        {selectedCity === city ? (
          <Icon name="check" size={24} color="#8BC63E" />
        ) : null}
      </TouchableOpacity>
    ));
  };

  const onPressSave = () => {
    Alert.alert(
      '"Bidfood" wants to restart',
      'Allow app to restart to change the city',
      [
        {
          text: 'Cancel',
          onPress: () => {
            NavigationService.goBack();
          },
          style: 'destructive',
        },
        {
          text: 'Allow',
          onPress: async () => {
            props.setUserEmirates(selectedCity);
            props.resetCategoryTree();
            await AsyncStorage.setItem(
              'store',
              storesPerEmirates[selectedCity]
            );

            await AsyncStorage.setItem('storeCity', selectedCity);

            await AsyncStorage.setItem('isRegionSelected', 'true');
            setTimeout(() => {
              RNRestart.Restart();
              SplashScreen.show();
            }, 500);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text>Select Your Emirate</Text>
        {renderCities()}
        <TouchableOpacity style={styles.buttonContainer} onPress={onPressSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  cityOptionContainer: {
    backgroundColor: '#fff',
    height: 48,
    width: '90%',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 10,
  },
  headerStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8BC63E',
    alignSelf: 'center',
    marginVertical: 20,
  },
  buttonContainer: {
    backgroundColor: '#8BC63E',
    height: 48,
    width: '80%',
    paddingHorizontal: 10,
    marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const mapStateToProps = ({ account }) => {
  return { emirates: account.store.emirates };
};

export default connect(mapStateToProps, { setUserEmirates, resetCategoryTree })(
  EmiratesSelection
);
