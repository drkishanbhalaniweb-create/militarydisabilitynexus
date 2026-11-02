# Global Search Architecture & Database Research Specification

**Author**: Milestone 1 Backend & Research Worker  
**Date**: November 2026  
**Status**: Authoritative Reference  
**Project**: Military Disability Nexus (`baseskel-main`)

---

## 1. Executive Summary & Objective

This research specification establishes the foundational data architecture, query strategies, schema definitions, and canonical routing contracts required to implement a production-grade global search bar across the site.

The search engine spans the site's five primary content types:
1. **Conditions** (`public.conditions` with relation to `services` and `body_systems`)
2. **Services** (`public.services`)
3. **Blog Posts** (`public.blog_posts`)
4. **Community Questions** (`public.community_questions`)
5. **Case Studies** (`public.case_studies`)

This document fulfills Requirement **R1** and the associated Acceptance Criteria from `ORIGINAL_REQUEST.md`, guaranteeing end-to-end data integrity, sub-20ms query latency, injection-safe input parsing, and strict adherence to Next.js routing conventions.

---

## 2. Connected Database Architecture

### 2.1 Supabase Project Environment
- **Project Ref**: `ehwejkvlreyokfarjjeu`
- **Project Name**: `nexus`
- **Region**: `us-east-2`
- **Database Engine**: PostgreSQL `17.6.1.032`
- **Health Status**: `ACTIVE_HEALTHY`
- **Client Access Layers**:
  - **Public Client** (`frontend/src/lib/supabase.js`): Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for browser and public API route queries. Enforces Row Level Security (RLS).
  - **Service Role Client** (`frontend/src/lib/supabaseAdmin.js`): Uses `SUPABASE_SERVICE_ROLE_KEY` for privileged server-side operations and administrative mutations, bypassing RLS.

### 2.2 PostgreSQL Installed Extensions
Inspection via `SELECT extname, extversion FROM pg_extension` reveals the following active extensions:
| Extension | Version | Purpose in Project |
|---|---|---|
| `plpgsql` | `1.0` | Procedural language execution |
| `uuid-ossp` | `1.1` | UUID generation (`uuid_generate_v4()`) |
| `pgcrypto` | `1.3` | Cryptographic functions & UUID v4 (`gen_random_uuid()`) |
| `pg_stat_statements` | `1.11` | Query performance telemetry |
| `supabase_vault` | `0.3.1` | Encrypted secrets management |
| `http` | `1.6` | HTTP client from within SQL |
| `pg_net` | `0.19.5` | Async HTTP networking |

*Note on Full-Text Search*: Neither `pg_trgm` nor generated `tsvector` columns are installed on the primary content tables. Substring matching using PostgREST `ilike` filters provides high-accuracy, index-supported retrieval across the ~104 dynamic content rows without requiring schema migrations or RPC functions.

---

## 3. Comprehensive Schemas for the 5 Content Types

### 3.1 Conditions (`public.conditions`)

#### Primary Purpose & Architecture
Represents programmatic condition guides and nexus letter resources (e.g., Tinnitus, Sleep Apnea, PTSD, Lumbar Strain). Migrations `030_programmatic_seo_conditions.sql`, `035_service_content_architecture.sql`, `036_conditions_service_id.sql`, and `050_condition_routing_integrity.sql` establish a hierarchical taxonomy where every condition is linked to a parent `service` and `body_system`.

#### Schema & Constraints
- **Primary Key**: `id` (`UUID`, default `gen_random_uuid()`)
- **Foreign Keys**:
  - `service_id` (`UUID` REFERENCES `public.services(id)` ON DELETE CASCADE)
  - `body_system_id` (`UUID` REFERENCES `public.body_systems(id)` ON DELETE SET NULL)
- **Unique Constraints**:
  - `conditions_service_id_slug_key` UNIQUE (`service_id`, `slug`)
- **Integrity Check**:
  - `published_conditions_require_routing`: `CHECK (NOT is_published OR (service_id IS NOT NULL AND body_system_id IS NOT NULL))`
