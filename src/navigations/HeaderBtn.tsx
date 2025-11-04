import { GestureResponderEvent, TouchableOpacity } from "react-native";
import SansSerifText from "../components/SansSerifText";

interface HeaderBtnProps {
  name: string;
  onPress: (event: GestureResponderEvent) => void;
}

export default function HeaderBtn (props: HeaderBtnProps) {
  return (
    <TouchableOpacity 
      onPressIn={props.onPress}
      style={{
        padding: 5,
        pointerEvents: "box-none"
      }}
      hitSlop={20}
    >
      <SansSerifText>
        {props.name}
      </SansSerifText>
    </TouchableOpacity>
  )
}
