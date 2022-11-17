import React, { Component, useEffect, useNavigation } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { connect } from 'react-redux';
import {
  getCountries,
  addGuestCartBillingAddress,
  createCustomer,
  updateCheckoutUI,
  checkoutCustomerNextLoading,
  setCustomerAccountInfoBoolean,
  setCustomerPaymentInfoBoolean,
  removeFromCartLoading,
  removeFromCart,
  refreshCart,
  setCustomerShippingInfoBoolean,
} from '../../actions';
import { magento } from '../../../src/magento';
import { Spinner, ModalSelect, Text } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { CityDropDown } from '../common/CityDropDown';
import AsyncStorage from '@react-native-community/async-storage';
import { store } from '../../store';
import { NAVIGATION_NEW_ADDRESS_PATH } from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
const specialCharRegExp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const validateEmail = /\S+@\S+\.\S+/;
// let user = AsyncStorage.getItem('selectedCheckBox').then((val) => {

//   customerAddresses?.map((item) => {

//     if (item.id == val) {
//       setCheckBoxChecked(customerAddresses.indexOf(item));
//       console.log('vlaue', user)
//     }

//   })
// });

const store45 = ['Abu Dhabi', 'Al Ain'];

class CheckoutCustomerAccount extends Component {
  static contextType = ThemeContext;

  state = {
    errors: {},
    selectedCity: '',
    apartment_no: '',
    building_name: '',
    address_type: '',
    landmark: '',
    radioSelected: 0,
    iscountryselected: false,
  };

  componentWillMount() {
    var value = AsyncStorage.getItem('store');

    // AsyncStorage.getItem('storeCity').then((res) => {
    //   this.setState({ selectedCity: res });
    //   console.log("storeCity", "storeCity==> " + res);
    // })

    //  value.then((e)=>{
    //    this.setState({
    //     name: e.name
    //    })
    //  })
  }

  componentDidMount() {
    var data_val = store.getState().getAddress.getAddress;
    this.props.updateCheckoutUI('countryId', 'AE');
    this.setState({ iscountryselected: true });
    this.props.getCountries();
    this.props.setCustomerAccountInfoBoolean(false);
    this.props.setCustomerShippingInfoBoolean(false);
    this.props.setCustomerPaymentInfoBoolean(false);
    setTimeout(() => {
      this.countrySelect();
    }, 500);

    this.props.updateCheckoutUI('error', false);
    this.props.checkoutCustomerNextLoading(false);

    const { customer } = this.props;
    if (customer.firstname && customer.firstname.length) {
      this.updateUI('firstname', customer.firstname);
    }
    if (customer.lastname && customer.lastname.length) {
      this.updateUI('lastname', customer.lastname);
    }
    if (customer.email && customer.email.length) {
      this.updateUI('email', customer.email);
    }
    if (customer.addresses.length !== 0) {
      this.setState({ selectedCity: customer.addresses[0].city });

      this.setState({
        address_type: customer.addresses[0].custom_attributes[0]?.value || '',
      });
      this.setState({
        building_name: customer.addresses[0].custom_attributes[2]?.value || '',
      });
      this.setState({
        apartment_no: customer.addresses[0].custom_attributes[1]?.value || '',
      });
      this.setState({
        landmark: customer.addresses[0].custom_attributes[3]?.value || '',
      });
    } else {
      AsyncStorage.getItem('storeCity').then((res) => {
        this.setState({ selectedCity: res });
      });
    }

    if (customer) {
    }
    if (customer && customer.addresses && customer.addresses.length) {
      const address = customer.addresses[0];
      const regionData = address.region;
      const region = {
        regionCode: regionData.region_code,
        region: regionData.region,
        regionId: regionData.region_id,
      };
      this.updateUI('countryId', address.country_id);
      if (!address?.region?.region) {
        this.updateUI('region', '');
      } else {
        this.updateUI('region', address?.region?.region);
      }

      if (!address?.street) {
        this.updateUI('street', '');
      } else {
        this.updateUI(
          'street',
          address?.street.length ? address?.street[0] : ''
        );
      }
      this.updateUI('city', this.state.selectedCity);
      if (!address?.postcode) {
        this.updateUI('postcode', '');
      } else {
        this.updateUI('postcode', address?.postcode);
      }
      if (!address?.telephone) {
        this.updateUI('telephone', '');
      } else {
        this.updateUI('telephone', address?.telephone);
      }
    }
  }

