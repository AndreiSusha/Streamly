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

const LogIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) {
      return Alert.alert('Error', 'All fields are required');
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${API_IP}login`, {
        email: form.email.toLowerCase(),
        password: form.password,
      });

      const token = response.data.token;
      const userData = response.data.user;

      // Save the data to AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userData.id);
      await AsyncStorage.setItem('username', userData.username);
      await AsyncStorage.setItem('email', userData.email);

      console.log('Success', response.data.msg);

      router.replace('/home');
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.msg || 'Login failed. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center min-h-[83vh] px-4 ">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[130px] h-[84px]"
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
            secureTextEntry
          />

          <Button
            title="Log in"
            handlePress={submit}
            containerStyles="mt-10"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-gray-100 text-lg font-pregular">
              Don’t have an account?
            </Text>
            <Link
              href="/register"
              className="text-lg text-secondary font-psemibold"
            >
              Sign up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LogIn;
