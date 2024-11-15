module.exports = {
  apps: [
    {
      name: "ckhelper",
      script: "index.js",
      watch: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],

  deploy: {
    production: {
      user: "ubuntu",
      host: "ec2-3-39-189-149.ap-northeast-2.compute.amazonaws.com",
      ref: "origin/main",
      repo: "git@github.com:Jeon-JongChan/ckhelper.git",
      path: "/home/ubuntu/build",
      "post-setup": "pnpm install",
      "pre-deploy-local": "",
      "post-deploy":
        "pnpm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
