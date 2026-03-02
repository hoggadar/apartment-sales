import * as React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

type SelectProps = {
  value: string;
  options: string[];
  label: string;
  placeholder?: string;
  onSelect: (value: string) => void;
};

export function Select({
  value,
  options,
  label,
  placeholder = "Выберите...",
  onSelect,
}: SelectProps) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const displayValue = value || placeholder;

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-neutral-700 mb-1.5">{label}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3.5 min-h-[48px] justify-center"
      >
        <Text
          className={`text-base ${value ? "text-neutral-900" : "text-neutral-400"}`}
        >
          {displayValue}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="bg-white rounded-t-2xl max-h-[70%]"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="p-4 border-b border-neutral-200">
              <Text className="text-lg font-semibold text-neutral-900">
                {label}
              </Text>
            </View>
            <ScrollView className="max-h-64">
              {options.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onSelect(opt);
                    setModalVisible(false);
                  }}
                  className={`px-4 py-4 border-b border-neutral-100 ${
                    opt === value ? "bg-blue-50" : ""
                  }`}
                >
                  <Text
                    className={`text-base ${
                      opt === value ? "font-semibold text-blue-600" : "text-neutral-800"
                    }`}
                  >
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
