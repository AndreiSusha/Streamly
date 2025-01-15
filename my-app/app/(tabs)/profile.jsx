import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { InfoBox, EmptyState, MediaCard } from '../../components';
import { icons } from '../../constants';

const Profile = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUserMediaFiles = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found.');

      const response = await fetch(`http://192.168.1.241:3000/media/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const mediaFiles = await response.json();
      return mediaFiles;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  };

  const fetchUserDetails = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');

      if (!username || !email || !userId) {
        throw new Error('User details not found.');
      }

      setUser({ username, email, userId });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const logout = async () => {
    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found.');

      const response = await fetch('http://192.168.1.241:3000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to log out.');
      }

      // Clear all AsyncStorage data
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  //   const logout = async () => {
//     try {
//       // Clear all AsyncStorage data
//       await AsyncStorage.clear();
//       router.replace('/login');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to log out.');
//     }
//   };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchUserDetails();
        const allMedia = await fetchUserMediaFiles();
        setData(allMedia);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', height: '100%' }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MediaCard
            title={item.title}
            filename={item.filename}
            username={item.user?.username}
            avatar={item.user?.avatar || 'https://via.placeholder.com/46'}
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity className="w-full items-end mb-10" onPress={logout}>
              <Image source={icons.logout} resizeMode="contain" className="w-6 h-6" />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar || 'https://via.placeholder.com/46' }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username || 'Loading...'}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-5 flex flex-row">
              <InfoBox
                title={data.length}
                subtitle="Posts"
                titleStyles="text-xl"
                containerStyles="mr-10"
              />
              <InfoBox title="555" subtitle="Followers" titleStyles="text-xl" />
            </View>
          </View>
        )}
        ListEmptyComponent={() =>
          !isLoading && (
            <EmptyState
              title="No Posts Found"
              subtitle="No posts have been uploaded yet."
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Profile;