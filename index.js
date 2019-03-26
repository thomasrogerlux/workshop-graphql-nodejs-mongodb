const { ApolloServer, gql } = require("apollo-server");
const mongoose = require("mongoose");
const { lang, allLang, addLang, deleteLang } = require("./resolver");

const typeDefs = gql`
  type Lang {
    name: String
    ext: String
  }

  type Query {
    lang(name: String): Lang
    allLang: [Lang]
  }

  type Mutation {
    addLang(name: String, ext: String): Lang
    deleteLang(name: String): Lang
  }
`;

const resolvers = {
  Query: {
    lang: lang,
    allLang: allLang
  },
  Mutation: {
    addLang: addLang,
    deleteLang: deleteLang
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

mongoose.connect(
  "mongodb://node:password1@ds123346.mlab.com:23346/workshop-graphql-node",
  {
    useNewUrlParser: true
  }
);

mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoLab");
    server.listen().then(({ url }) => console.log(`Listening on ${url}`));
  })
  .on("error", error => console.log("Error connecting to MongoLab:", error));