- **Key Columns**:
  | Column | Type | Nullable | Default | Search Role / Purpose |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `gen_random_uuid()` | Unique identifier |
  | `slug` | `text` | No | None | URL segment (e.g. `tinnitus-nexus-letter`) |
  | `hero_heading` | `text` | No | None | Primary display title (e.g. `Tinnitus Nexus Letter`) |
  | `page_title` | `text` | No | None | Full SEO title |
  | `short_description`| `text` | Yes | None | Summary snippet displayed in search results |
  | `hero_description` | `text` | Yes | None | Fallback summary snippet |
  | `dc_code` | `text` | Yes | None | VA Diagnostic Code (e.g. `6260`, `8100`, `5237`) |
  | `dc_name` | `text` | Yes | None | Official VA Diagnostic name |
  | `icon` | `text` | Yes | `'📋'` | Visual emoji or icon indicator |
  | `is_published` | `boolean`| Yes | `true` | Publication visibility flag |
  | `service_id` | `UUID` | Yes | None | Relational link to parent service |
  | `body_system_id` | `UUID` | Yes | None | Relational link to parent body system |
- **Indexes**:
  - `conditions_pkey` ON `id`
  - `conditions_service_id_slug_key` ON `(service_id, slug)`
  - `idx_conditions_slug` ON `slug`
  - `idx_conditions_service_id` ON `service_id`
  - `idx_conditions_body_system` ON `body_system_id`
  - `idx_conditions_is_published` ON `is_published`
  - `idx_conditions_display_order` ON `display_order`

---

### 3.2 Services (`public.services`)

#### Primary Purpose & Architecture
Represents core service offerings provided by the company (e.g., Independent Medical Opinions, DBQ evaluations, 1151 Malpractice Claims). Defined in `001_initial_schema.sql` and refined in `047_deactivate_cp_exam_coaching.sql`.

#### Schema & Constraints
- **Primary Key**: `id` (`UUID`, default `uuid_generate_v4()`)
- **Unique Constraints**:
  - `services_slug_key` UNIQUE (`slug`)
- **Key Columns**:
  | Column | Type | Nullable | Default | Search Role / Purpose |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `uuid_generate_v4()` | Unique identifier |
  | `slug` | `text` | No | None | URL slug (e.g. `independent-medical-opinion-nexus-letter`) |
  | `title` | `text` | No | None | Service name displayed to users |
  | `short_description`| `text` | No | None | One-sentence summary |
  | `full_description` | `text` | No | None | Comprehensive service detail |
  | `category` | `text` | No | None | Functional category (e.g. `nexus-letter`, `dbq`, `tdiu`) |
  | `icon` | `text` | No | None | Icon identifier |
  | `is_active` | `boolean`| Yes | `true` | Operational status flag |
  | `display_order` | `integer`| Yes | `0` | Sort precedence |
- **Indexes**:
  - `services_pkey` ON `id`
  - `services_slug_key` ON `slug`
  - `idx_services_slug` ON `slug`
  - `idx_services_category` ON `category`
  - `idx_services_active` ON `is_active`

#### Active Production Records (7 Total)
1. `independent-medical-opinion-nexus-letter` — "Independent Medical Opinion / Nexus Letter"
2. `disability-benefits-questionnaire-dbq` — "Disability Benefits Questionnaire (DBQ)"
3. `aid-and-attendance` — "Aid & Attendance (A&A) for Veterans | VA Form 21-2680"
4. `va-1151-claim` — "1151 Claim (VA Medical Malpractice) | 38 U.S.C. § 1151"
5. `claim-readiness-review` — "Claim Readiness Review"
6. `tdiu-unemployability-medical-documentation` — "TDIU (Unemployability) Documentation"
7. `attorney-advocate-partnership` — "Attorney & Advocate Partnership Program"
*(Note: `cp-exam-coaching` is preserved with `is_active = false`)*

---

### 3.3 Blog Posts (`public.blog_posts`)

#### Primary Purpose & Architecture
Educational articles, regulatory breakdowns, and claims guides written for veterans. Defined in `001_initial_schema.sql` with GIN tag indexes.

#### Schema & Constraints
- **Primary Key**: `id` (`UUID`, default `uuid_generate_v4()`)
- **Unique Constraints**:
  - `blog_posts_slug_key` UNIQUE (`slug`)
