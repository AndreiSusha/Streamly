import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { images } from '../../constants';
import { SearchInput, Carousel, EmptyState, MediaCard } from '../../components';

const Home = () => {
  const [data, setData] = useState([]);
  const [latestMedia, setLatestMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch all media files
  const mediaFiles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.241:3000/media', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return [];
      }
      const mediaFiles = await response.json();

      return mediaFiles.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.log('Error', error.message);
      return [];
    }
  };

  // Fetch latest media files
  const fetchLatestMediaFiles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'http://192.168.1.241:3000/media/latest?limit=7',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.log('Failed to fetch latest media files');
        return [];
      }

      return await response.json();
    } catch (error) {
      console.log('Error fetching latest media:', error.message);
      throw error;
    }
  };

  // Fetch current user details
  const fetchCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) {
        throw new Error('User ID or token not found.');
      }

      const response = await fetch(`http://192.168.1.241:3000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.log('Failed to fetch user data.');
        return [];
      }

      return await response.json();
    } catch (error) {
      console.log('Error fetching user:', error.message);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allMedia = await mediaFiles();
        const latest = await fetchLatestMediaFiles();
        const user = await fetchCurrentUser();
        setData(allMedia);
        setLatestMedia(latest);
        setCurrentUser(user);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const allMedia = await mediaFiles();
      const latest = await fetchLatestMediaFiles();
      const user = await fetchCurrentUser();
      setData(allMedia);
      setLatestMedia(latest);
      setCurrentUser(user);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setRefreshing(false);
    }
  };

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
            avatar={item.user?.avatar || null}
          />
        )}
        ListHeaderComponent={() => (
          <View className="px-4 my-6 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="text-sm font-pmedium text-gray-100">
                  Welcome back!
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {currentUser ? currentUser.username : 'User'}
                </Text>
              </View>

              <View className="mt-1.5">
                <Image
                  source={images.logo}
                  className="w-12 h-12"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />
            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gray-100 text-lg font-pregular mb-3">
                Latest Posts
              </Text>

              <Carousel posts={latestMedia} />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No Posts Found"
            subtitle="Be the first to upload a video"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Home;
