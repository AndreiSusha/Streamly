import React, { useState } from 'react';
import * as Animatable from 'react-native-animatable';
import { FlatList, TouchableOpacity, ImageBackground } from 'react-native';

const zoomIn = {
  0: {
    scale: 0.9,
  },
  1: {
    scale: 1,
  },
};

const zoomOut = {
  0: {
    scale: 1,
  },
  1: {
    scale: 0.9,
  },
};

const CarouselItem = ({ activeItem, item }) => {
  return (
    <Animatable.View
      className="mr-5"
      animation={activeItem === item._id ? zoomIn : zoomOut}
      duration={500}
    >
      <TouchableOpacity className="relative justify-center items-center" activeOpacity={0.7}>
        <ImageBackground
          source={{ uri: item.filename }} 
          className="w-52 h-72 rounded-[33px] my-5 overflow-hidden shadow-lg shadow-black/40"
          resizeMode="cover"
        />
      </TouchableOpacity>
    </Animatable.View>
  );
};

const Carousel = ({ posts }) => {
  const [activeItem, setActiveItem] = useState(posts[0]?._id);

  const viewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  };

  return (
    <FlatList
      data={posts}
      horizontal
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <CarouselItem activeItem={activeItem} item={item} />}
      onViewableItemsChanged={viewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 70,
      }}
      contentOffset={{ x: 170 }}
    />
  );
};

export default Carousel;
