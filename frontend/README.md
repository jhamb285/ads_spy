# AdSpy Tool - Frontend

Modern Next.js 14 frontend for the AdSpy Tool with brand management and ad search capabilities.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: SWR for data fetching and caching
- **Icons**: Lucide React

## Features

### 1. Home Page (`/`)
- Welcome dashboard with quick links
- Overview of system capabilities
- Quick start guide

### 2. Brand Management (`/brands`)
- View all tracked brands
- Add new brands with Facebook page URL
- Edit brand information
- Toggle active/inactive status
- Delete brands
- Search/filter brands
- View scraping statistics (total ads, last scraped date)

### 3. Ad Search (`/search`)
- Search ads by keywords
- Full-text search across:
  - Ad copy/body
  - Hook analysis
  - Angle analysis
  - Structure analysis
- Debounced search (300ms)
- Grid layout with ad previews
- Click to view full details

### 4. Ad Detail (`/search/[id]`)
- Full ad creative display
- Three-tab layout:
  - **Breakdown**: Hook, angle, and structure analysis
  - **Copy**: Full ad copy, captions, descriptions, transcripts
  - **Analysis**: Why it works, improvements, rewritten version
- Copy-to-clipboard functionality for all text sections
- Metadata display (ID, brand, dates, status)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3001` (or configure via env)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://your-vps-domain.com
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with navbar
│   ├── page.tsx                # Home page
│   ├── brands/
│   │   └── page.tsx            # Brand management page
│   └── search/
│       ├── page.tsx            # Search page
│       └── [id]/
│           ├── page.tsx        # Ad detail page
│           └── not-found.tsx   # 404 page
├── components/
│   ├── layout/
│   │   └── navbar.tsx          # Navigation bar
│   ├── brands/
│   │   ├── brand-list.tsx      # Brand list container
│   │   ├── brand-table.tsx     # Brand table with actions
│   │   ├── add-brand-dialog.tsx
│   │   ├── edit-brand-dialog.tsx
│   │   └── delete-brand-dialog.tsx
│   ├── search/
│   │   ├── search-interface.tsx # Search container
│   │   ├── search-bar.tsx       # Search input
│   │   ├── ad-results-grid.tsx  # Results grid
│   │   ├── ad-card.tsx          # Ad preview card
│   │   ├── ad-detail.tsx        # Ad detail view
│   │   └── copy-button.tsx      # Copy to clipboard
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── api.ts                   # API client functions
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Utility functions
└── .env.local                   # Environment variables
```

## API Integration

The frontend expects the following backend endpoints:

### Brand Endpoints

```typescript
GET    /api/brands              // Get all brands
POST   /api/brands              // Add new brand
PATCH  /api/brands/:id          // Update brand
DELETE /api/brands/:id          // Delete brand
```

### Ad Endpoints

```typescript
GET /api/ads/search?q={query}   // Search ads
GET /api/ads/:id                // Get ad by ID
```

See `lib/api.ts` for full API client implementation.

## Design System

### Colors

- **Primary**: Black (`#000000`)
- **Background**: White (`#FFFFFF`)
- **Borders**: Black with 10% opacity (`rgba(0, 0, 0, 0.1)`)
- **Text**:
  - Primary: Black
  - Secondary: Gray 600
  - Muted: Gray 500

### Typography

- **Font**: Inter (via Google Fonts)
- **Headings**: Bold, tight tracking
- **Body**: Regular weight, comfortable line height

### Components

All UI components are from shadcn/ui with minimal customization:
- Clean, minimal aesthetic
- Black and white color scheme
- Subtle shadows on hover
- Smooth transitions

## Key Features

### SWR Data Fetching

Uses SWR for:
- Automatic caching
- Auto-revalidation
- Loading states
- Error handling
- Optimistic updates

```typescript
const { data, error, mutate } = useSWR('brands', getBrands)
```

### Debounced Search

Search queries are debounced by 300ms to reduce API calls:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query)
  }, 300)
  return () => clearTimeout(timer)
}, [query])
```

### Toast Notifications

Uses Sonner for toast notifications:
- Success messages (green)
- Error messages (red)
- Info messages (gray)

### Loading States

Skeleton components for loading states:
- Brand table skeleton
- Search results skeleton
- Maintains layout stability

### Error Handling

User-friendly error messages:
- API failures
- Network errors
- Not found pages
- Form validation

## Responsive Design

Mobile-first design with breakpoints:
- **Mobile**: 1 column
- **Tablet** (md): 2 columns
- **Desktop** (lg): 3 columns

All components are fully responsive with proper spacing and layout adjustments.

## Accessibility

- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Alt text for images
- Form labels and validation

## Future Enhancements

- [ ] Ad filtering by brand, date range, status
- [ ] Batch operations (delete multiple brands)
- [ ] Export search results to CSV
- [ ] Ad comparison view (side-by-side)
- [ ] Analytics dashboard (stats, charts)
- [ ] Dark mode support
- [ ] Real-time updates with WebSockets

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the backend has proper CORS configuration:

```typescript
// Backend: Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

### API Connection Failed

1. Check backend is running on port 3001
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check backend logs for errors

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## License

Part of the Creative Automation System project.
