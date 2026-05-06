-- 0002_seed_categories.sql

insert into public.categories (slug, name, icon, sort_order, parent_id) values
  ('paneller', 'Güneş Panelleri', 'panel', 1, null),
  ('bataryalar', 'Bataryalar', 'battery', 2, null),
  ('invertorler', 'İnvertörler', 'invertor', 3, null),
  ('aydinlatma', 'Aydınlatma', 'sun', 4, null),
  ('hazir-paketler', 'Hazır Paket Sistemler', 'box', 5, null),
  ('aksesuarlar', 'Aksesuarlar', 'wrench', 6, null)
on conflict (slug) do nothing;

-- alt kategoriler — parent slug ile resolve
with parents as (
  select slug, id from public.categories
)
insert into public.categories (slug, name, parent_id, sort_order) values
  ('monokristal',    'Monokristal',    (select id from parents where slug = 'paneller'), 1),
  ('polikristal',    'Polikristal',    (select id from parents where slug = 'paneller'), 2),
  ('bifacial',       'Bifacial',       (select id from parents where slug = 'paneller'), 3),
  ('topcon',         'TOPCon N-Type',  (select id from parents where slug = 'paneller'), 4),

  ('jel-batarya',    'Jel',            (select id from parents where slug = 'bataryalar'), 1),
  ('lityum',         'Lityum (LiFePO4)', (select id from parents where slug = 'bataryalar'), 2),
  ('agm',            'AGM',            (select id from parents where slug = 'bataryalar'), 3),

  ('tam-sinus',      'Tam Sinüs',      (select id from parents where slug = 'invertorler'), 1),
  ('on-grid',        'On-Grid',        (select id from parents where slug = 'invertorler'), 2),
  ('hibrit',         'Hibrit',         (select id from parents where slug = 'invertorler'), 3),

  ('sokak-lambasi',  'Solar Sokak Lambası', (select id from parents where slug = 'aydinlatma'), 1),
  ('bahce-lambasi',  'Solar Bahçe Lambası', (select id from parents where slug = 'aydinlatma'), 2),

  ('paket-6kw',      '6 kW Sistem',    (select id from parents where slug = 'hazir-paketler'), 1),
  ('paket-10kw',     '10 kW Sistem',   (select id from parents where slug = 'hazir-paketler'), 2),
  ('paket-50kw',     '50 kW Sistem',   (select id from parents where slug = 'hazir-paketler'), 3),

  ('sarj-kontrol',   'Şarj Kontrol Cihazları', (select id from parents where slug = 'aksesuarlar'), 1),
  ('kablo',          'Kablolar',       (select id from parents where slug = 'aksesuarlar'), 2),
  ('konnektor',      'Konektörler',    (select id from parents where slug = 'aksesuarlar'), 3),
  ('montaj',         'Montaj Kitleri', (select id from parents where slug = 'aksesuarlar'), 4)
on conflict (slug) do nothing;
