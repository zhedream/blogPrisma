import { GraphQLScalarType, Kind } from "graphql";
import type { PrismaClient } from "./generated/prisma/client.js";

type Context = { prisma: PrismaClient };
type Args = Record<string, any>;

const articleRelations = { tags: true, type: true } as const;
const taxonomyRelations = {
  articles: { include: articleRelations }
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

export const resolvers = {
  DateTime,
  Query: {
    article: (_: unknown, { where }: Args, { prisma }: Context) => prisma.article.findUnique({ where, include: articleRelations }),
    articles: (_: unknown, args: Args, { prisma }: Context) => prisma.article.findMany({ where: args.where, orderBy: args.orderBy, skip: args.skip, take: takeFrom(args), include: articleRelations }),
    articlesConnection: async (_: unknown, args: Args, { prisma }: Context) => {
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
