import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {images} from '../../constants';
import {SearchInput, Carousel, EmptyState} from '../../components'
import { useState } from 'react';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // re call vids -> if any new vids are available
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: '#161622', height: '100%' }}>
      <FlatList
        data={[{ id: 1 }, { id: 2 }]}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View>
            <Text className="text-3xl text-white">{item.id}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          <View className="px-4 my-6 space-y-6">
            <View className="justify-between items-start flex-row mb-6">
              <View>
              <Text className="text-sm font-pmedium text-gray-100">
                Welcome back!
              </Text>
              <Text className="text-2xl font-psemibold text-white">User</Text>
              </View>

              <View className='mt-1.5'>
                <Image
                  source={images.logo}
                  className="w-12 h-12"
                  resizeMode='contain'
                />
              </View>
            </View>

          <SearchInput />
          <View className='w-full flex-1 pt-5 pb-8'>
          <Text className='text-gray-100 text-lg font-pregular mb-3'>Latest Videos</Text>

          <Carousel posts={[{id: 1}, {id: 2}, {id: 3}] ?? []} />
          </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
          title="No Videos Found"
          subtitle="Be the first to upload a video"
        />
  )}
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Home;