  removeItemFromCart = async (productsIds) => {
    const {
      removeFromCartLoading,
      removeFromCart,
      cart,
      cartId,
      cartItems,
      refreshCart,
    } = this.props;

    const productIdsLength = productsIds?.length || 0;
    let item = {};
    const removeItemName = [];
    for (let i = 0; i < productIdsLength; i++) {
      for (let j = 0; j < cartItems?.length; j++) {
        if (productsIds[i] === cartItems[j]?.sku) {
          item = cartItems[j];
          break;
        }
      }

      if (Object.keys(item)?.length) {
        removeItemName.push(item?.name);
        await removeFromCartLoading(item?.item_id);
        await removeFromCart({
          cart,
          item,
          type: 'delete',
          quantity: item?.qty || 1,
          cartId,
        });
      }
    }
    await refreshCart();
    Alert.alert(
      '',
      `The below items are out of stock at your shipping destination and will be removed:\n${removeItemName.join(
        ',\n'
      )}`,
      [
        {
          text: 'OK',
          onPress: () => {
            NavigationService.goBack();
          },
        },
      ]
    );
  };

  checkItemAvailableAtRegion = async () => {
    const { cartItems } = this.props;
    const { selectedCity } = this.state;
    let itemQuantity = {};
    cartItems?.forEach((cartItem) => {
      itemQuantity[cartItem.sku] = cartItem.qty;
    });

    const getItemQuantityPromise = cartItems?.map((item) =>
      magento.admin.getItemQuantity(item?.sku)
    );
    const allItemsQuantity = await Promise.all(getItemQuantityPromise);
    let removeItemsSku = [];
    allItemsQuantity?.forEach((productStores) => {
      if (store45.includes(selectedCity)) {
        productStores?.items?.forEach((productDetails) => {
          const productQty = itemQuantity[productDetails?.sku] || 1;
          if (
            productDetails?.source_code === '45' &&
            productDetails?.quantity <= productQty
          ) {
            removeItemsSku.push(productDetails?.sku);
          }
        });
      } else {
        productStores?.items?.forEach((productDetails) => {
          const productQty = itemQuantity[productDetails?.sku] || 1;
          if (
            productDetails?.source_code === '44' &&
            productDetails?.quantity <= productQty
          ) {
            removeItemsSku.push(productDetails?.sku);
          }
        });
      }
    });
    return removeItemsSku;
  };

