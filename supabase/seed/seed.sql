-- ============================================================
-- REFINED BEAUTY HUB — Seed Data
-- Run AFTER all migrations
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Hair',        'hair',     'Cuts, colour, treatments and styling',         'scissors',       1),
  ('Skin',        'skin',     'Facials, peels and advanced skin care',        'sparkles',       2),
  ('Nails',       'nails',    'Manicures, pedicures, gel extensions',         'gem',            3),
  ('Makeup',      'makeup',   'Everyday, editorial and bridal makeup',        'palette',        4),
  ('Lashes',      'lashes',   'Classic, hybrid and volume lash extensions',   'eye',            5),
  ('Brows',       'brows',    'Threading, lamination, microblading',          'feather',        6),
  ('Body',        'body',     'Body treatments, waxing, massage',             'heart',          7),
  ('Bridal',      'bridal',   'Complete bridal beauty packages',              'crown',          8)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SERVICES
-- ============================================================

WITH cat AS (SELECT id, slug FROM categories)
INSERT INTO services
  (category_id, name, slug, short_description, description, duration_minutes, price, price_max, is_featured, is_popular, display_order)
VALUES
  -- HAIR
  ((SELECT id FROM cat WHERE slug='hair'), 'Signature Haircut & Style', 'haircut-style',
   'Precision cut and blowout tailored to your face shape.',
   'Includes consultation, shampoo, precision cut, and professional blowout styled to perfection.',
   60, 1800, NULL, TRUE, TRUE, 1),

  ((SELECT id FROM cat WHERE slug='hair'), 'Balayage & Colour', 'balayage-colour',
   'Hand-painted sun-kissed highlights with toning.',
   'Full balayage technique with toning gloss and blowout. Low-maintenance, high-impact colour.',
   180, 8500, 12000, TRUE, TRUE, 2),

  ((SELECT id FROM cat WHERE slug='hair'), 'Keratin Smoothing Treatment', 'keratin-treatment',
   'Frizz-free, silky smooth hair for up to 4 months.',
   'Professional keratin treatment that eliminates frizz and adds intense shine. Lasts 3–4 months.',
   150, 7000, 10000, FALSE, FALSE, 3),

  -- SKIN
  ((SELECT id FROM cat WHERE slug='skin'), 'Luxury Glow Facial', 'luxury-glow-facial',
   'Deep cleanse, exfoliation, and hydration for radiant skin.',
   'Our signature facial includes cleanse, steam, extractions, enzyme exfoliation, facial massage, and a hydrating mask.',
   75, 3500, NULL, TRUE, TRUE, 1),

  ((SELECT id FROM cat WHERE slug='skin'), 'Chemical Peel', 'chemical-peel',
   'Advanced exfoliation for texture, pigmentation, and glow.',
   'Customised peel targeting uneven skin tone, acne scars, and texture. Includes post-peel care protocol.',
   60, 4500, 6000, FALSE, FALSE, 2),

  -- NAILS
  ((SELECT id FROM cat WHERE slug='nails'), 'Gel Manicure', 'gel-manicure',
   'Long-lasting gel polish with cuticle care.',
   'Includes soak, cuticle care, nail shaping, gel application, and top coat. Lasts 2–3 weeks.',
   45, 1500, NULL, FALSE, TRUE, 1),

  ((SELECT id FROM cat WHERE slug='nails'), 'Gel Nail Extensions', 'gel-extensions',
   'Full set of hard gel extensions with your choice of finish.',
   'Builder gel extensions shaped to your preference — natural, almond, coffin or stiletto. Includes gel polish.',
   90, 3000, 4000, TRUE, TRUE, 2),

  ((SELECT id FROM cat WHERE slug='nails'), 'Nail Art (per nail)', 'nail-art',
   'Custom hand-painted nail art designs.',
   'Intricate designs including florals, gradients, chrome, gems, and seasonal themes. Price per nail.',
   30, 200, 500, FALSE, FALSE, 3),

  -- MAKEUP
  ((SELECT id FROM cat WHERE slug='makeup'), 'Everyday Glam Makeup', 'everyday-glam',
   'Natural to medium coverage everyday makeup application.',
   'Perfect for events, dinners, or photoshoots. Includes foundation, contouring, eye makeup, and lips.',
   60, 2500, NULL, FALSE, TRUE, 1),

  ((SELECT id FROM cat WHERE slug='makeup'), 'Bridal Makeup', 'bridal-makeup',
   'Full glam bridal makeup with HD finish and setting.',
   'Complete bridal makeup with airbrush or HD foundation, detailed eye work, lashes, and long-lasting setting.',
   120, 8000, 12000, TRUE, TRUE, 2),

  -- BRIDAL PACKAGE
  ((SELECT id FROM cat WHERE slug='bridal'), 'Complete Bridal Package', 'complete-bridal-package',
   'Full bridal makeover — hair, makeup, skin prep, and nails.',
   'Our signature bridal experience: trial session, day-of hair styling, bridal makeup, nail art, and eyelash application. A truly unforgettable transformation.',
   300, 25000, 35000, TRUE, FALSE, 1)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STAFF
