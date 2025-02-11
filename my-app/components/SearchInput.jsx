import { useState } from 'react';
import { router, usePathname } from 'expo-router';
import { View, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { icons } from '../constants';

const SearchInput = ({ initialQuery }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (query === '')
      return Alert.alert(
        'Missing Query',
        'Enter something to search for amazing things'
      );

    if (pathname.startsWith('/search')) router.setParams({ query });
    else router.push(`/search/${query}`);
  };

  return (
    <View
      className={`flex flex-row items-center space-x-4 w-full h-16 px-4 rounded-2xl border-2 ${
        isFocused ? 'border-secondary' : 'border-black-200'
      } bg-black-100`}
    >
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={query}
        placeholder="Search for something special"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e) => setQuery(e)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />

      <TouchableOpacity onPress={handleSearch}>
        <Image source={icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
