# Workshop API GraphQL avec NodeJS et MongoDB

## Installation de NodeJS

Rendez-vous sur le site https://nodejs.org/en/ pour télécharger et installer la dernière version de NodeJS (minimum version 8 pour ce workshop).

Vous pouvez également l’installer via votre gestionnaire de paquet favoris, cependant, dans ce cas, veuillez installer également le paquet `npm` ou `yarn`.

## Initialisation de notre projet

Dans votre terminal créez un nouveau dossier et initialisez le projet

```shell
$ mkdir api-graphql-node-mongo
$ cd api-graphql-node-mongo
$ npm init -y
```

## Installation des dépendences de notre projet

Nous allons utiliser plusieurs librairies :

- `apollo-server` : Notre serveur GraphQL
- `graphql` : Utilisé par notre serveur Apollo
- `mongoose` : Pour creer des documents MongoDB

Pour les installer :

```shell
$ npm install -save apollo-server graphql mongoose
```

## Setup du serveur GraphQL

Créez un fichier `index.js`

```js
const { ApolloServer, gql } = require("apollo-server");

const lang = {
  name: "Javascript",
  ext: "js"
};

const typeDefs = gql`
  type Lang {
    name: String
    ext: String
  }

  type Query {
    lang: Lang
  }
`;

const resolvers = {
  Query: {
    lang: lang
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log(`Listening on ${url}`));
```

Puis dans un terminal

```shell
$ node index.js
```

Vous pouvez maintenant vous rendre dans votre navigateur à l'adresse `http://localhost:4000/` où vous pourrez tester votre premiere requete GraphQL :

```gql
{
  lang {
    name
    ext
  }
}
```

Et ainsi recevoir l'user que nous avons defini precedement

## Setup de la base de donnée MongoDB

Rendez vous sur https://mlab.com/ et créez un compte gratuit pour heberger une base de donnée MongoDB

Une fois votre base de donnée crée, récuperez son URL et modifiez le fichier `index.js`

```js
// ...

const server = new ApolloServer({ typeDefs, resolvers });

mongoose.connect("__URL_MONGOLAB__", { useNewUrlParser: true });

mongoose.connection
  .once("open", () => {
    console.log("Connected to MongoLab");
    server.listen().then(({ url }) => console.log(`Listening on ${url}`));
  })
  .on("error", error => console.log("Error connecting to MongoLab:", error));
```

Dans l'interface de MongoLab vous devrez ensuite créer un utilisateur ainsi que la collection `lang`.

Ajouter ensuites quelques documents dans la collection `lang`:

```json
{
  "name": "Javascript",
  "ext": "js"
}
```

```json
{
  "name": "GraphQL",
  "ext": "gql"
}
```

## Creation du model Lang

Creez un fichier `Lang.js`

```js
const mongoose = require("mongoose");

const LangSchema = new mongoose.Schema(
  {
    name: { type: String },
    ext: { type: String }
  },
  { collection: "lang" }
);

module.exports = mongoose.model("Lang", LangSchema);
```

## Utilisation du model pour nos requetes

Creez un fichier `resolver.js`

```js
const Lang = require("./Lang");

async function lang(parent, args, context) {
  const res = await Lang.find({ name: args.name });

  if (res.length < 1) {
    return null;
  }

  return res[0];
}

async function allLang(parent, args, context) {
  return Lang.find();
}

module.exports = {
  lang,
  allLang
};
```

Puis modifiez le fichier `index.js`

```js
// ...

const { lang, allLang } = require("./resolver");

const typeDefs = gql`
  type Lang {
    name: String
    ext: String
  }

  type Query {
    lang(name: String): Lang
    allLang: [Lang]
  }
`;

const resolvers = {
  Query: {
    lang: lang,
    allLang: allLang
  }
};

// ...
```

## Mise en place des mutations add et delete

Dans le fichier `resolver.js` ajoutez les deux resolvers suivants :

```js
async function addLang(parent, args, context) {
  const newLang = new Lang({ name: args.name, ext: args.ext });

  const savedLang = await newLang.save();

  return savedLang;
}

async function deleteLang(parent, args, context) {
  const deletedLang = await Lang.findOneAndDelete({ name: args.name });

  return deletedLang;
}
```

N'oubliez pas d'export ces deux fonctions

Et dans `index.js` on va definir ces deux mutations dans le typedef

```js
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
```

N'oubliez pas d'importer les deux nouveaux resolvers
