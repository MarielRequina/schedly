# Admin Section Structure

## Overview
All admin-related files are now organized in the `/app/admin` folder with a dedicated layout and navigation system.

## File Structure

```
app/
├── admin/
│   ├── _layout.tsx          # Admin-specific layout with navigation
│   ├── index.tsx            # Admin login page
│   ├── dashboard.tsx        # Manage Appointments (approve/reject bookings)
│   └── services.tsx         # Manage Services (add/edit/delete services)
├── _layout.tsx              # User layout (hides for admin routes)
└── [other user files...]
```

## Admin Routes

### Login
- **Path:** `/admin` or `/admin/`
- **Credentials:**
  - Email: `admin@schedly.com`
  - Password: `admin123`

### Dashboard (Manage Appointments)
- **Path:** `/admin/dashboard`
- **Features:**
  - View all bookings in real-time
  - Approve bookings (✅)
  - Reject bookings (❌)
  - Set back to pending (🕓)
  - Sends notifications to users

### Manage Services
- **Path:** `/admin/services`
- **Features:**
  - View all services
  - Add new services (name, price, duration, description)
  - Edit existing services
  - Delete services
  - Real-time updates from Firebase

## Admin Navigation Bar

The admin layout includes a bottom navigation with:
1. **Dashboard** - Manage appointments
2. **Services** - Manage services
3. **Logout** - Return to admin login

## Removed Files

- ❌ `app/adminDashboard.tsx` (moved to `app/admin/dashboard.tsx`)
- ❌ `app/salonDetails.tsx` (unused/orphaned file)

## Key Features

### Separation of Concerns
- Admin routes are completely separated from user routes
- Admin has its own layout with purple theme (#6B46C1)
- User layout automatically hides when on admin routes

### Firebase Integration
- Real-time data updates using Firestore snapshots
- Automatic notifications sent to users on booking status changes
- Services stored in `services` collection
- Bookings stored in `bookings` collection

### Navigation Flow
```
Admin Login (/admin)
    ↓
Admin Dashboard (/admin/dashboard)
    ↔ Manage Services (/admin/services)
    ↓
Logout → Back to Admin Login (/admin)
```

## Development Notes

- Admin layout uses Expo Router's nested routing
- TypeScript interfaces defined for type safety
- Consistent styling with purple theme
- Modal-based forms for adding/editing services
