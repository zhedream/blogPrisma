module.exports = {
  apps: [
    {
      name: "blogPrisma",
      script: "node_modules/.bin/tsx",
      args: "src/index.ts",
      env_production: {
        NODE_ENV: "production",
        PORT: "7200"
      }
    }
  ]
};