  onNextPressed = async () => {
    if (this.state.iscountryselected) {
      const {
        email,
        password,

        countryId,
        firstname,
        lastname,
        telephone,
        city = this.state.selectedCity,
        street,
        region,
        cartId,
        country,
        countries,
        customer,
      } = this.props;
      // const getUserInfo = async () => {
      let regionId = await AsyncStorage.getItem('store');
      let selectedEmirates = await AsyncStorage.getItem('storeCity');
      // }
      const countryFiltered = countries.find((item) => item.id === countryId);
      // const customer = {
      //   customer: {
      //     email,
      //     firstname,
      //     lastname,
      //     addresses: [
      //       {
      //         defaultShipping: true,
      //         defaultBilling: true,
      //         firstname,
      //         lastname,
      //         region,
      //         postcode,
      //         street: [street],
      //         city,
      //         telephone,
      //         countryId,
      //         country,
      //       },
      //     ],
      //   },
      //   password,
      // };
      // const regionValue =
      //   typeof region === 'object'
      //     ? {
      //         region: this.state.selectedCity,
      //         regionId: regionId,
      //         regionCode: regionId,

      //       }
      //     : {
      //         region,
      //       };
      const address = {
        address: {
          // id: 0,
          // region: regionValue.region,
          // region_id: regionValue.regionId,
          // region_code: regionValue.regionCode,

          region: this.state.selectedCity,
          region_id: regionId.replace('s', ''),
          region_code: this.state.selectedCity,
          custom_attributes: [
            {
              attribute_code: 'address_type',
              value: this.state.address_type,
            },
            {
              attribute_code: 'building_name',
              value: this.state.building_name,
            },
            {
              attribute_code: 'apartment_no',
              value: this.state.apartment_no,
            },
            {
              attribute_code: 'landmark',
              value: this.state.landmark,
            },
          ],

          //  region_id: false,
          // region_code: false,
          country_id: countryId,
          street: [street],
          // company: 'test',
          telephone,
          // fax: 'test',

          city,
          firstname,
          lastname,

          email,
          same_as_billing: 1,
        },
        useForShipping: true,
      };
      let errors = {};
      let local = { ...address.address };

      if (!customer) {
        local = {
          ...local,
          password,
          country: countryFiltered ? countryFiltered.full_name_locale : '',
        };
      }
      this.props.updateCheckoutUI('address_type', this.state.address_type);
      this.props.updateCheckoutUI('apartment_no', this.state.apartment_no);
      this.props.updateCheckoutUI('building_name', this.state.building_name);
      this.props.updateCheckoutUI('landmark', this.state.landmark);
      delete local.region_code;
      delete local.region_id;
      // delete local.region;
      delete local.same_as_billing;
      delete local.country_id;
      Object.entries(local).forEach((el) => {
        errors = {
          ...errors,
          [el[0]]: Array.isArray(el[1]) ? !el[1][0] : !el[1],
        };
      });
      if (!this.state.apartment_no) {
        errors = { ...errors, apartment_no: true };
      }
      if (!this.state.building_name) {
        errors = { ...errors, building_name: true };
      }
      if (!this.state.address_type) {
        errors = { ...errors, address_type: true };
      }
      this.setState({ errors: errors });
      let obj = Object.values(errors).some((el) => !!el);
      if (!obj) {
        this.props.checkoutCustomerNextLoading(true);
        if (this.state.selectedCity !== selectedEmirates) {
          const removeSkuId = await this.checkItemAvailableAtRegion();
          if (removeSkuId.length) {
            await this.removeItemFromCart(removeSkuId);
            this.props.checkoutCustomerNextLoading(false);
            return;
          }
        }
        this.props.addGuestCartBillingAddress(cartId, address);
        this.props.setCustomerAccountInfoBoolean(true);
      }
    } else {
      alert('please choose country ');
      this.props.checkoutCustomerNextLoading(false);
    }
  };

  updateUI = (key, value) => {
    this.props.updateCheckoutUI(key, value);
  };

  countrySelect(attributeId, optionValue) {
    this.props.updateCheckoutUI('countryId', 'AE');
    this.setState({ iscountryselected: true });
  }

  regionSelect(attributeId, selectedRegion) {
    const { countryId, countries } = this.props;
    if (countryId && countryId.length) {
      const country = countries.find((item) => item.id === countryId);
      const regionData = country.available_regions.find(
        (item) => item.id === selectedRegion
      );
      const region = {
        regionCode: regionData.code,
        region: regionData.name,
        regionId: regionData.id,
      };
      this.updateUI('region', region);
    }
  }

  renderButton() {
    const theme = this.context;
    if (this.props.loading) {
      return <Spinner size="large" />;
    }

    const isCustomerLoggedIn = magento.isCustomerLogin();
    const showPasswordValidationError =
      !isCustomerLoggedIn && !specialCharRegExp.test(this.props.password);
    const showEmailValidationError =
      !isCustomerLoggedIn && !validateEmail.test(this.props.email);

    return (
      <>
        <TouchableOpacity
          onPress={this.onNextPressed}
          style={[
            styles.buttonStyle(theme),
            {
              backgroundColor:
                showPasswordValidationError || showEmailValidationError
                  ? 'grey'
                  : '#8BC63E',
            },
          ]}
          disabled={showPasswordValidationError || showEmailValidationError}
        >
          <Text style={{ color: '#fff', fontSize: 19 }}>
            {translate('common.next')}
          </Text>
        </TouchableOpacity>
        {showPasswordValidationError ? (
          <Text style={styles.signUpErrorMessage}>
            {'Your Password must have atleast one special character'}
          </Text>
        ) : showEmailValidationError ? (
          <Text style={[styles.signUpErrorMessage, { marginTop: 9 }]}>
            {'Please enter valid email'}
          </Text>
        ) : null}
      </>
    );
  }

