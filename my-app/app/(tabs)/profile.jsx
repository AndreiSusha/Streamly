import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  FlatList,
  Alert,
  Image,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Button,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet from 'react-native-action-sheet';

import { InfoBox, EmptyState, MediaCard } from '../../components';
import { icons } from '../../constants';

const Profile = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [currentMediaId, setCurrentMediaId] = useState('');

  const fetchUserMediaFiles = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) return [];

      const response = await fetch(
        `http://192.168.1.241:3000/media/user/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        console.error('Failed to fetch media files', response.status);
        return [];
      }

      const mediaFiles = await response.json();
      return mediaFiles.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
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

  // const logout = async () => {
  //   try {
  //     await AsyncStorage.clear();
  //     router.replace('/login');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to log out.');
  //   }
  // };

  const logout = async () => {
    try {
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

      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

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
        setNewTitle('');
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

  const showActionSheet = (mediaId, title) => {
    const options = ['Edit', 'Delete', 'Cancel'];
    const cancelButtonIndex = 2;

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          openEditModal(mediaId, title);
        } else if (buttonIndex === 1) {
          handleDelete(mediaId);
        }
      }
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserDetails();
      const allMedia = await fetchUserMediaFiles();
      setData(allMedia);
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
            avatar={item.user?.avatar}
            mediaId={item._id}
            onMenuPress={(mediaId, title) => showActionSheet(mediaId, title)}
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              className="w-full items-end mb-10"
              onPress={logout}
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <View className="w-full h-full bg-gray-400 rounded-lg flex justify-center items-center">
                <Text className="text-white text-xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
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
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View className="flex-1 justify-center items-center bg-primary bg-opacity-50">
          <View className="bg-white rounded-2xl p-4 w-4/5">
            <TextInput
              placeholder="Edit Title"
              value={newTitle}
              onChangeText={setNewTitle}
              className="border border-gray-300 p-2 rounded"
            />
            <View className="flex flex-row justify-between mt-4">
            <Button title="Save" onPress={handleEdit} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;