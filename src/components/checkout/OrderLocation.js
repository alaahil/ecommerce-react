import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import {
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
} from '../../actions';

const OrderLocation = ({
  customerBillingData,
  ui,
  customer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
}) => {
  const { postcode, street, city } = customerBillingData;

  useEffect(() => {
    // console.log('heeeeeey',JSON.stringify(customerBillingData));
    if (!ui || !ui?.telephone) {
      getCountries();
      resetAccountAddressUI();

      if (customer && customer.addresses && !!customer.addresses.length) {
        const address = customer.addresses[0];
        const regionData = address.region;
        const region = {
          regionCode: regionData.region_code,
          region: regionData.region,
          regionId: regionData.region_id,
        };
        updateAccountAddressUI('region', region);
        updateAccountAddressUI('countryId', address.country_id);
        updateAccountAddressUI(
          'street',
          address.street.length ? address.street[0] : '',
        );
        
        updateAccountAddressUI('city', address.city);
        updateAccountAddressUI('postcode', "address.postcode");
        updateAccountAddressUI('telephone', address.telephone);
      }
    }
  }, [
    customer,
    getCountries,
    resetAccountAddressUI,
    updateAccountAddressUI,
    ui,
  ]);

  return (
    <View style={{ paddingVertical: 5 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{ fontSize: 18 }}>Delivery Location</Text>
        <TouchableOpacity>
          {/* <Text style={{fontSize:18,color:"#5EC401"}}>Change</Text> */}
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ paddingTop: 10, fontSize: 15 }}>
          {`${street}, ${postcode}, ${city}.`}
        </Text>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}></View>
      </View>
    </View>
  );
};

const mapStateToProps = ({ account }) => {
  const {
    customer,
    ui: { telephone },
  } = account;
  return { customer, telephone, ui: account.ui };
};

export default connect(mapStateToProps, {
  logout,
  currentCustomer,
  getCountries,
  resetAccountAddressUI,
  updateAccountAddressUI,
})(OrderLocation);