  renderRegions() {
    const { countryId, countries, region } = this.props;
    const { errors } = this.state;
    if (countryId && countryId.length && countries && countries.length) {
      const country = countries.find((item) => item.id === countryId);
      if (country && country.available_regions) {
        const data = country.available_regions.map((value) => ({
          label: value.name,
          key: value.id,
        }));

        const label = region?.region
          ? region?.region
          : translate('common.region');

        return (
          <ModalSelect
            withLabel={false}
            disabled={data.length === 0}
            key="regions"
            label={label}
            attribute={translate('common.region')}
            value={translate('common.region')}
            data={data}
            onChange={this.regionSelect.bind(this)}
          />
        );
      }
    }

    const regionValue =
      typeof this.props.region === 'string'
        ? this.props.region
        : this.props.region.region;
    return (
      <TextInput
        value={regionValue}
        placeholder="Enter Your Region"
        onChangeText={(value) => this.updateUI('region', value)}
        placeholderTextColor={'grey'}
        style={[
          styles.inputStyle,
          errors.region ? { borderWidth: 2, borderColor: 'red' } : undefined,
        ]}
        selectionColor={'grey'}
      />
    );
  }

  renderCountries() {
    const { countries, countryId } = this.props;

    if (!countries || !countries.length) {
      return (
        <TextInput
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          placeholder={translate('common.country')}
          keyboardType="email-address"
          autoCorrect={false}
          value={this.props.country}
          selectionColor={'grey'}
          onChangeText={(value) => this.updateUI('country', value)}
          style={styles.inputStyle}
        />
      );
    }

    const data = countries.map((value) => ({
      label: value.full_name_locale,
      key: value.id,
    }));

    const country = countries.find((item) => item.id === countryId);
    const label = country ? country.full_name_locale : 'Enter Your Country';
    const { errors } = this.state;

    return (
      <View
        style={[
          styles.inputStyle,
          errors.country ? { borderWidth: 2, borderColor: 'red' } : undefined,
        ]}
      >
        <ModalSelect
          withLabel={false}
          disabled={data.length === 0}
          key="countries"
          label={label}
          attribute={translate('common.country')}
          defaultValue={this.props.country || 'United Arab Emirates'}
          data={[data[0]]}
          onChange={this.countrySelect.bind(this)}
        />
      </View>
    );
  }

