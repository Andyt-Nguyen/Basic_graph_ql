const graphql = require('graphql');
const axios = require('axios');
const { 
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: { 
      type: CompanyType,
      async resolve(parentValue, args) {
        // console.log('Parent val', parentValue);
        // console.log('Args', args);
        const res = await axios.get(`http://localhost:3000/companies/${parentValue.company}`);
        return res.data;
      }
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(`http://localhost:3000/users/${args.id}`);
        return res.data;
      }
    }
  }
});


module.exports = new GraphQLSchema({
  query: RootQuery
})
