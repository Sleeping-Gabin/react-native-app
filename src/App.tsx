import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { Provider } from 'react-redux';
import AppThemeProvider from './components/AppThemeProvider';
import { getDatabase } from './database/database';
import RootNavigation from './navigations/RootNavigation';
import store from './store';
import { navDarkTheme, navLightTheme } from './styles/navigationThemes';
import { darkTheme, lightTheme } from './styles/themes';

SplashScreen.preventAutoHideAsync();
enableScreens();

function App() {
  const colorScheme = useColorScheme();
  const navTheme = colorScheme==="dark" ? navDarkTheme : navLightTheme;
  const theme = colorScheme==="dark" ? darkTheme : lightTheme;

  const initDB = async () => {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS review (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          star_rate INTEGER NOT NULL CHECK(star_rate >= 1 AND star_rate <= 5),
          text TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'paperBook',
          emotion TEXT NOT NULL DEFAULT 'happy',
          write_date TEXT NOT NULL
        );
      `);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS book (
          review_id INTEGER NOT NULL UNIQUE,
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          authors TEXT NOT NULL,
          publisher TEXT NOT NULL,
          thumbnail TEXT NOT NULL,
          year INTEGER NOT NULL,
          FOREIGN KEY (review_id)
            REFERENCES review (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        );
      `);
    })
    .catch(error => console.error(error));
  }

  useEffect(() => {
    initDB();
  }, []);

  const [loaded, error] = useFonts({
    "MaruBuri-Regular": require("../assets/fonts/MaruBuri-Regular.ttf"),
    "MaruBuri-SemiBold": require("../assets/fonts/MaruBuri-SemiBold.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }), [loaded, error];

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <AppThemeProvider theme={theme}>
            <StatusBar backgroundColor={theme.background} barStyle={colorScheme==="dark"?"light-content":"dark-content"} />
            <NavigationContainer theme={navTheme}>
              <RootNavigation />
            </NavigationContainer>
          </AppThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

registerRootComponent(App);
