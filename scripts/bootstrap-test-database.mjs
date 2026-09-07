import "dotenv/config";
import { readFile } from "node:fs/promises";
import mariadb from "mariadb";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const url = new URL(databaseUrl);
const database = decodeURIComponent(url.pathname.slice(1));
if (!database) throw new Error("DATABASE_URL must include a database name");

const requiredTables = [
  "Author",
  "Visitor",
  "Article",
  "Tag",
  "Category",
  "Comment",
  "Message",
  "Subject",
  "_ArticleToTag",
  "_ArticleToSubject"
];

const connection = await mariadb.createConnection({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database,
  ssl: true,
  multipleStatements: true,
  connectTimeout: 15_000
});

try {
  const tableRows = await connection.query(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
    [database]
  );
  const existingTables = new Set(tableRows.map(({ name }) => name));

  if (existingTables.size === 0) {
    const schemaSql = await readFile(new URL("../prisma/test-schema.sql", import.meta.url), "utf8");
    await connection.query(schemaSql);
  } else {
    const missingTables = requiredTables.filter((table) => !existingTables.has(table));
    if (missingTables.length > 0) {
      throw new Error(`Refusing to modify a partially initialized database; missing: ${missingTables.join(", ")}`);
    }
  }

  await connection.beginTransaction();
  await connection.query(
    "INSERT INTO `Category` (`id`, `name`, `createdAt`, `updatedAt`) VALUES (?, ?, NOW(3), NOW(3)) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3)",
    ["preview-category-technology", "技术"]
  );
  await connection.query(
    "INSERT INTO `Tag` (`id`, `name`, `createdAt`, `updatedAt`) VALUES (?, ?, NOW(3), NOW(3)) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3)",
    ["preview-tag-nuxt", "Nuxt"]
  );
  await connection.query(
    "INSERT INTO `Tag` (`id`, `name`, `createdAt`, `updatedAt`) VALUES (?, ?, NOW(3), NOW(3)) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = NOW(3)",
    ["preview-tag-prisma", "Prisma"]
  );

  const articles = [
    [
      "preview-article-welcome",
      "欢迎来到博客测试环境",
      "这篇文章用于验证 Nuxt、GraphQL、Prisma 与 TiDB 的完整数据链路。",
      "# 欢迎来到博客测试环境\n\n如果你能看到这篇文章，说明前后端与数据库已经成功联通。",
      "<h1>欢迎来到博客测试环境</h1><p>如果你能看到这篇文章，说明前后端与数据库已经成功联通。</p>"
    ],
    [
      "preview-article-nuxt",
      "Nuxt 4 测试文章",
      "验证服务端渲染、文章详情和分类页面。",
      "# Nuxt 4 测试文章\n\n这是临时测试数据，可以在测试完成后删除。",
      "<h1>Nuxt 4 测试文章</h1><p>这是临时测试数据，可以在测试完成后删除。</p>"
    ]
  ];

  for (const [id, title, description, markdown, html] of articles) {
    await connection.query(
      "INSERT INTO `Article` (`id`, `title`, `desc`, `md`, `html`, `catalogue`, `clickCount`, `readCount`, `commentCount`, `isPublished`, `typeId`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, TRUE, ?, NOW(3), NOW(3)) ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `desc` = VALUES(`desc`), `md` = VALUES(`md`), `html` = VALUES(`html`), `isPublished` = TRUE, `typeId` = VALUES(`typeId`), `updatedAt` = NOW(3)",
      [id, title, description, markdown, html, "", "preview-category-technology"]
    );
  }

  await connection.query(
    "INSERT IGNORE INTO `_ArticleToTag` (`A`, `B`) VALUES (?, ?), (?, ?), (?, ?)",
    [
      "preview-article-welcome", "preview-tag-nuxt",
      "preview-article-welcome", "preview-tag-prisma",
      "preview-article-nuxt", "preview-tag-nuxt"
    ]
  );
  await connection.commit();

  const [{ articleCount }] = await connection.query("SELECT COUNT(*) AS articleCount FROM `Article`");
  console.log(JSON.stringify({ database, initialized: true, articleCount: Number(articleCount) }));
} catch (error) {
  await connection.rollback().catch(() => undefined);
  throw error;
} finally {
  await connection.end();
}
