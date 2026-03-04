import * as React from "react";
import { View } from "react-native";
import { ApartmentForm } from "../apartments/ApartmentForm";

export default function ApartmentsScreen() {
  return (
    <View className="flex-1 bg-white">
      <ApartmentForm />
    </View>
  );
}
