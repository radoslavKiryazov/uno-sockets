let books = [
  { title: "In His Own Write", author: "John Lennon" },
  { title: "A Spaniard In The Works", author: "John Lennon" },
];

const resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    addBook: (_, { title, author }) => {
      const newBook = { title, author };
      books.push(newBook);
      return newBook;
    },
  },
};

export default resolvers;
