import { View, Text, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router'
import { images } from '../../constants';
import InputForm from '../../components/InputForm';
import Button from '../../components/Button';

const LogIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false)  

  const submit = () => {
    console.log('submit', form);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center min-h-[83vh] px-4 ">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[115px] h-[35px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Log in to Streamly
          </Text>

          <InputForm
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          <InputForm
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <Button 
          title='Log in'
          habdlePress={submit}
          containerStyles='mt-10'
          isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-gray-100 text-lg font-pregular'>Don’t have an account?</Text>
            <Link href='/register' className='text-lg text-secondary font-psemibold'>Register</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LogIn;
