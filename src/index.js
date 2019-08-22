const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const  mysql = require("mysql");

const resolvers = require('./resolvers')
const permissions = require('./permissions')
const typeDefs = './src/schema/schema.graphql'

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  middlewares: [permissions],
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: './src/generated/prisma.graphql',
      endpoint: process.env.PRISMA_ENDPOINT,
      secret: process.env.PRISMA_SECRET,
      debug: true,
    }),
    mysql:mysql.createConnection({
      host: process.env.DBHOST || '127.0.0.1',  //主机地址
      user: process.env.DBUSER || 'root', //数据库用户名
      password: process.env.DBPASSWORD || 'lhz123', //数据库用户密码
      database: process.env.DBDATABASE || 'blog@default'  //数据库名
     }),
  }),
})
// 多套系统需要 改端口 服务器可通过 反向代理让外网连接
const port = process.env.PORT || 7200
const playground = process.env.PLAYGROUND || false

server.start(
  {
    port,
    // playground
  },
  () => console.log(`Server at http://localhost:${port}`),
)
