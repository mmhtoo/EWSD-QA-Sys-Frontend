This project is web portal for University's QA System.
Here is question's outline for this project.
• The University has a Quality Assurance Manager to oversee the process.
• All Departments have a QA coordinator who is responsible for managing the process for their Department, and for encouraging staff to contribute.
• All staff (academic and support) have the opportunity to submit one or more ideas.
• All staff must agree to Terms and Conditions before they can submit.
• All staff can optionally upload documents to support their ideas.
• All ideas can be categorised (tagged) from a list of categories at the point when they are submitted.
• The QA Manager can add additional categories at any time, and can delete categories, but only if they have not been used.
• All staff can see all submitted ideas and can comment on any idea. They can also
give the Thumbs Up or Thumbs Down for any idea, but only once for any idea
• Ideas and comments can be posted anonymously, although the author’s details will be stored in the database so any inappropriate ideas can be investigated.• All new ideas are disabled after a closure date for new ideas, but comments can continue to be done until a final closure date.
• Once an idea is submitted the system emails a notification to the Department’s QA
Coordinator.
• The author of an idea receives an automatic email notification whenever a comment is submitted to any of their ideas.
• Lists of Most Popular Ideas (+1 for Thumbs Up, -1 for Thumbs Down), Most Viewed
Ideas, Latest Ideas and Latest Comments must be made available to all users.
• Lists of Ideas need to be paginated (5 per page)
• The University QA Manager needs to be able to download all the data after the final
closure date in a CSV file for transfer out of the system. Any uploaded documents
need to be downloaded in a ZIP file.
• An administrator is needed to maintain any system data, e.g. closure dates for each
academic year, staff details.
• Statistical analysis (e.g. number of ideas per Department) needs to be available.
• The interface must be suitable for all devices (eg mobile phones, tablets, desktops).

Your task is to write detail implementation plan for web portal. In this workspace, I've pre-configured components
under component folder. Do not edit or overwrite the existing components. Instead, you can create new components as needed to implement the features outlined above using existing component design by copying.

- I've already added required pages under pages folder with basic structure.
  You can add necessary components to these pages to implement the required features.
- routes/AppRootRoutes.tsx is for routing for application.
- Make sure to apply base type for the following to use in sample data showing outline in list data.
  - The type file is placed in /types/entity.d.ts
  - Make sure to take reference to that file
- Page layout will include breadcrumb in dashboad page, related filters (search, category filter, etc.) and pagination for list pages.
- Make sure to write common components for reusable UI elements like pagination, search filter, category filter (master data binding)
- Make sure to use Tanstack react table from existing compoent style and write re-usable component for DataTable with prop drilling
- All page will be same style for implementation CRUD, will include common useable form which form will be rendered inside models with reusable
  - validation will be used with zod,
  - detail view will be readonly with all data fields in nice UI
- You'll need to implement approve,reject action for report record
- Need to implement reusable delete comfirm modal for every delete action to re-use
- Clean up existin DashboardLayout menu without overriding referrence components and apply same design style and add new related menu,
  - remove unnecessary menu from header and add product related app

- YOUR MAIN TASK IS TO JUST WRITE IMPLEMENTATION IN /pages folder in existing files, you just to write other CRUD related models and forms
- PLEASE ADD ALSO QUICK MENU BUTTON TO ADD NEW IDEA and develop also new page for IdeaFeeds for other normal users to view without table view, with card view, must include comments and reaction count, comments must be given via drawer, import existing drawer components form by checking
