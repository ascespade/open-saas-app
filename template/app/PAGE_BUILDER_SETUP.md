# Page Builder Setup Guide

## ✅ Integration Complete

The visual page builder has been successfully integrated into your Open SaaS project!

## 📋 Pre-Run Checklist

Before running the application, complete these steps:

### 1. Database Migration
Run the database migration to create the new `Page` and `Component` tables:

```bash
cd template/app
wasp db migrate-dev
```

This will:
- Create the `Page` table with fields: id, name, slug, componentTree, isPublished, etc.
- Create the `Component` table with fields: id, type, props, styles, parentId, order
- Link both tables to the `User` table

### 2. Verify Dependencies
All required dependencies have been installed:
- ✅ `react-dnd` and `react-dnd-html5-backend` (for drag-and-drop)
- ✅ `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (alternative drag-and-drop)
- ✅ All UI components (Button, Input, Label, Select, Dialog) are available

### 3. Start the Application
After migration, start the development server:

```bash
wasp start
```

### 4. Access the Page Builder
Once the app is running:
- Navigate to `/page-builder` to see your pages list
- Click "New Page" to create your first page
- The welcome screen will appear on first visit

## 🎯 Features Available

### Component Library
- **Container**: Flexible layout containers
- **Text**: Editable text content
- **Button**: Interactive buttons
- **Image**: Image display
- **Heading**: H1-H6 headings

### Editor Features
- **Drag & Drop**: Drag components from library to canvas
- **Visual Selection**: Click components to select and edit
- **Property Panel**: Edit component properties and styles
- **Preview Mode**: Toggle between edit and preview
- **Save/Load**: Persist pages to database

### Navigation
- Page Builder link added to main navigation menu
- Accessible from authenticated user dashboard

## 📁 File Structure

```
template/app/src/page-builder/
├── types.ts                    # TypeScript types and interfaces
├── operations.ts               # Server-side operations (save, load, delete)
├── PageBuilderPage.tsx         # Main editor page
├── PageListPage.tsx            # Pages list view
├── FirstRunConfig.tsx          # Welcome screen for first-time users
└── components/
    ├── ComponentLibrary.tsx    # Component library sidebar
    ├── Canvas.tsx              # Main canvas area
    ├── RenderComponent.tsx     # Component renderer
    └── PropertyPanel.tsx       # Property editor panel
```

## 🔧 Configuration

### Routes Added
- `/page-builder` - Pages list
- `/page-builder/edit?id=<pageId>` - Page editor

### Database Models
- `Page` - Stores page metadata and component tree
- `Component` - Stores individual component data (optional, currently using JSON in Page)

### Wasp Operations
- `getPage` - Fetch a single page
- `getUserPages` - Fetch all user's pages
- `savePage` - Create or update a page
- `deletePage` - Delete a page

## 🚀 Next Steps

1. **Run Migration**: `wasp db migrate-dev`
2. **Start App**: `wasp start`
3. **Create First Page**: Navigate to `/page-builder` and click "New Page"
4. **Customize**: Add more component types as needed

## 📝 Notes

- Pages are stored as JSON in the `componentTree` field
- Components support nested structures (containers can have children)
- All pages are user-scoped (users can only see/edit their own pages)
- Admin users can access any page (for moderation)

## 🐛 Troubleshooting

If you encounter issues:

1. **Migration Errors**: Make sure PostgreSQL is running and DATABASE_URL is set
2. **Type Errors**: Run `wasp clean` then `wasp start` to regenerate types
3. **Import Errors**: Verify all dependencies are installed with `npm install`

## ✨ Enjoy Building!

Your visual page builder is ready to use. Start creating beautiful pages with drag-and-drop!

