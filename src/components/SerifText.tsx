import { Text, TextProps } from "react-native";
import { useAppTheme } from "./AppThemeProvider";

interface SerifTextProps extends TextProps {
  type?: "Regular"|"SemiBold";
}

export default function SerifText(props: SerifTextProps) {
  let type = props.type ?? "Regular";
  const theme = useAppTheme();

  return (
    <Text {...props}
      style={[
        {
          fontFamily: `MaruBuri-${type}`,
          color: theme.text,
        },
        props.style
      ]}
    >
      {props.children}
    </Text>
  )
}