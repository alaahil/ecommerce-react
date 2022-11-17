import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Spinner, Text } from '../common';
import { initiatePasswordReset, updatePasswordResetUI } from '../../actions';
import { ThemeContext } from '../../theme';
import { translate } from '../../i18n';

const PasswordReset = ({
  loading,
  error,
  success,
  initiatePasswordReset: _initiatePasswordReset,
  updatePasswordResetUI: _updatePasswordResetUI,
}) => {
  const theme = useContext(ThemeContext);
  const [email, setEmail] = useState('');

  useEffect(
    () => () => {
      // componentWillUnmount
      _updatePasswordResetUI();
    },
    [_updatePasswordResetUI],
  );

  const onResetPress = () => {
    _initiatePasswordReset(email);
  };

  const renderMessages = () => {
    if (error) {
      return <Text style={styles.error(theme)}>{error}</Text>;
    }

    if (success) {
      return <Text style={styles.success(theme)}>{success}</Text>;
    }
  };

  const renderButtons = () => {
    if (loading) {
      return <Spinner style={{ marginTop: theme.spacing.extraLarge }} />;
    }

    return (
      <Pressable
        disabled={email === ''}
        onPress={onResetPress}
        style={{
          width: '80%',
          height: 50,
          backgroundColor: '#8BC63E',
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ color: '#fff', fontSize: 14 }}>
          {translate('passwordReset.resetButton')}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container(theme)}>
      <Text bold type="subheading" style={styles.title(theme)}>
        {translate('passwordReset.passwordRecovery')}
      </Text>
      <Text style={styles.description}>
        {translate('passwordReset.passwordRecoveryInstructions')}
      </Text>
      <TextInput
        autoCapitalize="none"
        underlineColorAndroid="transparent"
        placeholder={translate('common.email')}
        keyboardType="email-address"
        autoCorrect={false}
        value={email}
        selectionColor={'grey'}
        placeholderTextColor={'grey'}
        editable={!loading}
        onChangeText={setEmail}
        onSubmitEditing={onResetPress}
        style={styles.inputStyle}
      />
      {renderButtons()}
      {renderMessages()}
    </View>
  );
};

PasswordReset.navigationOptions = {
  title: translate('passwordReset.title'),
};

const styles = StyleSheet.create({
  container: theme => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  }),
  title: theme => ({
    marginBottom: theme.spacing.medium,
  }),
  description: {
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  emailOffset: theme => ({
    width: '80%',
    marginVertical: theme.spacing.large,
  }),
  error: theme => ({
    color: theme.colors.error,
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: theme.spacing.extraLarge,
  }),
  success: theme => ({
    color: theme.colors.success,
    width: theme.dimens.WINDOW_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: theme.spacing.extraLarge,
  }),
  inputStyle: {
    height: 48,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
    borderRadius: 6,
    paddingLeft: 8,
    color: '#000000'
  },
});

PasswordReset.propTypes = {
  loading: PropTypes.bool.isRequired,
  success: PropTypes.oneOfType([PropTypes.string, null]),
  error: PropTypes.oneOfType([PropTypes.string, null]),
  initiatePasswordReset: PropTypes.func.isRequired,
  updatePasswordResetUI: PropTypes.func.isRequired,
};

PasswordReset.defaultProps = {
  success: null,
  error: null,
};

const mapStateToProps = ({ customerAuth }) => {
  const {
    resetLoading: loading,
    resetPasswordErrorMessage: error,
    resetPasswordSuccessMessage: success,
  } = customerAuth;

  return {
    loading,
    success,
    error,
  };
};

export default connect(mapStateToProps, {
  initiatePasswordReset,
  updatePasswordResetUI,
})(PasswordReset);
