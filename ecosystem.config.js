module.exports = {
  /**
   * 用于 pm2
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name: 'blog',
      script: 'src/index.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production : {
        NODE_ENV: 'production',
        PRISMA_ENDPOINT:'http://127.0.0.1:4466/blog',
        APP_SECRET:'iow-blog',
        PRISMA_SECRET:'iow-blog',
        PORT:7200,
        DBHOST:'127.0.0.1',
        DBUSER:'root',
        DBPASSWORD:'lhz123',
        DBDATABASE:'blog@default'

      }
    }

  ]

};
