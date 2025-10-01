# PriorityMatrix 📋

A modern todo application with Eisenhower Matrix prioritization, built with React Router, Supabase, and TypeScript.

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Overview

PriorityMatrix helps you organize tasks using the Eisenhower Matrix framework, categorizing tasks by importance and urgency. Features include:

- 📊 Interactive Eisenhower Matrix for task positioning
- 🎯 Visual priority-based task organization
- 🖱️ Drag-and-drop task management
- 📅 Due date tracking
- ✅ Task status management (To Do, Scheduled, Completed)
- 🎨 Clean, accessible UI with Tailwind CSS

## 🏗️ Tech Stack

- **Framework**: [React Router v7](https://reactrouter.com/) (Remix v2 successor)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/)
- **Styling**: Tailwind CSS
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Date Utilities**: date-fns
- **Hosting**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PriorityMatrix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database setup is already complete** (schema has been applied)

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Your application will be available at `http://localhost:5173`

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Project Status](docs/PROJECT_STATUS.md)** - Current implementation status and features
- **[Style Guide](docs/StyleGuide.md)** - Design system, colors, typography, and accessibility guidelines

## 🎨 Key Features

### Eisenhower Matrix

Tasks are positioned on a 2D graph based on:
- **Importance** (Y-axis): How critical the task is to your goals
- **Urgency** (X-axis): How time-sensitive the task is

The matrix creates four quadrants:
- **DO FIRST** (High Importance, High Urgency) - Critical and time-sensitive
- **SCHEDULE** (High Importance, Low Urgency) - Important but can be planned
- **DELEGATE** (Low Importance, High Urgency) - Urgent but not important
- **ELIMINATE** (Low Importance, Low Urgency) - Consider removing

### Task Management

- **Priority Sorting**: "To Do" column automatically sorts by calculated priority
- **Drag & Drop**: Move tasks between To Do, Scheduled, and Completed columns
- **Due Dates**: Optional due date tracking with visual indicators
- **Loading States**: Smooth animations and feedback

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Testing (when configured)
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

### Project Structure

```
PriorityMatrix/
├── app/
│   ├── components/         # React components
│   │   ├── ImportanceUrgencyGraph.tsx
│   │   ├── TaskCard.tsx
│   │   └── TodoColumn.tsx
│   ├── lib/               # Utility functions
│   │   ├── supabase.server.ts
│   │   └── utils.ts
│   ├── routes/            # Route components
│   │   ├── _index.tsx
│   │   ├── add-todo.tsx
│   │   ├── add-todo.position.tsx
│   │   ├── add-todo.saving.tsx
│   │   └── todos.tsx
│   ├── types/             # TypeScript types
│   │   └── todo.ts
│   └── app.css            # Global styles
├── docs/                  # Documentation
│   ├── PROJECT_STATUS.md
│   └── StyleGuide.md
├── public/                # Static assets
└── .env                   # Environment variables (not committed)
```

### Database Schema

The `todos` table structure:

```sql
create table todos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  due_date date,
  importance integer not null check (importance >= 0 and importance <= 100),
  urgency integer not null check (urgency >= 0 and urgency <= 100),
  status text not null default 'todo' check (status in ('todo', 'scheduled', 'completed')),
  position integer not null default 0,
  completed_at timestamp with time zone
);
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables** in the Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### Docker Deployment

```bash
# Build the Docker image
docker build -t priority-matrix .

# Run the container
docker run -p 3000:3000 priority-matrix
```

The containerized application can be deployed to:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## 🎯 Roadmap

- [ ] User authentication
- [ ] Task editing functionality
- [ ] Task deletion with confirmation
- [ ] Search and filtering
- [ ] Dark mode
- [ ] Mobile responsive design improvements
- [ ] Task notes and descriptions
- [ ] Recurring tasks
- [ ] Task categories/tags

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the project's coding standards (see `.claude/rules.md`)
2. Reference the `StyleGuide.md` for UI/UX consistency
3. Write tests for new features
4. Ensure accessibility standards are met
5. Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Eisenhower Matrix concept by Dwight D. Eisenhower
- Built with [React Router](https://reactrouter.com/)
- Database by [Supabase](https://supabase.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ using React Router and Supabase**