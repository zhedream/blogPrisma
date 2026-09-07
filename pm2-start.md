# PM2 启动

先注入 `DATABASE_URL` 等环境变量并安装依赖、生成 Prisma Client：

```bash
npm ci
npm run prisma:generate
pm2 start ecosystem.config.cjs --env production
```

