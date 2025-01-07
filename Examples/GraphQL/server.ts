import { ApolloServer } from "@apollo/server";
import typeDefs from "./schema/typeDefs";
import resolvers from "./schema/resolvers";

const server = new ApolloServer({ typeDefs, resolvers });

// start server with express or something
// server.listen().then(({ url }) => {
//   console.log(`GraphQL server running at ${url}`);   
// });
