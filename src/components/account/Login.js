import React, { useState, useContext, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner, Button, Text } from '../common';
import { auth, signIn } from '../../actions/CustomerAuthActions';
import {
  NAVIGATION_SIGNIN_PATH,
  NAVIGATION_RESET_PASSWORD_PATH,
} from '../../navigation/routes';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';
import passwordIcon from '../../assets/auth/Password.png';
import emailIcon from '../../assets/auth/email.png';
import bar from '../../assets/auth/bar.png';
import facebook from '../../assets/auth/facebook.png';
import google from '../../assets/auth/google.png';
import apple from '../../assets/auth/apple.png';
import { ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import fb_auth from '@react-native-firebase/auth';
import jwt_decode from 'jwt-decode';
import { useEffect } from 'react';

const Login = ({
  loading,
  error,
  success,
  navigation,
  auth: _auth,
  signIn: _signIn,
}) => {
  const theme = useContext(ThemeContext);
  // Internal State
  // const [email, setEmail] = useState('umer@gmail.com');
  // const [password, setPassword] = useState('@1234umer');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  // Reference
  const passwordInputRef = useRef(null);

  const onLoginPress = () => {
    if (email.length === 0 || password.length === 0) {
      alert('Email or Password fields can not be empty');
      return;
    }

    _auth(email, password);
  };

  const onSigninPress = () => {
    navigation.navigate(NAVIGATION_SIGNIN_PATH);
  };

  const passwordForget = () => {
    navigation.navigate(NAVIGATION_RESET_PASSWORD_PATH);
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
      // Log-in the user with the credential
      if (currentProfile != null) {
        const customer = {
          customer: {
            email: currentProfile.userID + '@bidfoodhome.com',
            firstname: currentProfile.firstName,
            lastname: currentProfile.lastName || ' _',
            addresses: [{ telephone: '0' }],
          },
          password: currentProfile.firstName + '@123',
        };
        console.log('User :' + JSON.stringify(customer));
        _signIn(customer);
      } else {
        onFacebookButtonPress();
      }
    }
    // _auth(
    //   currentProfile.firstName === 'Open'? 'open_zsqioot_user@tfbnw.net': currentProfile.email,
    //   currentProfile.firstName + '@' + currentProfile.userID,
    // );
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const currentProfile = await GoogleSignin.signIn();
      // Log-in the user with the credential
      const customer = {
        customer: {
          email: currentProfile.user.email,
          firstname: currentProfile.user.givenName,
          lastname: currentProfile.user.familyName || ' _',
          addresses: [{ telephone: '0' }],
        },
        password: currentProfile.user.givenName + '@123',
      };
      _signIn(customer);
      // _auth(
      //   currentProfile.user.email,
      //   currentProfile.user.givenName + '@' + currentProfile.user.id,
      //   true,
      //   customer
      // );
      // console.log(
      //   currentProfile.user.email,
      //   currentProfile.user.givenName + '@' + currentProfile.user.id,
      // );
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
    // Log-in the user with the credential

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
      return <Spinner style={{ marginTop: 30 }} />;
    }

    return (
      <View>
        <Button
          // disabled={email === '' || password === ''}
          onPress={onLoginPress}
          style={styles.buttonAuth(theme)}
        >
          <Text style={styles.loginButtonTitle}>LOGIN</Text>
        </Button>
        <View style={styles.signupContainer}>
          <Text onPress={onSigninPress} style={styles.fontStyle}>
            Don't have account?
          </Text>
          <Text onPress={onSigninPress} style={styles.signupTitle}>
            Sign up
          </Text>
        </View>

        {/* Social accounts */}
        <View>
          <View style={styles.logoContainer}>
            <Image source={bar} />
            <Text style={styles.textStyle}>OR</Text>
            <Image source={bar} />
          </View>
          <View style={styles.logoContainer}>
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
      return (
        <Text style={styles.error(theme)}>
          Incorrect Password or Username. Please try again.
        </Text>
      );
    }

    if (success) {
      return <Text style={styles.success(theme)}>{success}</Text>;
    }
  };

  const handlePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.container(theme)}
      >
        <View style={[styles.inputContainer, { marginBottom: 27 }]}>
          <Image
            source={emailIcon}
            style={styles.iconStyle}
            resizeMode="contain"
          />
          <TextInput
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            placeholder="Email Address"
            placeholderTextColor={'grey'}
            keyboardType="email-address"
            returnKeyType="next"
            autoCorrect={false}
            selectionColor={'grey'}
            value={email}
            editable={!loading}
            onChangeText={setEmail}
            onSubmitEditing={() => passwordInputRef.current.focus()}
            blurOnSubmit={false}
            style={styles.inputStyle}
            textContentType="emailAddress"
          />
        </View>
        <View style={styles.inputContainer}>
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
            autoCorrect={false}
            value={password}
            editable={!loading}
            selectionColor={'grey'}
            onChangeText={setPassword}
            onSubmitEditing={onLoginPress}
            ref={passwordInputRef}
            style={styles.inputStyle}
            placeholderTextColor={'grey'}
            textContentType="password"
          />
          <TouchableOpacity onPress={handlePassword} style={styles.eyeIcon}>
            <Icon
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#8BC63E"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={passwordForget}
          style={styles.forgotPassword}
        >
          <Text style={styles.forgotPasswordText}> Forgot Your Password?</Text>
        </TouchableOpacity>
        {renderButtons()}
        {renderMessages()}
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

