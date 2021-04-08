import React, {FC, ReactElement, useEffect, useState} from 'react';
import {Alert, View, ScrollView, StyleSheet} from 'react-native';
import Parse from 'parse/react-native';
import {
  Divider,
  List,
  RadioButton,
  Title,
  Button as PaperButton,
  Text as PaperText,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const BookList: FC<{}> = ({}): ReactElement => {
  const navigation = useNavigation();

  // State variables
  const [publishers, setPublishers] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [queryPublisher, setQueryPublisher] = useState('');
  const [queryAuthor, setQueryAuthor] = useState('');
  const [queryGenre, setQueryGenre] = useState('');
  const [queriedBooks, setQueriedBooks] = useState<[Parse.Object]>();

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    async function getQueryChoices() {
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
      queryBooks();
    }
    // This condition ensures that username is updated only if needed
    if (publishers === null && authors === null && genres === null) {
      getQueryChoices();
    }
  }, [publishers, authors, genres]);

  const queryBooks = async function (): Promise<[Boolean]> {
    const queryPublisherValue: Parse.Object = queryPublisher;
    const queryGenreValue: Parse.Object = queryGenre;
    const queryAuthorValue: Parse.Object = queryAuthor;
    // Reading parse objects is done by using Parse.Query
    const parseQuery: Parse.Query = new Parse.Query('Book');
    // One-to-many queries
    if (queryPublisherValue !== '') {
      parseQuery.equalTo('publisher', queryPublisherValue);
    }
    if (queryGenreValue !== '') {
      parseQuery.equalTo('genre', queryGenreValue);
    }
    // Many-to-many query
    if (queryAuthorValue !== '') {
      parseQuery.equalTo('authors', queryAuthorValue);
    }
    // TODO: one-to-one ISBD query
    return await parseQuery
      .find()
      .then(async (books: [Parse.Object]) => {
        // Be aware that empty or invalid queries return as an empty array
        // Set results to state variable
        for (let book of books) {
          let bookAuthorsRelation = book.relation('authors');
          book.authorsObjects = await bookAuthorsRelation.query().find();
        }
        setQueriedBooks(books);
        return true;
      })
      .catch((error: {message: string}) => {
        // Error can be caused by lack of Internet connection
        Alert.alert('Error!', error.message);
        return false;
      });
  };

  return (
    <>
      <ScrollView style={Styles.wrapper}>
        <View>
          <Title>{'Book List'}</Title>
          {/* Book list */}
          {queriedBooks !== null &&
            queriedBooks !== undefined &&
            queriedBooks.map((book: Parse.Object) => (
              <List.Item
                key={book.id}
                title={book.get('title')}
                description={`Publisher: ${book
                  .get('publisher')
                  .get('name')}, ISBD: ${book.get('isbd')}, Genre: ${book
                  .get('genre')
                  .get('name')}, Author(s): ${book.authorsObjects.map(
                  (author: Parse.Object) => `${author.get('name')}`,
                )}`}
                titleStyle={Styles.book_text}
                style={Styles.book_item}
              />
            ))}
          {queriedBooks !== null &&
          queriedBooks !== undefined &&
          queriedBooks.length <= 0 ? (
            <PaperText>{'No books here!'}</PaperText>
          ) : null}
        </View>
        <View>
          <List.Accordion title="Query options">
            {publishers !== null && (
              <RadioButton.Group
                onValueChange={(newValue) => setQueryPublisher(newValue)}
                value={queryPublisher}>
                <List.Accordion title="Publisher">
                  {publishers.map((publisher: Parse.Object, index: number) => (
                    <RadioButton.Item
                      key={`${index}`}
                      label={publisher.get('name')}
                      value={publisher}
                    />
                  ))}
                </List.Accordion>
              </RadioButton.Group>
            )}
            {genres !== null && (
              <RadioButton.Group
                onValueChange={(newValue) => setQueryGenre(newValue)}
                value={queryGenre}>
                <List.Accordion title="Genre">
                  {genres.map((genre: Parse.Object, index: number) => (
                    <RadioButton.Item
                      key={`${index}`}
                      label={genre.get('name')}
                      value={genre}
                    />
                  ))}
                </List.Accordion>
              </RadioButton.Group>
            )}
            {authors !== null && (
              <RadioButton.Group
                onValueChange={(newValue) => setQueryAuthor(newValue)}
                value={queryAuthor}>
                <List.Accordion title="Author">
                  {authors.map((author: Parse.Object, index: number) => (
                    <RadioButton.Item
                      key={`${index}`}
                      label={author.get('name')}
                      value={author}
                    />
                  ))}
                </List.Accordion>
              </RadioButton.Group>
            )}
          </List.Accordion>
          <PaperButton
            onPress={() => queryBooks()}
            mode="contained"
            icon="search-web"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Query'}
          </PaperButton>
        </View>
        <Divider />
        <View>
          <PaperButton
            onPress={() =>
              navigation.navigate('ObjectCreationForm', {
                objectType: 'Publisher',
              })
            }
            mode="contained"
            icon="plus"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Add Publisher'}
          </PaperButton>
          <PaperButton
            onPress={() =>
              navigation.navigate('ObjectCreationForm', {
                objectType: 'Genre',
              })
            }
            mode="contained"
            icon="plus"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Add Genre'}
          </PaperButton>
          <PaperButton
            onPress={() =>
              navigation.navigate('ObjectCreationForm', {
                objectType: 'Author',
              })
            }
            mode="contained"
            icon="plus"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Add Author'}
          </PaperButton>
          <PaperButton
            onPress={() => navigation.navigate('BookCreationForm')}
            mode="contained"
            icon="plus"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Add Book'}
          </PaperButton>
        </View>
      </ScrollView>
    </>
  );
};

// These define the screen component styles
const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  wrapper: {
    width: '90%',
    alignSelf: 'center',
  },
  create_button: {
    marginTop: 6,
    marginLeft: 15,
    height: 40,
  },
  book_item: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  book_text: {
    fontSize: 15,
  },
});
