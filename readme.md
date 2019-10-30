# BlogPrisma

## 安装

### examples
https://github.com/prisma/prisma-examples/tree/master/node/graphql-subscriptions
### prisma 
https://www.prisma.io/docs/prisma-client/setup/generating-the-client-JAVASCRIPT-rsc1/
### apollo 
https://www.apollographql.com/docs/angular/basics/services/



prisma/graphql 服务

http://127.0.0.1:4466/management
http://127.0.0.1:4466/blog/_admin
http://127.0.0.1:4466/blog
http://127.0.0.1:7200/

```json token
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJibG9nQGRlZmF1bHQiLCJyb2xlcyI6WyJhZG1pbiJdfSwiaWF0IjoxNTY2NDY3MDI2LCJleHAiOjE1NjcwNzE4MjZ9.6R3KM3VA2P_WQoQdop30zSxJvwWZlDE8yl5pKxPK2-g"
}
```
# 目录结构

.
├── datamode
│   ├── datamodel.graphql // 数据库模型 迁移文件 *
│   ├── prisma.ts
│   └── prisma.yml // prisma 脚手架配置文件  *
├── docker-compose.yml // prisma 容器启动, 配置文件
├── ecosystem.config.js // pm2 启动配置文件
├── package.json
├── pm2-start.md // pm2 进程守护 启动命令
├── readme.md
├── src
│   ├── generated // prisma generate 根据 数据库模型 生成的
│   │   ├── prisma-client
│   │   └── prisma.graphql //  自动生成 , 
│   ├── index.js // 
│   ├── permissions // 权限
│   │   └── index.js
│   ├── resolvers // 解析器
│   │   ├── index.js
│   │   ├── Mutation.js // 修改相关的分类
│   │   ├── Query.js // 查询相关写这
│   │   └── Subscription.js // 订阅相关
│   ├── schema
│   │   └── schema.graphql // 手动配置 schema , 从prisma.graphql 复制
│   └── utils.js // 工具函数
└── yarn.lock

# prismagraphql 服务

1. prismagraphql 服务
准备 docker , docker-compose
docker-composer up -d  启动服务,  使用配置 docker-compose.yml
成功查看 http://127.0.0.1:4466

注意: host 不能填 127.0.0.1  , 这是docker 容器里面用的,  ifconfig 查看 ip

2. 解析服务

yarn install

cd datamode
prisma generate // 生成 prisma.graphql
prisma deploy // 部署数据库

yarn dev 调试

pm2 start ecosystem.config.js --env production // pm2 进程守护
