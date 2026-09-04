# BlogPrisma

Blog 的 GraphQL API，运行于 Node.js 20、GraphQL Yoga 5 和 Prisma ORM 7。

## 本地启动

```bash
cp .env.example .env
# 先修改 .env 中的密码
docker compose up -d db
npm ci
npm run prisma:generate
npm run prisma:validate
npm run dev
```

GraphQL endpoint：`http://127.0.0.1:7200/graphql`。

## 验证

```bash
npm run typecheck
npm ls brace-expansion --all
```

第二条命令应为空；本仓库不再包含 CVE-2026-69152 所影响的依赖。

## 现有 Prisma 1 数据库迁移

不要直接对生产库执行 `prisma migrate deploy`。Prisma 1 创建的表名、外键和隐式多对多连接表可能与新 schema 的默认命名不同。

1. 完整备份生产数据库，并恢复到隔离的演练实例。
2. 把 `DATABASE_URL` 指向演练实例，保存当前 `prisma/schema.prisma` 后运行 `npm run prisma:pull`。
3. 对比 introspection 结果，补齐 `@map`、`@@map`、关系名及连接表映射；确认行数、主外键和空值约束。
4. 在演练库运行 GraphQL 查询及写入回归测试。
5. 按 Prisma 的 production troubleshooting / baselining 流程建立基线；经审查后才允许生产执行 `npm run prisma:migrate`。

本次迁移移除了 Prisma 1 原生 subscriptions；当前前端未使用它。若以后需要订阅，应另行接入消息总线或数据库事件机制。

## 部署

`DATABASE_URL`、`DB_CONNECTION_LIMIT`、`PORT` 和 `NODE_ENV` 由部署环境注入。PM2 示例见 `ecosystem.config.cjs`；不要把 `.env` 或数据库密码提交到 Git。