-- ============================================================

INSERT INTO staff (name, slug, role, bio, experience_years, specialties, is_featured, is_active, display_order)
VALUES
  ('Sunita Shrestha', 'sunita-shrestha',
   'Senior Hair Artist & Colourist',
   'With 10 years in the industry, Sunita is our master colourist specialising in balayage, highlights, and creative colour transformations.',
   10, ARRAY['Balayage','Colouring','Keratin Treatments','Bridal Hair'],
   TRUE, TRUE, 1),

  ('Priti Maharjan', 'priti-maharjan',
   'Lead Makeup Artist',
   'Priti is a certified makeup artist trained in Mumbai and Kathmandu, known for her flawless bridal and editorial work.',
   8, ARRAY['Bridal Makeup','Airbrush','HD Makeup','Skincare'],
   TRUE, TRUE, 2),

  ('Anisha Tamang', 'anisha-tamang',
   'Nail Technician & Nail Art Specialist',
   'Anisha brings creativity and precision to every set. Known for intricate nail art, she holds a certification in advanced nail techniques.',
   5, ARRAY['Gel Extensions','Nail Art','Manicures','Pedicures'],
   TRUE, TRUE, 3),

  ('Rekha Rana', 'rekha-rana',
   'Skin & Facial Therapist',
   'Rekha is our resident skincare expert, certified in advanced facial treatments and chemical peels. Passionate about results-driven skin transformations.',
   7, ARRAY['Facials','Chemical Peels','Skin Analysis','Anti-Ageing'],
   FALSE, TRUE, 4)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- AVAILABILITY (Mon–Fri 10am–7pm, Sat 9am–8pm, Sun 10am–6pm)
-- ============================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM staff LOOP
    -- Sunday
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'sunday', '10:00', '18:00') ON CONFLICT DO NOTHING;
    -- Weekdays
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'monday', '10:00', '19:00') ON CONFLICT DO NOTHING;
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'tuesday', '10:00', '19:00') ON CONFLICT DO NOTHING;
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'wednesday', '10:00', '19:00') ON CONFLICT DO NOTHING;
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'thursday', '10:00', '19:00') ON CONFLICT DO NOTHING;
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'friday', '10:00', '20:00') ON CONFLICT DO NOTHING;
    INSERT INTO availability_slots (staff_id, day, start_time, end_time)
    VALUES (r.id, 'saturday', '09:00', '20:00') ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- ============================================================
-- ACADEMY COURSES
-- ============================================================

INSERT INTO academy_courses
  (title, slug, category, level, format, short_description, description, duration_text, price, max_students, has_certificate, is_featured, next_start_date, syllabus, includes, display_order)
