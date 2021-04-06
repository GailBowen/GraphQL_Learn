// 1. Require 'apollo-server'
const expressPlayground = require('graphql-playground-middleware-express').default
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const { GraphQLScalarType } = require('graphql')

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

      //return photos.filter(photo => photo.created > args.after);
      
      return photos;
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

const { readFileSync } = require('fs')

const typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

// 2. Call `express()` to create an Express application
var app = express()

const server = new ApolloServer({ typeDefs, resolvers })

// 3. Call `applyMiddleware()` to allow middleware mounted on the same path
server.applyMiddleware({ app })

// 4. Create a home route
app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

// 5. Listen on a specific port
app.listen({ port: 4000 }, () =>
  console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
)

app.get('/playground', expressPlayground({ endpoint: '/graphql' }))