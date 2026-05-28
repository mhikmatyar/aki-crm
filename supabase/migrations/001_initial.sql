-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========================
-- BRANCHES
-- ========================
create table if not exists branches (
  id uuid primary key default uuid_generate_v4(),
  nama_cabang text not null,
  kota text not null,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ========================
-- USER PROFILES
-- ========================
create table if not exists user_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  nama text not null,
  role text not null check (role in ('super_admin', 'admin')),
  cabang_id uuid references branches(id),
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================
-- CUSTOMERS
-- ========================
create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  nomor_telp text not null,
  jenis_mobil text not null,
  harga_beli numeric not null default 0,
  item_dibeli text not null,
  tanggal_pembelian date not null,
  lokasi_cabang uuid not null references branches(id),
  reminder_bulan int not null default 6,
  pernah_claim boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users
);

-- ========================
-- CLAIMS
-- ========================
create type kondisi_klaim_enum as enum ('A', 'B', 'C', 'D');

create table if not exists claims (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  posisi_aki text not null,
  kondisi_klaim kondisi_klaim_enum not null,
  catatan text,
  tanggal_klaim date not null default current_date,
  status text not null default 'aktif' check (status in ('aktif', 'done')),
  done_at timestamptz,
  created_by uuid references auth.users,
  updated_by uuid references auth.users,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========================
-- WA LOGS
-- ========================
create table if not exists wa_logs (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  nama_customer text not null,
  nomor_telp text not null,
  jenis_mobil text not null,
  tanggal_pembelian date not null,
  durasi_saat_kirim int not null,
  pesan_dikirim text not null,
  dikirim_oleh uuid references auth.users,
  cabang uuid references branches(id),
  waktu_kirim timestamptz not null default now()
);

-- ========================
-- FUNCTIONS & TRIGGERS
-- ========================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger customers_updated_at before update on customers
  for each row execute function update_updated_at();

create trigger claims_updated_at before update on claims
  for each row execute function update_updated_at();

create or replace function update_pernah_claim()
returns trigger as $$
begin
  if new.status = 'done' and old.status != 'done' then
    update customers set pernah_claim = true where id = new.customer_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger claims_done_trigger after update on claims
  for each row execute function update_pernah_claim();

-- ========================
-- ROW LEVEL SECURITY
-- ========================
alter table branches enable row level security;
alter table user_profiles enable row level security;
alter table customers enable row level security;
alter table claims enable row level security;
alter table wa_logs enable row level security;

-- Helper function: get current user role
create or replace function get_my_role()
returns text as $$
  select role from user_profiles where id = auth.uid();
$$ language sql security definer;

-- Helper function: get current user branch
create or replace function get_my_cabang()
returns uuid as $$
  select cabang_id from user_profiles where id = auth.uid();
$$ language sql security definer;

-- BRANCHES policies
create policy "branches_read_all" on branches for select using (true);

-- USER PROFILES policies
create policy "profiles_read_own" on user_profiles for select
  using (id = auth.uid() or get_my_role() = 'super_admin');

create policy "profiles_insert_superadmin" on user_profiles for insert
  with check (get_my_role() = 'super_admin');

create policy "profiles_update_superadmin" on user_profiles for update
  using (get_my_role() = 'super_admin');

-- CUSTOMERS policies
create policy "customers_select" on customers for select
  using (
    get_my_role() = 'super_admin' or
    lokasi_cabang = get_my_cabang()
  );

create policy "customers_insert" on customers for insert
  with check (
    get_my_role() = 'super_admin' or
    lokasi_cabang = get_my_cabang()
  );

create policy "customers_update" on customers for update
  using (
    get_my_role() = 'super_admin' or
    lokasi_cabang = get_my_cabang()
  );

-- CLAIMS policies
create policy "claims_select" on claims for select
  using (
    get_my_role() = 'super_admin' or
    exists (
      select 1 from customers c
      where c.id = claims.customer_id
      and c.lokasi_cabang = get_my_cabang()
    )
  );

create policy "claims_insert" on claims for insert
  with check (
    get_my_role() = 'super_admin' or
    exists (
      select 1 from customers c
      where c.id = claims.customer_id
      and c.lokasi_cabang = get_my_cabang()
    )
  );

create policy "claims_update" on claims for update
  using (
    get_my_role() = 'super_admin' or
    exists (
      select 1 from customers c
      where c.id = claims.customer_id
      and c.lokasi_cabang = get_my_cabang()
    )
  );

-- WA LOGS policies
create policy "wa_logs_select" on wa_logs for select
  using (
    get_my_role() = 'super_admin' or
    cabang = get_my_cabang()
  );

create policy "wa_logs_insert" on wa_logs for insert
  with check (
    get_my_role() = 'super_admin' or
    cabang = get_my_cabang()
  );

-- ========================
-- SEED DATA (optional)
-- ========================
insert into branches (nama_cabang, kota) values
  ('Cabang Pusat', 'Jakarta'),
  ('Cabang Bekasi', 'Bekasi'),
  ('Cabang Depok', 'Depok')
on conflict do nothing;
