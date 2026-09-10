import { GraphQLScalarType, Kind } from "graphql";
import type { PrismaClient } from "./generated/prisma/client.js";

import { requireAdmin } from "./auth.js";

export type Context = { prisma: PrismaClient; isAdmin?: boolean };
type Args = Record<string, any>;

const articleRelations = { tags: true, type: true } as const;
const taxonomyRelations = {
  articles: {
    where: { isPublished: true },
    include: articleRelations
  }
} as const;

function takeFrom(args: Args) {
  if (typeof args.first === "number") return args.first;
  if (typeof args.last === "number") return -args.last;
  return undefined;
}

function articleData(data: Args, update = false): any {
  const { typeId, tagIds, ...scalars } = data;
  return {
    ...scalars,
    ...(typeId !== undefined
      ? { type: typeId ? { connect: { id: typeId } } : { disconnect: true } }
      : {}),
    ...(tagIds !== undefined
      ? { tags: { [update ? "set" : "connect"]: tagIds.map((id: string) => ({ id })) } }
      : {})
  };
}

function articleScalarData(data: Args) {
  const { typeId: _typeId, tagIds: _tagIds, ...scalars } = data;
  return scalars;
}

const DateTime = new GraphQLScalarType({
  name: "DateTime",
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    return new Date(value as string | number).toISOString();
  },
  parseValue(value) {
    return new Date(value as string | number);
  },
  parseLiteral(node) {
    return node.kind === Kind.STRING ? new Date(node.value) : null;
  }
});

function articleWhere(where: Args = {}, admin = false): any {
  const { title_contains, AND, OR, ...rest } = where;
  const filter = {
    ...rest,
    ...(title_contains !== undefined ? { title: { contains: title_contains } } : {}),
    ...(AND ? { AND: AND.map((item: Args) => articleWhere(item, true)) } : {}),
    ...(OR ? { OR: OR.map((item: Args) => articleWhere(item, true)) } : {})
  };
  return admin ? filter : { AND: [filter, { isPublished: true }] };
}

function safeArticleArgs(args: Args, context: Context): Args {
  return { ...args, where: articleWhere(args.where, context.isAdmin) };
}

const publicResolvers = {
  DateTime,
  Query: {
    adminSession: (_: unknown, __: Args, context: Context) => { requireAdmin(context); return true; },
    article: async (_: unknown, { where }: Args, context: Context) => {
      const article = await context.prisma.article.findUnique({ where, include: articleRelations });
      return article && (context.isAdmin || article.isPublished) ? article : null;
    },
    articles: (_: unknown, args: Args, context: Context) => {
      const safe = safeArticleArgs(args, context);
      return context.prisma.article.findMany({ where: safe.where, orderBy: safe.orderBy, skip: safe.skip, take: takeFrom(safe), include: articleRelations });
    },
    articlesConnection: async (_: unknown, args: Args, context: Context) => {
      const { prisma } = context;
      args = safeArticleArgs(args, context);
      const [count, nodes] = await prisma.$transaction([
        prisma.article.count({ where: args.where }),
        prisma.article.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: articleRelations })
      ]);
      return { aggregate: { count }, nodes };
    },
    tag: (_: unknown, { where }: Args, { prisma }: Context) => prisma.tag.findUnique({ where, include: taxonomyRelations }),
    tags: (_: unknown, args: Args, { prisma }: Context) => prisma.tag.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: taxonomyRelations }),
    tagsConnection: async (_: unknown, args: Args, { prisma }: Context) => {
      const [count, nodes] = await prisma.$transaction([
        prisma.tag.count({ where: args.where }),
        prisma.tag.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: taxonomyRelations })
      ]);
      return { aggregate: { count }, nodes };
    },
    category: (_: unknown, { where }: Args, { prisma }: Context) => prisma.category.findUnique({ where, include: taxonomyRelations }),
    categories: (_: unknown, args: Args, { prisma }: Context) => prisma.category.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: taxonomyRelations }),
    categoriesConnection: async (_: unknown, args: Args, { prisma }: Context) => {
      const [count, nodes] = await prisma.$transaction([
        prisma.category.count({ where: args.where }),
        prisma.category.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: taxonomyRelations })
      ]);
      return { aggregate: { count }, nodes };
    }
  },
  Mutation: {
    createArticle: (_: unknown, { data }: Args, { prisma }: Context) => prisma.article.create({ data: articleData(data), include: articleRelations }),
    updateArticle: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.article.update({ where, data: articleData(data, true), include: articleRelations }),
    updateManyArticles: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.article.updateMany({ where, data: articleScalarData(data) }),
    upsertArticle: (_: unknown, { create, update, where }: Args, { prisma }: Context) => prisma.article.upsert({ where, create: articleData(create), update: articleData(update, true), include: articleRelations }),
    deleteArticle: (_: unknown, { where }: Args, { prisma }: Context) => prisma.article.delete({ where, include: articleRelations }),
    deleteManyArticles: (_: unknown, { where }: Args, { prisma }: Context) => prisma.article.deleteMany({ where }),
    createTag: (_: unknown, { data }: Args, { prisma }: Context) => prisma.tag.create({ data }),
    updateTag: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.tag.update({ where, data }),
    updateManyTags: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.tag.updateMany({ where, data }),
    upsertTag: (_: unknown, { create, update, where }: Args, { prisma }: Context) => prisma.tag.upsert({ where, create, update }),
    deleteTag: (_: unknown, { where }: Args, { prisma }: Context) => prisma.tag.delete({ where }),
    deleteManyTags: (_: unknown, { where }: Args, { prisma }: Context) => prisma.tag.deleteMany({ where }),
    createCategory: (_: unknown, { data }: Args, { prisma }: Context) => prisma.category.create({ data }),
    updateCategory: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.category.update({ where, data }),
    updateManyCategories: (_: unknown, { data, where }: Args, { prisma }: Context) => prisma.category.updateMany({ where, data }),
    upsertCategory: (_: unknown, { create, update, where }: Args, { prisma }: Context) => prisma.category.upsert({ where, create, update }),
    deleteCategory: (_: unknown, { where }: Args, { prisma }: Context) => prisma.category.delete({ where }),
    deleteManyCategories: (_: unknown, { where }: Args, { prisma }: Context) => prisma.category.deleteMany({ where })
  }
};

// Central enforcement covers every mutation, including aliases and batched fields.
export const resolvers = {
  ...publicResolvers,
  Mutation: Object.fromEntries(Object.entries(publicResolvers.Mutation).map(([name, resolve]) => [
    name, (parent: unknown, args: Args, context: Context) => {
      requireAdmin(context);
      if (args.where && (name.includes("Articles"))) args = { ...args, where: articleWhere(args.where, true) };
      return resolve(parent, args, context);
    }
  ]))
};
