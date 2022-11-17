import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context'
import {
  NAVIGATION_ADDRESS_SCREEN_PATH,
  NAVIGATION_NEW_ADDRESS_PATH,
} from '../navigation/routes';
import { logError } from '../helper/logger';
import AsyncStorage from '@react-native-community/async-storage';
import { magento } from '../magento';
import Checkbox from '../components/account/checkbox';
import { useSelector, useDispatch } from 'react-redux';
import { get_Address_detail } from '../actions';

// import {
//     deleteCustomerAddress
// } from '../actions';

export default function MyAddreess({ navigation }) {
  const dispatch = useDispatch();
  const getAddressForCheckbox = useSelector(
    (state) => state.getAddress.getAddress
  );
  const [customerAddresses, setCustomerAddresses] = useState([]);
  // var customerAddresses =[]
  const [isLoading, setLoading] = useState(true);
  const [checkBoxChecked, setCheckBoxChecked] = useState();

  useEffect(() => {
    // getCustomerInfo();
    customerAddresses?.map((item) => {
      if (item.id == getAddressForCheckbox.id) {
        setCheckBoxChecked(customerAddresses.indexOf(item));
      }
      //  else {
      //     setCheckBoxChecked(customerAddresses.indexOf(item, start))
      // }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerAddresses]);

  // let user = AsyncStorage.getItem('selectedCheckBox').then((val) => {

  //     customerAddresses?.map((item) => {

  //         if (item.id == val) {
  //             setCheckBoxChecked(customerAddresses.indexOf(item));
  //             console.log(item)
  //         }

  //     })
  // });

  useEffect(() => {
    // if (navigation.isFocused()) { getCustomerInfo(); }
    getCustomerInfo();
    const focusListener = navigation.addListener('didFocus', () => {
      //   The screen is focused
      //   Call any action
      getCustomerInfo();
    });
    return () => {
      // clean up event listener
      focusListener.remove();
    };
  }, [navigation]);

  const getCustomerInfo = async () => {
    try {
      const customer = await magento.customer.getCurrentCustomer();
      // console.log("currentCustomer==>", JSON.stringify(customer.addresses))
      let testAddress = Array();
      for (let i = 0; i < customer.addresses.length; i++) {
        let address = customer.addresses[i];
        address.src = require('../assets/Icons/delete_Icon.png');
        address.src1 = require('../assets/Icons/edit_image.png');
        // console.log("customer" + i, address)
        // if (customer.addresses[i].id == getAddressForCheckbox.id) {
        //     setCheckBoxChecked(customerAddresses.indexOf(item));
        //     console.log("indexxxxxxx", customerAddresses.indexOf(item))
        // }
        testAddress.push(address);

        // setCustomerAddresses(prevArray => [...prevArray, address])
      }

      // console.log("addresses size==>", testAddress.length)
      // setCustomerAddresses(testAddress)

      setCustomerAddresses([...testAddress]);

      setTimeout(() => {
        // console.log("currentCustomer==>", JSON.stringify(customerAddresses))
        setLoading(false);
      }, 10000);
    } catch (error) {
      console.log('onAppStart -> unable to retrieve current customer', error);
      logError(error);
    }
  };
  // const [address, setAddress] = useState([
  //     {
  //         id: 1,

  //         title: 'Home',
  //         src: require('../assets/Icons/delete_Icon.png'),
  //         src1: require('../assets/Icons/edit_image.png'),
  //         address: '51/5A, Road: 7, Pallabi, Dubai',

  //     },
  //     {
  //         id: 2,
  //         title: 'Work',

  //         src: require('../assets/Icons/delete_Icon.png'),
  //         src1: require('../assets/Icons/edit_image.png'),
  //         address: 'Dingi Technologies Ltd, Wakil T',
  //     },

  // ]);

  const onPressAddress = async (id) => {
    console.log('onPressAddress==> ', id);

    await AsyncStorage.setItem(
      'selectedAddressIndex',
      `${id}`
      // `${index}`
    );

    navigation.navigate(NAVIGATION_ADDRESS_SCREEN_PATH, { addressID: id });
  };

  const onPressDeleteAddress = async (id) => {
    // navigation.navigate(NAVIGATION_ADDRESS_SCREEN_PATH);
    // alert("ID is: => "+id);

    Alert.alert('Address Delete!', 'Are you sure you want to delete', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          console.log('OK Pressed');
          deleteAddress(id);
        },
      },
    ]);
  };

  const deleteAddress = async (id) => {
    const result = await magento.admin.deleteCustomerAddress(id);

    alert(
      result === true ? 'Address deleted successfully' : 'Address not deleted!'
    );

    getCustomerInfo();

    console.log('delete addess ', result);
  };
  const onPressAddNewAddress = () => {
    navigation.navigate(NAVIGATION_NEW_ADDRESS_PATH);
  };

  const onselectItem = async (item, index) => {
    setCheckBoxChecked(index);
    // console.log('item', item);
    dispatch(get_Address_detail(item));
  };

  return (
    <View style={styles.container}>
      {customerAddresses != null && customerAddresses.length > 0 && (
        <FlatList
          data={customerAddresses}
          renderItem={({ item, index }) => {
            console.log(JSON.stringify(item));
            return (
              <View>
                <View style={styles.flatViewstyle}>
                  <View style={{ flexDirection: 'row' }}>
                    <Checkbox
                      select={() => onselectItem(item, index)}
                      icon={checkBoxChecked == index}
                    />
                    <Text style={styles.titleTextStyle}>
                      {item.custom_attributes
                        ? item.custom_attributes[0].value.toUpperCase()
                        : 'HOME'}
                    </Text>
                  </View>

                  {/* source={require('./my-icon.png')} */}
                  {/* address['src'] = require('../assets/Icons/delete_Icon.png')
                address['src1'] = require('../assets/Icons/edit_image.png') */}

                  <View style={{ marginRight: 16 }}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => onPressAddress(index)}>
                        <View style={styles.imgView}>
                          <Image
                            source={require('../assets/Icons/edit_image.png')}
                            style={{
                              width: 20,
                              height: 20,
                              resizeMode: 'center',
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => onPressDeleteAddress(item.id)}
                      >
                        <View style={styles.imagView}>
                          <Image
                            source={require('../assets/Icons/delete_Icon.png')}
                            style={{
                              width: 20,
                              height: 20,
                              resizeMode: 'center',
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <Text style={styles.addressText}>
                  {item.street[0]}, {item.postcode}, {item.city},{' '}
                  {item.country_id}
                </Text>

                <View
                  style={{
                    borderWidth: 1,
                    marginTop: 20,
                    borderColor: 'lightgray',
                    marginRight: 20,
                    marginLeft: 20,
                  }}
                />
              </View>
            );
          }}
        />
      )}
      <TouchableOpacity style={styles.BUTTON} onPress={onPressAddNewAddress}>
        <Text style={styles.TextStle}>Add New Address</Text>

        <Image
          style={styles.image3}
          source={require('../assets/Icons/add.png')}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  Image: {
    backgroundColor: '#0C034C',

    height: 20,
    width: 20,
  },
  Image1: {
    height: 20,
    width: 20,
  },
  BUTTON: {
    // position: "absolute",
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#8BC63E',
    height: 40,
    alignItems: 'center',
    marginRight: '10%',
    marginLeft: '10%',
    borderRadius: 10,
    marginBottom: 12,
  },
  TextStle: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 50,
  },
  container: {
    backgroundColor: 'white',
    height: '100%',
  },
  image3: {
    height: 12,
    width: 12,
    tintColor: 'white',
  },
  imagView: {
    backgroundColor: '#0C034C',
    width: 30,
    marginRight: 20,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  imgView: {
    backgroundColor: '#B6B6B6',
    width: 30,
    marginRight: 20,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  flatViewstyle: {
    marginTop: 20,
    flexDirection: 'row',
    marginVertical: 10,
    justifyContent: 'space-around',
  },
  flatViewstyle1: {
    // marginTop: 10,
    // margin: 10,
    padding: 20,

    // flexDirection: 'row',
    // justifyContent: 'space-between'
  },
  titleTextStyle: {
    color: 'black',
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressText: {
    color: 'black',
    marginLeft: 20,
    fontSize: 14,
  },
});
