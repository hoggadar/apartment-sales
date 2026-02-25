import * as React from "react";
import { ScrollView, Text, View } from "react-native";
import { StatsSection } from "../home/StatsSection";
import { Slide, StatBlock } from "../home/types";
import { Carousel } from "../home/Carousel";

const slides: Slide[] = [
  {
    id: 1,
    title: "Заголовок 1",
    subtitle: "Подзаголовок 1",
    bg: "#2563eb",
  },
  {
    id: 2,
    title: "Заголовок 2",
    subtitle: "Подзаголовок 2",
    bg: "#0d9488",
  },
  {
    id: 3,
    title: "Заголовок 3",
    subtitle: "Подзаголовок 3",
    bg: "#7c3aed",
  },
];

const infoBlocks: StatBlock[] = [
  {
    icon: "🏠",
    title: "4 000+",
    label: "Квартир",
  },
  {
    icon: "⭐",
    title: "4.9",
    label: "Рейтинг",
  },
  {
    icon: "👤",
    title: "5 500+",
    label: "Клиентов",
  },
];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white pt-2">
      <View className="px-5 pb-3">
        <Text className="text-xl font-bold text-neutral-900 leading-tight">Главная</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
        <Carousel slides={slides} />
        <StatsSection blocks={infoBlocks} />
      </ScrollView>
    </View>
  );
}
