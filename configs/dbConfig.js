const { Pool } = require("pg");
const dotenv = require("dotenv");
const envConfigs = require("./config.json");

const currEnvironment = process.env.NODE_ENV || "development";

if (currEnvironment === "test") {
  dotenv.config({ path: ".env.test", quiet: true });
} else {
  dotenv.config({ quiet: true });
}

let { [currEnvironment]: config } = envConfigs;

config = Object.entries(config).reduce((configValues, [key, envKey]) => {
  if (envKey in process.env) {
    configValues[key] = process.env[envKey];
  }
  return configValues;
}, {});

const { dbUrl, host, database, port, user, password } = config;
let connectionString =
  dbUrl || `postgresql://${user}:${password}@${host}:${port}/${database}`;

if (currEnvironment === "prod") {
  const sslParams = new URLSearchParams();
  sslParams.append("ssl", "true");
  sslParams.append("sslfactory", "org.postgresql.ssl.NonValidatingFactory");
  connectionString = `${connectionString}?${sslParams.toString()}`;
}

const poolConfig = { connectionString };
if (currEnvironment !== "prod") {
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);

module.exports = pool;
