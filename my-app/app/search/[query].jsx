import { View, Text } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

const Search = () => {
  const { query } = useLocalSearchParams();
  return (
    <View>
      <Text className="text-2xl font-psemibold text-white mt-1">{query}</Text>
    </View>
  );
};

export default Search;
