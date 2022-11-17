import React from 'react';
import { View } from 'react-native';
import CreateNewAddressForm from './CreateNewAddressForm';

import { translate } from '../../i18n';

const CreateNewAddress = () => (
  <View style={{ flex: 1 }}>
    <CreateNewAddressForm />
  </View>
);

CreateNewAddress.navigationOptions = () => ({
  title: translate('addAccountAddress.title'),
  headerBackTitle: ' ',
});

export default CreateNewAddress;
