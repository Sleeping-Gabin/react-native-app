import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { AppTheme } from "../styles/themes";
import { useAppTheme } from "./AppThemeProvider";
import SansSerifText from "./SansSerifText";

interface InfoProps extends PropsWithChildren {
  label: string;
}

export default function Info(props: InfoProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.info}>
      <SansSerifText 
        style={styles.label}
      >
        {props.label}
      </SansSerifText>
      {props.children}
    </View>
  )
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  info: {
    minWidth: "40%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  label: {
    marginRight: 10,
    color: theme.darkGray,
  }
});