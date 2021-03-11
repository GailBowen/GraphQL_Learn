// 1. Require 'apollo-server'
const { ApolloServer } = require('apollo-server')

const typeDefs = `


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
  }

  type Query {
		totalPhotos: Int!,
    allPhotos: [Photo!]!,
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

var photos = [
  {
    "id": "1",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake"
  },
  {
    "id": "2",
    "name": "Enjoying the sunshine",
    "category": "SELFIE",
    "githubUser": "sSchmidt"
  },
  {
    id: "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunbarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt"
  }
]

var tags = [
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" },
  { "photoID": "3", "userID": "gPlake" }
]

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
    allUsers: () => users
  },


  Mutation: {
    postPhoto(parent, args) {

        var newPhoto = {
          id: _id++,
          ...args.input
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
    taggedPhotos: parent => {
      filteredTags = tags.filter(t => t.userID == parent.githubLogin);
      
      myPhotos = [];
      
      for (index = 0; index < filteredTags.length; ++index) {
          myPhotos.push(photos.find(p => p.id == filteredTags[index].photoID));
      }

      return myPhotos;
    }
    
  }

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