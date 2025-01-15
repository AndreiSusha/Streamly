import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { icons } from '../constants';
import ActionSheet from 'react-native-action-sheet';

const MediaCard = ({ title, filename, username, avatar, mediaId, onDelete, onEdit }) => {
  
  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const showActionSheet = () => {
    const options = ['Edit', 'Delete', 'Cancel'];
    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          onEdit(mediaId, title); // call onEdit function
        } else if (buttonIndex === 1) {
          onDelete(mediaId); // call onDelete function
        }
      }
    );
  };

  return (
    <View className="flex-col items-center px-4 mb-14">
      <View className="flex-row items-start gap-3">
        <View className="justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-400 rounded-lg flex justify-center items-center">
                <Text className="text-white font-bold">{getInitials(username)}</Text>
              </View>
            )}
          </View>
          <View className="justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="text-sm text-white font-psemibold"
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text
              className="text-xs text-gray-100 font-pregular"
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>
        <View className="pt-2">
          <TouchableOpacity onPress={showActionSheet}>
            <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
      >
        <Image
          source={{ uri: filename }}
          className="w-full h-full rounded-xl mt-3"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
};

export default MediaCard;