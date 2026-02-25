import "../../global.css";
import * as React from "react";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { RootTabs } from "./navigation/RootTabs";

export default function App() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

