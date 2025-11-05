import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { PropsWithChildren } from "react";
import { Keyboard, Pressable, StyleSheet, ViewStyle } from "react-native";
import { openSheet, useAppDispatch, useAppSelector } from "../store";
import { useAppTheme } from "./AppThemeProvider";

interface SheetLabelProps extends PropsWithChildren {
  name: string;
  style?: ViewStyle;
}

export default function SheetLabel(props: SheetLabelProps) {
  const {name, style} = props;
  
  const isOpen = useAppSelector(state => state.sheet.openName === name);
  const dispatch = useAppDispatch();
  
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    label: {
      flex: 3,
      paddingVertical: 5,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    }
  })

  return (
    <Pressable 
      style={[styles.label, style]}
      onPress={() => {
        Keyboard.dismiss();
        dispatch(openSheet(name))
      }}
    >
      {props.children}
      <MaterialDesignIcons color={theme.text} name={isOpen ? "menu-up" : "menu-down"}/>
    </Pressable>
  )
}