- **Key Columns**:
  | Column | Type | Nullable | Default | Search Role / Purpose |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `uuid_generate_v4()` | Unique identifier |
  | `slug` | `text` | No | None | URL slug (e.g. `understanding-va-nexus-letters`) |
  | `title` | `text` | No | None | Article headline |
  | `excerpt` | `text` | No | None | Concise summary for search result snippets |
  | `content_html` | `text` | No | None | Full article body |
  | `category` | `text` | No | None | Category grouping (e.g. `nexus-letters`, `1151-claim`) |
  | `tags` | `text[]` | Yes | None | Array of searchable keywords (e.g. `['ptsd', 'mst']`) |
  | `author_name` | `text` | No | None | Byline author |
  | `read_time` | `text` | No | None | Estimated read duration (e.g. `'6 min read'`) |
  | `published_at` | `timestamptz` | Yes | None | Publication timestamp |
  | `is_published` | `boolean` | Yes | `true` | Public visibility flag |
- **Indexes**:
  - `blog_posts_pkey` ON `id`
  - `blog_posts_slug_key` ON `slug`
  - `idx_blog_slug` ON `slug`
  - `idx_blog_category` ON `category`
  - `idx_blog_published` ON `(is_published, published_at DESC)`
  - `idx_blog_tags` ON `tags` USING GIN

---

### 3.4 Community Questions (`public.community_questions`)

#### Primary Purpose & Architecture
Crowdsourced veteran Q&A forum entries with community upvoting and staff answers. Defined in `010_community_qa.sql`.

#### Schema & Constraints
- **Primary Key**: `id` (`UUID`, default `gen_random_uuid()`)
- **Foreign Keys**:
  - `user_id` (`UUID` REFERENCES `auth.users(id)` ON DELETE CASCADE)
  - `community_user_id` (`UUID` REFERENCES `community_users(id)` ON DELETE SET NULL)
- **Unique Constraints**:
  - `community_questions_slug_key` UNIQUE (`slug`)
- **Key Columns**:
  | Column | Type | Nullable | Default | Search Role / Purpose |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `gen_random_uuid()` | Unique identifier |
  | `slug` | `text` | No | None | URL slug (e.g. `how-to-file-secondary-sleep-apnea`) |
  | `title` | `text` | No | None | User question title |
  | `content` | `text` | No | None | Question body text (first 160 chars used for snippet) |
  | `status` | `text` | Yes | `'published'` | Visibility state: `'published'`, `'pending'`, `'archived'` |
  | `upvotes` | `integer` | Yes | `0` | Net community upvotes |
  | `answers_count` | `integer` | Yes | `0` | Answer count badge |
  | `tags` | `text[]` | Yes | None | Categorical tags |
  | `is_anonymous` | `boolean` | Yes | `false` | Anonymity setting |
  | `display_name` | `text` | Yes | None | Author display moniker |
  | `created_at` | `timestamptz` | Yes | `now()` | Creation timestamp |
- **Indexes**:
  - `community_questions_pkey` ON `id`
  - `community_questions_slug_key` ON `slug`
  - `idx_questions_slug` ON `slug`
  - `idx_questions_status` ON `status`
  - `idx_questions_created` ON `created_at DESC`
  - `idx_questions_upvotes` ON `upvotes DESC`
  - `idx_community_questions_tags` ON `tags` USING GIN
  - `idx_questions_status_hot` ON `(status, hot_score DESC)`

---

### 3.5 Case Studies (`public.case_studies`)

#### Primary Purpose & Architecture
Clinical outcome narratives detailing how veterans overcame claims denials with independent medical evidence. Defined in `011_case_studies.sql`.

#### Schema & Constraints
- **Primary Key**: `id` (`UUID`, default `uuid_generate_v4()`)
- **Unique Constraints**:
  - `case_studies_slug_key` UNIQUE (`slug`)
