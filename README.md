# Sheldon AI

Sheldon AI automatically transforms your daily development activity into polished blog posts and notes. By connecting to platforms like Github, it creates summaries of the work you've accomplished every day and spits it out in specific formats. Blog posts, revision notes, documentation, you name it!
Perfect for developers who want to maintain a coding journal, share progress updates, or simply keep track of what they accomplished each day.
Sheldon AI is your content-creation buddy who aims to democratise content creation, allowing you to create written content in parallel as you code.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sheldon-ai.git
cd sheldon-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:

```
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

> **Note**: You'll need to [create a GitHub OAuth App](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) to get these credentials.

## Available Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Features

- GitHub OAuth authentication
- GitHub API integration
- Connect GitHub repos of your choice

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new).

## License

[MIT](LICENSE)
