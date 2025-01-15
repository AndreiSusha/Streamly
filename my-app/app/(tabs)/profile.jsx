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

  // const fetchUserMediaFiles = async () => {
  //   try {
  //     const userId = await AsyncStorage.getItem('userId');
  //     if (!userId) throw new Error('User ID not found.');

  //     const response = await fetch(
  //       `http://192.168.1.241:3000/media/user/${userId}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       return [];
  //     }

  //     const mediaFiles = await response.json();
  //     return mediaFiles;
  //   } catch (error) {
  //     console.error(error.message);
  //     return [];
  //   }
  // };

  const fetchUserMediaFiles = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!userId || !token) throw new Error('User ID or token not found.');
  
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
        throw new Error('Failed to fetch media files');
      }
  
      return await response.json();
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

  // const logout = async () => {
  //   try {
  //     // Clear all AsyncStorage data
  //     await AsyncStorage.clear();
  //     router.replace('/login');
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to log out.');
  //   }
  // };

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
            const updatedData = await fetchUserMediaFiles();
            setData(updatedData);
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
    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 2,
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
            onDelete={handleDelete}
            onEdit={() => showActionSheet(item._id, item.title)}
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
              {user?.username ? (
                <View className="w-full h-full bg-gray-400 rounded-lg flex justify-center items-center">
                  <Text className="text-white text-xl font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  className="w-[90%] h-[90%] rounded-lg"
                  resizeMode="cover"
                />
              )}
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
        refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      {/* Modal for Editing Title */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            marginTop: 50,
            padding: 20,
            backgroundColor: 'white',
            borderRadius: 10,
          }}
        >
          <Text>Edit Title</Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Enter new title"
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <Button title="Save" onPress={handleEdit} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
