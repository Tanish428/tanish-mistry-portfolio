// Official & authentic brand SVGs stored locally
import javaLogo from '../assets/brands/java.svg';
import pythonLogo from '../assets/brands/python.svg';
import cppLogo from '../assets/brands/cplusplus.svg';
import csharpLogo from '../assets/brands/csharp.svg';
import jsLogo from '../assets/brands/javascript.svg';
import tsLogo from '../assets/brands/typescript.svg';
import dartLogo from '../assets/brands/dart.svg';

import reactLogo from '../assets/brands/react.svg';
import html5Logo from '../assets/brands/html5.svg';
import css3Logo from '../assets/brands/css3.svg';
import bootstrapLogo from '../assets/brands/bootstrap.svg';

import nodeLogo from '../assets/brands/nodejs.svg';
import expressLogo from '../assets/brands/express.svg';
import djangoLogo from '../assets/brands/django.svg';
import dotnetLogo from '../assets/brands/dotnet.svg';
import aspnetLogo from '../assets/brands/aspnet.svg';
import restApiLogo from '../assets/brands/restapi.svg';

import mongoLogo from '../assets/brands/mongodb.svg';
import mysqlLogo from '../assets/brands/mysql.svg';
import postgresLogo from '../assets/brands/postgresql.svg';
import sqlServerLogo from '../assets/brands/sqlserver.svg';
import sqliteLogo from '../assets/brands/sqlite.svg';
import supabaseLogo from '../assets/brands/supabase.svg';
import databaseLogo from '../assets/brands/database.svg';

import flutterLogo from '../assets/brands/flutter.svg';
import mongooseLogo from '../assets/brands/mongoose.svg';
import hibernateLogo from '../assets/brands/hibernate.svg';
import efCoreLogo from '../assets/brands/entityframework.svg';
import signalrLogo from '../assets/brands/signalr.svg';
import yfinanceLogo from '../assets/brands/yfinance.svg';

import gitLogo from '../assets/brands/git.svg';
import githubLogo from '../assets/brands/github.svg';
import dockerLogo from '../assets/brands/docker.svg';
import postmanLogo from '../assets/brands/postman.svg';
import vscodeLogo from '../assets/brands/vscode.svg';

import linkedinLogo from '../assets/brands/linkedin.svg';
import emailLogo from '../assets/brands/email.svg';

// Normalization dictionary for instant brand resolution
export const BRAND_MAP = {
  // Programming Languages
  java: javaLogo,
  python: pythonLogo,
  cpp: cppLogo,
  cplusplus: cppLogo,
  'c++': cppLogo,
  csharp: csharpLogo,
  'c#': csharpLogo,
  cs: csharpLogo,
  javascript: jsLogo,
  js: jsLogo,
  'javascript (es6+)': jsLogo,
  es6: jsLogo,
  typescript: tsLogo,
  ts: tsLogo,
  dart: dartLogo,

  // Frontend
  react: reactLogo,
  'react.js': reactLogo,
  reactjs: reactLogo,
  html: html5Logo,
  html5: html5Logo,
  css: css3Logo,
  css3: css3Logo,
  bootstrap: bootstrapLogo,

  // Backend
  node: nodeLogo,
  nodejs: nodeLogo,
  'node.js': nodeLogo,
  express: expressLogo,
  expressjs: expressLogo,
  'express.js': expressLogo,
  django: djangoLogo,
  dotnet: dotnetLogo,
  '.net': dotnetLogo,
  aspnet: aspnetLogo,
  'asp.net': aspnetLogo,
  'asp.net core': aspnetLogo,
  'asp.net core mvc': aspnetLogo,
  dotnetcore: aspnetLogo,
  rest: restApiLogo,
  'rest api': restApiLogo,
  'rest apis': restApiLogo,
  api: restApiLogo,
  apis: restApiLogo,

  // Databases
  mongodb: mongoLogo,
  mongo: mongoLogo,
  mysql: mysqlLogo,
  postgresql: postgresLogo,
  postgres: postgresLogo,
  sqlite: sqliteLogo,
  sqlserver: sqlServerLogo,
  'sql server': sqlServerLogo,
  mssql: sqlServerLogo,
  supabase: supabaseLogo,
  database: databaseLogo,
  dbms: databaseLogo,
  sql: databaseLogo,

  // Frameworks & Libraries
  flutter: flutterLogo,
  mongoose: mongooseLogo,
  'mongoose odm': mongooseLogo,
  hibernate: hibernateLogo,
  entityframework: efCoreLogo,
  'entity framework': efCoreLogo,
  'entity framework core': efCoreLogo,
  'ef core': efCoreLogo,
  ef: efCoreLogo,
  signalr: signalrLogo,
  yfinance: yfinanceLogo,

  // Tools & Platforms
  git: gitLogo,
  github: githubLogo,
  docker: dockerLogo,
  postman: postmanLogo,
  vscode: vscodeLogo,
  'visual studio code': vscodeLogo,
  'vs code': vscodeLogo,

  // Social & Contacts
  linkedin: linkedinLogo,
  email: emailLogo,
  mail: emailLogo,
};

/**
 * Resolves the logo asset path based on multiple possible identifiers:
 * 1. iconName property
 * 2. slug property
 * 3. name property (normalized)
 */
export function getBrandLogoSrc(name = '', slug = '', iconName = '') {
  const normalize = (str) =>
    (str || '')
      .toLowerCase()
      .trim()
      .replace(/[\s_-]+/g, ' ');

  // Direct iconName lookup
  if (iconName) {
    const key = normalize(iconName);
    if (BRAND_MAP[key]) return BRAND_MAP[key];
    const stripped = key.replace(/[^a-z0-9]/g, '');
    if (BRAND_MAP[stripped]) return BRAND_MAP[stripped];
  }

  // Slug lookup
  if (slug) {
    const key = normalize(slug);
    if (BRAND_MAP[key]) return BRAND_MAP[key];
    const stripped = key.replace(/[^a-z0-9]/g, '');
    if (BRAND_MAP[stripped]) return BRAND_MAP[stripped];
  }

  // Name lookup
  if (name) {
    const rawKey = normalize(name);
    if (BRAND_MAP[rawKey]) return BRAND_MAP[rawKey];

    // Try without special characters
    const stripped = rawKey.replace(/[^a-z0-9]/g, '');
    if (BRAND_MAP[stripped]) return BRAND_MAP[stripped];

    // Check substring matches
    for (const [key, src] of Object.entries(BRAND_MAP)) {
      if (key.length >= 3 && rawKey.includes(key)) {
        return src;
      }
    }
  }

  return null;
}
