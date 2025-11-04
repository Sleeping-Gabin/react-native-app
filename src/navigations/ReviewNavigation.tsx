import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ReviewListScreen from "../screens/ReviewListScreen";
import NavHeader from "./NavHeader";
import { ReviewStackParamList } from "./types";

const Stack = createNativeStackNavigator<ReviewStackParamList>();

export default function ReviewNavigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerBackground: () => <NavHeader />,
      }}
    >
      <Stack.Screen 
        name="ReviewList" 
        component={ReviewListScreen} 
        options={{
          title: "독서 기록"
        }}
      />
    </Stack.Navigator>
  );
}