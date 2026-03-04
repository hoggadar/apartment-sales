import * as React from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { Slide } from "./types";

type CarouselProps = {
  slides: Slide[];
};

export function Carousel({ slides }: CarouselProps) {
  const scrollRef = React.useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const cardWidth = viewportWidth;

  const handleDotPress = (index: number) => {
    if (!cardWidth) return;

    scrollRef.current?.scrollTo({
      x: cardWidth * index,
      animated: true,
    });
    setActiveSlide(index);
  };

  return (
    <View className="px-5">
      <View
        className="overflow-hidden"
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0 && nextWidth !== viewportWidth) {
            setViewportWidth(nextWidth);
          }
        }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            if (!cardWidth) return;
            const x = event.nativeEvent.contentOffset.x;
            const rawIndex = Math.round(x / cardWidth);
            const index = Math.max(0, Math.min(rawIndex, slides.length - 1));
            setActiveSlide(index);
          }}
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{ width: cardWidth || "100%", backgroundColor: slide.bg }}
              className="rounded-2xl p-5 h-[150px] justify-end"
            >
              <Text className="text-white text-lg font-bold">{slide.title}</Text>
              <Text className="text-white/80 text-sm mt-0.5">{slide.subtitle}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-row justify-center gap-1.5 mt-3">
        {slides.map((slide, index) => (
          <Pressable
            key={slide.id}
            onPress={() => handleDotPress(index)}
            style={{
              width: activeSlide === index ? 24 : 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: activeSlide === index ? "#2563eb" : "#cbd5e1",
            }}
          />
        ))}
      </View>
    </View>
  );
}
