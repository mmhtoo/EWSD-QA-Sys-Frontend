## Implementation Detail Plan — QA System Portal

This plan covers the required UI features and how to implement them using the existing components and page stubs. It keeps changes confined to /pages, adds reusable CRUD forms/modals, and wires routes/menus without modifying existing components.

---

### 1) Page Scaffolding & Shared UI

- Use the existing layout pieces across all pages:
  - PageBreadcrumb (dashboard pages must include breadcrumb + actions)
  - ComponentCard for sections
  - DataTable + TablePagination for tabular lists
- Create reusable UI helpers (new components):
  - Search filter
  - Category filter (bind to master categories)
  - Pagination wrapper (5 items per page)
  - Reusable form modal (create/edit)
  - Reusable read-only detail modal
  - Reusable delete-confirm modal (wrap existing DeleteConfirmationModal)

---

### 2) Types & Sample Data

- Use base types from /types/entity.d.ts for all sample/mock data in page lists.
- Each list page should show data aligned to the entity types (Idea, Department, AcademicYear, etc.).

---

### 3) Ideas — CRUD (Table View)

- Page: pages/idea/IdeaListPage.tsx
- Implement:
  - Search + category filter
  - Pagination (5 per page)
  - Actions: View, Edit, Delete
  - Zod validation for create/edit form
  - Terms & Conditions checkbox required
  - Optional document upload (use existing FileUploader)
  - Anonymous toggle
- Ensure submission is blocked after “new idea closure date”.

---

### 4) IdeaFeeds — Card View (Normal Users)

- New Page: pages/idea/IdeaFeedsPage.tsx
- Card layout:
  - Title, category tags, snippet, anonymous indicator
  - Thumbs Up / Thumbs Down counts
  - Comment count & view count
- Comment entry:
  - Use drawer (Offcanvas) to submit comments
  - Comment list inside drawer
- Add route /ideas/feeds in AppRootRoutes and configs/routes

---

### 5) Comments & Reactions

- Comments can be added (with optional anonymous flag).
- Reaction (Thumbs Up / Down) can be given once per idea.
- Display counts in list and feed cards.

---

### 6) Content Reports (Approve / Reject)

- Page: pages/content-report/ContentReportListPage.tsx
- Table view with:
  - Status filter
  - Approve / Reject actions
  - Delete action (confirm modal)
  - Read-only detail modal
- Use zod in any create/edit forms (if needed).

---

### 7) Master Data CRUD

Implement same CRUD pattern for:

- Department
- Academic Year (closure dates)
- Idea Category
- Report Category
- Roles & Permissions (if UI present)

Rules:

- Idea categories can only be deleted if unused (disable delete in UI).

---

### 8) Dashboard

- Page: pages/dashboard/DashboardHomePage.tsx
- Add required lists:
  - Most Popular Ideas
  - Most Viewed Ideas
  - Latest Ideas
  - Latest Comments
- Add Quick Menu button in breadcrumb actions to “Add New Idea”.

---

### 9) Navigation & Routing

- Update routes/AppRootRoutes.tsx and configs/routes.ts:
  - Add /ideas/feeds
  - Ensure report category path matches pages/master/report-category/ReportCategoryListPage.tsx
- Clean up menu:
  - Remove unrelated demo items
  - Add QA-specific sections (Dashboard, Ideas, Idea Feeds, Reports, Masters)

---

### 10) UX & Responsiveness

- Make all pages responsive (cards and tables adapt on mobile/tablet).
- Use consistent spacing and layout from existing component design.

---

### Verification Checklist

- Pagination shows 5 rows per page.
- Filters and search work on list views.
- Create/edit forms validate with zod.
- Idea submission blocked after closure date.
- Comments allowed until final closure date.
- Approve/Reject actions work in reports.
- Delete actions show confirmation modal.
- IdeaFeeds renders card view with drawer comments.
- Dashboard shows all required lists + quick add.

My feedback:

- instead of writine useReactTable hook in every table pages, write re-usable adapter CommonDataTable component to accept required props
- remove unnecessary quick search, notification and account settings
- instead of menu dropdown in side menu , apply section based module with icons,
- develop also UserList with CRUD operations, and assign role to user in user form with existign code style
- move breadcrumb under dashboard's title and add button with left justify between from partent component in very pages,
- you should write to implement DashboardPage to drop breadcrums, page title and other permission related props as demo
- Update Ubold app icon to brand icon in public folder and use it in the app manifest and favicon.
- update also page with related page name

My feedback:

- apply Users as separate title with menu
- change icon under master module menus in side bar
- add new idea button in side bar menu, also for logout button
- remove profile link in header
- add linking from login (/auth/login) to dashboard (/d/dashboard) after successful login, and also add logout button in sidebar with linking to login page
- add csv report function in idea list page, remove dashbaord home page content and just put coming soon label
- refactor comments UI for idea feeds page, use drawer to show comment list and comment entry form, also add reply feature and attachment adding in replying comment
