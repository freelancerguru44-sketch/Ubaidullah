-- MISAAL (example) -- apna REAL project data likho, phir MySQL Workbench / phpMyAdmin mein run karo.
-- Concept ya practice project ko status 'Concept' hi rakho, client work mat likho agar nahi tha.
USE portfolio_db;

INSERT INTO projects
 (slug, title, summary, category, status, tech, features, problem, solution, role, challenges, cover_image, sort_order)
VALUES
 ('my-first-project',
  'Project ka naam',
  'Ek line mein project kya karta hai.',
  'Point of Sale (POS) System',
  'Concept',
  JSON_ARRAY('React','Node.js','MySQL'),
  JSON_ARRAY('Feature 1','Feature 2','Feature 3'),
  'Masla kya tha.',
  'Aap ne kya hal banaya.',
  'Is project mein aap ka role.',
  'Kya mushkilat aayin aur kya seekha.',
  '/images/projects/my-first-project.webp',
  1);

-- Creative work ki misaal:
INSERT INTO creative_items (title, category, description, media_type, media_url, sort_order)
VALUES ('Poster ka naam', 'Graphic Design', 'Chhota context.', 'image', '/images/creative/poster-1.webp', 1);
