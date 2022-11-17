//import liraries
import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
// create a component
const checkbox = (props) => {
  console.log('checker', props);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          width: 30,
          height: 30,
          borderColor: '#8BC63E',
          borderWidth: 1,
        }}
        onPress={() => props.select(props.onPressSelect)}
      >
        {props.icon ? <Icon name="check" color="#8BC63E" size={30} /> : null}
      </TouchableOpacity>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: '#2c3e50',
  },
});

//make this component available to the app
export default checkbox;