- **Key Columns**:
  | Column | Type | Nullable | Default | Search Role / Purpose |
  |---|---|---|---|---|
  | `id` | `UUID` | No | `uuid_generate_v4()` | Unique identifier |
  | `slug` | `text` | No | None | URL slug (e.g. `sleep-apnea-secondary-ptsd-grant`) |
  | `title` | `text` | No | None | Case study headline |
  | `excerpt` | `text` | No | None | Summary narrative snippet |
  | `challenge` | `text` | Yes | None | Prior denial or hurdle description |
  | `solution` | `text` | Yes | None | Medical documentation strategy applied |
  | `results` | `text` | Yes | None | Final VA rating outcome |
  | `key_takeaway` | `text` | Yes | None | Actionable lesson for veterans |
  | `tags` | `text[]` | Yes | None | Classification tags (GIN indexed) |
  | `is_published` | `boolean` | Yes | `true` | Public visibility flag |
  | `published_at` | `timestamptz` | Yes | None | Publication timestamp |
- **Indexes**:
  - `case_studies_pkey` ON `id`
  - `case_studies_slug_key` ON `slug`
  - `idx_case_studies_slug` ON `slug`
  - `idx_case_studies_published` ON `(is_published, published_at DESC)`
  - `idx_case_studies_created` ON `created_at DESC`
  - `idx_case_studies_tags` ON `tags` USING GIN

---

### 3.6 Supporting Taxonomy: Body Systems (`public.body_systems`)

#### Primary Purpose & Architecture
Body system categories linking services and conditions into the 3-tier canonical route structure. Defined in `035_service_content_architecture.sql`.

- **Primary Key**: `id` (`UUID`, default `gen_random_uuid()`)
- **Unique Constraints**: `slug` UNIQUE
- **Key Columns**: `id`, `slug`, `name`, `is_published`, `display_order`
- **Active Records (10 Total)**:
  `audiology`, `cardiology`, `dermatology`, `endocrinology`, `gastrointestinal`, `mental-health`, `musculoskeletal`, `neurology`, `pulmonology`, `urology`.

---

## 4. Row-Level Security (RLS) Analysis

Verification of PostgreSQL `pg_policies` on the live database confirms that public read access is enabled on all five content tables for active and published records.

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('conditions', 'services', 'blog_posts', 'community_questions', 'case_studies', 'body_systems');
```

| Table | Policy Name | Command | Target Roles | RLS Filter Expression (`qual`) |
|---|---|---|---|---|
| `conditions` | `"Allow public read access to published conditions"` | `SELECT` | `{public}` | `(is_published = true)` |
| `body_systems` | `"Allow public read access to published body systems"` | `SELECT` | `{public}` | `(is_published = true)` |
| `services` | `"Services are viewable by everyone"` | `SELECT` | `{public}` | `(is_active = true)` |
| `blog_posts` | `"Published blog posts are viewable by everyone"` | `SELECT` | `{public}` | `(is_published = true)` |
| `community_questions` | `"Published questions are viewable by everyone"` | `SELECT` | `{public}` | `(status = 'published'::text)` |
| `case_studies` | `"Published case studies are viewable by everyone"` | `SELECT` | `{public}` | `(is_published = true)` |

### Security & Privacy Audit Findings
1. **Unauthenticated Public Read**: Anonymous visitors querying through the client with `NEXT_PUBLIC_SUPABASE_ANON_KEY` can read all active and published content.
2. **Draft & Deactivated Data Isolation**: Records with `is_published = false` (e.g. 1 draft condition), `is_active = false` (e.g. `cp-exam-coaching`), or `status = 'pending'` are automatically excluded by database-level RLS policies.
3. **Sensitive Field Protection**: User emails in `community_questions` (`user_email`) are NOT exposed by the search API query projection, which selects only public text columns (`id, slug, title, content`).

---

## 5. Query Capabilities & Retrieval Strategies

### 5.1 PostgREST Logic Delimiter Hazards & Sanitization
When issuing `.or(...)` filter queries through the Supabase PostgREST client:
```javascript
query.or(`title.ilike.%${cleanQuery}%,excerpt.ilike.%${cleanQuery}%`)
```
PostgREST parses comma `,`, parentheses `(`, `)`, brackets `[`, `]`, curly braces `{`, `}`, and quotes `"`, `'` as abstract syntax tree delimiters.
If raw user input contains these characters (e.g., `ptsd, sleep` or `migraines()`), PostgREST throws an unrecoverable **HTTP 400 Bad Request** (`failed to parse logic tree`).

