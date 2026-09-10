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
npm run prisma:push
npm run dev
```

GraphQL endpoint：`http://127.0.0.1:7200/graphql`。

`prisma:push` 只用于上面的全新本地空数据库。不要对已有数据或生产数据库执行该命令。

## 验证

```bash
npm test
npm run typecheck
npm run security:check
```

安全检查会拒绝 CVE-2026-69152 所影响的 `brace-expansion` 版本，以及锁文件中的非官方 npm 镜像地址。

## 现有 Prisma 1 数据库迁移

不要直接对生产库执行 `prisma db push` 或 `prisma migrate deploy`。Prisma 1 创建的表名、外键和隐式多对多连接表可能与新 schema 的默认命名不同。

1. 完整备份生产数据库，并恢复到隔离的演练实例。
2. 把 `DATABASE_URL` 指向演练实例，保存当前 `prisma/schema.prisma` 后运行 `npm run prisma:pull`。
3. 对比 introspection 结果，补齐 `@map`、`@@map`、关系名及连接表映射；确认行数、主外键和空值约束。
4. 在演练库运行 GraphQL 查询及写入回归测试。
5. 按 Prisma 的 production troubleshooting / baselining 流程建立基线；经审查后才允许生产执行 `npm run prisma:migrate`。

本次迁移移除了 Prisma 1 原生 subscriptions；当前前端未使用它。若以后需要订阅，应另行接入消息总线或数据库事件机制。

## 部署

`DATABASE_URL`、`DB_CONNECTION_LIMIT`、`PORT` 和 `NODE_ENV` 由部署环境注入。PM2 示例见 `ecosystem.config.cjs`；不要把 `.env` 或数据库密码提交到 Git。

Vercel 会在安装依赖后自动生成 Prisma Client。Function 入口分别为 `GET /api/health` 和 `/api/graphql`；本地服务仍使用 `/health` 和 `/graphql`。探活不访问数据库，GraphQL 请求仍必须配置真实 `DATABASE_URL`。Serverless 环境建议把 `DB_CONNECTION_LIMIT` 设为 `3` 或更低。

## Blog Admin v2 配套鉴权

设置服务端 `ADMIN_API_TOKEN`（至少 32 字符的随机密钥，例如 `openssl rand -hex 32`），在后台登录页面输入相同密钥。不要提交密钥，也不要放进 `VITE_*` 环境变量。未配置时所有写操作关闭；前台公开文章读取不受影响。

后台请求通过 `Authorization: Bearer …` 验证；`adminSession` 用于登录验证，不访问数据库。所有 Mutation 必须鉴权。匿名文章查询（包括按 ID、连接计数、嵌套分类/标签）只返回公开文章。管理密钥轮换会立即使旧密钥失效；这是单管理员方案，没有用户注册、角色分配或服务端会话。建议只通过 HTTPS 使用，并在部署平台设置请求限流。

文章筛选新增 `title_contains`，原有 `title` 精确匹配保持兼容。后台保存使用 `typeId` 和 `tagIds`，清空分类传 `typeId: null`，清空标签传 `tagIds: []`。本次不修改数据库结构。
