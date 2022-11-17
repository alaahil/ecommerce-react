import { View, Text, Image } from 'react-native'
import React from 'react'
import message from "../../assets/auth/email.png";
import phone from "../../assets/auth/phone-call.png";
import whatsApp from "../../assets/auth/whatsapp.png";

const Contact = () => {
  return (
    <View style={{width:"100%"}}>
      <Text style={{fontSize:17,textAlign:"center",marginBottom:20}}>Contact Us</Text>
      <View style={{flexDirection:"row",alignItems:"center",paddingVertical:5,borderBottomWidth:1,borderBottomColor:"#E1E1E1"}}>
       <Image source={message} style={{width:20,height:20,resizeMode:"contain"}} />
       <Text style={{paddingLeft:5}}>Send Message</Text>
      </View>
      <View style={{flexDirection:"row",alignItems:"center",width:"100%",paddingVertical:5,borderBottomWidth:1,borderBottomColor:"#E1E1E1"}}>
       <Image source={phone} style={{width:20,height:20,resizeMode:"contain"}} />
       <Text style={{paddingLeft:5}}>Contact Our Customer Service</Text>
      </View>
      <View style={{flexDirection:"row",alignItems:"center",width:"100%",paddingVertical:5,borderBottomWidth:1,borderBottomColor:"#E1E1E1"}}>
       <Image source={whatsApp} style={{width:20,height:20,resizeMode:"contain"}} />
       <Text style={{paddingLeft:5}}>Live Chat On What's App</Text>
      </View>
    </View>
  )
}

export default Contact