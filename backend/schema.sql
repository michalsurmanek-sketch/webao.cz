
create table public.webao_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.webao_admins enable row level security;
grant select on public.webao_admins to authenticated;
create policy webao_own_admin on public.webao_admins for select to authenticated using (user_id=(select auth.uid()));
insert into public.webao_admins(user_id) select id from auth.users where id='18911832-6a7a-447a-b7d9-ddd399555f52';

create table public.webao_projects (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
 name text not null check(char_length(name) between 2 and 80),
 category text not null default 'AO síť',
 summary text not null default '',
 thesis text not null default '',
 use_of_funds text not null default '',
 stage text not null default 'Rozvíjíme',
 funding_goal numeric(14,2) check(funding_goal>=0),
 min_interest numeric(14,2) check(min_interest>=0),
 open_to_interest boolean not null default true,
 sort_order integer not null default 0,
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.webao_projects enable row level security;
grant select on public.webao_projects to anon,authenticated;
grant insert,update,delete on public.webao_projects to authenticated;
create policy webao_public_projects on public.webao_projects for select to anon,authenticated using (true);
create policy webao_admin_projects_insert on public.webao_projects for insert to authenticated with check(exists(select 1 from public.webao_admins where user_id=(select auth.uid())));
create policy webao_admin_projects_update on public.webao_projects for update to authenticated using(exists(select 1 from public.webao_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.webao_admins where user_id=(select auth.uid())));
create policy webao_admin_projects_delete on public.webao_projects for delete to authenticated using(exists(select 1 from public.webao_admins where user_id=(select auth.uid())));

create table public.webao_interests (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.webao_projects(id),
 name text not null check(char_length(name) between 2 and 120),
 email text not null check(char_length(email)<=254),
 phone text not null default '' check(char_length(phone)<=40),
 company text not null default '' check(char_length(company)<=160),
 interest_type text not null check(interest_type in ('investment','partnership','expertise')),
 amount numeric(14,2) check(amount>0 and amount<=1000000000),
 message text not null default '' check(char_length(message)<=3000),
 status text not null default 'new' check(status in ('new','contacted','meeting','proposal','agreed','closed')),
 notes text not null default '' check(char_length(notes)<=20000),
 follow_up date,
 privacy_version text not null default '2026-10-webao-interest',
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
create index webao_interests_project_idx on public.webao_interests(project_id);
create index webao_interests_status_idx on public.webao_interests(status,created_at desc);
alter table public.webao_interests enable row level security;
revoke all on public.webao_interests from anon;
grant select,insert,update on public.webao_interests to authenticated;
create policy webao_admin_interests on public.webao_interests for all to authenticated using(exists(select 1 from public.webao_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.webao_admins where user_id=(select auth.uid())));

create table public.webao_funding (
 id uuid primary key default gen_random_uuid(),
 project_id uuid not null references public.webao_projects(id),
 interest_id uuid references public.webao_interests(id),
 partner_name text not null check(char_length(partner_name) between 2 and 160),
 amount numeric(14,2) not null check(amount>0 and amount<=1000000000),
 currency text not null default 'CZK' check(currency='CZK'),
 status text not null check(status in ('planned','committed','received')),
 funding_type text not null default 'K individuálnímu dojednání',
 effective_date date not null default current_date,
 reference text not null default '' check(char_length(reference)<=160),
 notes text not null default '' check(char_length(notes)<=5000),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
create index webao_funding_project_idx on public.webao_funding(project_id);
create index webao_funding_interest_idx on public.webao_funding(interest_id);
create index webao_funding_creator_idx on public.webao_funding(created_by);
alter table public.webao_funding enable row level security;
revoke all on public.webao_funding from anon;
grant select,insert,update,delete on public.webao_funding to authenticated;
create policy webao_admin_funding on public.webao_funding for all to authenticated using(exists(select 1 from public.webao_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.webao_admins where user_id=(select auth.uid())) and created_by=(select auth.uid()));

create table public.webao_rate_limits (
 id bigint generated always as identity primary key,
 ip_hash text not null,
 created_at timestamptz not null default now()
);
create index webao_rate_limits_ip_idx on public.webao_rate_limits(ip_hash,created_at desc);
alter table public.webao_rate_limits enable row level security;
revoke all on public.webao_rate_limits from anon,authenticated;

insert into public.webao_projects(slug,name,category,summary,thesis,use_of_funds,sort_order) values
('plotao','PLOTAO','Dům a zahrada','Vše pro váš plot na jednom místě.','Propojit výběr oplocení, poptávku a realizaci v jedné síti.','Další rozvoj služby a partnerské sítě.',1),
('gurmao','GURMAO','Jídlo a restaurace','Objevování restaurací podle chuti a nálady.','Pomoci lidem najít podnik, který jim sedne.','Rozvoj vyhledávání, obsahu a spoluprací.',2),
('slevao','SLEVAO','Slevy a akce','Letáky, nabídky a každodenní úspory.','Zpřehlednit nabídky obchodů na jednom místě.','Rozvoj katalogu, aktualizace nabídek a uživatelského prostředí.',3),
('betonao','BETONAO','Stavba a materiály','Betonové ploty, dodavatelé a možnosti realizace.','Propojit zájemce o betonové oplocení s dodavateli.','Rozvoj katalogu a sítě dodavatelů.',4),
('montao','MONTAO','Realizace','Montáž oplocení.','Rozvíjet služby montáže plotů a spolupráci v regionech.','Rozvoj realizací a komunikace se zákazníky.',5),
('renovao','RENOVAO','Renovace','Nový život betonových plotů.','Péče o vzhled a obnovu stávajícího oplocení.','Rozvoj služby a prezentace realizací.',6),
('vibrao','VIBRAO','Výroba','Výroba podhrabových desek.','Rozvíjet výrobní projekt v oblasti oplocení.','Příprava výrobního zázemí a dalšího rozvoje.',7);


-- Applied follow-up: permit admin erasure while retaining independent funding records.
grant delete on public.webao_interests to authenticated;
alter table public.webao_funding drop constraint webao_funding_interest_id_fkey;
alter table public.webao_funding add constraint webao_funding_interest_id_fkey foreign key(interest_id) references public.webao_interests(id) on delete set null;

insert into public.webao_projects(slug,name,summary,sort_order) values
('poptejplot','POPTĚJ PLOT','Poptávky po oplocení.',8),
('poptejcenu','POPTĚJ CENU','Jedna poptávka, více možností.',9),
('vydrhnu','VYDRHNU','Čištění a péče o domov.',10),
('reklamas','REKLAMAS','Reklama a prezentace.',11),
('adresao','ADRESAO','Místa a adresy.',12),
('chatao','CHATAO','Chaty a pobyty.',13),
('herbao','HERBAO','Svět bylinek.',14),
('casinao','CASINAO','Průvodce světem kasin.',15),
('farmao','FARMAO','Svět farmářů.',16),
('webao','WEBAO','Vstupní brána AO sítě.',17) on conflict(slug) do nothing;
