module.exports = {
  apps: [
    {
      name: "blogPrisma",
      cwd: __dirname,
      script: "dist/index.js",
      interpreter: "/usr/local/lib/nodejs/node-v22.21.0-linux-x64-glibc-217/bin/node",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "300M",
      env_production: {
        NODE_ENV: "production",
        PORT: "7200"
      }
    }
  ]
};
