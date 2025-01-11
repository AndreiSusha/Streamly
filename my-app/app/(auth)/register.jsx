import { View, Text, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { images } from '../../constants';
import InputForm from '../../components/InputForm';
import Button from '../../components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const API_IP = process.env.EXPO_PUBLIC_API_BASE_URL;

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    // Check if any field is empty
    if (!form.username || !form.email || !form.password) {
      return Alert.alert('Error', 'All fields are required');
    }

    setIsSubmitting(true);

    try {
      const registrationData = {
        username: form.username,
        email: form.email.toLowerCase(),
        password: form.password
      };
      // Create a new user
      const response = await axios.post(`${API_IP}register`, registrationData);

      // Check if the user was created successfully
      if (response.status === 201) {
        
        const userData = response.data.user;
        const token = response.data.token;
        // Save user data to AsyncStorage
        await AsyncStorage.setItem('userId', userData.id);
        await AsyncStorage.setItem('username', userData.username);
        await AsyncStorage.setItem('email', userData.email);
        await AsyncStorage.setItem('token', token);

        Alert.alert('Success', 'User registered successfully');
        router.replace('/home');
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      const errorMessage =
        error.response?.data?.msg || error.message || 'Failed to create user';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center min-h-[90vh] px-4 ">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[130px] h-[84px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Sign up to Streamly
          </Text>
          <InputForm
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-10"
          />
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
            secureTextEntry
          />

          <Button 
            title='Sign up'
            handlePress={submit}
            containerStyles='mt-10'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-gray-100 text-lg font-pregular'>Have an account?</Text>
            <Link href='/login' className='text-lg text-secondary font-psemibold'>Log in</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;
