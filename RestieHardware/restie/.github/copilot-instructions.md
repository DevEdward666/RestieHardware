# Restie Hardware - AI Agent Instructions

## Project Overview
Restie is a hybrid mobile e-commerce application for hardware inventory management and sales. Built with **Ionic React + Capacitor** for cross-platform deployment (iOS/Android/Web), it serves both customers and admin users with offline-first capabilities.

**Tech Stack:** React 18, TypeScript, Ionic Framework 7, Capacitor 5, Redux (Redux Toolkit), Dexie.js (IndexedDB), Axios, Vite

## Architecture Patterns

### State Management: Redux with Thunks
- **Store:** `src/Service/Store.ts` - Redux Toolkit configuration
- **Reducers:** `src/Service/Reducers/` - Domain-separated (Inventory, Customer, Login, Admin, Commons)
- **Actions:** `src/Service/Actions/` - Mirror reducer structure, contains async thunks
- **Pattern:** Actions call API functions, dispatch reducer actions, and return responses

```typescript
// Action Pattern (InventoryActions.ts)
export const getInventory = (payload: SearchInventoryModel) => 
  async (dispatch: Dispatch<LIST_OF_ITEMS>) => {
    const res = await getAllInventory(payload);
    dispatch({ type: "LIST_OF_ITEMS", list_of_items: res });
    return res;
  };
```

### API Layer: Centralized with Bearer Auth
- **Location:** `src/Service/API/` - Organized by domain (Inventory, Login, Admin)
- **HTTP Client:** `src/Helpers/useAxios.ts` - Wrapper around Axios with `post()`, `get()`, `getWithAuth()`, `put()`, `patch()`
- **Auth Pattern:** Nearly ALL API calls require `localStorage.getItem("bearer")` token check (throws error if missing)
- **Response:** Most endpoints return `.result.$values` array; handle exceptions for `.result` object returns

```typescript
// Standard API Pattern (InventoryApi.ts)
const getToken = localStorage.getItem("bearer");
if (!getToken) throw new Error("Token not found");

const response = await post(
  `${baseUrl}api/Inventory/endpoint`,
  { "Content-Type": "application/json", Authorization: `Bearer ${getToken}` },
  JSON.stringify(payload)
);
return response.result.$values; // or response.result
```

### Environment Configuration
- **Base URLs:** `src/Helpers/environment.ts` switches between dev/prod based on `process.env.NODE_ENV` and `VITE_LOCAL` flag
- **Dev:** `environment.dev.ts` exports `devBaseUrl`
- **Prod:** `environment.prod.ts` exports `prodBaseUrl`

### Offline-First with Dexie.js
- **Database:** `src/Service/OfflineDatabase/Database.ts` - Single Dexie instance (`user_db`)
- **Current Schema:** `deliveryInfo` table for offline delivery tracking
- **Usage:** Components query/insert using `queryItems()`, `createItem()`, `getAllItems()`, `deleteItem()` from Database.ts
- **Network Detection:** Uses `@capacitor/network` to check connection status; redirects to `/DeliverOffline` when offline (see App.tsx)

### Component Organization
- **Pages:** `src/pages/[Feature]/[FeaturePage].tsx` - Route-level components, minimal logic
- **Components:** `src/components/[Feature]/[FeatureComponent].tsx` - Actual business logic and UI
- **Pattern:** Pages wrap Components (e.g., `LoginPage.tsx` renders `LoginComponent.tsx`)

## Critical Workflows

### Authentication Flow
1. User credentials → `LoginComponent.tsx`
2. Dispatch `Login(payload)` action → calls `LoginAPI.ts`
3. On success: token stored as `localStorage.setItem("bearer", token)`
4. Additional user data stored: `user_id`, `cartid` in localStorage
5. Protected routes check token presence before API calls

### Inventory Search/Filtering
- **Model:** `SearchInventoryModel` (page, offset, limit, searchTerm, category?, brand?, filter?)
- **Actions:** `getInventory()` (initial load), `searchInventoryList()` (search), `get_brands_actions()`, `get_category_actions()`
- **Pagination:** Page-based with offset/limit
- **State:** Results stored in Redux `InventoryReducer.list_of_items`

