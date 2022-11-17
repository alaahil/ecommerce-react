import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import Rating from "../../assets/rating/offer.png";
import { useState } from 'react';
import { Pressable } from 'react-native';

const ReviewApp = () => {

    const [defaultRating, setDefaultRating] = useState(4)
    const [maxRating, setMaxRating] = useState([1,2,3,4,5])
     
    const starImageField = "https://raw.githubusercontent.com/tranhonghan/images/main/star_filled.png" ;
    const starImageCorner = "https://raw.githubusercontent.com/tranhonghan/images/main/star_corner.png" ;
 

  return (
    <View style={{width:"100%",marginTop:30}}>
        <Image source={Rating} style={{
            width:"100%",
            resizeMode:"contain",
            height:300
        }} />
        <Text style={{textAlign:"center",paddingBottom:10,fontSize:18,opacity:.7,paddingVertical:10}}>Your Oponion matters a lot to us!</Text>
        <View
          style={{
            display:"flex",
            flexDirection:"row",
            alignItems:"center",
            justifyContent:"center",
            paddingBottom:-10
          }}
          >
              {
                maxRating.map((item,key) =>{
                  return(
                   <TouchableOpacity
                   activeOpacity={0.7}
                   key={item}
                   >
                     <Image style={styles.star} 
                     source={
                       item <= defaultRating
                        ? {uri: starImageField}
                        : {uri: starImageCorner}
                     }
                     />
                   </TouchableOpacity>
                  )
                }) 
              }
              </View>
              <View style={{marginHorizontal:30,marginVertical:20}}>
                  <TextInput 
                  multiline={true}
                  numberOfLines={6}
                  placeholder='Write us a review' placeholderTextColor='#000' style={{
                      color:"#000",
                      backgroundColor:"#F0F1F2",
                      borderRadius:5,
                      borderWidth:0,
                      flexDirection:"row",
                      paddingLeft:10,
                      textAlignVertical:"top",
                      opacity:.7,
                  }} />

                  <Pressable
                  style={{
                    width: "100%",
                    height:45,
                    backgroundColor:"#8BC63E",
                    flexDirection:"row",
                    alignItems:"center",
                    justifyContent:"center",
                    borderWidth:0,
                    borderRadius:5,
                    marginVertical:20
                  }}
                  >
                      <Text style={{color:"#fff",fontSize:19}}>Submit</Text>
                  </Pressable>
              </View>
    </View>
  )
}

const styles = StyleSheet.create({
    star:{
        width:30,
        height:30,
        marginRight:5,
      },
})

export default ReviewApp
