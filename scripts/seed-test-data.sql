-- ═══════════════════════════════════════════════════
-- SEED TEST DATA — Pour tests exhaustifs admin
-- Utilise 3 users existants : client@freenzy.io, paid@freenzy.io, demo@freenzy.io
-- ═══════════════════════════════════════════════════

DO $$
DECLARE
  uid_client UUID;
  uid_paid UUID;
  uid_demo UUID;
BEGIN
  SELECT id INTO uid_client FROM users WHERE email = 'client@freenzy.io';
  SELECT id INTO uid_paid FROM users WHERE email = 'paid@freenzy.io';
  SELECT id INTO uid_demo FROM users WHERE email = 'demo@freenzy.io';

  -- ═══ CUSTOM AGENTS ═══
  INSERT INTO custom_agents (user_id, name, role, emoji, domain, tone, autonomy_level, is_active, system_prompt)
  VALUES
    (uid_client, 'Mon Assistant RH', 'Gestion des ressources humaines', E'\U0001F454', 'rh', 'professional', 75, true, 'Tu es un expert RH.'),
    (uid_client, 'Agent SEO', 'Optimisation referencement', E'\U0001F50D', 'marketing', 'casual', 60, true, 'Tu es un expert SEO.'),
    (uid_paid, 'Analyste Data', 'Analyse de donnees business', E'\U0001F4CA', 'data', 'professional', 85, true, 'Tu analyses les KPIs.'),
    (uid_paid, 'Coach Vente', 'Formation commerciale', E'\U0001F3AF', 'commercial', 'energetic', 70, false, 'Tu formes les commerciaux.'),
    (uid_demo, 'Bot Support', 'Support client automatise', E'\U0001F916', 'support', 'friendly', 50, true, 'Tu geres le support.')
  ON CONFLICT DO NOTHING;

  -- ═══ USER MODULES ═══
  INSERT INTO user_modules (user_id, name, slug, emoji, type, is_published, public_access, record_count, description)
  VALUES
    (uid_client, 'CRM Prospects', 'crm-prospects', E'\U0001F4CB', 'crm', true, false, 47, 'Suivi des prospects'),
    (uid_client, 'Formulaire Contact', 'form-contact', E'\U0001F4DD', 'form', true, true, 12, 'Formulaire de contact site web'),
    (uid_paid, 'Dashboard KPI', 'dashboard-kpi', E'\U0001F4CA', 'dashboard', true, false, 0, 'Tableau de bord KPIs'),
    (uid_paid, 'Agent Interne', 'agent-interne', E'\U0001F916', 'agent', false, false, 0, 'Agent personnalise interne'),
    (uid_demo, 'Suivi Taches', 'suivi-taches', E'\U00002705', 'form', true, true, 23, 'Suivi des taches quotidiennes')
  ON CONFLICT (user_id, slug) DO NOTHING;

  -- ═══ CAMPAIGNS ═══
  INSERT INTO campaigns (user_id, title, description, status, campaign_type, platforms, budget_credits, spent_credits)
  VALUES
    (uid_client, 'Lancement Produit Q1', 'Campagne lancement nouveau produit', 'active', 'social', ARRAY['linkedin','instagram'], 50000, 12000),
    (uid_client, 'Newsletter Mars', 'Newsletter mensuelle', 'completed', 'email', ARRAY['email'], 5000, 4800),
    (uid_paid, 'Promo Ete', 'Campagne promotionnelle ete', 'pending_approval', 'multi_channel', ARRAY['linkedin','facebook','email'], 100000, 0),
    (uid_paid, 'Recrutement Dev', 'Annonce recrutement developpeur', 'draft', 'social', ARRAY['linkedin'], 20000, 0),
    (uid_demo, 'Test WhatsApp', 'Test envoi WhatsApp', 'approved', 'whatsapp', ARRAY['whatsapp'], 10000, 3500)
  ON CONFLICT DO NOTHING;

  -- ═══ USER DOCUMENTS ═══
  INSERT INTO user_documents (user_id, filename, original_filename, file_type, mime_type, size_bytes, token_estimate, agent_context, content_text)
  VALUES
    (uid_client, 'doc1.pdf', 'Business Plan 2026.pdf', 'pdf', 'application/pdf', 2456789, 8500, 'general', 'Contenu du business plan...'),
    (uid_client, 'doc2.docx', 'Contrat Partenariat.docx', 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 345678, 2100, 'agent-customize', 'Contrat de partenariat entre...'),
    (uid_paid, 'doc3.csv', 'Export Clients.csv', 'csv', 'text/csv', 123456, 4200, 'personal', 'nom,email,date_inscription'),
    (uid_paid, 'doc4.xlsx', 'Budget Previsionnel.xlsx', 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 567890, 3800, 'general', 'Budget previsionnel 2026'),
    (uid_demo, 'doc5.md', 'Notes Reunion.md', 'md', 'text/markdown', 8900, 350, 'repondeur', 'Notes reunion - Point 1 - Point 2'),
    (uid_demo, 'doc6.txt', 'FAQ Produit.txt', 'txt', 'text/plain', 15600, 620, 'studio-video', 'FAQ complete du produit')
  ON CONFLICT DO NOTHING;

  -- ═══ PERSONAL AGENT CONFIGS ═══
  INSERT INTO personal_agent_configs (user_id, agent_id, is_active, settings) VALUES
    (uid_client, 'fz-budget', true, '{"currency":"EUR"}'),
    (uid_client, 'fz-comptable', true, '{"regime":"micro"}'),
    (uid_client, 'fz-chasseur', true, '{}'),
    (uid_paid, 'fz-budget', true, '{"currency":"EUR"}'),
    (uid_paid, 'fz-cv', true, '{}'),
    (uid_paid, 'fz-ecrivain', true, '{}'),
    (uid_demo, 'fz-budget', true, '{"currency":"EUR"}'),
    (uid_demo, 'fz-ceremonie', true, '{}')
  ON CONFLICT (user_id, agent_id) DO NOTHING;

  -- ═══ BUDGET TRANSACTIONS ═══
  INSERT INTO budget_transactions (user_id, amount_cents, type, category, description, date) VALUES
    (uid_client, 350000, 'income', 'salaire', 'Salaire mars', '2026-03-01'),
    (uid_client, -85000, 'expense', 'loyer', 'Loyer mars', '2026-03-05'),
    (uid_client, -4500, 'expense', 'transport', 'Navigo', '2026-03-01'),
    (uid_paid, 500000, 'income', 'freelance', 'Mission client ABC', '2026-03-02'),
    (uid_paid, -120000, 'expense', 'materiel', 'Nouveau laptop', '2026-03-03'),
    (uid_demo, 280000, 'income', 'salaire', 'Salaire mars', '2026-03-01'),
    (uid_demo, -65000, 'expense', 'alimentation', 'Courses mars', '2026-03-04')
  ON CONFLICT DO NOTHING;

  -- ═══ FREELANCE RECORDS ═══
  INSERT INTO freelance_records (user_id, type, amount_cents, tva_rate, description, client_name, category, payment_status) VALUES
    (uid_client, 'revenue', 1500000, 20.00, 'Developpement site web', 'Societe Alpha', 'services', 'paid'),
    (uid_client, 'expense', 45000, 20.00, 'Hebergement cloud', 'AWS', 'infra', 'paid'),
    (uid_paid, 'revenue', 2500000, 20.00, 'Consulting data', 'BigCorp', 'consulting', 'pending'),
    (uid_paid, 'revenue', 800000, 20.00, 'Formation IA', 'StartupXYZ', 'formation', 'paid')
  ON CONFLICT DO NOTHING;

  -- ═══ MISSION PIPELINE ═══
  INSERT INTO mission_pipeline (user_id, title, client_name, platform, status, tjm_cents) VALUES
    (uid_client, 'Dev React Senior', 'TechCorp', 'malt', 'interview', 65000),
    (uid_client, 'Lead Dev Node.js', 'FinTech SA', 'freelance.com', 'applied', 70000),
    (uid_client, 'CTO Interim', 'StartupAI', 'linkedin', 'negotiation', 90000),
    (uid_paid, 'Data Engineer', 'DataCorp', 'malt', 'won', 75000),
    (uid_paid, 'ML Engineer', 'AILab', 'welcometothejungle', 'discovered', 80000)
  ON CONFLICT DO NOTHING;

  -- ═══ CV PROFILES ═══
  INSERT INTO cv_profiles (user_id, full_name, title, summary, skills) VALUES
    (uid_client, 'Jean Dupont', 'Developpeur Full-Stack', 'Expert React/Node avec 8 ans experience', '["React","Node.js","TypeScript","PostgreSQL"]'),
    (uid_paid, 'Marie Martin', 'Data Scientist', 'Specialiste ML/IA avec 5 ans en startup', '["Python","TensorFlow","SQL","Spark"]')
  ON CONFLICT (user_id) DO NOTHING;

  -- ═══ EVENTS PLANNER ═══
  INSERT INTO events_planner (user_id, event_type, title, event_date, venue, budget_cents, guest_count, status) VALUES
    (uid_demo, 'mariage', 'Mariage Julie et Thomas', '2026-09-15', 'Chateau de Versailles', 5000000, 120, 'planning'),
    (uid_demo, 'anniversaire', 'Anniversaire 30 ans', '2026-06-20', 'Restaurant Le Meurice', 300000, 25, 'confirmed')
  ON CONFLICT DO NOTHING;

  -- ═══ WRITING PROJECTS ═══
  INSERT INTO writing_projects (user_id, title, genre, project_type, current_word_count, target_word_count, status) VALUES
    (uid_paid, 'IA qui revait', 'science-fiction', 'novel', 45000, 80000, 'drafting'),
    (uid_paid, 'Guide du Freelance', 'non-fiction', 'essay', 12000, 20000, 'revising')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed data inserted for users: %, %, %', uid_client, uid_paid, uid_demo;
END $$;
