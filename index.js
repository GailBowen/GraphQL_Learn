// 1. Require 'apollo-server'
const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

const typeDefs = `
  scalar SpecialDate

  type Tag {
    photoID: ID!
    userID: ID!
  },

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    taggedPhotos:[Photo]
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

	type Photo {
        id: ID!
        url: String
        name: String!
        description: String
        category: PhotoCategory!
        githubUser: String!
        postedBy: User!
        taggedUsers:[User]
        created: SpecialDate!
  }

  type Query {
		totalPhotos: Int!,
    allPhotos(after: SpecialDate): [Photo!]!,
    allUsers: [User!]!
	}

  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
    githubUser: String!
  }

  type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
  }
`
var _id = 4;

var users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
  { "githubLogin": "gPlake", "name": "Glen Plake" },
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt" },
  { "githubLogin": "gFoad", "name": "Gail Foad" }
]

var photos = [];


var tags = [
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" },
  { "photoID": "3", "userID": "gPlake" },
  { "photoID": "1", "userID": "mHattrup" },
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: (parent, args) => {
      args.after; // JavaScript Date Object
      console.log(args.after);
      console.log(photos);
      
      
      return photos.filter(photo => photo.created > args.after);
    },
    allUsers: () => users
  },


  Mutation: {
    postPhoto(parent, args) {

        var newPhoto = {
          id: _id++,
          ...args.input,
          created: new Date()
        } 
        
        photos.push(newPhoto);

        return newPhoto;
    }
  },

  Photo: {
    url: parent => `www.beautifulsite.com/img/${parent.name}.jpg`,
    postedBy: parent => {return users.find(u => u.githubLogin == parent.githubUser)},
    taggedUsers: parent => 
     tags
      .filter(tag => tag.photoID === parent.id)
      .map(tag => tag.userID)
      .map(tagnum => users.find(u => u.githubLogin === tagnum))
  },

  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser == parent.githubLogin);
    },
    taggedPhotos: parent => 
        tags
          .filter(tag => tag.userID === parent.githubLogin)
          .map(tag => tag.photoID)
          .map(photoID => photos.find(photo => photo.id === photoID))
  },

  SpecialDate: new GraphQLScalarType({
    name: 'SpecialDate',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })

}

// Create a new instance of the server.
// Send it an object with typeDefs (the schema) and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers
})


// Call listen on the server to launch the web server
server
  .listen()
  .then(({url}) => console.log(`GraphQL Service running on ${url}`))