module.exports = {
  apps: [
    {
      name: "control-vehiculos",
      script: "C:\\xampp\\php\\php.exe",
      interpreter: "none",
      args: "-S 0.0.0.0:8015 C:\\Users\\JOSUE\\Desktop\\control-vehiculos\\pm2-router.php",
      cwd: "C:\\Users\\JOSUE\\Desktop\\control-vehiculos\\public",
      autorestart: true,
      max_restarts: 10,
    },
    {
      name: "control-vehiculos-schedule",
      script: "artisan",
      interpreter: "php",
      args: "schedule:run",
      cwd: "C:\\Users\\JOSUE\\Desktop\\control-vehiculos",
      autorestart: false,
      cron_restart: "* * * * *",
    },
  ],
};
