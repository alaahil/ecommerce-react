import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import {
  getCountries,
  addAccountAddress,
  updateAccountAddressUI,
  accountAddressNextLoading,
  resetAccountAddressUI,
} from '../../actions';
import { Spinner, ModalSelect, Button, Text } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { CityDropDown } from '../common/CityDropDown';
import AsyncStorage from '@react-native-community/async-storage';
import NavigationService from '../../navigation/NavigationService';

class AddAccountAddress extends Component {
  // state ={
  //    icon : true,
  // }

  static contextType = ThemeContext;

  state = {
    selectedCity: this.props.city ? this.props.city : 'Select Your City',
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      selecedIndex: -1,
      icon: true,
      t: false,
    };
  }

  componentWillUnmount() {
    // this.focusListener.remove();
    this.props.updateAccountAddressUI('error', false);
  }

  componentDidMount() {
    const { navigation } = this.props;
    // this.focusListener = this.props.navigation.addListener('focus', () => {
    //   // do something
    //   console.log("Came in edit screen","edit address")
    // });

    console.log(
      'this.props.customer.addresses',
      JSON.stringify(this.props.customer.addresses)
    );

    // AsyncStorage.getItem('storeCity').then((res) => {
    //   this.setState({ 'selectedCity': res });
    //   console.log("storeCity", "storeCity==> " + res);
    // })

    this.props.getCountries();
    // this.props.resetAccountAddressUI();

    if (
      this.props.customer &&
      this.props.customer.addresses &&
      this.props.customer.addresses.length
    ) {
      AsyncStorage.getItem('selectedAddressIndex').then((index) => {
        console.log('selectedAddressIndex==> ', index);
        this.setState({ selecedIndex: index });
        const address = this.props.customer.addresses[parseInt(index)];
        console.log('Custom ttribute', address.custom_attributes);
        const regionData = address.region;
        const region = {
          regionCode: regionData.region_code,
          region: regionData.region,
          regionId: regionData.region_id,
        };
        // this.updateUI('region', region);
        this.updateUI('countryId', address.country_id);
        this.updateUI('street', address.street.length ? address.street[0] : '');
        this.updateUI('city', address.city);
        this.updateUI(
          'apartment_no',
          address.custom_attributes[1]?.value
            ? address.custom_attributes[1]?.value
            : ''
        );
        this.updateUI(
          'address_type',
          address.custom_attributes[0]?.value
            ? address.custom_attributes[0]?.value
            : ''
        );
        this.updateUI(
          'building_name',
          address.custom_attributes[2]?.value
            ? address.custom_attributes[2]?.value
            : ''
        );
        this.updateUI(
          'landmark',
          address.custom_attributes[3]?.value
            ? address.custom_attributes[3]?.value
            : ''
        );
        this.updateUI('telephone', address.telephone);
        this.setState({ selectedCity: address.city });
        this.setState({ isLoading: false });
      });
    }
  }

  onNextPressed = () => {
    const {
      apartment_no,
      landmark,
      address_type,
      building_name,
      countryId,
      city,
      street,
      region,
      customer,
      telephone,
    } = this.props;

    let allAddresses = this.props.customer.addresses;

    if (
      apartment_no.length == 0 ||
      telephone.length === 0 ||
      street.length === 0 ||
      address_type.length === 0 ||
      building_name.length === 0 ||
      this.state.selectedCity.length === 0 ||
      this.state.selectedCity === 'Select Your City' ||
      !countryId
    ) {
      alert('please fill the required fields');
      return;
    }

    const regionValue =
      typeof region === 'object'
        ? {
            region: region.region,
            region_id: region.regionId,
            region_code: region.regionCode,
          }
        : {
            region,
          };

    allAddresses[parseInt(this.state.selecedIndex)] = {
      region: regionValue,
      country_id: countryId,
      street: [street],
      city,
      // same_as_billing: 1,
      firstname: customer.firstname,
      lastname: customer.lastname,
      telephone,
      custom_attributes: [
        {
          attribute_code: 'address_type',
          value: address_type,
        },
        {
          attribute_code: 'building_name',
          value: building_name,
        },
        {
          attribute_code: 'apartment_no',
          value: apartment_no,
        },
        {
          attribute_code: 'landmark',
          value: landmark,
        },
      ],
    };

    const data = {
      customer: {
        ...customer,
        addresses: allAddresses,
      },
    };
    this.props.updateAccountAddressUI('error', false);
    this.props.accountAddressNextLoading(true);

    console.log('updateAddress', JSON.stringify(data));
    this.props.addAccountAddress(customer.id, data, (result) => {
      console.log('addNewAddress(c==> ', result);
      Alert.alert(
        '',
        result ? 'Address updated successfully!' : 'Address not updated!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('OK Pressed');
              NavigationService.goBack();
            },
          },
        ]
      );
    });
    // this.props.resetAccountAddressUI();
  };

  updateUI = (key, value) => {
    this.props.updateAccountAddressUI(key, value);
  };

  countrySelect = (attributeId, optionValue) => {
    this.props.updateAccountAddressUI('countryId', optionValue);
  };

  regionSelect = (attributeId, selectedRegion) => {
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
  };

  renderButton = () => {
    const theme = this.context;
    if (this.props.loading) {
      return <Spinner />;
    }
    return (
      <Button onPress={this.onNextPressed} style={styles.buttonStyle(theme)}>
        {translate('common.update')}
      </Button>
    );
  };

  renderRegions = () => {
    const theme = this.context;
    const { countryId, countries, region } = this.props;
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
            attribute="Region"
            value="Region"
            data={data}
            onChange={this.regionSelect}
            style={styles.inputContainer1(theme)}
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
        placeholder={translate('common.region')}
        placeholderTextColor={'grey'}
        onChangeText={(value) => this.updateUI('region', value)}
        style={styles.inputStyle}
        selectionColor={'grey'}
      />
    );
  };

  renderCountries = () => {
    const theme = this.context;
    const { countries, countryId } = this.props;

    if (!countries || !countries.length) {
      return (
        <TextInput
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          placeholder={translate('common.country')}
          placeholderTextColor={'grey'}
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
    const label = country
      ? country.full_name_locale
      : translate('common.country');

    return (
      <ModalSelect
        withLabel={false}
        disabled={data.length === 0}
        key="countries"
        label={label}
        attribute={translate('common.country')}
        value={translate('common.country')}
        data={[data[0]]}
        onChange={this.countrySelect}
      />
    );
  };

  render() {
    const theme = this.context;
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        enableOnAndroid={true}
      >
        {this.state.isLoading ? (
          <View />
        ) : (
          <View style={styles.container(theme)}>
            {this.renderCountries()}

            {/* {this.renderRegions()} */}
            <TextInput
              value={this.props.address_type}
              placeholder={'Home , Office , Custom'}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('address_type', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />
            <TextInput
              value={this.props.street}
              placeholder={translate('common.street')}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('street', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />
            <TextInput
              value={this.props.apartment_no}
              placeholder={'Apartment/Villa Number'}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('apartment_no', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />
            <TextInput
              value={this.props.building_name}
              placeholder={'Building Name'}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('building_name', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />

            <TextInput
              value={this.props.landmark}
              placeholder={'Landmark ( Optional )'}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('landmark', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />

            {/*<TextInput*/}
            {/*  value={this.state.selectedCity}*/}
            {/*  placeholder={translate('common.city')}*/}
            {/*  onChangeText={value => this.updateUI('city', value)}*/}
            {/*  style={styles.inputStyle}*/}
            {/*  editable={false}*/}
            {/*  selectTextOnFocus={false}*/}
            {/*  selectionColor={'grey'}*/}
            {/*/>*/}
            <CityDropDown
              selectedCity={this.state.selectedCity}
              onPressCity={(city) => {
                this.setState({ selectedCity: city });
                this.updateUI('city', city);
              }}
              style={styles.inputStyle}
            />

            <TextInput
              value={this.props.telephone}
              placeholder={translate('common.telephone')}
              placeholderTextColor={'grey'}
              onChangeText={(value) => this.updateUI('telephone', value)}
              style={styles.inputStyle}
              selectionColor={'grey'}
            />

            {this.renderButton()}
            <Text type="heading" style={styles.errorTextStyle(theme)}>
              {this.props.error}
            </Text>
          </View>
        )}
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.large,
  }),
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    borderRadius: 6,
    width: '100%',
    height: 32,
    marginVertical: 12,
    flex: 1,
  },
  errorTextStyle: (theme) => ({
    color: theme.colors.error,
    alignSelf: 'center',
  }),
  buttonStyle: (theme) => ({
    marginVertical: theme.spacing.large,
    alignSelf: 'center',
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    borderWidth: 0,
    borderRadius: 5,
  }),
  inputContainer1: (theme) => ({
    marginBottom: theme.spacing.large,
  }),
  inputStyle: {
    height: 48,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
    borderRadius: 6,
    paddingLeft: 8,
  },
});

const mapStateToProps = ({ account, magento }) => {
  const { customer } = account;
  const { countries } = magento;
  return {
    ...account.ui,
    countries,
    customer,
  };
};

export default connect(mapStateToProps, {
  getCountries,
  updateAccountAddressUI,
  addAccountAddress,
  accountAddressNextLoading,
  resetAccountAddressUI,
})(AddAccountAddress);