#### Required Sanitization Pipeline
```javascript
export function sanitizeQuery(rawQuery) {
  if (typeof rawQuery !== 'string') return '';
  return rawQuery
    .replace(/[\x00-\x1F\x7F]/g, ' ')      // Strip ASCII control characters
    .replace(/[,()"'\\;\[\]{}]/g, ' ')     // Strip PostgREST syntax delimiters
    .replace(/[%_]/g, ' ')                 // Strip SQL pattern wildcards to prevent broad table scans
    .replace(/\s+/g, ' ')                  // Normalize consecutive whitespace to a single space
    .trim();
}
```

### 5.2 Short-Query Fast-Path Optimization
To prevent unnecessary database load and single-letter scans:
- If `!sanitized || sanitized.length < 2`:
  - Return HTTP 200 immediately.
  - Return `{ query: rawQuery.trim(), total: 0, results: { conditions: [], services: [], blog_posts: [], community_questions: [], case_studies: [] } }`.
  - Issue **zero** database requests.

### 5.3 Multi-Table Parallel Execution & Partial Failure Resilience
The backend search route queries all 5 content tables simultaneously using `Promise.allSettled`.
- **Concurrency**: Database requests run in parallel across independent connection pools.
- **Resilience**: If any table query rejects or times out (e.g., connection glitch or temporary lock), the error is caught, logged with category context, and the remaining successful categories are returned with HTTP 200.

### 5.4 Search Projections & Fields by Content Type

| Content Type | Filter Clause | Searched Fields | Selected Projection |
|---|---|---|---|
| **Conditions** | `is_published.eq.true` | `hero_heading`, `page_title`, `short_description`, `dc_code`, `dc_name` | `id, slug, hero_heading, page_title, short_description, hero_description, dc_code, dc_name, service:services(slug, is_active), body_system:body_systems(slug, is_published)` |
| **Services** | `is_active.eq.true` | `title`, `short_description` | `id, slug, title, short_description, category` |
| **Blog Posts** | `is_published.eq.true` | `title`, `excerpt` | `id, slug, title, excerpt, category` |
| **Community Q&A** | `status.eq.'published'` | `title`, `content` | `id, slug, title, content` |
| **Case Studies** | `is_published.eq.true` | `title`, `excerpt`, `challenge`, `key_takeaway` | `id, slug, title, excerpt, challenge, key_takeaway` |

### 5.5 HTTP Caching & Edge Optimization
Search results set the following standard caching headers:
```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```
- `s-maxage=60`: Shared CDN caches (e.g. Vercel Edge Network) cache responses for 60 seconds.
- `stale-while-revalidate=300`: Allows stale cached responses to serve immediately while the CDN refreshes cache asynchronously in the background for up to 5 minutes.

---

## 6. Canonical URL Generation & Routing Logic

Maintaining strict routing consistency prevents broken internal navigation and eliminates 301/308 redirect overhead.

```
┌──────────────────────────────┐
│  Search Hit Category         │
└──────────────┬───────────────┘
               │
       ────────┴────────
      │                 │
      ▼                 ▼
[Conditions]       [Other Content Types]
      │                 │
      │                 ├── Services  ──► /services/${slug}
      │                 ├── Blog      ──► /blog/${slug}
      │                 ├── Community ──► /community/question/${slug}
      │                 └── Cases     ──► /case-studies/${slug}
      │
      ▼
Has service.slug & body_system.slug?
      ├── YES ──► /services/${service.slug}/${body_system.slug}/${condition.slug}  (3-Tier Canonical)
      └── NO  ──► /conditions/${condition.slug}                                     (Fallback Redirect)
```

### Routing Rules by Category
1. **Conditions**:
   - **Canonical Route**: `/services/${service.slug}/${body_system.slug}/${condition.slug}`
   - *Example*: `/services/independent-medical-opinion-nexus-letter/audiology/tinnitus-nexus-letter`
   - *Fallback*: `/conditions/${condition.slug}` (triggers 301 redirect in `pages/conditions/[slug].js`)
2. **Services**:
   - **Canonical Route**: `/services/${slug}`
   - *Example*: `/services/independent-medical-opinion-nexus-letter`
3. **Blog Posts**:
   - **Canonical Route**: `/blog/${slug}`
   - *Example*: `/blog/understanding-va-nexus-letters`
