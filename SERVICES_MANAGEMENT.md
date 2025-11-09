# Services Management System

## Overview
The admin can now manage services that appear in the user's Services and Promo Deals pages **without using Firebase**. All data is stored in a shared file and managed through the Admin panel.

## How It Works

### Shared Data File
**Location:** `constants/servicesData.ts`

This file contains:
- **servicesData[]** - Array of all services (5 default services)
- **promoDeals[]** - Array of all promo deals (7 default promos)
- Helper functions: `addService()`, `updateService()`, `deleteService()`, `getServices()`, `getPromos()`

### Admin Management
**Location:** `app/admin/ManageServices.tsx`

The admin can:
1. **View all services** - Lists all services from the shared data
2. **Add new service** - Click the + button to add a new service
   - Required fields: Name, Price, Image URL
   - Optional: Description
3. **Edit service** - Click the edit (pencil) button to modify a service
4. **Delete service** - Click the delete (trash) button to remove a service

### User Pages
**Services Page:** `app/services.tsx`
- Displays all services from `getServices()`
- Shows service cards with images, prices, descriptions
- Changes made by admin appear here automatically

**Promo Deals Page:** `app/promodeals.tsx`
- Displays all promos from `getPromos()`
- Shows promo cards with badges, discounts
- Changes made by admin appear here automatically

## Workflow

```
Admin Panel (ManageServices)
    ↓
Add/Edit/Delete Service
    ↓
Updates servicesData in constants/servicesData.ts
    ↓
User sees updated services in:
    - Services Page (app/services.tsx)
    - Promo Deals Page (app/promodeals.tsx)
```

## Default Services

1. **Haircut & Styling** - ₱250 - ₱400
2. **Hair Color** - ₱800 - ₱1,500
3. **Rebond & Treatment** - ₱1,200 - ₱2,500
4. **Nail Care** - ₱300 - ₱600
5. **Makeup & Glam** - ₱800 - ₱2,000

## Default Promo Deals

1. **30% Off Hair Rebond** - HOT DEAL
2. **Free Manicure with Haircut** - BUNDLE
3. **Holiday Glow Makeup** - LIMITED
4. **Hair Color Treatment** - NEW
5. **Weekend Relax Package** - WEEKENDS
6. **Student Special Cut** - STUDENT

## Important Notes

- **No Firebase/Firestore** - All data is stored locally in the shared file
- **Real-time updates** - Changes reflect immediately across all pages
- **Image URLs** - Services require image URLs (can use any public image URL)
- **Data persistence** - Data persists during the app session but resets on app restart (stored in memory)

## Future Enhancements

To make data persist across app restarts, you could:
1. Use AsyncStorage to save the data locally
2. Use a backend API to store data
3. Use Firebase (if needed in the future)
