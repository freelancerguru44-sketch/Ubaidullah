-- MySQL schema: portfolio_db
CREATE DATABASE IF NOT EXISTS portfolio_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio_db;

CREATE TABLE IF NOT EXISTS projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  title         VARCHAR(200) NOT NULL,
  summary       VARCHAR(300) NOT NULL,
  category      VARCHAR(80)  NOT NULL,
  status        ENUM('Live','In Development','Concept') NOT NULL DEFAULT 'Concept',
  tech          JSON NULL,
  features      JSON NULL,
  problem       TEXT NULL,
  solution      TEXT NULL,
  role          TEXT NULL,
  challenges    TEXT NULL,
  cover_image   VARCHAR(255) NULL,
  live_url      VARCHAR(255) NULL,
  github_url    VARCHAR(255) NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_published  TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS creative_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  category      VARCHAR(80)  NOT NULL,
  description   VARCHAR(300) NULL,
  media_type    ENUM('image','video') NOT NULL DEFAULT 'image',
  media_url     VARCHAR(255) NOT NULL,
  thumb_url     VARCHAR(255) NULL,
  sort_order    INT NOT NULL DEFAULT 0,
  is_published  TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(160) NOT NULL,
  project_type  VARCHAR(80)  NULL,
  budget        VARCHAR(80)  NULL,
  timeline      VARCHAR(80)  NULL,
  details       TEXT NOT NULL,
  is_read       TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  id            TINYINT PRIMARY KEY,
  profile       JSON NOT NULL,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
