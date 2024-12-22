import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import '../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import Button from '../components/Button';

export default function App() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <ScrollView contentContainerStyle={{ height: '100%' }}>
        <View className="w-full justify-center items-center min-h-[85vh] px-4">
          <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />
          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[300px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Discover endless possibilities with
              <Text className="text-secondary-200"> Nativewind</Text>
            </Text>
          </View>
          <Text className='text-sm font-pregular text-gray-100 mt-7 text-center'>Meets innovations</Text>
          <Button
          title="Get Started"
          handlePress={() => router.push('/login')}
          containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
      <StatusBar backgroundColor='#161622'
      style='light'/>
    </SafeAreaView>
  );
}
