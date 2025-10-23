import { Stack } from "expo-router";

export default function tabsLayout() {
  return(
<Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="guide" />
    <Stack.Screen name="tips" />

</Stack>
  );
}
