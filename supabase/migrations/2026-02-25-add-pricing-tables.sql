-- ─────────────────────────────────────────────
-- Pricing tables
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pricing_programs (
  id          text        PRIMARY KEY,          -- e.g. 'ielts', 'pte'
  label       text        NOT NULL,
  tier        text        NOT NULL DEFAULT 'standard',
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_packages (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id    text        NOT NULL REFERENCES pricing_programs(id) ON DELETE CASCADE,
  section_name  text        NOT NULL DEFAULT 'Full Preparation & Skill-Focused Training',
  section_desc  text        NOT NULL DEFAULT '',
  hours         int         NOT NULL,
  price_private bigint      NOT NULL,   -- in IDR, e.g. 1200000
  price_semi    bigint      NOT NULL,
  popular       boolean     NOT NULL DEFAULT false,
  sort_order    int         NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_perks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  text        NOT NULL REFERENCES pricing_programs(id) ON DELETE CASCADE,
  perk_text   text        NOT NULL,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────

ALTER TABLE pricing_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_perks    ENABLE ROW LEVEL SECURITY;

-- Public can read all pricing
CREATE POLICY "pricing_programs_public_read"  ON pricing_programs FOR SELECT USING (true);
CREATE POLICY "pricing_packages_public_read"  ON pricing_packages FOR SELECT USING (true);
CREATE POLICY "pricing_perks_public_read"     ON pricing_perks    FOR SELECT USING (true);

-- Admin can do everything
CREATE POLICY "pricing_programs_admin_all"  ON pricing_programs FOR ALL USING (is_blog_admin());
CREATE POLICY "pricing_packages_admin_all"  ON pricing_packages FOR ALL USING (is_blog_admin());
CREATE POLICY "pricing_perks_admin_all"     ON pricing_perks    FOR ALL USING (is_blog_admin());

-- ─────────────────────────────────────────────
-- Seed data  (current hardcoded values)
-- ─────────────────────────────────────────────

INSERT INTO pricing_programs (id, label, tier, sort_order) VALUES
  ('ielts',      'IELTS',           'premium', 1),
  ('pte',        'PTE Academic',    'premium', 2),
  ('toefl-ibt',  'TOEFL iBT',       'premium', 3),
  ('toefl-itp',  'TOEFL ITP',       'standard',4),
  ('general',    'General English', 'standard',5),
  ('business',   'Business English','standard',6)
ON CONFLICT (id) DO NOTHING;

-- IELTS packages
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('ielts','Full Preparation & Skill-Focused Training','Covers all IELTS skills — Listening, Reading, Writing & Speaking.',  8, 1000000,  600000, false, 1),
  ('ielts','Full Preparation & Skill-Focused Training','Covers all IELTS skills — Listening, Reading, Writing & Speaking.', 16, 2000000, 1200000, true,  2),
  ('ielts','Full Preparation & Skill-Focused Training','Covers all IELTS skills — Listening, Reading, Writing & Speaking.', 24, 3000000, 1800000, false, 3);

-- PTE packages
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('pte','Full Preparation & Skill-Focused Training','Covers all PTE skills with computer-based exam techniques.',  8, 1200000,  720000, false, 1),
  ('pte','Full Preparation & Skill-Focused Training','Covers all PTE skills with computer-based exam techniques.', 16, 2400000, 1440000, true,  2),
  ('pte','Full Preparation & Skill-Focused Training','Covers all PTE skills with computer-based exam techniques.', 24, 3600000, 2160000, false, 3);

-- TOEFL iBT packages
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('toefl-ibt','Full Preparation & Skill-Focused Training','Covers all TOEFL iBT sections including integrated tasks.',  8, 1000000,  600000, false, 1),
  ('toefl-ibt','Full Preparation & Skill-Focused Training','Covers all TOEFL iBT sections including integrated tasks.', 16, 2000000, 1200000, true,  2),
  ('toefl-ibt','Full Preparation & Skill-Focused Training','Covers all TOEFL iBT sections including integrated tasks.', 24, 3000000, 1800000, false, 3);

-- TOEFL ITP packages
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('toefl-itp','Full Preparation & Skill-Focused Training','Paper-based test preparation covering Structure, Listening & Reading.',  8,  800000,  500000, false, 1),
  ('toefl-itp','Full Preparation & Skill-Focused Training','Paper-based test preparation covering Structure, Listening & Reading.', 16, 1600000, 1000000, true,  2),
  ('toefl-itp','Full Preparation & Skill-Focused Training','Paper-based test preparation covering Structure, Listening & Reading.', 24, 2400000, 1500000, false, 3);

-- General English packages (two sections)
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('general','A1–A2 (Beginner to Elementary)',          'Build your English foundation from the ground up.',                           8,  800000,  500000, false, 1),
  ('general','A1–A2 (Beginner to Elementary)',          'Build your English foundation from the ground up.',                          16, 1600000, 1000000, true,  2),
  ('general','A1–A2 (Beginner to Elementary)',          'Build your English foundation from the ground up.',                          24, 2400000, 1500000, false, 3),
  ('general','B1–B2 (Intermediate to Upper-Intermediate)','Strengthen fluency and accuracy for academic or professional use.',         8,  800000,  500000, false, 4),
  ('general','B1–B2 (Intermediate to Upper-Intermediate)','Strengthen fluency and accuracy for academic or professional use.',        16, 1600000, 1000000, true,  5),
  ('general','B1–B2 (Intermediate to Upper-Intermediate)','Strengthen fluency and accuracy for academic or professional use.',        24, 2400000, 1500000, false, 6);

-- Business English packages
INSERT INTO pricing_packages (program_id, section_name, section_desc, hours, price_private, price_semi, popular, sort_order) VALUES
  ('business','English for Specific Purposes','Business English, Tourism, Job Interviews, and other professional contexts.',  8,  800000,  500000, false, 1),
  ('business','English for Specific Purposes','Business English, Tourism, Job Interviews, and other professional contexts.', 16, 1600000, 1000000, true,  2),
  ('business','English for Specific Purposes','Business English, Tourism, Job Interviews, and other professional contexts.', 24, 2400000, 1500000, false, 3);

-- Perks
INSERT INTO pricing_perks (program_id, perk_text, sort_order) VALUES
  ('ielts','Full preparation materials', 1),
  ('ielts','Mock tests & band prediction', 2),
  ('ielts','Personalized study plan', 3),
  ('ielts','WhatsApp support', 4),
  ('ielts','Progress tracking', 5),
  ('ielts','Student portal access (portal.englishwitharik.com)', 6),
  ('ielts','Quizzes & games', 7),
  ('ielts','Flexible booking', 8),

  ('pte','AI-scored practice tests', 1),
  ('pte','PTE-specific strategies', 2),
  ('pte','Full skill coverage', 3),
  ('pte','WhatsApp support', 4),
  ('pte','Progress tracking', 5),
  ('pte','Student portal access (portal.englishwitharik.com)', 6),
  ('pte','Quizzes & games', 7),
  ('pte','Flexible booking', 8),

  ('toefl-ibt','Internet-based test strategies', 1),
  ('toefl-ibt','Integrated task practice', 2),
  ('toefl-ibt','Full skill coverage', 3),
  ('toefl-ibt','WhatsApp support', 4),
  ('toefl-ibt','Progress tracking', 5),
  ('toefl-ibt','Student portal access (portal.englishwitharik.com)', 6),
  ('toefl-ibt','Quizzes & games', 7),
  ('toefl-ibt','Flexible booking', 8),

  ('toefl-itp','Paper-based test strategies', 1),
  ('toefl-itp','Grammar & structure focus', 2),
  ('toefl-itp','Full skill coverage', 3),
  ('toefl-itp','WhatsApp support', 4),
  ('toefl-itp','Progress tracking', 5),
  ('toefl-itp','Student portal access (portal.englishwitharik.com)', 6),
  ('toefl-itp','Quizzes & games', 7),
  ('toefl-itp','Flexible booking', 8),

  ('general','A1–B2 levels available', 1),
  ('general','Daily communication skills', 2),
  ('general','Vocabulary & grammar', 3),
  ('general','WhatsApp support', 4),
  ('general','Completion certificate (optional)', 5),
  ('general','Student portal access (portal.englishwitharik.com)', 6),
  ('general','Quizzes & games', 7),
  ('general','Flexible booking', 8),

  ('business','Tourism, Business, Job Interview & more', 1),
  ('business','Professional communication skills', 2),
  ('business','Industry-specific vocabulary', 3),
  ('business','WhatsApp support', 4),
  ('business','Completion certificate (optional)', 5),
  ('business','Student portal access (portal.englishwitharik.com)', 6),
  ('business','Quizzes & games', 7),
  ('business','Flexible booking', 8);
