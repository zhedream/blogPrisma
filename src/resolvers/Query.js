
const article = async (root, args, context, info) => {return await context.db.query.article({}, info)}
const articles = async (root, args, context, info) => {return await context.db.query.articles({}, info)}
const articlesConnection = async (root, args, context, info) => {return await context.db.query.articlesConnection({}, info);}


module.exports = {
  // article
  article,
  articles,
  articlesConnection
}
