// article
const article = async (root, args, context, info) => {return await context.db.query.article({}, info)}
const articles = async (root, args, context, info) => {return await context.db.query.articles({}, info)}
const articlesConnection = async (root, args, context, info) => {return await context.db.query.articlesConnection({}, info);}
// tag
const tag = async (root, args, context, info) => {return await context.db.query.tag({}, info)}
const tags = async (root, args, context, info) => {return await context.db.query.tags({}, info)}
const tagsConnection = async (root, args, context, info) => {return await context.db.query.tagsConnection({}, info);}
// category
const category = async (root, args, context, info) => {return await context.db.query.category({}, info)}
const categories = async (root, args, context, info) => {return await context.db.query.categories({}, info)}
const categoriesConnection = async (root, args, context, info) => {return await context.db.query.categoriesConnection({}, info);}

module.exports = {
  // article
  article,
  articles,
  articlesConnection,
  // tag
  tag,
  tags,
  tagsConnection,
  // category
  category,
  categories,
  categoriesConnection,
}