  renderUser() {
    const { errors } = this.state;
    if (this.props.customer) {
      return;
    }

    return (
      <View>
        <TextInput
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          keyboardType="email-address"
          selectionColor={'grey'}
          autoCorrect={false}
          label={translate('common.email')}
          placeholderTextColor={'grey'}
          style={[
            styles.inputStyle,
            errors.email ? { borderWidth: 2, borderColor: 'red' } : undefined,
          ]}
          value={this.props.email}
          placeholder={translate('common.email')}
          onChangeText={(value) => this.updateUI('email', value)}
        />

        <TextInput
          secureTextEntry={true}
          selectionColor={'grey'}
          label={translate('common.password')}
          placeholderTextColor={'grey'}
          style={[
            styles.inputStyle,
            errors.password
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          value={this.props.password}
          placeholder={translate('common.password')}
          onChangeText={(value) => this.updateUI('password', value)}
        />

        <TextInput
          selectionColor={'grey'}
          label={translate('common.firstName')}
          placeholderTextColor={'grey'}
          style={[
            styles.inputStyle,
            errors.firstname
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          value={this.props.firstname}
          placeholder={translate('common.firstName')}
          onChangeText={(value) => this.updateUI('firstname', value)}
        />

        <TextInput
          selectionColor={'grey'}
          label={translate('common.lastName')}
          placeholderTextColor={'grey'}
          style={[
            styles.inputStyle,
            errors.lastname
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          value={this.props.lastname}
          placeholder={translate('common.lastName')}
          onChangeText={(value) => this.updateUI('lastname', value)}
        />
      </View>
    );
  }

  renderSavedAddresses(radioSelected) {
    const { customer } = this.props;
    return customer?.addresses?.length > 0 ? (
      <View>
        <FlatList
          data={customer.addresses}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={{ flexDirection: 'row', marginVertical: 10 }}
              onPress={() => this.radioClick(item, index)}
            >
              <View key={index}>
                <View
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: '#8BC63E',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {index == radioSelected ? (
                    <View
                      style={{
                        height: 12,
                        width: 12,
                        borderRadius: 6,
                        backgroundColor: '#8BC63E',
                      }}
                    />
                  ) : null}
                </View>
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#37474F',
                  }}
                >
                  {item.street.join()}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#37474F',
                  }}
                >
                  {item.city}
                </Text>
                {/* <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#37474F',
                }}>
                {item.postcode}
              </Text> */}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    ) : null;
  }

  radioClick(item, id) {
    this.setState({
      radioSelected: id,
      selectedCity: item.city,
    });
    this.updateUI('countryId', item.country_id);
    if (!item?.region?.region) {
      this.updateUI('region', '');
    } else {
      this.updateUI('region', item?.region?.region);
    }

    if (!item?.street) {
      this.updateUI('street', '');
    } else {
      this.updateUI('street', item?.street.length ? item?.street[0] : '');
    }
    this.updateUI('city', item.city);
    if (!item?.postcode) {
      this.updateUI('postcode', '');
    } else {
      this.updateUI('postcode', item?.postcode);
    }

    if (!item?.custom_attributes[2]) {
      this.updateUI('apartment_no', '');
      this.setState({ apartment_no: '' });
    } else {
      this.updateUI('apartment_no', item?.apartment_no);
      this.setState({
        apartment_no: item.custom_attributes[2]?.value || '',
      });
    }
    if (!item?.custom_attributes[1]) {
      this.updateUI('building_name', '');
      this.setState({ building_name: '' });
    } else {
      this.updateUI('building_name', item?.building_name);
      this.setState({ building_name: item.custom_attributes[1]?.value || '' });
    }
    if (!item?.custom_attributes[0]) {
      this.updateUI('address_type', '');
      this.setState({ address_type: '' });
    } else {
      this.updateUI('address_type', item?.address_type);
      this.setState({ address_type: item.custom_attributes[0]?.value || '' });
    }
    if (!item?.custom_attributes[3]) {
      this.updateUI('landmark', '');
      this.setState({ landmark: '' });
    } else {
      this.updateUI('landmark', item?.landmark);
      this.setState({ landmark: item.custom_attributes[3]?.value || '' });
    }
    if (!item?.telephone) {
      this.updateUI('telephone', '');
    } else {
      this.updateUI('telephone', item?.telephone);
    }
  }

  render() {
    const theme = this.context;
    const { errors, selected, radioSelected } = this.state;
    return (
      <View style={styles.container(theme)}>
        {this.renderSavedAddresses(radioSelected)}

        {this.renderUser()}

        {this.renderCountries()}

        {this.updateUI('city', this.state.selectedCity)}

        {/* <TextInput
          value={this.state.selectedCity}
          placeholder="Enter your city"
          onChangeText={value => this.updateUI('city', value)}
          style={[
            styles.inputStyle,
            errors['city'] ? { borderWidth: 2, borderColor: 'red' } : undefined,
          ]}
          selectionColor={'grey'}
        /> */}
        <CityDropDown
          selectedCity={this.state.selectedCity}
          onPressCity={(city) => {
            this.setState({ selectedCity: city });
            this.updateUI('city', city);
          }}
          hasError={errors.city}
        />

        <TextInput
          value={this.props.street}
          placeholder="Street Name"
          placeholderTextColor={'grey'}
          onChangeText={(value) => {
            this.setState({ street: value });
            this.updateUI('street', value);
          }}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.street ? { borderWidth: 2, borderColor: 'red' } : undefined,
          ]}
          selectionColor={'grey'}
        />
        <TextInput
          value={this.state.apartment_no}
          placeholder="Apartment/Villa Number"
          placeholderTextColor={'grey'}
          onChangeText={(value) => {
            this.updateUI('apartment_no', value);
            this.setState({ apartment_no: value });
          }}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.apartment_no
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          selectionColor={'grey'}
        />
        <TextInput
          value={this.state.address_type}
          placeholder="Home , Office , Custom"
          placeholderTextColor={'grey'}
          onChangeText={(value) => {
            this.updateUI('address_type', value);
            this.setState({ address_type: value });
          }}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.address_type
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          selectionColor={'grey'}
        />
        <TextInput
          value={this.state.building_name}
          placeholder="Building Name"
          placeholderTextColor={'grey'}
          onChangeText={(value) => {
            this.updateUI('building_name', value);
            this.setState({ building_name: value });
          }}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.building_name
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          selectionColor={'grey'}
        />
        <TextInput
          value={this.state.landmark}
          placeholder="landmark (optional)"
          placeholderTextColor={'grey'}
          onChangeText={(value) => {
            this.setState({ landmark: value });
            this.updateUI('landmark', value);
          }}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.landmark
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          selectionColor={'grey'}
        />
        {/* <TextInput
          editable={false}
          selectionColor={'grey'}
          // label={translate('common.firstName')}
          placeholderTextColor={'grey'}
          style={[
            styles.inputStyle,
            {color:'#000'},
            errors['city']
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          value={this.state.selectedCity}
        // placeholder={translate('common.firstName')}
        // onChangeText={value => this.updateUI('city', value)}
        /> */}
        <TextInput
          value={this.props.telephone}
          keyboardType="numeric"
          placeholder="Enter your telephone"
          placeholderTextColor={'grey'}
          onChangeText={(value) => this.updateUI('telephone', value)}
          style={[
            styles.inputStyle,
            { color: '#000' },
            errors.telephone
              ? { borderWidth: 2, borderColor: 'red' }
              : undefined,
          ]}
          selectionColor={'grey'}
        />

        <Text type="heading" style={styles.errorTextStyle(theme)}>
          {this.props.error}
        </Text>

        {this.renderButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: (theme) => ({
    padding: theme.spacing.large,
  }),
  input: {
    width: '90%',
    borderWidth: 0,
    backgroundColor: 'red',
  },
  errorTextStyle: (theme) => ({
    color: theme.colors.error,
    alignSelf: 'center',
  }),
  nextButtonStyle: {
    flex: 1,
    alignItems: 'center',
  },
  buttonStyle: (theme) => ({
    alignSelf: 'center',
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  }),
  inputStyle: {
    height: 48,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    marginTop: 16,
    borderRadius: 6,
    paddingLeft: 8,
  },
  signUpErrorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 7,
  },
});

const mapStateToProps = ({ checkout, cart, account, magento }) => {
  const { countries } = magento;
  const { cartId, products } = cart;
  const { customer } = account;

  return {
    ...checkout.ui,
    cartId,
    countries,
    customer,
    products,
    cart,
    cartItems: cart?.quote?.items,
  };
};

export default connect(mapStateToProps, {
  getCountries,
  updateCheckoutUI,
  addGuestCartBillingAddress,
  checkoutCreateCustomer: createCustomer,
  checkoutCustomerNextLoading,
  setCustomerAccountInfoBoolean,
  setCustomerShippingInfoBoolean,
  setCustomerPaymentInfoBoolean,
  removeFromCart,
  removeFromCartLoading,
  refreshCart,
})(CheckoutCustomerAccount);
