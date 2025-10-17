import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from "expo-router";

export default function tabsLayout() {
  return(
  <Tabs screenOptions={{
    headerStyle: { backgroundColor: '#76D9DB' },
    headerTitleStyle: { color: '#000000' },
    tabBarActiveTintColor: '#76D9DB',
    tabBarStyle: { backgroundColor: '#00004D' },
  }} >
    
    <Tabs.Screen name="Dashboard" options={{headerShown: false, tabBarIcon:({color})=><MaterialIcons name="home" size={24} color={color} />}} />
    <Tabs.Screen name="History" options={{headerShown:false, tabBarIcon:({color})=><MaterialIcons name="history" size={24} color={color}/>}}/>
    <Tabs.Screen name="Graph" options={{headerShown:false, tabBarIcon:({color})=><MaterialIcons name="bar-chart" size={24} color={color}/>}}/>
    <Tabs.Screen name="Settings" options={{headerShown:false, tabBarIcon:({color})=><MaterialIcons name="settings" size={24} color={color}/>}}/>
    
  </Tabs>
  );
}
