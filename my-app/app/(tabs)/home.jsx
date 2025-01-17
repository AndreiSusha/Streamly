import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet from 'react-native-action-sheet';

import { images } from '../../constants';
import { StatusBar } from 'expo-status-bar';
import { SearchInput, Carousel, EmptyState, MediaCard } from '../../components';

const Home = () => {
  const [data, setData] = useState([]);
  const [latestMedia, setLatestMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [currentMediaId, setCurrentMediaId] = useState('');
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
        // console.log('Fetched media files:', allMedia);
        setLatestMedia(latest);
        setCurrentUser(user);
        // console.log('Current user:', user);
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

  const handleEdit = async () => {
    if (newTitle && newTitle !== '') {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(
          `http://192.168.1.241:3000/media/${currentMediaId}/edit`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTitle }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update media.');
        }

        const updatedMedia = await response.json();
        setData((prevData) =>
          prevData.map((item) =>
            item._id === currentMediaId ? updatedMedia.media : item
          )
        );
        setModalVisible(false);
        setNewTitle(''); // Clear the input
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleDelete = async (mediaId) => {
    Alert.alert('Delete Media', 'Are you sure you want to delete this media?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(
              `http://192.168.1.241:3000/media/${mediaId}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Failed to delete media.');
            }

            // Update the data state to remove the deleted media
            setData((prevData) =>
              prevData.filter((item) => item._id !== mediaId)
            );
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const openEditModal = (mediaId, currentTitle) => {
    setCurrentMediaId(mediaId);
    setNewTitle(currentTitle);
    setModalVisible(true);
  };

  const showActionSheet = (mediaId, title, ownerId) => {
    const options = [];
    // Check if the current user is the owner of the media
    if (currentUser && currentUser._id === ownerId) {
      options.push('Edit', 'Delete');
    }
    options.push('Cancel');

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          openEditModal(mediaId, title); // call openEditModal instead of onEdit
        } else if (buttonIndex === 1) {
          handleDelete(mediaId); // call handleDelete function
        }
      }
    );
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
            mediaId={item._id}
            onDelete={handleDelete}
            onEdit={(mediaId, title) =>
              showActionSheet(mediaId, title, item.user?._id)
            }
            ownerId={item.user?._id}
            currentUser={currentUser}
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
      <StatusBar backgroundColor="#161622" style="light" />
      {/* Modal for Editing Title */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-11/12 max-w-md p-6 bg-white rounded-lg shadow-md">
            <Text className="text-lg font-semibold mb-4">Edit Title</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Enter new title"
              className="border-b border-gray-300 mb-4 py-2"
            />
            <View className="flex-row justify-between">
              <Button title="Save" onPress={handleEdit} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
