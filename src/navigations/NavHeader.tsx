import { View } from "react-native";
import { useAppTheme } from "../components/AppThemeProvider";

export default function NavHeader() {
  const theme = useAppTheme();
  
  return (
    <View style={{
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: theme.primary,
    }}/>
  )
}