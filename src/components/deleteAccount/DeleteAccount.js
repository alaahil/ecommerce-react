import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, ScrollView, TextInput, View } from 'react-native';
import { Button } from '../common';
import { magento } from '../../magento';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../actions';

const DeleteAccount = () => {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const customerId = useSelector((state) => state?.account?.customer?.id);
  const onPressDelete = useCallback(async () => {
    await magento.customer.deleteCustomer(customerId);
    dispatch(logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainerStyle}
    >
      <Text style={styles.textStyle}>
        {
          'Your account will be permanently deleted, if you sure you want to delete the account permanently delete the account.\n\n\n Please type DELETE in below box '
        }
      </Text>
      <TextInput
        value={text}
        placeholder={'Please type DELETE'}
        placeholderTextColor={'grey'}
        onChangeText={setText}
        style={styles.inputStyle}
        selectionColor={'grey'}
        autoCapitalize={'characters'}
      />
      <View style={styles.bottomView}>
        <Button
          onPress={onPressDelete}
          style={styles.buttonStyle}
          disabled={text.toUpperCase() !== 'DELETE'}
        >
          {'Permanently Delete Account'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  textStyle: {
    color: '#8BC63E',
    fontSize: 14,
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  bottomView: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  inputStyle: {
    height: 48,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    marginVertical: 16,
    borderRadius: 6,
    paddingLeft: 8,
  },
  buttonStyle: {
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'red',
    borderWidth: 0,
    borderRadius: 5,
  },
});

export default DeleteAccount;
