/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import {Image, SafeAreaView, StatusBar, Text, View} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Parse from 'parse/react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {BookList} from './BookList';
import Styles from './Styles';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {ObjectCreationForm} from './ObjectCreationForm';
import {BookCreationForm} from './BookCreationForm';

// Your Parse initialization configuration goes here
Parse.setAsyncStorage(AsyncStorage);
const PARSE_APPLICATION_ID: string = '';
const PARSE_HOST_URL: string = 'https://parseapi.back4app.com/';
const PARSE_JAVASCRIPT_ID: string = '';
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_ID);
Parse.serverURL = PARSE_HOST_URL;

function BookListScreen() {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={Styles.login_container}>
        <View style={Styles.login_header}>
          <Image
            style={Styles.login_header_logo}
            source={require('./assets/logo-back4app.png')}
          />
          <Text style={Styles.login_header_text}>
            <Text style={Styles.login_header_text_bold}>
              {'React Native on Back4App - '}
            </Text>
            {' Associations'}
          </Text>
        </View>
        <BookList />
      </SafeAreaView>
    </>
  );
}

function ObjectCreationScreen() {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={Styles.login_container}>
        <View style={Styles.login_header}>
          <Image
            style={Styles.login_header_logo}
            source={require('./assets/logo-back4app.png')}
          />
          <Text style={Styles.login_header_text}>
            <Text style={Styles.login_header_text_bold}>
              {'React Native on Back4App - '}
            </Text>
            {' Associations'}
          </Text>
        </View>
        <ObjectCreationForm />
      </SafeAreaView>
    </>
  );
}

function BookCreationScreen() {
  return (
    <>
      <StatusBar />
      <SafeAreaView style={Styles.login_container}>
        <View style={Styles.login_header}>
          <Image
            style={Styles.login_header_logo}
            source={require('./assets/logo-back4app.png')}
          />
          <Text style={Styles.login_header_text}>
            <Text style={Styles.login_header_text_bold}>
              {'React Native on Back4App - '}
            </Text>
            {' Associations'}
          </Text>
        </View>
        <BookCreationForm />
      </SafeAreaView>
    </>
  );
}

// This method instantiates and creates a new StackNavigator
const Stack = createStackNavigator();

// React native paper theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0065A4',
    accent: '#208AEC',
  },
};

// Add the stack navigator and inside it you can insert all your app screens, in the desired order
const App = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="BookList" component={BookListScreen} />
          <Stack.Screen
            name="ObjectCreationForm"
            component={ObjectCreationScreen}
          />
          <Stack.Screen
            name="BookCreationForm"
            component={BookCreationScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
