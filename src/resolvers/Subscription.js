 article=  {
    subscribe: async (parent, args, context) => {
      return context.db.$subscribe
        .article({
          mutation_in: ['CREATED', 'UPDATED'],
        })
        .node()
    },
    resolve: ArticleSubscriptionPayload => {
      return ArticleSubscriptionPayload
    },
  }
module.exports = {
  article,
}
