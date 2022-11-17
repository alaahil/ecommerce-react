import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Text } from '../common';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import userIcon from '../../assets/auth/user.png';
import emailIcon from '../../assets/auth/email.png';
import { useDispatch, useSelector } from 'react-redux';
import { validateEmail } from '../../helper/utils';
import { NAVIGATION_CHANGE_PASSWORD } from '../../navigation/routes';
import { magento } from '../../magento';
import AsyncStorage from '@react-native-community/async-storage';
import { currentCustomer } from '../../actions';
import { Loader } from '../common/Loader';

// This file name should be Signup
const EditProfile = ({ navigation }) => {
  const theme = useContext(ThemeContext);
  // Internal State
  const customer = useSelector((state) => state.account.customer);

  const [firstname, setFirstname] = useState(customer?.firstname || '');
  const [lastname, setLastname] = useState(customer?.lastname || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const onUpdateProfile = async () => {
    // TODO: add password validation check
    try {
      if (
        email.length === 0 ||
        firstname.length === 0 ||
        lastname.length === 0
      ) {
        alert('Please fill all fields. All fields are mandatory');
        return;
      }
      if (!validateEmail(email)) {
        alert('Please Enter a valid email');
        return;
      }
      setIsSubmitting(true);
      const payload = {
        email,
        firstname,
        lastname,
      };
      console.log('Payload', payload);
      const response = await magento.customer.updateUserProfile(
        customer?.id,
        payload
      );
      console.log('Response', response);
      setIsSubmitting(false);
      Alert.alert(
        'Successfully Updated',
        'Your customer data updated Successfully',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
      dispatch(currentCustomer());
    } catch (e) {
      setIsSubmitting(false);
      Alert.alert('Fail to update', e?.message || '', [
        {
          text: 'OK',
          onPress: () => {},
        },
      ]);
    }
  };

  const renderButtons = () => {
    return (
      <View>
        <Button onPress={onUpdateProfile} style={styles.buttonAuth(theme)}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Update</Text>
        </Button>
      </View>
    );
  };

  const renderMessages = () => {
    // if (error) {
    //   return <Text style={styles.error(theme)}>{error}</Text>;
    // }
    // if (success) {
    //   return <Text style={styles.success(theme)}>{success}</Text>;
    // }
  };
  useEffect(() => {
    AsyncStorage.getItem('customerToken').then((customerToken) => {
      console.log('customerToken', customerToken);
    });
  }, []);

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      enableOnAndroid={true}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <Loader isVisible={isSubmitting} />
      <View style={styles.container(theme)}>
        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={userIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder={translate('common.firstName')}
            placeholderTextColor={'grey'}
            returnKeyType="done"
            autoCorrect={false}
            value={firstname}
            onChangeText={setFirstname}
            selectionColor="grey"
            onSubmitEditing={() => Keyboard.dismiss()}
            blurOnSubmit={false}
            style={styles.inputStyle}
          />
        </View>
        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={userIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder={translate('common.lastName')}
            placeholderTextColor={'grey'}
            returnKeyType="done"
            autoCorrect={false}
            value={lastname}
            onChangeText={setLastname}
            selectionColor="grey"
            blurOnSubmit={false}
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.inputStyle}
          />
        </View>

        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={emailIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder={translate('common.email')}
            placeholderTextColor={'grey'}
            keyboardType="email-address"
            returnKeyType="done"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            selectionColor="grey"
            blurOnSubmit={false}
            onSubmitEditing={() => Keyboard.dismiss()}
            style={styles.inputStyle}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate(NAVIGATION_CHANGE_PASSWORD);
          }}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text style={styles.changePassword}>Change Password</Text>
        </TouchableOpacity>
        <View style={styles.bottomView}>{renderButtons()}</View>
        {renderMessages()}
        <View />
      </View>
    </KeyboardAwareScrollView>
  );
};

EditProfile.navigationOptions = {
  title: 'Edit Profile',
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    // paddingTop: theme.dimens.WINDOW_HEIGHT * 0.1,
    paddingTop: 20,
  }),

  buttonAuth: (theme) => ({
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    borderWidth: 0,
    height: 50,
    borderRadius: 5,
  }),
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    borderRadius: 6,
    width: '90%',
  },
  error: (theme) => ({
    color: theme.colors.error,
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: theme.spacing.extraLarge,
  }),
  success: (theme) => ({
    color: theme.colors.success,
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: theme.soacing.extraLarge,
  }),
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputStyle: {
    flex: 1,
    height: 56,
    marginLeft: 10,
    color: '#000000',
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  bottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  changePassword: {
    color: '#8BC63E',
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
});

export default EditProfile;
