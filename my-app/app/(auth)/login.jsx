import { View, Text, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants';

const LogIn = () => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className='w-full justify-start h-full px-4 my-6'>
          <Image source={images.logo}
          resizeMode='contain'
          className='w-[115px] h-[35px]'/>
          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold'>Log in to Streamly</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default LogIn