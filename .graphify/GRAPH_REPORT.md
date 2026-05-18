# Prompthub Knowledge Graph Report

**Project:** prompthub  
**Generated:** 2026-05-07  
**Backend:** Copilot (via VS Code skill)  
**Total Nodes:** 39 | **Total Edges:** 40 | **Workflows:** 5

---

## 🎯 God Nodes (Most Critical)

These are the most-connected components that everything flows through:

### 1. **creators** (12 connections)
- **Why Critical:** Every feature is scoped to a creator - authentication, isolation, multi-tenancy
- **Connected to:** auth, profiles, prompts, analytics, ads, RLS policies
- **Key Flow:** OAuth → creator record → all subsequent actions filtered by creator_id

### 2. **prompts** (9 connections)
- **Why Critical:** Core business entity; links to pages, analytics, ads, and revenue
- **Connected to:** pages (auto-generated), views, events, categories, ad_placements
- **Key Flow:** New prompt → create page → enable ads → track performance

### 3. **events** (8 connections)
- **Why Critical:** Central hub for all analytics and tracking
- **Connected to:** views, ad_impressions, ad_clicks, campaign analytics
- **Key Flow:** Reader/ad interaction → logged as event → aggregated for dashboards

### 4. **admin_dashboard** (6 connections)
- **Why Critical:** Single entry point for all creator management
- **Connected to:** prompt CRUD, analytics, Instagram, settings
- **Key Flow:** Creator lands here → can publish, monetize, analyze, integrate

### 5. **prompts_crud API** (5 connections)
- **Why Critical:** Gateway to publishing; auto-generates public pages
- **Connected to:** prompts table, pages table, prompt_form component, analytics triggers
- **Key Flow:** Form submission → DB write → page auto-created → live instantly

---

## 🔄 Major Workflows

### Workflow 1: **Creator Onboarding**
```
Click "Create" 
  → Instagram OAuth (app/api/auth/instagram)
  → Encrypt token (lib/crypto.ts)
  → Create creator record (creators table, RLS enabled)
  → Redirect to admin dashboard
Result: Multi-tenant isolation starts
```

### Workflow 2: **Publish & Monetize**
```
Creator fills PromptForm
  → Upload media (app/api/upload)
  → Submit to prompts_crud
  → Save to prompts table
  → Auto-generate public page (pages table)
  → Setup ad placements
  → Live at creator.prompthub.com/prompt-id
Result: 3 monetization channels available (ads, gating, payment)
```

### Workflow 3: **Reader Experience**
```
Visit subdomain.prompthub.com/prompt-id
  → Multi-tenant router resolves creator context
  → Load prompt_page_template
  → Apply email gating (if enabled)
  → Track view event → events table
  → Render ad placements → track impressions
  → Reader engages (view, click, convert)
Result: Analytics + ad revenue flows start
```

### Workflow 4: **Analytics & Revenue**
```
Events logged continuously
  → Analytics service aggregates (hourly/daily)
  → Dashboard shows breakdowns:
    - Total views, CTR, earnings
    - Per-prompt performance
    - Ad revenue vs. gating revenue
    - Top performers trending
Result: Creator sees full monetization picture
```

### Workflow 5: **Ad Campaign Management**
```
Advertiser submits campaign
  → Campaign stored (ad_campaigns table)
  → Placements auto-assigned to matching prompts
  → Impressions tracked (ad_impressions)
  → Clicks tracked (ad_clicks)
  → Analytics shows ROI (analytics_campaign)
Result: Bidirectional revenue (pay creators, get paid by advertisers)
```

---

## 🌐 Architecture Layers

### **Database Layer (13 tables)**
| Core | Analytics | Ads |
|------|-----------|-----|
| creators | views | ad_clients |
| prompts | events | ad_campaigns |
| categories | email_captures | ad_placements |
| pages | | ad_impressions |
| | | ad_clicks |

**RLS Policy:** All tables filtered by creator_id (except ad_* which are role-based)

### **API Layer (12 routes)**
- **Auth:** Instagram OAuth with token encryption
- **Prompts:** Full CRUD with auto-page generation on publish
- **Analytics:** Overview, per-prompt, campaign performance
- **Ads:** Campaign CRUD, impression/click tracking with webhooks
- **Utilities:** Upload, email capture, categories, platforms, cron jobs

### **Component Layer (11 components)**
- **Admin:** Dashboard, prompt form/table, analytics charts, Instagram picker, settings
- **Landing:** Hero, features, navbar, how-it-works, footer
- **Public:** Multi-tenant page templates with email gating

### **Service Layer (7 services)**
- Creator auth + RLS enforcement
- Analytics aggregation + event logging
- Instagram OAuth + token encryption
- Ad campaign + placement management
- Email gating
- Multi-tenant routing
- Cron jobs (cache, rollups)

---

## 🔗 Surprising Connections

### Connection 1: Prompt Page → Ad Tracking
**Finding:** Readers trigger ad analytics without creator involvement  
**Why:** Impressions/clicks must fire from the page template  
**Impact:** Ad revenue flows automatically; creators don't need to do anything  
**Confidence:** HIGH

### Connection 2: Multi-Tenant Router ↔ Creator Service
**Finding:** Subdomain routing and RLS policies are deeply coupled  
**Why:** Each subdomain must resolve to a creator AND apply row-level security  
**Impact:** Creator isolation is enforced at routing + DB layers (defense in depth)  
**Confidence:** HIGH

### Connection 3: Instagram Service → Prompts CRUD
**Finding:** Instagram integration feeds into prompt publishing  
**Why:** Instagram posts can be auto-imported as prompts  
**Impact:** Low-friction content import from Instagram → published on PromptHub  
**Confidence:** MEDIUM

### Connection 4: Email Gating ↔ Prompts
**Finding:** Email capture is optional per-prompt  
**Why:** Creators choose which prompts require emails  
**Impact:** Hybrid freemium model - some prompts gated, others free  
**Confidence:** HIGH

---

## 📊 Key Metrics

**Coverage:**
- API Routes: 12 (auth, CRUD, analytics, ads, utilities)
- Components: 11 (admin dashboard, landing, public pages)
- Database Tables: 12 (core, analytics, ads)
- Services: 7 (auth, analytics, ads, multi-tenant, etc.)

**Business Logic:**
- Multi-tenancy: Via subdomain routing + RLS policies
- Monetization: 3 channels (email gating, payment, ads)
- Analytics: Real-time view → event pipeline → aggregation
- Ad Revenue: Bidirectional (pay creators, get paid by advertisers)

---

## 💡 Query Examples

```bash
# What's the auth flow?
/graphify query "how does creator authentication work?"

# How does a prompt become a published page?
/graphify path "prompts_crud" "pages"

# Where do ad impressions come from?
/graphify explain "ad_impressions"

# What triggers analytics events?
/graphify query "what flows into the events table?"

# How is creator data isolated?
/graphify path "creators" "creator_service"
```

---

## 🛠️ Next Steps

1. **Build Full Graph:** Run `/graphify .` in VS Code to extract detailed code relationships
2. **Track Changes:** After code updates, run `/graphify . --update` to sync nodes
3. **Query Patterns:** Use `/graphify query` to find answers instead of grepping
4. **Visualize:** Open `graph.html` in browser to explore interactively

See `.agents/agent.md` for full agent workflow guidelines.
