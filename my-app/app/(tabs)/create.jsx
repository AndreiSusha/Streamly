import { useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

import { icons } from '../../constants';
import { Button, InputForm } from '../../components';

const API_IP = process.env.EXPO_PUBLIC_API_BASE_URL;

const Create = () => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    image: null,
  });

  const openPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/jpeg', 'image/png', 'image/jpg'],
    });

    if (!result.canceled) {
      setForm({ ...form, image: result });
    } 
    // else {
    //   Alert.alert('Error', 'No file selected');
    // }
  };

  const submit = async () => {
    if (!form.title || !form.image) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    setUploading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('userId', userId);
      formData.append('file', {
        uri: form.image.uri,
        type: form.image.mimeType || 'image/jpeg',
        name: form.image.name,
      });

      const response = await axios.post(`${API_IP}media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', response.data.msg);
      setForm({ title: '', image: null });
      router.push("/home");
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.msg || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', height: '100%' }}>
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">
          Upload magical content here
        </Text>

        <InputForm
          title="Name"
          value={form.title}
          placeholder="Give your post a perfect title..."
          handleChangeText={(e) => setForm({ ...form, title: e })}
          otherStyles="mt-10"
        />

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Photo
          </Text>
          <TouchableOpacity onPress={openPicker}>
            {form.image ? (
              <Image
                source={{ uri: form.image.uri }}
                resizeMode="cover"
                className="w-full h-64 rounded-2xl"
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    alt="upload"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Button
          title="Submit & Publish"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;
