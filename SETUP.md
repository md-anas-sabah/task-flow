# Setup Guide for TaskFlow

This guide will help you set up and run the TaskFlow application locally.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update these values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API key

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

## Detailed Setup

### 1. PostgreSQL Setup

#### Option A: Local PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb taskmanager
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb taskmanager
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Option B: Cloud PostgreSQL (Recommended for Production)

Free options:
- [Neon](https://neon.tech) - Free tier with 0.5GB storage
- [Supabase](https://supabase.com) - Free tier with 500MB storage
- [Railway](https://railway.app) - Free tier available

### 2. Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager?schema=public"

# NextAuth (Generate secret: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# AI Features (Optional - Get from platform.openai.com)
OPENAI_API_KEY="sk-..."
```

### 3. Database Migration

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# (Optional) View database in Prisma Studio
npm run db:studio
```

### 4. First User

Register your first user at `http://localhost:3000/register`

The first user will have USER role. You can manually update to ADMIN in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Customization

### Update Footer Information

Edit `src/components/layout/footer.tsx`:

```typescript
const GITHUB_USERNAME = "yourusername"  // Your GitHub username
const LINKEDIN_PROFILE = "yourprofile"  // Your LinkedIn profile
const YOUR_NAME = "Your Name"           // Your name
```

### Update README

Edit `README.md` and replace:
- Author name
- GitHub username
- LinkedIn profile

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/taskflow.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (set to your Vercel URL)
     - `OPENAI_API_KEY` (optional)
   - Click "Deploy"

3. **Set up Database**
   - Use Vercel Postgres, or
   - Use Neon/Supabase and update `DATABASE_URL`

### Deploy to Other Platforms

#### Railway
- Auto-detects Next.js
- Provides PostgreSQL addon
- Deploy with one click

#### Render
- Free PostgreSQL included
- Auto-deploys from GitHub
- Good for side projects

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL is correct
- Check firewall settings

**Error: "Schema not found"**
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Build Errors

**Error: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Prisma Client errors**
```bash
npx prisma generate
```

### NextAuth Errors

**Error: "NEXTAUTH_SECRET missing"**
```bash
openssl rand -base64 32
# Add output to .env as NEXTAUTH_SECRET
```

## Development Tips

### Useful Commands

```bash
# View database
npm run db:studio

# Reset database
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name

# Format code
npm run lint

# Build for production
npm run build
```

### VS Code Extensions

Recommended extensions:
- Prisma (prisma.prisma)
- Tailwind CSS IntelliSense
- ESLint
- TypeScript

## Next Steps

1. Customize the application:
   - Update branding and colors
   - Add your own features
   - Modify task statuses/priorities

2. Add more features:
   - Email notifications
   - File uploads
   - Calendar view
   - Team chat

3. Optimize for production:
   - Set up monitoring (Sentry)
   - Add analytics (PostHog, Plausible)
   - Configure CDN
   - Set up backups

## Support

If you encounter issues:
1. Check this SETUP.md file
2. Review README.md
3. Check Prisma docs: [prisma.io/docs](https://prisma.io/docs)
4. Check Next.js docs: [nextjs.org/docs](https://nextjs.org/docs)

---

Good luck with your assignment! 🚀