VALUES
  ('Professional Makeup Artistry',
   'professional-makeup-artistry',
   'makeup', 'beginner', 'in_person',
   'Master every makeup technique from natural looks to high-fashion editorial.',
   'A comprehensive 3-month course covering all aspects of professional makeup artistry. From skincare prep to bridal, editorial, and special effects makeup.',
   '3 Months', 45000, 12, TRUE, TRUE, '2025-08-01',
   '[
     {"module":1,"title":"Foundation of Beauty","topics":["Skin types","Face mapping","Colour theory","Tool hygiene"],"duration":"2 weeks"},
     {"module":2,"title":"Natural & Everyday Looks","topics":["Foundation matching","Contouring","Eye basics","Lip work"],"duration":"3 weeks"},
     {"module":3,"title":"Bridal & Special Occasion","topics":["HD techniques","Airbrush","Bridal hair","Client management"],"duration":"3 weeks"},
     {"module":4,"title":"Editorial & Portfolio","topics":["High fashion","Avant-garde","Portfolio shoot","Business basics"],"duration":"4 weeks"}
   ]'::JSONB,
   ARRAY['Kit worth NPR 15,000','Certificate of Completion','Portfolio photoshoot','Lifetime alumni network'],
   1),

  ('Hair Styling & Colouring',
   'hair-styling-colouring',
   'hair', 'beginner', 'in_person',
   'Complete hair artistry — cuts, global colour, balayage, and advanced styling.',
   'A 4-month intensive covering hair science, cutting techniques, global colour, balayage, toning, and business skills for professional stylists.',
   '4 Months', 60000, 10, TRUE, TRUE, '2025-09-01',
   '[
     {"module":1,"title":"Hair Science","topics":["Hair structure","Porosity","Products knowledge","Scalp health"],"duration":"2 weeks"},
     {"module":2,"title":"Cutting Techniques","topics":["Classic cuts","Layering","Texturising","Men''s grooming"],"duration":"4 weeks"},
     {"module":3,"title":"Colour Fundamentals","topics":["Colour wheel","Global colour","Root application","Toning"],"duration":"4 weeks"},
     {"module":4,"title":"Advanced Techniques","topics":["Balayage","Highlights","Keratin","Business setup"],"duration":"6 weeks"}
   ]'::JSONB,
   ARRAY['Professional tool kit','Colour products supplied','Certificate of Completion','Salon placement assistance'],
   2),

  ('Nail Technician Certification',
   'nail-technician-certification',
   'nails', 'beginner', 'in_person',
   'From basic manicures to advanced gel extensions and nail art.',
   'A 6-week intensive certification course covering all aspects of nail care, gel application, extensions, and creative nail art.',
   '6 Weeks', 20000, 8, TRUE, FALSE, '2025-07-15',
   '[
     {"module":1,"title":"Nail Fundamentals","topics":["Nail anatomy","Hygiene","Tools","Basic manicure & pedicure"],"duration":"1 week"},
     {"module":2,"title":"Gel Systems","topics":["Gel polish","Hard gel","Builder gel","Removal"],"duration":"2 weeks"},
     {"module":3,"title":"Extensions & Nail Art","topics":["Full set","Nail art techniques","Chrome & ombre","Client care"],"duration":"3 weeks"}
   ]'::JSONB,
   ARRAY['Starter nail kit','Practice hands','Certificate of Completion','Business mentorship session'],
   3)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TESTIMONIALS
-- ============================================================

INSERT INTO testimonials
  (client_name, rating, review, service_label, is_verified, is_featured, is_published)
VALUES
  ('Priya Sharma',   5, 'My bridal look was absolutely breathtaking. The team understood my vision perfectly and I felt like royalty on my wedding day. Cannot recommend enough!', 'Bridal Makeup & Hair', TRUE, TRUE, TRUE),
  ('Anita Maharjan', 5, 'I have been coming here for my balayage for over a year. The results are consistently stunning — natural, low-maintenance, and worth every rupee.', 'Balayage & Colour', TRUE, TRUE, TRUE),
  ('Sujata Thapa',   5, 'The facial treatment here is next-level luxury. My skin has never looked better. The ambiance is so serene, I feel relaxed the moment I walk in.', 'Luxury Glow Facial', TRUE, TRUE, TRUE),
  ('Kavya Rana',     5, 'I enrolled in the Makeup Artistry course and it changed my career. The instructors are skilled and the curriculum is industry-relevant. Best decision!', 'Makeup Artistry Course', TRUE, TRUE, TRUE),
  ('Deepika Basnet', 5, 'The nail art here is unmatched in Kathmandu. Intricate designs, long-lasting gel, and such a relaxing experience. I look forward to every appointment!', 'Gel Extensions & Art', TRUE, FALSE, TRUE),
  ('Roshni Gurung',  5, 'Professional, warm, and genuinely caring. They recommended the perfect treatment for my skin type. Real results after just three sessions. Incredible!', 'Skin Treatment Package', TRUE, TRUE, TRUE)

ON CONFLICT DO NOTHING;
