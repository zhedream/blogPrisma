const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
  getUserId,
  USER,
  findRoleIdByName,
  createUserRole,
  findUserIdByEmail,
  userRoleExists,
} = require('../utils')

 //Article
const createArticle = async (root, args, context, info) =>await context.db.mutation.createArticle({ data: args.data }, info);
const updateArticle = async (root, args, context, info) =>await context.db.mutation.updateArticle({ data: args.data, where: args.where }, info);
const updateManyArticles = async (root, args, context, info) =>await context.db.mutation.updateManyArticles({ where: args.where }, info);
const upsertArticle = async (root, args, context, info) =>await context.db.mutation.upsertArticle({ data: args.data, where: args.where }, info);
const deleteArticle = async (root, args, context, info) =>await context.db.mutation.deleteArticle({ where: args.where, data: args.create, data: args.update }, info);
const deleteManyArticles = async (root, args, context, info) =>await context.db.mutation.deleteManyArticles({ where: args.where }, info);

module.exports = {
  // Article
  createArticle,
  updateArticle,
  updateManyArticles,
  upsertArticle,
  deleteArticle,
  deleteManyArticles,
}
