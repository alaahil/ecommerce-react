import React, { useRef, useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Platform,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Text } from '../common';
import { ThemeContext } from '../../theme';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import passwordIcon from '../../assets/auth/Password.png';
import { magento } from '../../magento';
import { logout } from '../../actions';
import { Loader } from '../common/Loader';

// This file name should be Signup
const ChangePassword = () => {
  const theme = useContext(ThemeContext);
  // Internal State
  const customer = useSelector((state) => state.account.customer);

  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reference
  const newPasswordRef = useRef(null);
  const confirmNewPassRef = useRef(null);
  const dispatch = useDispatch();

  const onChangePassword = async () => {
    // TODO: add password validation check
    try {
      if (newPassword.length === 0 || confirmNewPassword.length === 0) {
        alert('Please fill all fields. All fields are mandatory');
        return;
      }
      if (confirmNewPassword !== newPassword) {
        alert('New password and Confirm Password should be same');
        return;
      }
      setIsSubmitting(true);
      const payload = {
        password: confirmNewPassword,
      };
      console.log('Payload', payload);
      const response = await magento.customer.updateUserProfile(
        customer.id,
        payload
      );
      setIsSubmitting(false);
      Alert.alert(
        'Password Updated Successfully',
        'Please login again with changed password',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ]
      );
      dispatch(logout());

      console.log('Response', response);
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
        <Button onPress={onChangePassword} style={styles.buttonAuth(theme)}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Update</Text>
        </Button>
      </View>
    );
  };

  const handleNewPasswordVisible = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const handleConfirmPasswordVisible = () => {
    setConfirmNewPasswordVisible(!confirmNewPasswordVisible);
  };

  const renderMessages = () => {
    // if (error) {
    //   return <Text style={styles.error(theme)}>{error}</Text>;
    // }
    // if (success) {
    //   return <Text style={styles.success(theme)}>{success}</Text>;
    // }
  };

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
            source={passwordIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder={'New Password'}
            secureTextEntry={!newPasswordVisible}
            placeholderTextColor={'grey'}
            returnKeyType="next"
            autoCorrect={false}
            value={newPassword}
            onChangeText={setNewPassword}
            selectionColor="grey"
            blurOnSubmit={false}
            ref={newPasswordRef}
            onSubmitEditing={() => confirmNewPassRef.current.focus()}
            style={styles.inputStyle}
          />
          <TouchableOpacity
            onPress={handleNewPasswordVisible}
            style={styles.eyeIcon}
          >
            <Icon
              name={newPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#8BC63E"
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={passwordIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            secureTextEntry={!confirmNewPasswordVisible}
            underlineColorAndroid="transparent"
            placeholder={'Confirm New Password'}
            placeholderTextColor={'grey'}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoCorrect={false}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            selectionColor="grey"
            ref={confirmNewPassRef}
            blurOnSubmit={false}
            style={styles.inputStyle}
          />
          <TouchableOpacity
            onPress={handleConfirmPasswordVisible}
            style={styles.eyeIcon}
          >
            <Icon
              name={confirmNewPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#8BC63E"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomView}>{renderButtons()}</View>
        {renderMessages()}
        <View />
      </View>
    </KeyboardAwareScrollView>
  );
};

ChangePassword.navigationOptions = {
  title: 'Change Password',
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

export default ChangePassword;
