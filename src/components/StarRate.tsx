import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { useAppTheme } from "./AppThemeProvider";
import SansSerifText from "./SansSerifText";

interface StarRateProps {
  starRate: number;
  size?: number;
}

export default function StarRate(props: StarRateProps) {
  const {starRate, size} = props;
  const theme = useAppTheme();

  return(
    <SansSerifText>
      {
        Array.from({length: starRate}, (_, idx) => (
          <MaterialDesignIcons size={size} name="star" color={theme.secondary} key={idx}/>
        ))
      }
      {
        Array.from({length: 5-starRate}, (_, idx) => (
          <MaterialDesignIcons size={size} name="star-outline" color={theme.gray} key={5-idx}/>
        ))
      }
    </SansSerifText>
  )
}
