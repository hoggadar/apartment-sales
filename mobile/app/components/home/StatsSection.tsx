import * as React from "react";
import { Text, View } from "react-native";
import { StatBlock } from "./types";

type StatsSectionProps = {
  blocks: StatBlock[];
};

function StatCard({ icon, title, label }: StatBlock) {
  return (
    <View className="flex-1 bg-neutral-50 rounded-2xl p-3.5 items-center">
      <Text className="text-2xl">{icon}</Text>
      <Text className="text-lg font-bold text-neutral-900 mt-1">{title}</Text>
      <Text className="text-xs text-neutral-500">{label}</Text>
    </View>
  );
}

export function StatsSection({ blocks }: StatsSectionProps) {
  return (
    <View className="px-5 mt-5">
      <Text className="text-sm font-semibold text-neutral-800 mb-2.5">В цифрах</Text>
      <View className="flex-row gap-3">
        {blocks.map((block) => (
          <StatCard key={block.label} {...block} />
        ))}
      </View>
    </View>
  );
}
