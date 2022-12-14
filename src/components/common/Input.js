import React, { useContext } from 'react';
import { TextInput, View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from './Text';
import { ThemeContext } from '../../theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  assignRef,
  containerStyle,
  labelStyle,
  inputStyle,
  ...props
}) => {
  const theme = useContext(ThemeContext);

  return (
    <View style={[styles.containerStyle(theme), containerStyle]}>
      {/* {label && (
        <Text type="heading" style={[styles.labelStyle(theme), labelStyle]}>
          {label}
        </Text>
      )} */}
      <TextInput
        {...props}
        secureTextEntry={secureTextEntry}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.bodyText}
        autoCorrect={false}
        style={[styles.inputStyle(theme), inputStyle]}
        value={value}
        onChangeText={onChangeText}
        ref={component => {
          assignRef && assignRef(component);
        }}
      />
    </View>
  );
};

const styles = {
  containerStyle: theme => ({
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  }),
  inputStyle: theme => ({
    color: theme.colors.titleText,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
    borderRadius: 5,
    height: 48,
  }),
  labelStyle: theme => ({
    paddingLeft: theme.spacing.large,
    flex: 1,
  }),
};

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  placeholder: PropTypes.string,
  secureTextEntry: PropTypes.bool,
  containerStyle: ViewPropTypes.style,
  assignRef: PropTypes.func,
};

Input.defaultProps = {
  label: null,
  value: '',
  placeholder: '',
  secureTextEntry: false,
  assignRef: () => {},
  onChangeText: () => {},
};

export { Input };