Login.navigationOptions = {
  title: translate('login.title'),
};

const styles = StyleSheet.create({
  container: (theme) => ({
    flex: 1,
    alignItems: 'center',
    paddingTop: theme.dimens.WINDOW_HEIGHT * 0.1,
    paddingHorizontal: 16,
  }),
  authInput: (theme) => ({
    border: 'none',
    paddingLeft: 25,
    borderRadius: 5,
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    height: 50,
    marginBottom: theme.spacing.large,
  }),
  buttonAuth: (theme) => ({
    width: theme.dimens.WINDOW_WIDTH * 0.9,
    backgroundColor: '#8BC63E',
    height: 50,
    borderRadius: 5,
  }),
  buttonMargin: (theme) => ({
    marginTop: theme.spacing.large,
  }),
  socialIcon: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  error: (theme) => ({
    color: theme.colors.error,
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: theme.spacing.large,
  }),
  forgotPassword: { alignSelf: 'flex-end', marginTop: 16, marginBottom: 23 },
  success: (theme) => ({
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    color: theme.colors.success,
    textAlign: 'center',
    marginTop: theme.spacing.extraLarge,
  }),
  link: (theme) => ({
    marginTop: theme.spacing.extraLarge,
  }),
  linkTitle: {
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    borderRadius: 6,
    width: '100%',
  },
  eyeIcon: { marginRight: 10 },
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
  forgotPasswordText: {
    color: '#8BC63E',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  loginButtonTitle: {
    color: '#fff',
    fontSize: 18,
  },
  signupTitle: {
    fontSize: 16,
    color: '#8BC63E',
    marginLeft: 5,
  },
  textStyle: {
    paddingHorizontal: 8,
    opacity: 0.7,
  },
  fontStyle: {
    fontSize: 16,
  },
});

const mapStateToProps = ({ customerAuth }) => {
  const { error, success, loading } = customerAuth;

  return { error, success, loading };
};

Login.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType(PropTypes.string, null),
  success: PropTypes.oneOfType(PropTypes.string, null),
  auth: PropTypes.func.isRequired,
  signIn: PropTypes.func.isRequired,
};

Login.defaultProps = {
  error: null,
  success: null,
  loading: false,
};

export default connect(mapStateToProps, { auth, signIn })(Login);
