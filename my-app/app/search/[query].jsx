import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, Text, FlatList, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchInput, EmptyState, MediaCard } from '../../components';
import { images } from '../../constants';

const Search = () => {
  const { query } = useLocalSearchParams();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.241:3000/media/search?query=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Oopsie! It’s empty here. Such magical posts haven’t been created yet!');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const allMedia = await fetchMediaFiles();
        setData(allMedia);
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const allMedia = await fetchMediaFiles();
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
            avatar={item.user?.avatar || 'https://via.placeholder.com/46'}
          />
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={() => (
          <View className="px-4 my-6 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="text-sm font-pmedium text-gray-100">
                  This is what you found
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {query}
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

            <SearchInput initialQuery={query} />
          </View>
        )}
        ListEmptyComponent={() =>
          !isLoading && (
            <EmptyState
              title="No Posts Found"
              subtitle="No posts found for this search query"
            />
          )
        }
      />
    </SafeAreaView>
  );
};

export default Search;
