import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import ReviewDetailScreen from "../screens/ReviewDetailScreen";
import ReviewWriteScreen from "../screens/ReviewWriteScreen";
import { pressDelete, pressSave, useAppDispatch } from "../store";
import HeaderBtn from "./HeaderBtn";
import NavHeader from "./NavHeader";
import TabBar from "./TabBar";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  const dispatch = useAppDispatch();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
        headerBackground: () => <NavHeader />,
        headerTransparent: false,
        animation: "fade_from_bottom",
        headerBackButtonDisplayMode: "minimal"
      }}
      initialRouteName="Tab"
    >
      <Stack.Screen
        name="ReviewDetail"
        component={ReviewDetailScreen}
        options={({navigation, route}) => ({
          title: "",
          headerRight: () => (
            <View 
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              <HeaderBtn
                name="수정"
                onPress={() => {
                  navigation.navigate("ReviewWrite", {
                    mode: "modify",
                    reviewId: route.params.reviewId
                  })
                }}
              />
              <HeaderBtn
                name="삭제"
                onPress={() => dispatch(pressDelete())}
              />
            </View>
          )
        })}
      />
      <Stack.Screen
        name="ReviewWrite"
        component={ReviewWriteScreen}
        options={{
          title: "기록 작성",
          headerRight: () => 
            <HeaderBtn name="저장" 
              onPress={() => {dispatch(pressSave())}}
            />
        }}
      />
      <Stack.Screen
        name="Tab"
        component={TabBar}
        options={{
          headerShown: false,
          headerBackground: undefined
        }}
      />
    </Stack.Navigator>
  )
}