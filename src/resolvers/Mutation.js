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
 //Tag
 const createTag = async (root, args, context, info) =>await context.db.mutation.createTag({ data: args.data }, info);
 const updateTag = async (root, args, context, info) =>await context.db.mutation.updateTag({ data: args.data, where: args.where }, info);
 const updateManyTags = async (root, args, context, info) =>await context.db.mutation.updateManyTags({ where: args.where }, info);
 const upsertTag = async (root, args, context, info) =>await context.db.mutation.upsertTag({ data: args.data, where: args.where }, info);
 const deleteTag = async (root, args, context, info) =>await context.db.mutation.deleteTag({ where: args.where, data: args.create, data: args.update }, info);
 const deleteManyTags = async (root, args, context, info) =>await context.db.mutation.deleteManyTags({ where: args.where }, info);


  //category
  const createCategory = async (root, args, context, info) =>await context.db.mutation.createCategory({ data: args.data }, info);
  const updateCategory = async (root, args, context, info) =>await context.db.mutation.updateCategory({ data: args.data, where: args.where }, info);
  const updateManyCategories = async (root, args, context, info) =>await context.db.mutation.updateManyCategories({ where: args.where }, info);
  const upsertCategory = async (root, args, context, info) =>await context.db.mutation.upsertCategory({ data: args.data, where: args.where }, info);
  const deleteCategory = async (root, args, context, info) =>await context.db.mutation.deleteCategory({ where: args.where, data: args.create, data: args.update }, info);
 const deleteManyCategories = async (root, args, context, info) =>await context.db.mutation.deleteManyCategories({ where: args.where }, info);

module.exports = {
  // Article
  createArticle,
  updateArticle,
  updateManyArticles,
  upsertArticle,
  deleteArticle,
  deleteManyArticles,
  // Tag
  createTag,
  updateTag,
  updateManyTags,
  upsertTag,
  deleteTag,
  deleteManyTags,
  //category
  createCategory,
  updateCategory,
  updateManyCategories,
  upsertCategory,
  deleteCategory,
  deleteManyCategories,

}
