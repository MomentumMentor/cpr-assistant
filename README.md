# CPR Assistant

A Next.js 14 application for creating structured Context-Purpose-Results (CPR) documents with AI assistance.

## Features

- **AI-Powered Document Creation**: Leverages OpenAI's GPT-4o-mini for intelligent document generation
- **Structured Workflow**: Guides users through Context, Purpose, and Results sections
- **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Database Integration**: Uses Supabase for data persistence
- **Responsive Design**: Mobile-friendly interface with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI SDK (gpt-4o-mini)
- **Database**: Supabase
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Supabase account and project

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Getting Your API Keys

**OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key

**Supabase Keys:**
1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Project Settings > API
4. Copy the Project URL, anon/public key, and service_role key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cpr-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Test API Configuration

Visit `/api/test` to verify your environment variables are configured correctly:

```bash
curl http://localhost:3000/api/test
```

Expected response:
```json
{
  "status": "ok",
  "hasOpenAI": true,
  "hasSupabase": true
}
```

## Project Structure

```
/app
  /page.tsx                 # Homepage
  /dashboard
    /page.tsx              # Dashboard with CPR list
  /cpr
    /new
      /page.tsx            # CPR creation wizard
  /api
    /test
      /route.ts            # API test endpoint

/lib
  /openai.ts               # OpenAI client configuration
  /supabase
    /client.ts             # Browser Supabase client
    /server.ts             # Server Supabase client

/components
  /ui                      # shadcn/ui components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment

### Vercel (Recommended)

1. Push your code to a Git repository
2. Import the project in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to configure all environment variables in your deployment platform.

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
