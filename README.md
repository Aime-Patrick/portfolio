# Portfolio

This is a personal portfolio website built with **React** and **Tailwind CSS**. It showcases your skills, projects, and contact information in a modern, responsive design.

## Features

- **Home:** Introduction, profile image, and social links.
- **About:** Experience, skills, and background.
- **Services:** Highlights of your offerings (Web Design, Development, Mobile App).
- **Projects:** Featured projects with images, descriptions, and links.
- **Contact:** Contact form and social links.
- **AI Chatbot:** N8N-powered chatbot with GitHub and portfolio scraping for comprehensive visitor assistance.
- **Admin Dashboard:** Full CMS for managing content (projects, services, profile, messages).
- **Theme Toggle:** Switch between light and dark modes.
- **Responsive Design:** Optimized for desktop and mobile.
- **Animated Transitions:** Smooth scroll and reveal animations.
- **SEO Optimized:** Enterprise-level SEO with structured data, social media optimization, and performance enhancements.
- **PWA Ready:** Progressive Web App capabilities with offline support preparation.

## Tech Stack

### Frontend
- [React 19](https://reactjs.org/) with TypeScript
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [React Router DOM](https://reactrouter.com/) - Routing
- [React Icons](https://react-icons.github.io/react-icons/) - Icons

### Backend & Services
- [Firebase](https://firebase.google.com/) - Authentication, Firestore Database, Storage
- [EmailJS](https://www.emailjs.com/) - Contact form
- [N8N](https://n8n.io/) - Chatbot automation

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory
   - Add your Firebase and N8N credentials
   - See `ENVIRONMENT_VARIABLES.md` for details

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## Additional Setup

- **Environment Variables:** See `ENVIRONMENT_SETUP.md` for required environment variables setup
- **Firebase Setup:** See `FIREBASE_SETUP.md` for detailed Firebase configuration
- **Cloudinary Setup:** See `CLOUDINARY_SETUP_GUIDE.md` for image upload configuration (5 min setup)
- **N8N Chatbot:** See `AI_AGENT_SYSTEM_PROMPT.md` for chatbot integration guide
- **SEO Optimization:** See `SEO_SUMMARY.md` for comprehensive SEO improvements
- **Deployment:** See `DEPLOYMENT_CHECKLIST.md` for complete deployment guide
- **Project Audit:** See `PROJECT_AUDIT_REPORT.md` for comprehensive project analysis

## Folder Structure

```
portfolio/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── Chatbot.tsx     # N8N-powered chatbot
│   │   ├── Header.tsx      # Main navigation
│   │   └── ...
│   ├── Sections/           # Main portfolio sections
│   │   ├── HomeSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   └── ContactSection.tsx
│   ├── firebase.ts         # Firebase configuration
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                 # Static assets
├── scripts/               # Utility scripts
├── firestore.rules        # Firestore security rules
└── package.json
```

## Key Routes

- `/` - Main portfolio (public)
- `/login` - Admin login
- `/admin` - Admin dashboard (protected)
  - `?section=dashboard` - Dashboard home
  - `?section=projects` - Manage projects
  - `?section=services` - Manage services
  - `?section=profile` - Edit profile
  - `?section=messages` - View messages
  - `?section=settings` - Site settings

## SEO Features

This portfolio includes enterprise-level SEO optimization:

### Technical SEO
- ✅ **robots.txt** - Search engine crawler instructions
- ✅ **sitemap.xml** - Complete site structure with images
- ✅ **manifest.json** - PWA configuration
- ✅ **Structured Data** - 3 Schema.org JSON-LD schemas (Person, WebSite, ProfessionalService)
- ✅ **Performance Headers** - Preconnect, DNS prefetch, caching
- ✅ **Security Headers** - XSS protection, frame options, content type

### On-Page SEO
- ✅ **Optimized Meta Tags** - Title, description, keywords
- ✅ **Open Graph Tags** - Facebook/LinkedIn preview optimization
- ✅ **Twitter Cards** - Twitter preview optimization
- ✅ **Canonical URLs** - Proper URL structure
- ✅ **Mobile Optimization** - Responsive design with proper viewport

### Target Keywords
- Full Stack Developer Rwanda
- Software Engineer Kigali
- React Developer Portfolio
- Node.js Developer
- TypeScript Expert
- Web Development Services Rwanda

### SEO Score: 9/10 ⭐

For detailed information:
- `SEO_SUMMARY.md` - Overview of all SEO improvements
- `SEO_ACTION_CHECKLIST.md` - Post-deployment tasks
- `SEO_IMPROVEMENTS.md` - Detailed analysis and strategy

## Customization

- **Content:** Use the admin dashboard at `/admin` to update projects, services, and profile
- **Styling:** Modify Tailwind classes or update `index.css` for custom styles
- **Chatbot:** Configure your N8N workflow to customize chatbot behavior
- **Colors:** Update CSS variables in `index.css` (`:root` section)
- **SEO:** Update meta tags in `index.html` for your specific keywords

---

Feel free to use and modify this portfolio for your own needs. Happy coding! 🚀