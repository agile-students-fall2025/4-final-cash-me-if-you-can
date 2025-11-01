# Contributing to Cash Me If You Can

Thank you for your interest in contributing to our project! This document outlines the guidelines and processes for contributing.

## Team Norms

### Core Values
- Communicate openly and respectfully
- Help each other when stuck
- Give constructive feedback during code reviews
- Meet deadlines and inform team if blocked
- Test your code before pushing

### Communication
- Use Discord/Whatsapp for team communication
- Respond to messages within 24 hours
- Attend all standups and sprint meetings
- Update task status regularly on GitHub

### Work Schedule
- Standups: Tuesdays 9:30 pm, Friday 4 pm, Sunday 10 pm
- Sprint planning at start of each sprint
- Sprint reviews/demos at end of each sprint
- Work on tasks between standup meetings

## Git Workflow

We follow the **Feature Branch Workflow**:

1. **Pull latest changes from main**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a new branch for your feature/task**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   Branch naming convention: `feature/feature-name` or `fix/bug-name`

3. **Make your changes and commit regularly**
   ```bash
   git add .
   git commit -m "Clear description of what you did"
   ```

4. **Push your branch to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request on GitHub**
   - Add a clear description of changes
   - Link related issue (e.g., "Closes #23")
   - Request review from at least one team member

6. **Address review feedback**
   - Make requested changes
   - Push updates to same branch

7. **Merge after approval**
   - Only merge after getting approval
   - Delete branch after merging

## Rules for Contributing

### Code Standards
- Write clean, readable code with meaningful variable names
- Add comments for complex logic
- Follow existing code style in the project
- Test your changes before submitting PR

### Pull Requests
- Keep PRs focused on a single feature or fix
- Write clear PR descriptions
- Link to related GitHub issue
- Get at least one approval before merging
- Resolve merge conflicts before merging

### Commits
- Make small, focused commits
- Write clear commit messages
- Use present tense ("Add feature" not "Added feature")
- Commit at least once between standup meetings

### Issues
- All work should be tracked as GitHub Issues
- Use appropriate labels (`user story`, `task`, `spike`)
- Assign issues to the correct Sprint milestone
- Update issue status as work progresses

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm
- Git

### Local Environment Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd 4-final-cash-me-if-you-can
   ```

2. **Install front-end dependencies**
   ```bash
   cd front-end
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

4. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

## Building and Testing

### Running the app locally
```bash
cd front-end
npm start
```

### Building for production
```bash
cd front-end
npm run build
```

### Running tests
```bash
cd front-end
npm test
```

## Questions?

If you have questions or need help, reach out on the team Discord channel!
