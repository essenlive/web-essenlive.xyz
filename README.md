# 🚀 Notion-ShadCN-Website

**Your personal website ready in 1 minute!** ⚡

A beautiful, fast, and modern website/portfolio powered by Notion as a headless CMS and built with Next.js 16 + React 19 + ShadCN/UI. No database setup, no complex configuration - just connect your Notion workspace and you're ready to go!

## ✨ Features

- 🎨 **Beautiful UI** - Clean, modern design with ShadCN/UI components
- 📝 **Notion as Headless CMS** - Manage your content in Notion with a flexible JSON structure
- 🌙 **Dark/Light Mode** - System-aware theme with manual toggle support
- 📱 **Fully Responsive** - Perfect on all devices with mobile navigation
- ⚡ **Lightning Fast** - Built with Next.js 16, React 19 (Turbopack) and optimized for performance
- 🗂️ **Flexible Routing** - Support for both pages and database views with custom paths
- 📊 **Mermaid Diagrams** - Support for flowcharts and diagrams
- 🎯 **SEO Ready** - Automatic meta tags and OpenGraph support
- 🖼️ **Image Optimization** - Automatic image downloading and caching from Notion
- 🔧 **Type-Safe** - Full TypeScript support throughout the codebase

## 🎯 Quick Start (1 Minute Setup!)

### 1. Fork & Clone

```bash
git clone https://github.com/essenlive/web-essenlive.xyz
cd web-essenlive.xyz
npm install
```

### 2. Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "My Website")
4. Copy the "Internal Integration Token" → This is your `NOTION_SECRET`
5. Share your Notion pages/databases with the integration

### 3. Setup Environment

Create a `.env.local` file with your configuration:

```env
# 🔑 Notion API (Required)
NOTION_SECRET=your_notion_integration_secret_here

# 🌐 Site Configuration (Required)
SITE_DATA={"sitename": "YourSite", "structure": {"/": {"type": "page", "id": "your-page-id"}, "/blog": {"type": "database", "id": "your-database-id", "filter": {"property": "Status", "status": {"equals": "Published"}}, "sorts": [{"property": "Date", "direction": "descending"}]}}, "socials": {"mail": "mailto:hello@example.com", "github": "https://github.com/yourusername"}}
```

**SITE_DATA Structure:**
- `sitename`: Your website name (displayed in navigation)
- `structure`: Object mapping URL paths to Notion pages or databases
  - `type`: Either "page" or "database"
  - `id`: Notion page/database ID (found in the page URL)
  - `filter`: (Optional) Database query filter
  - `sorts`: (Optional) Database sort order
- `socials`: (Optional) Social media links for the navigation bar

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site!

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack)
- **React**: React 19
- **Styling**: Tailwind CSS 4 + ShadCN/UI
- **CMS**: Notion API (@notionhq/client)
- **Language**: TypeScript 5
- **Theme**: next-themes with system preference support
- **Icons**: Lucide React
- **Diagrams**: Mermaid.js
- **Code Highlighting**: Prism.js via react-syntax-highlighter
- **Deployment**: Vercel, Netlify, or any Node.js host

## 📁 Project Structure

```plaintext
├── app/
│   ├── [...slug]/         # Catch-all dynamic routes
│   │   └── page.tsx       # Dynamic page handler
│   ├── page.tsx           # Homepage (root path handler)
│   ├── layout.tsx         # Root layout with navigation
│   └── globals.css        # Global styles
├── components/
│   ├── notion/            # Modular Notion block renderers
│   │   ├── page.tsx       # Page view component
│   │   ├── database.tsx   # Database list view component
│   │   ├── notion-renderer.tsx  # Main block router
│   │   ├── rich-text.tsx  # Rich text formatting
│   │   ├── text-blocks.tsx     # Headings, paragraphs, quotes
│   │   ├── list-blocks.tsx     # Lists and todos
│   │   ├── media-blocks.tsx    # Images, videos, files
│   │   └── layout-blocks.tsx   # Columns, toggles, tables
│   ├── ui/                # ShadCN/UI components
│   ├── navigation.tsx     # Header with responsive menu
│   ├── theme-provider.tsx # Theme context provider
│   ├── theme-toggle.tsx   # Dark/light mode toggle
│   ├── page-card.tsx      # Database item card
│   ├── code.tsx           # Code block with syntax highlighting
│   └── mermaid-diagram.tsx # Mermaid diagram renderer
├── lib/
│   ├── notion.ts          # Notion API client & data fetching
│   ├── types.ts           # TypeScript type definitions
│   └── utils.ts           # Utility functions
├── public/
│   └── images/            # Auto-downloaded Notion images
└── .env.local             # Environment configuration
```

