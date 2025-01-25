import { StatusBar } from 'expo-status-bar';
import { Text, View, Image, ScrollView } from 'react-native';
import { router } from 'expo-router';
import '../global.css';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../constants';
import Button from '../components/Button';
import AppWrapper from '../appWrapper';

export default function App() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#161622' }}>
      <AppWrapper>
        <ScrollView contentContainerStyle={{ height: '100%' }}>
          <View className="w-full justify-center items-center min-h-[85vh] px-4">
            <Image
              source={images.logo}
              className="w-[160px] h-[104px]"
              resizeMode="contain"
            />
            <Image
              source={images.cards}
              className="max-w-[380px] w-full h-[300px] mt-20"
              resizeMode="contain"
            />

            <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
              Stream. Share. Shine – Your Media, Everywhere.
            </Text>

            <Button
              title="Get Started"
              handlePress={() => router.push('/login')}
              containerStyles="w-full mt-7"
            />
          </View>
        </ScrollView>
      </AppWrapper>
      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
}
