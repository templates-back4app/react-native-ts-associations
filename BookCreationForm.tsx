import React, {FC, ReactElement, useEffect, useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import Parse from 'parse/react-native';
import {
  Checkbox,
  RadioButton,
  Title,
  Button as PaperButton,
  Text as PaperText,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const BookCreationForm: FC<{}> = ({}): ReactElement => {
  // Navigation parameters
  const navigation = useNavigation();

  // State variables
  const [publishers, setPublishers] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookISBD, setBookISBD] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookAuthors, setBookAuthors] = useState([]);
  const [bookGenre, setBookGenre] = useState('');

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    async function getFormChoices() {
      // This condition ensures that data is updated only if needed
      if (publishers === null && authors === null && genres === null) {
        // Query all choices
        for (let choiceObject of ['Publisher', 'Author', 'Genre']) {
          let newQuery: Parse.Query = new Parse.Query(choiceObject);
          await newQuery
            .find()
            .then(async (queryResults: [Parse.Object]) => {
              // Be aware that empty or invalid queries return as an empty array
              // Set results to state variable
              if (choiceObject === 'Publisher') {
                setPublishers(queryResults);
              } else if (choiceObject === 'Author') {
                setAuthors(queryResults);
              } else if (choiceObject === 'Genre') {
                setGenres(queryResults);
              }
              return true;
            })
            .catch((error: {message: string}) => {
              // Error can be caused by lack of Internet connection
              Alert.alert('Error!', error.message);
              return false;
            });
        }
      }
    }
    getFormChoices();
  }, [publishers, authors, genres]);

  // Functions used by the screen components
  const createBook = async function (): Promise<[boolean]> {
    try {
      // This values come from state variables linked to
      // the screen form fields, retrieving the user choices
      // as a complete Parse.Object, when applicable;
      const bookTitleValue: string = bookTitle;
      const bookISBDValue: string = bookISBD;
      // For example, bookPublisher holds the value from
      // RadioButton.Group field with its options being every
      // Publisher parse object instance saved on server, which is
      // queried on screen load via useEffect
      const bookPublisherObject: Parse.Object = bookPublisher;
      const bookGenreObject: Parse.Object = bookGenre;
      // bookAuthors can be an array of Parse.Objects, since the book
      // may have more than one Author
      const bookAuthorsObjects: [Parse.Object] = bookAuthors;

      // Creates a new parse object instance
      const objectParseObject: Parse.Object = Parse.Object.extend('Book');
      let newObject = new objectParseObject();

      // Set data to parse object
      // Simple title field
      newObject.set('title', bookTitleValue);

      // 1:1 relation, for now set as a simple string as well
      newObject.set('isbd', bookISBDValue);

      // One-to-many relations can be set in two ways:
      // add direct object to field (Parse will convert to pointer on save)
      newObject.set('publisher', bookPublisherObject);
      // or add pointer to field
      newObject.set('genre', bookGenreObject.toPointer());

      // many-to-many relation
      // Create a new relation so data can be added
      let authorsRelation = newObject.relation('authors');
      // bookAuthorsObjects is an array of Parse.Objects,
      // you can add to relation by adding the whole array or object by object
      authorsRelation.add(bookAuthorsObjects);

      // After setting the values, save it on the server
      return await newObject
        .save()
        .then(async (_result: Parse.Object) => {
          // Success
          Alert.alert('Success!');
          navigation.goBack();
          return true;
        })
        .catch((error: {message: string}) => {
          // Error can be caused by lack of Internet connection
          Alert.alert('Error!', error.message);
          return false;
        });
    } catch (error) {
      // Error can be caused by wrong type of values in fields
      Alert.alert('Error!', error);
      return false;
    }
  };

  const handlePressCheckboxAuthor = (author: Parse.Object) => {
    if (bookAuthors.includes(author)) {
      setBookAuthors(
        bookAuthors.filter((bookAuthor: Parse.Object) => bookAuthor !== author),
      );
    } else {
      setBookAuthors(bookAuthors.concat([author]));
    }
  };

  return (
    <>
      <View style={Styles.wrapper}>
        <Title>{'New Book'}</Title>
        <PaperTextInput
          value={bookTitle}
          onChangeText={text => setBookTitle(text)}
          label="Title"
          mode="outlined"
          style={Styles.form_input}
        />
        <PaperTextInput
          value={bookISBD}
          onChangeText={text => setBookISBD(text)}
          label="ISBD"
          mode="outlined"
          style={Styles.form_input}
        />
        {publishers !== null && (
          <>
            <PaperText>Publisher</PaperText>
            <RadioButton.Group
              onValueChange={newValue => setBookPublisher(newValue)}
              value={bookPublisher}>
              {publishers.map((publisher: Parse.Object, index: number) => (
                <RadioButton.Item
                  key={`${index}`}
                  label={publisher.get('name')}
                  value={publisher}
                />
              ))}
            </RadioButton.Group>
          </>
        )}
        {genres !== null && (
          <>
            <PaperText>Genre</PaperText>
            <RadioButton.Group
              onValueChange={newValue => setBookGenre(newValue)}
              value={bookGenre}>
              {genres.map((genre: Parse.Object, index: number) => (
                <RadioButton.Item
                  key={`${index}`}
                  label={genre.get('name')}
                  value={genre}
                />
              ))}
            </RadioButton.Group>
          </>
        )}
        {authors !== null && (
          <>
            <PaperText>{'Author(s)'}</PaperText>
            <View>
              {authors.map((author: Parse.Object, index: number) => (
                <Checkbox.Item
                  key={`${index}`}
                  label={author.get('name')}
                  value={author.get('name')}
                  status={
                    bookAuthors.includes(author) ? 'checked' : 'unchecked'
                  }
                  onPress={() => handlePressCheckboxAuthor(author)}
                />
              ))}
            </View>
          </>
        )}
        <PaperButton
          onPress={() => createBook()}
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
