# Contributing to SIAD TIK POLDA

Terima kasih atas minat Anda untuk berkontribusi pada SIAD TIK POLDA! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## 🤝 Code of Conduct

- Bersikap profesional dan menghormati semua kontributor
- Fokus pada feedback yang konstruktif
- Utamakan kolaborasi di atas kompetisi

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork & Clone**
   ```bash
   git clone <your-fork-url>
   cd siad-tik-polda
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env dengan konfigurasi lokal Anda
   ```

4. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. **Create Superadmin**
   ```bash
   npx ts-node scripts/setup/create-superadmin.ts
   ```

6. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-name
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Build project
npm run build

# Test manually
npm run dev
```

### 4. Commit Changes

```bash
git add .
git commit -m "type: descriptive message"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Go to GitHub repository
- Click "New Pull Request"
- Fill in the PR template
- Wait for review

## 📝 Coding Standards

### TypeScript

- Use TypeScript untuk semua file baru
- Define proper types, avoid `any`
- Use interfaces untuk object shapes

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  role: Role;
}

// ❌ Bad
const user: any = { ... };
```

### React Components

- Use functional components
- Use hooks untuk state management
- Extract complex logic ke custom hooks
- Memoize expensive computations

```typescript
// ✅ Good
export default function MyComponent({ data }: Props) {
  const filteredData = useMemo(() => 
    data.filter(item => item.active), 
    [data]
  );
  
  return <div>{/* ... */}</div>;
}
```

### File Organization

- One component per file
- Group related components
- Use index files untuk exports

```
components/
├── Surat/
│   ├── SuratTable.tsx
│   ├── SuratForm.tsx
│   └── index.ts
```

### Naming Conventions

#### Files & Folders
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase.ts`

#### Code
- Variables & Functions: `camelCase`
- Components: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Types & Interfaces: `PascalCase`

```typescript
// Variables & Functions
const userData = getUserData();
function calculateTotal() { }

// Components
function UserProfile() { }

// Constants
const MAX_RETRY_COUNT = 3;

// Types
interface UserProfile { }
type UserRole = 'ADMIN' | 'USER';
```

### CSS & Styling

- Use Tailwind CSS classes
- Use semantic class names
- Avoid inline styles unless necessary
- Use dark mode classes: `dark:`

```tsx
// ✅ Good
<div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### API Routes

- Use proper HTTP methods
- Return consistent response format
- Handle errors properly
- Use try-catch blocks

```typescript
export async function GET(request: Request) {
  try {
    const data = await fetchData();
    return Response.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: 'Error message' 
    }, { status: 500 });
  }
}
```

## 📋 Commit Guidelines

### Commit Message Format

```
type: subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat: add bulk delete functionality

- Add bulk delete button
- Implement selection logic
- Add confirmation modal

Closes #123
```

```bash
fix: resolve login redirect issue

Fixed issue where users were not redirected after login
```

```bash
docs: update README with new features
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No console.log or debug code
- [ ] Documentation updated if needed
- [ ] No breaking changes (or documented)
- [ ] Tested on multiple browsers (if UI changes)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Before/After screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No breaking changes
```

### Review Process

1. Submit PR
2. Wait for review (1-3 days)
3. Address feedback
4. Get approval
5. Merge (done by maintainers)

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing features
- Fixing bugs with user impact
- Changing API endpoints
- Adding new scripts

### Documentation Structure

```
docs/
├── features/      # Feature documentation
├── fixes/         # Bug fix documentation
├── guides/        # How-to guides
├── changelog/     # Change logs
└── analysis/      # Analysis reports
```

### Writing Good Documentation

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update README if needed
- Cross-reference related docs

### Documentation Template

```markdown
# Feature/Fix Name

## Overview
Brief description

## Implementation
Technical details

## Usage
How to use

## Example
Code example

## Notes
Additional information
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- Browser: [e.g. Chrome 120]
- OS: [e.g. Windows 11]
- Version: [e.g. 1.0.0]

**Additional context**
Any other information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description

**Describe the solution**
What you want to happen

**Describe alternatives**
Alternative solutions considered

**Additional context**
Mockups, examples, etc.
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Responsive on mobile
- [ ] Dark mode works
- [ ] No performance issues

### Testing New Features

1. Test happy path
2. Test edge cases
3. Test error scenarios
4. Test on different screen sizes
5. Test with different user roles

## 🎨 UI/UX Guidelines

- Follow existing design patterns
- Maintain consistency
- Use existing components when possible
- Ensure responsive design
- Test in both light and dark mode
- Add loading states
- Add error states
- Add empty states

## 🔒 Security

- Never commit secrets/keys
- Use environment variables
- Validate user input
- Sanitize data
- Use prepared statements
- Implement proper authentication
- Follow OWASP guidelines

## 📞 Getting Help

- Check [Documentation](./docs/)
- Review [Project Structure](./PROJECT_STRUCTURE.md)
- Check existing issues
- Ask in team chat
- Contact maintainers

## 🎓 Learning Resources

### Project Specific
- [Project Structure](./PROJECT_STRUCTURE.md)
- [Refactoring Summary](./REFACTORING_SUMMARY.md)
- [Features Documentation](./docs/features/)

### Technologies
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ✅ Good Practices

### Do's ✅

- Write clean, readable code
- Comment complex logic
- Use meaningful variable names
- Follow existing patterns
- Test your changes
- Update documentation
- Ask questions when unsure

### Don'ts ❌

- Don't commit commented code
- Don't use `any` type
- Don't commit console.log
- Don't break existing functionality
- Don't skip testing
- Don't ignore linting errors
- Don't commit directly to main

## 🏆 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Team meetings

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing!** 🎉

Every contribution, no matter how small, helps make this project better.
