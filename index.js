const fetch = require("node-fetch");
const { ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
type Character {
      name: String
      height: String
      mass: String
      hair_color: String
      skin_color: String
      eye_color: String
      birth_year: String
      gender: String
      homeworld: String
      films: [String]
      created: String
      edited: String
      url: String
  }

  type Film {
    title: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    characters: [Character]
    film(ids: [String]): [Film]
  }
`;



  // Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      characters: () => fetchAllCharacters(),
      film: async (parent,args) => {
        const {ids} = args
        let resultado = await fetchAllFilms(ids);
        return resultado;
      }
    },
  };

  const fetchAllFilms = async (ids)=> {
    const promises = ids.map( async row => {
      return await fetchFilm(row);
    })
    
    return Promise.all(promises);
  }


const fetchFilm = (id) => {
  return fetch(`https://swapi.dev/api/films/${id}/`)
  .then(res => res.json())
}

  //I made this because I haven't found any way to fetch all data in one call from the API.
const fetchAllCharacters = async () => {
  const pages = [1,2,3,4,5,6,7,8,9];
  const promises = pages.map( async row => {
    return await fetchCharacters(`https://swapi.dev/api/people/?page=${row}`);
  })
  return Promise.all(promises).then(res => {
    let array_result = [];
    res.map(row => {
      row.map(row2 => {
        array_result.push(row2)
      })
    });
    
    return array_result;
  });
}

const fetchCharacters = (url) => {
    return fetch(url)
    .then(res => res.json())
    .then(res => res.results)
}


  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});