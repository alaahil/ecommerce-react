import React from 'react';
import { Text } from 'react-native';

const date = [
    {
      time:"8Am - 11Am",
      id:1
    },
    {
      time:"11Am - 12Am",
      id:2
    },
    {
      time:"12Am - 2Pm",
      id:3
    },
    {
      time:"2Pm - 4Pm",
      id:4
    },
    {
      time:"4Pm - 6Pm",
      id:5
    },
    {
      time:"6Pm - 8Pm",
      id:6
    }
]
  
function Data() {
  return( 
   <div>
    {date.map((t) =>{
        <Text key={t.id}>{t.time}</Text>
    })}
  </div>
  )
}

export default Data;
