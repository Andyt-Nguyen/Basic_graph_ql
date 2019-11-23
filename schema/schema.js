const graphql = require('graphql');
const axios = require('axios');
const { 
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;



const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({ // Put in function to avoid circular reference error
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType), // expects many users
      async resolve(parentValue, args) {
        const res = await axios.get(`http://localhost:3000/companies/${parentValue.id}/users`);
        return res.data;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({ // Put in function to avoid circular reference error
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: { 
      type: CompanyType, // Grabs single data point
      async resolve(parentValue, args) {
        // console.log('Parent val', parentValue);
        // console.log('Args', args);
        const res = await axios.get(`http://localhost:3000/companies/${parentValue.companyId}`);
        return res.data;
      }
    }
  })
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
    },

    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        const res = await axios.get(`http://localhost:3000/companies/${args.id}`);
        return res.data;
      }
    }
  }
});


/**
 * Mutations
 */

 const mutation = new GraphQLObjectType({
   name: 'Mutation',
   fields: {
     addUser: {
       type: UserType,
       args: {
         firstName: { type: new GraphQLNonNull(GraphQLString) },
         age: { type: GraphQLInt },
         companyId: { type: GraphQLString }
       },
       async resolve(parentValue, { firstName, age }) {
        const res = await axios.post('http://localhost:3000/users', { firstName, age });
        return res.data;
       } 
     },

     deleteUser: {
       type: UserType,
       args: {
         id: { type: new GraphQLNonNull(GraphQLString) }
       },
       async resolve(parentValue, args) {
         const res = await axios.delete(`http://localhost:3000/users/${args.id}`);
         return res.data;
       }
     },

     editUser: {
       type: UserType,
       args: {
         id: { type: new GraphQLNonNull(GraphQLString) },
         firstName: { type: GraphQLString },
         age: { type: GraphQLInt },
         companyId: { type: GraphQLString }
       },
       async resolve(parentValue, args) {
         const res = await axios.patch(`http://localhost:3000/users/${args.id}`, args)

         return res.data;
       }
     }
   }
 })


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
})
