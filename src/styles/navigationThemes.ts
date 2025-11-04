import { darkTheme, lightTheme } from "./themes"

const navigationFonts = {
  regular: {
    fontFamily: "MaruBuri-Regular",
    fontWeight:  "normal" as const,
  },
  medium: {
    fontFamily: "MaruBuri-Regular",
    fontWeight: "normal" as const,
  },
  bold: {
    fontFamily: "MaruBuri-Medium",
    fontWeight: "normal" as const,
  },
  heavy: {
    fontFamily: "MaruBuri-SemiBold",
    fontWeight: "normal" as const,
  },
}

export const navDarkTheme = {
  dark: true,
  colors: {
    primary: darkTheme.primary,
    background: darkTheme.background,
    card: darkTheme.background,
    text: darkTheme.primary,
    border: darkTheme.primary,
    notification: darkTheme.secondaryContainer,
  },
  fonts: navigationFonts
}

export const navLightTheme = {
  dark: false,
  colors: {
    primary: lightTheme.primary,
    background: lightTheme.background,
    card: lightTheme.background,
    text: lightTheme.primary,
    border: lightTheme.primary,
    notification: lightTheme.secondaryContainer,
  },
  fonts: navigationFonts
}