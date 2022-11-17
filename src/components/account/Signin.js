import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner, Button, Text } from '../common';
import { auth, signIn } from '../../actions';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import userIcon from '../../assets/auth/user.png';
import emailIcon from '../../assets/auth/email.png';
import passwordIcon from '../../assets/auth/Password.png';
import callIcon from '../../assets/auth/phone-call.png';
import { NAVIGATION_LOGIN_PATH } from '../../navigation/routes';
import facebook from '../../assets/auth/facebook.png';
import google from '../../assets/auth/google.png';
import apple from '../../assets/auth/apple.png';
import bar from '../../assets/auth/bar.png';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoginManager, Profile } from 'react-native-fbsdk-next';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import fb_auth from '@react-native-firebase/auth';
import jwt_decode from 'jwt-decode';
import DropDownPicker from 'react-native-dropdown-picker';

// This file name should be Signup
const Signin = ({
  loading,
  error,
  success,
  navigation,
  signIn: _signIn,
  auth: _auth,
}) => {
  const theme = useContext(ThemeContext);
  // Internal State
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Reference
  const lastnameInputRef = useRef(null);
  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneNumberInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);


  const onCreateAccountPress = () => {
    // TODO: add password validation check
    const customer = {
      customer: {
        email,
        firstname,
        lastname,
        dob: `${year}-${month}-${day}`,
        addresses: [{ telephone: phoneNumber }],
      },
      password,
    };
    if (
      email.length === 0 ||
      password.length === 0 ||
      firstname.length === 0 ||
      lastname.length === 0 ||
      phoneNumber.length === 0 ||
      confirmPassword.length === 0 ||
      day.length === 0 ||
      month.length === 0 ||
      year.length === 0
    ) {
      alert('Please fill all fields. All fields are mandatory');
      return;
    }
    if (
      day > 31 ||
      month > 12 ||
      day < 1 ||
      month < 0 ||
      year < 1800 ||
      year > 2022
    ) {
      alert('enter a valid birth date');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    _signIn(customer);
  };

  const onFacebookButtonPress = async () => {
    // Attempt login with permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      alert('User cancelled the login process');
    } else {
      // Get the current profile information
      const currentProfile = await Profile.getCurrentProfile();

      // Populate the user profile
      const customer = {
        customer: {
          email: currentProfile.userID + '@bidfoodhome.com',
          firstname: currentProfile.firstName,
          lastname: currentProfile.lastName,
          addresses: [{ telephone: '0' }],
        },
        password: currentProfile.firstName + '@123',
      };
      _signIn(customer);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const currentProfile = await GoogleSignin.signIn();
      const customer = {
        customer: {
          email: currentProfile.user.email,
          firstname: currentProfile.user.givenName,
          lastname: currentProfile.user.familyName,
          addresses: [{ telephone: '0' }],
        },
        password: currentProfile.user.givenName + '@123',
      };
      _signIn(customer);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        alert('user cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        alert('operation (e.g. sign in) is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        alert('play services not available or outdated');
      } else {
        // some other error happened
        alert('some other error happened' + JSON.stringify(error));
      }
    }
  };

  const onAppleButtonPress = async () => {
    // Start the sign-in request

    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    // Ensure Apple returned a user identityToken
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }

    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = fb_auth.AppleAuthProvider.credential(
      identityToken,
      nonce
    );
    // Populate the user profile
    if (appleAuthRequestResponse.fullName.givenName) {
      const customer = {
        customer: {
          email: jwt_decode(appleCredential.token).email,
          firstname: appleAuthRequestResponse.fullName.givenName,
          lastname: appleAuthRequestResponse.fullName.familyName,
          addresses: [{ telephone: '0' }],
        },
        password: jwt_decode(appleCredential.token).sub,
      };
      _signIn(customer);
    } else {
      _auth(
        jwt_decode(appleCredential.token).email,
        jwt_decode(appleCredential.token).sub
      );
    }
  };

  const renderButtons = () => {
    if (loading) {
      return <Spinner />;
    }
    const onSigninPress = () => {
      navigation.navigate(NAVIGATION_LOGIN_PATH);
    };
    return (
      <View>
        <Button
          // disabled={
          //   firstname === '' ||
          //   lastname === '' ||
          //   email === '' ||
          //   password === ''
          // }
          onPress={onCreateAccountPress}
          style={styles.buttonAuth(theme)}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>SIGN UP</Text>
        </Button>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
          }}
        >
          <Text
            onPress={onSigninPress}
            style={{
              fontSize: 16,
            }}
          >
            Have an account?
          </Text>
          <Text
            onPress={onSigninPress}
            style={{
              fontSize: 16,
              color: '#8BC63E',
            }}
          >
            {' Sign In'}
          </Text>
        </View>
        {/* Social accounts */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <Image source={bar} />
            <Text style={{ paddingHorizontal: 8, opacity: 0.7 }}>OR</Text>
            <Image source={bar} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
            }}
          >
            <TouchableOpacity onPress={onFacebookButtonPress}>
              <Image source={facebook} style={styles.socialIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onGoogleButtonPress}>
              <Image source={google} style={styles.socialIcon} />
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={onAppleButtonPress}>
                <Image source={apple} style={styles.socialIcon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderMessages = () => {
    if (error) {
      return <Text style={styles.error(theme)}>{error}</Text>;
    }

    if (success) {
      return <Text style={styles.success(theme)}>{success}</Text>;
    }
  };

  const handlePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleConfirmPasswordVisible = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
      enableOnAndroid={true}
    >
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
            returnKeyType="next"
            autoCorrect={false}
            value={firstname}
            editable={!loading}
            onChangeText={setFirstname}
            selectionColor="grey"
            onSubmitEditing={() => lastnameInputRef.current.focus()}
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
            returnKeyType="next"
            autoCorrect={false}
            value={lastname}
            editable={!loading}
            onChangeText={setLastname}
            selectionColor="grey"
            blurOnSubmit={false}
            ref={lastnameInputRef}
            onSubmitEditing={() => dayRef.current.focus()}
            style={styles.inputStyle}
          />
        </View>
        <View
          style={[
            styles.inputContainer,
            {
              marginBottom: 27,
              justifyContent: 'space-around',
              paddingHorizontal: 3,
            },
          ]}
        >
          <Text style={{ color: '#73B033', fontWeight: 'bold' }}>{`Birth 
Date`}</Text>
          <TextInput
            underlineColorAndroid="transparent"
            placeholder={'dd'}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={day}
            returnKeyType="next"
            editable={!loading}
            onChangeText={setDay}
            selectionColor="grey"
            ref={dayRef}
            keyboardType={'numeric'}
            blurOnSubmit={false}
            maxLength={2}
            onSubmitEditing={() => {
              monthRef.current.focus();
            }}
            style={{
              width: '20%',
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#AEAEAE',
              marginVertical: 10,
              marginHorizontal: 5,
              color: '#000000',
              textAlign: 'center',
              paddingVertical: 5,
            }}
          />
          <TextInput
            underlineColorAndroid="transparent"
            placeholder={'mm'}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={month}
            returnKeyType="next"
            editable={!loading}
            maxLength={2}
            onChangeText={setMonth}
            selectionColor="grey"
            ref={monthRef}
            blurOnSubmit={false}
            keyboardType="numeric"
            onSubmitEditing={() => {
              yearRef.current.focus();
            }}
            style={{
              width: '20%',
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#AEAEAE',
              marginVertical: 5,
              marginHorizontal: 5,
              color: '#000000',
              textAlign: 'center',
              paddingVertical: 5,
            }}
          />
          <TextInput
            underlineColorAndroid="transparent"
            placeholder={'yyyy'}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={year}
            returnKeyType="next"
            editable={!loading}
            maxLength={4}
            onChangeText={setYear}
            selectionColor="grey"
            ref={yearRef}
            keyboardType="numeric"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              phoneNumberInputRef.current.focus();
            }}
            style={{
              width: '20%',
              borderWidth: 1,
              borderRadius: 10,
              borderColor: '#AEAEAE',
              marginVertical: 5,
              marginHorizontal: 5,
              color: '#000000',
              textAlign: 'center',
              paddingVertical: 5,
            }}
          />
        </View>

        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={callIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            underlineColorAndroid="transparent"
            placeholder={'Phone Number'}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={phoneNumber}
            returnKeyType="next"
            editable={!loading}
            onChangeText={setPhoneNumber}
            selectionColor="grey"
            ref={phoneNumberInputRef}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              emailInputRef.current.focus();
            }}
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
            returnKeyType="next"
            autoCorrect={false}
            value={email}
            editable={!loading}
            onChangeText={setEmail}
            selectionColor="grey"
            ref={emailInputRef}
            blurOnSubmit={false}
            onSubmitEditing={() => {
              passwordInputRef.current.focus();
            }}
            style={styles.inputStyle}
          />
        </View>
        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={passwordIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            secureTextEntry={!passwordVisible}
            placeholder={translate('common.password')}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={password}
            returnKeyType="next"
            editable={!loading}
            onChangeText={setPassword}
            selectionColor="grey"
            blurOnSubmit={false}
            ref={passwordInputRef}
            onSubmitEditing={() => {
              confirmPasswordInputRef.current.focus();
            }}
            style={styles.inputStyle}
          />
          <TouchableOpacity onPress={handlePassword} style={styles.eyeIcon}>
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
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
            underlineColorAndroid="transparent"
            secureTextEntry={!confirmPasswordVisible}
            placeholder={'Re-enter your password'}
            placeholderTextColor={'grey'}
            autoCorrect={false}
            value={confirmPassword}
            editable={!loading}
            onChangeText={setConfirmPassword}
            selectionColor="grey"
            blurOnSubmit={false}
            ref={confirmPasswordInputRef}
            onSubmitEditing={onCreateAccountPress}
            style={styles.inputStyle}
          />
          <TouchableOpacity
            onPress={handleConfirmPasswordVisible}
            style={styles.eyeIcon}
          >
            <Icon
              name={confirmPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#8BC63E"
            />
          </TouchableOpacity>
        </View>
        {renderButtons()}
        {renderMessages()}
        <View />
      </View>
    </KeyboardAwareScrollView>
  );
};

Signin.navigationOptions = {
  title: translate('signup.title'),
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    // paddingTop: theme.dimens.WINDOW_HEIGHT * 0.1,
    paddingTop: 20,
  }),
  authInput: (theme) => ({
    backgroundColor: '#E5E5E5',
    border: 'none',
    paddingLeft: 25,
    borderRadius: 5,
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    height: 50,
    marginBottom: theme.spacing.large,
  }),
  socialIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
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
});

Signin.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType(PropTypes.string, null),
  success: PropTypes.oneOfType(PropTypes.string, null),
  signIn: PropTypes.func.isRequired,
  auth: PropTypes.func.isRequired,
};

Signin.defaultProps = {
  error: null,
  success: null,
};

const mapStateToProps = ({ customerAuth }) => {
  const { error, success, loading } = customerAuth;

  return { error, success, loading };
};

export default connect(mapStateToProps, { signIn, auth })(Signin);
