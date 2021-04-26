import React, {FC, ReactElement, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import Parse from 'parse/react-native';
import {
  Title,
  Button as PaperButton,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';

export const ObjectCreationForm: FC<{}> = ({}): ReactElement => {
  // Navigation parameters
  const navigation = useNavigation();
  const route = useRoute();
  const objectType: string = route.params.objectType;

  // State variables
  const [objectName, setObjectName] = useState('');

  // Functions used by the screen components
  const createObject = async function (): Promise<boolean> {
    // This values come from state variables
    const objectNameValue: string = objectName;

    // Creates a new parse object instance
    let ParseObject: Parse.Object = new Parse.Object(objectType);

    // Set data to parse object
    ParseObject.set('name', objectNameValue);

    // After setting the values, save it on the server
    try {
      await ParseObject.save();
      // Success
      Alert.alert('Success!');
      navigation.goBack();
      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  return (
    <>
      <View style={Styles.wrapper}>
        <Title>{`New ${objectType}`}</Title>
        <PaperTextInput
          value={objectName}
          onChangeText={text => setObjectName(text)}
          label="Name"
          mode="outlined"
          style={Styles.form_input}
        />
        <PaperButton
          onPress={() => createObject()}
          mode="contained"
          icon="plus"
          style={Styles.submit_button}>
          {'Create'}
        </PaperButton>
      </View>
    </>
  );
};

// These define the screen component styles
const Styles = StyleSheet.create({
  wrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  form_input: {
    height: 44,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  submit_button: {
    width: '100%',
    maxHeight: 50,
    alignSelf: 'center',
    backgroundColor: '#208AEC',
  },
});
