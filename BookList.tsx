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
  TextInput as PaperTextInput,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

export const BookList: FC<{}> = ({}): ReactElement => {
  const navigation = useNavigation();

  // State variables
  const [publishers, setPublishers] = useState(null);
  const [authors, setAuthors] = useState(null);
  const [genres, setGenres] = useState(null);
  const [isbds, setIsbds] = useState(null);
  const [queryPublisher, setQueryPublisher] = useState('');
  const [queryAuthor, setQueryAuthor] = useState('');
  const [queryGenre, setQueryGenre] = useState('');
  const [queryIsbd, setQueryIsbd] = useState('');
  const [queriedBooks, setQueriedBooks] = useState<[Parse.Object]>();
  const [queryTitle, setQueryTitle] = useState('');
  const [queryOrdering, setQueryOrdering] = useState('ascending');
  const [queryYearFrom, setQueryYearFrom] = useState('');
  const [queryYearTo, setQueryYearTo] = useState('');

  // useEffect is called after the component is initially rendered and
  // after every other render
  useEffect(() => {
    async function getQueryChoices() {
      // Query all choices
      for (let choiceObject of ['Publisher', 'Author', 'Genre', 'ISBD']) {
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
            } else if (choiceObject === 'ISBD') {
              setIsbds(queryResults);
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
    if (
      publishers === null &&
      authors === null &&
      genres === null &&
      isbds === null
    ) {
      getQueryChoices();
    }
  }, [publishers, authors, genres, isbds]);

  const queryBooks = async function (): Promise<boolean> {
    // These values are simple input or radio buttons with query choices
    // linked to state variables
    const queryOrderingValue: string = queryOrdering;
    const queryTitleValue: string = queryTitle;
    const queryYearFromValue: number = Number(queryYearFrom);
    const queryYearToValue: number = Number(queryYearTo);

    // These values also come from state variables linked to
    // the screen query fields, with its options being every
    // parse object instance saved on server from the referred class, which is
    // queried on screen load via useEffect; this variables retrieve the user choices
    // as a complete Parse.Object;
    const queryPublisherValue: Parse.Object = queryPublisher;
    const queryGenreValue: Parse.Object = queryGenre;
    const queryAuthorValue: Parse.Object = queryAuthor;
    const queryIsbdValue: Parse.Object = queryIsbd;

    // Create our Parse.Query instance so methods can be chained
    // Reading parse objects is done by using Parse.Query
    const parseQuery: Parse.Query = new Parse.Query('Book');

    // Basic queries
    // Ordering (two options)
    if (queryOrderingValue === 'ascending') {
      parseQuery.addAscending('title');
    } else if (queryOrderingValue === 'descending') {
      parseQuery.addDescending('title');
    }
    // Title query
    if (queryTitleValue !== '') {
      // Be aware that contains is case sensitive
      parseQuery.contains('title', queryTitleValue);
    }
    // Year interval query
    if (queryYearFromValue !== 0 || queryYearToValue !== 0) {
      if (queryYearFromValue !== 0) {
        parseQuery.greaterThanOrEqualTo('year', queryYearFromValue);
      }
      if (queryYearToValue !== 0) {
        parseQuery.lessThanOrEqualTo('year', queryYearToValue);
      }
    }

    // Association queries
    // One-to-many queries
    if (queryPublisherValue !== '') {
      parseQuery.equalTo('publisher', queryPublisherValue);
    }
    if (queryGenreValue !== '') {
      parseQuery.equalTo('genre', queryGenreValue);
    }

    // One-to-one query
    if (queryIsbdValue !== '') {
      parseQuery.equalTo('isbd', queryIsbdValue);
    }

    // Many-to-many query
    // In this case, we need to retrieve books related to the chosen author
    if (queryAuthorValue !== '') {
      parseQuery.equalTo('authors', queryAuthorValue);
    }

    try {
      let books: [Parse.Object] = await parseQuery.find();
      // Many-to-many objects retrieval
      // In this example we need to get every related author Parse.Object
      // and add it to our query result objects
      for (let book of books) {
        // This query is done by creating a relation and querying it
        let bookAuthorsRelation = book.relation('authors');
        book.authorsObjects = await bookAuthorsRelation.query().find();
      }
      setQueriedBooks(books);
      return true;
    } catch (error) {
      // Error can be caused by lack of Internet connection
      Alert.alert('Error!', error.message);
      return false;
    }
  };

  const clearQueryChoices = async function (): Promise<boolean> {
    setQueryPublisher('');
    setQueryAuthor('');
    setQueryGenre('');
    setQueryIsbd('');
    setQueryTitle('');
    setQueryOrdering('ascending');
    setQueryYearFrom('');
    setQueryYearTo('');
    await queryBooks();
    return true;
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
                  .get('name')}, Year: ${book.get('year')}, ISBD: ${book
                  .get('isbd')
                  .get('name')}, Genre: ${book
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
            {/* Ascending and descending ordering by title */}
            <RadioButton.Group
              onValueChange={newValue => setQueryOrdering(newValue)}
              value={queryOrdering}>
              <List.Accordion title="Ordering">
                <RadioButton.Item
                  key={'ascending'}
                  label={'Title A-Z'}
                  value={'ascending'}
                />
                <RadioButton.Item
                  key={'descending'}
                  label={'Title Z-A'}
                  value={'descending'}
                />
              </List.Accordion>
            </RadioButton.Group>
            {/* Title text search */}
            <PaperTextInput
              value={queryTitle}
              onChangeText={text => setQueryTitle(text)}
              label="Book title"
              mode="outlined"
              autoCapitalize={'none'}
              style={Styles.form_input}
            />
            {/* Publishing year interval */}
            <List.Accordion title="Publishing Year">
              <PaperTextInput
                value={queryYearFrom}
                onChangeText={text => setQueryYearFrom(text)}
                label="Year from"
                mode="outlined"
                style={Styles.form_input}
              />
              <PaperTextInput
                value={queryYearTo}
                onChangeText={text => setQueryYearTo(text)}
                label="Year to"
                mode="outlined"
                style={Styles.form_input}
              />
            </List.Accordion>
            {/* Publisher filter */}
            {publishers !== null && (
              <RadioButton.Group
                onValueChange={newValue => setQueryPublisher(newValue)}
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
            {/* Genre filter */}
            {genres !== null && (
              <RadioButton.Group
                onValueChange={newValue => setQueryGenre(newValue)}
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
            {/* Authors filter */}
            {authors !== null && (
              <RadioButton.Group
                onValueChange={newValue => setQueryAuthor(newValue)}
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
            {/* ISBDs filter */}
            {isbds !== null && (
              <RadioButton.Group
                onValueChange={newValue => setQueryIsbd(newValue)}
                value={queryIsbd}>
                <List.Accordion title="ISBD">
                  {isbds.map((isbd: Parse.Object, index: number) => (
                    <RadioButton.Item
                      key={`${index}`}
                      label={isbd.get('name')}
                      value={isbd}
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
          <PaperButton
            onPress={() => clearQueryChoices()}
            mode="contained"
            icon="delete"
            color={'#208AEC'}
            style={Styles.create_button}>
            {'Clear Query'}
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
  form_input: {
    height: 44,
    marginBottom: 16,
    backgroundColor: '#FFF',
    fontSize: 14,
  },
});
