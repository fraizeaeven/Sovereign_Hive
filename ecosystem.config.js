module.exports = {
  apps: [
    {
      name: "Hive-Controller",
      script: "./src/hive_controller.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Hive-Worker",
      script: "./src/hive_worker.js",
      instances: 10, // Adjust based on GDX Spark CPU cores
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "Hive-Asset-Server",
      script: "./src/asset_server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        ASSET_SERVER_PORT: 3000
      }
    }
  ]
};