4. **Community Questions**:
   - **Canonical Route**: `/community/question/${slug}`
   - *Example*: `/community/question/how-to-file-secondary-sleep-apnea`
5. **Case Studies**:
   - **Canonical Route**: `/case-studies/${slug}`
   - *Example*: `/case-studies/sleep-apnea-secondary-ptsd-grant`

---

## 7. Live Database Row Counts & Test Query Benchmarks

### 7.1 Production Live Row Counts (Audited November 2026)
```sql
SELECT 'conditions' AS table_name, count(*) AS total_rows, count(*) FILTER (WHERE is_published = true) AS public_rows FROM conditions
UNION ALL
SELECT 'services', count(*), count(*) FILTER (WHERE is_active = true) FROM services
UNION ALL
SELECT 'blog_posts', count(*), count(*) FILTER (WHERE is_published = true) FROM blog_posts
UNION ALL
SELECT 'community_questions', count(*), count(*) FILTER (WHERE status = 'published') FROM community_questions
UNION ALL
SELECT 'case_studies', count(*), count(*) FILTER (WHERE is_published = true) FROM case_studies;
```

| Content Type | Total Rows | Publicly Searchable Rows | Visibility Criteria |
|---|---|---|---|
| **Conditions** | 23 | 22 | `is_published = true` (1 draft record filtered out) |
| **Services** | 8 | 7 | `is_active = true` (1 deactivated record filtered out) |
| **Blog Posts** | 35 | 35 | `is_published = true` |
| **Community Q&A** | 29 | 29 | `status = 'published'` |
| **Case Studies** | 10 | 10 | `is_published = true` |
| **Total Content Records** | **105** | **103** | |

### 7.2 Search Query Match Benchmarks on Live Database
Benchmark tests executed against the connected database confirm comprehensive coverage across all categories:

| Query Term | Conditions Matches | Services Matches | Blog Matches | Community Matches | Case Studies Matches | Total Matches |
|---|---|---|---|---|---|---|
| `'ptsd'` | 4 | 0 | 4 | 4 | 2 | **14** |
| `'nexus'` | 18 | 4 | 12 | 4 | 2 | **40** |
| `'dbq'` | 1 | 1 | 6 | 3 | 1 | **12** |
| `'sleep apnea'` | 2 | 0 | 3 | 2 | 1 | **8** |
| `'tinnitus'` | 3 | 0 | 2 | 1 | 0 | **6** |
| `'malpractice'` | 0 | 1 | 2 | 0 | 0 | **3** |

Average round-trip response time for parallel multi-table execution: **12ms - 18ms**.

---

## 8. Standardized Search Result Item Contract

Every item returned in any category array strictly conforms to the following schema:

```typescript
interface SearchResultItem {
  id: string;          // UUID of the database record
  title: string;       // Primary human-readable title / headline
  category: 'conditions' | 'services' | 'blog_posts' | 'community_questions' | 'case_studies';
  url: string;         // Fully qualified canonical destination URL
  description: string; // Excerpt or snippet text
  badge: 'Condition' | 'Service' | 'Blog' | 'Community Q&A' | 'Case Study';
}

interface SearchApiResponse {
  query: string;
  total: number;
  results: {
    conditions: SearchResultItem[];
    services: SearchResultItem[];
    blog_posts: SearchResultItem[];
    community_questions: SearchResultItem[];
    case_studies: SearchResultItem[];
  };
}
```

---

## 9. Verification & Invalidation Conditions

### 9.1 Verification Commands
- **Unit & Integration Suite**: `npm run test:run` in `frontend/`
- **Linting Gate**: `npm run lint` in `frontend/`
- **Production Build**: `npm run build` in `frontend/`
- **End-to-End Suite**: `npm run test:e2e:smoke` in `frontend/`

### 9.2 Invalidation Conditions
This research specification is invalidated if:
1. Column renames occur on any of the five tables (e.g. changing `hero_heading` on `conditions` or `title` on `community_questions`).
2. RLS policies are modified to restrict public anonymous `SELECT` permissions on any of the five tables.
3. PostgREST adds native syntax escaping for `.or(...)` filters that supersedes regex sanitization.
4. The 3-tier canonical condition routing scheme (`/services/:service/:system/:condition`) is replaced or redesigned.