### Cart & Orders
- `cartid` stored in localStorage for session persistence
- Cart operations: `addToCart()`, `deleteCart()`, `updateCartOrder()`
- Order flow: `SavedAndPayOrder()` → `ApprovedOrderAndPay()` → `UpdateDelivered()`
- Order retrieval: `ListOrder()` returns paginated order history
- Order details: `userOrderInfo()` for invoices, `userQuoatationOrderInfo()` for quotes

### Image Handling
- **Single Upload:** `UploadDeliveryImages()` uses FormData with `FormFile`, `Filename`, `FolderName`
- **Multiple Upload:** `UploadMultipleImages()` appends files to FormData
- **Retrieval:** `GetDeliveryImage()`, `GetMultipleimage()` by folder path
- **Pattern:** Always use `multipart/form-data` content type for file uploads

## Capacitor Native Features
- **Camera:** `src/Hooks/usePhotoGallery.ts` - Custom hook for photo capture
- **Bluetooth:** `@capacitor-community/bluetooth-le` + `@kduma-autoid/capacitor-bluetooth-printer` for receipt printing
- **Network:** `@capacitor/network` for connectivity status
- **Clipboard, Haptics, Keyboard, StatusBar:** Available via `@capacitor/*` plugins

## Development Commands
```bash
npm install --ignore-scripts  # First time setup (canvas will fail, that's OK)
npm run dev                   # Start Vite dev server (port 8100 per Ionic convention)
npm run build                 # TypeScript compile + Vite build
npm run build:vercel          # Build for Vercel deployment (skips optional canvas dependency)
npx cap sync                  # Sync web assets to native projects
npx cap open ios              # Open Xcode
npx cap open android          # Open Android Studio
npm run test.e2e              # Cypress E2E tests
npm run test.unit             # Vitest unit tests
```

## Deployment
- **Vercel:** Uses `vercel.json` config with `build:vercel` script
- **Canvas Issue:** `canvas` is marked as optional dependency - it's needed for jsPDF server-side rendering but not required for browser PDF generation
- **NPM Config:** `.npmrc` sets `legacy-peer-deps=true` for React Router v5 compatibility
- **Local Development:** Use `npm install --ignore-scripts` to skip canvas build (not needed for browser-based PDF generation)

## Naming Conventions
- **Components:** PascalCase with suffix (`LoginComponent.tsx`, `OrderListPage.tsx`)
- **API Functions:** camelCase, verb-first (`addToCart`, `getSelectedItem`, `SavedDeliveryInfo`)
- **Redux Actions:** snake_case constants (`LIST_OF_ITEMS`, `GET_BRANDS`), camelCase functions
- **Models:** PascalCase with descriptive suffixes (`SearchInventoryModel`, `PostDeliveryInfoOffline`)

## Common Pitfalls
1. **Missing Auth Token:** Always check `localStorage.getItem("bearer")` before API calls; most endpoints will fail silently or throw errors
2. **Response Structure:** Backend returns `.result.$values` for arrays; check specific endpoints that return `.result` directly
3. **Ionic Mode:** Project uses `mode="ios"` globally (`setupIonicReact({ mode: "ios" })`) for consistent iOS-style UI across platforms
4. **Offline Sync:** When adding offline features, must update Dexie schema in `Database.ts` with version bump
5. **Environment Variables:** Use `VITE_*` prefix for Vite env vars; access via `import.meta.env.VITE_*`

## Privacy & Compliance
- Privacy Policy page at `/privacy` (PrivacyPolicyPage.tsx) - Meta/Facebook + Philippine Data Privacy Act compliant
- Terms of Service at `/terms` (TermsOfServicePage.tsx)
- Footer component (`src/components/Footer/Footer.tsx`) includes policy links
- PrivacyConsent component available for forms requiring explicit consent

## Key Files Reference
- **Main Entry:** `src/main.tsx` → Redux Provider + Router setup
- **Routes:** `src/App.tsx` - All route definitions with network status monitoring
- **Tab Navigation:** `src/pages/Tabs/MainTab.tsx` - Bottom tab bar configuration
- **Redux Root:** `src/Service/Reducers/RootReducers.ts` - Combined reducers
- **Global Types:** `src/Service/Types/` - Redux action types by domain
