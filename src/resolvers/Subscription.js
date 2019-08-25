 const article=  {
    subscribe: async (parent, args, context,info) =>  context.db.subscription.article({},info),
    resolve: playload =>  playload.article
  }
module.exports = {
  article,
}
