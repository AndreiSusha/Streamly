import { View, Text } from 'react-native'
import React from 'react'

const MediaCard = ({ title, filename, user }) => {
  return (
    <View className='flex-col items-center px-4 mb-14'>
      <Text className='text-2xl, text-white'>{title}</Text>
    </View>
  )
}

export default MediaCard