## 🎨 Customization

### Styling

- Modify [app/globals.css](app/globals.css) for global styles
- Use ShadCN/UI components in [components/ui/](components/ui/)
- Customize theme colors using Tailwind CSS 4 configuration

### Site Configuration

The `SITE_DATA` environment variable controls your entire site structure:

**Pages**: Map a URL path directly to a Notion page
```json
"/about": {"type": "page", "id": "notion-page-id"}
```

**Databases**: Map a URL path to a filtered/sorted Notion database
```json
"/projects": {
  "type": "database",
  "id": "notion-database-id",
  "filter": {"property": "Status", "status": {"equals": "Published"}},
  "sorts": [{"property": "Date", "direction": "descending"}]
}
```

### Supported Notion Blocks

The renderer automatically supports:
- 📝 Rich text with formatting (bold, italic, code, strikethrough)
- 📑 Headings (H1, H2, H3)
- 🖼️ Images, videos, and files
- 📊 Tables
- 🔗 Links and bookmarks
- ✅ Todo lists and checklists
- 📋 Code blocks with syntax highlighting (via Prism.js)
- 📈 Mermaid diagrams
- 💬 Quotes and callouts
- 📦 Toggle lists and columns
- 🔢 Bulleted and numbered lists
- ➗ Dividers

### Adding Custom Block Types

Add new block renderers in [components/notion/](components/notion/) following the modular structure. Each file handles specific block types:
- Text blocks: paragraphs, headings, quotes
- List blocks: bulleted, numbered, todos
- Media blocks: images, videos, files
- Layout blocks: columns, toggles, tables

## 🚀 Deployment

- **Netlify**: Add environment variables in site settings
- **Railway**: Works great with Node.js apps
- **DigitalOcean App Platform**: Fully compatible
- **Self-hosted**: Run `npm run build && npm start`

### Environment Variables

Make sure to set these in your deployment platform:
- `NOTION_SECRET`: Your Notion integration token
- `SITE_DATA`: Your site configuration JSON (sitename, structure, socials)

## 📝 Content Management

### Creating Pages

1. Create a page in Notion
2. Share it with your integration
3. Add the page ID to your `SITE_DATA` structure with the desired URL path
4. Rebuild/redeploy your site

### Creating Database Collections

1. Create a database in Notion (for blog posts, projects, etc.)
2. Share it with your integration
3. Add the database ID to your `SITE_DATA` structure
4. Optionally add filters and sorts
5. Each database item automatically gets its own URL: `/path/page-title`

### Dynamic Routing

- Root path (`/`): Defined in `SITE_DATA.structure["/" ]`
- Custom paths (`/blog`, `/projects`): Defined in `SITE_DATA.structure`
- Database items: Auto-generated as `/parent-path/slug`
- Catch-all routes handled by [app/[...slug]/page.tsx](app/[...slug]/page.tsx)

## 🔧 Advanced Features

### Image Optimization

Images from Notion are automatically:
- Downloaded to `public/images/`
- Cached by MD5 hash to prevent duplicates
- Converted to optimized formats
- Served locally for faster load times

### Theme System

The theme system supports:
- Light and dark modes
- System preference detection (prefers-color-scheme)
- Manual toggle via navigation bar
- Persistent theme selection
- No flash on page load

### SEO & Metadata

Each page automatically generates:
- Dynamic meta tags from Notion content
- OpenGraph tags for social sharing
- Twitter Card metadata
- Favicon from page emoji/icon
- Proper HTML semantic structure

### Type Safety

Full TypeScript support with:
- Strict type checking enabled
- Type definitions for all Notion blocks
- Type-safe API responses
- IntelliSense support throughout

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this for your own website or portfolio!

## 🙏 Acknowledgments

- [Notion](https://notion.so) for the powerful API and CMS
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful, accessible components
- [Next.js](https://nextjs.org/) for the incredible React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Vercel](https://vercel.com/) for seamless deployment

---

**Built thanks to my previous iteration but espacially **

- [Notion-ShadCN-Blog](https://github.com/ddoemonn/Notion-ShadCN-Blog)
- [notion-blog-nextjs](https://github.com/samuelkraft/notion-blog-nextjs)


## ✅ To Do

- [ ] Manage differente pages with same database and other filters
- [ ] Optimize static generation
- [ ] Manage more notion blocks and properties.
- [ ] Optimize images at downlaod
- [ ] Build a [low tech version](https://solar.lowtechmagazine.com/2018/09/how-to-build-a-low-tech-website/)