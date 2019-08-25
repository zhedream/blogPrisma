 const article=  {
    subscribe: async (parent, args, context) => {
      return context.db.$subscribe
        .article({
          mutation_in: ['CREATED', 'UPDATED'],
        }).node()
    },
    resolve: payload => {
      return payload
    },
  }
module.exports = {
  article,
}
