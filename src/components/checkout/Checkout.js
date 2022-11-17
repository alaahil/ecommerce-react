import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CheckoutSection from './CheckoutSection';
import CheckoutCustomerAccount from './CheckoutCustomerAccount';
import CheckoutShippingMethod from './CheckoutShippingMethod';
import CheckoutPaymentMethod from './CheckoutPaymentMethod';
import CheckoutTotals from './CheckoutTotals';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import { Platform, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Checkout = ({
  navigation,
  activeSection: _activeSection,
  hasCustomerAccountDataCollected,
  hasShippingInfoCollected,
  hasPaymentInfoCollected,
}) => {
  const theme = useContext(ThemeContext);
  const activeSection = Number(_activeSection);
  const { bottom } = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      contentContainerStyle={{ paddingBottom: 10 + bottom }}
      enableOnAndroid={true}
    >
      <CheckoutSection
        title={translate('checkout.customerAccount')}
        number="1"
        expanded={activeSection === 1}
      >
        <CheckoutCustomerAccount navigation={navigation} />
      </CheckoutSection>
      <CheckoutSection
        title={translate('checkout.shippingMethod')}
        number="2"
        expanded={activeSection === 2}
        isDisabled={!hasCustomerAccountDataCollected}
      >
        <CheckoutShippingMethod />
      </CheckoutSection>
      <CheckoutSection
        title={translate('checkout.paymentMethod')}
        number="3"
        expanded={activeSection === 3}
        isDisabled={!hasShippingInfoCollected}
      >
        <CheckoutPaymentMethod />
      </CheckoutSection>
      <CheckoutSection
        title={translate('checkout.summary')}
        number="4"
        expanded={activeSection === 4}
        isDisabled={!hasPaymentInfoCollected}
      >
        <CheckoutTotals navigation={navigation} />
      </CheckoutSection>
    </KeyboardAwareScrollView>
  );
};

Checkout.navigationOptions = {
  title: translate('checkout.title'),
  headerBackTitle: ' ',
};
const styles = {
  container: (theme) => ({
    backgroundColor: theme.colors.background,
    flex: 1,
  }),
};

const mapStateToProps = ({ checkout }) => {
  const {
    activeSection,
    hasCustomerAccountDataCollected,
    hasShippingInfoCollected,
    hasPaymentInfoCollected,
  } = checkout;

  return {
    activeSection,
    hasCustomerAccountDataCollected,
    hasShippingInfoCollected,
    hasPaymentInfoCollected,
  };
};

export default connect(mapStateToProps)(Checkout);
