import { Chat, Message, Artifact, AppSettings } from "@/types"

export const demoSettings: AppSettings = {
  theme: "system",
  defaultProvider: "anthropic",
  defaultModel: "claude-3-5-sonnet-20241022",
  userAvatar: {
    style: "initials",
    value: "DU",
  },
  apiKeys: {
    openai: "sk-demo-key",
    anthropic: "sk-ant-demo-key",
  },
}

const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

export const demoChats: Chat[] = [
  {
    id: "demo-chat-1",
    title: "Building a React Component",
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    createdAt: oneHourAgo,
    updatedAt: now,
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Can you help me build a reusable button component in React with TypeScript? It should support different variants and sizes.",
        createdAt: oneHourAgo,
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: `I'll help you create a flexible, reusable button component with TypeScript. Here's a comprehensive implementation:

\`\`\`tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
\`\`\`

This button component features:

1. **Type-safe variants** using class-variance-authority
2. **Multiple visual styles**: default, destructive, outline, secondary, ghost, and link
3. **Flexible sizing**: small, default, large, and icon-only
4. **Full TypeScript support** with proper prop types
5. **Accessibility features**: proper focus rings and disabled states
6. **Forward refs** for advanced use cases

You can use it like this:

\`\`\`tsx
<Button>Default Button</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
\`\`\``,
        createdAt: new Date(oneHourAgo.getTime() + 5000),
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
      {
        id: "msg-3",
        role: "user",
        content: "Great! Can you also show me how to add loading state support?",
        createdAt: new Date(oneHourAgo.getTime() + 30000),
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: `Perfect! Let's enhance the button with loading state support:

\`\`\`tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span>{leftIcon}</span>}
            {children}
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
\`\`\`

Now you can use it with loading states:

\`\`\`tsx
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  await submitForm()
  setIsLoading(false)
}

<Button loading={isLoading} onClick={handleSubmit}>
  Submit
</Button>
\`\`\`

The button now:
- Shows a spinner when loading
- Automatically disables during loading
- Replaces content with "Loading..." text
- Supports optional left/right icons`,
        createdAt: new Date(oneHourAgo.getTime() + 35000),
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
    ],
    artifacts: [
      {
        id: "artifact-1",
        type: "code",
        title: "Button.tsx",
        language: "tsx",
        content: `import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }`,
        createdAt: new Date(oneHourAgo.getTime() + 5000),
        chatId: "demo-chat-1",
      },
      {
        id: "artifact-2",
        type: "code",
        title: "Button.tsx (with loading)",
        language: "tsx",
        content: `import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span>{leftIcon}</span>}
            {children}
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }`,
        createdAt: new Date(oneHourAgo.getTime() + 35000),
        chatId: "demo-chat-1",
      },
    ],
  },
  {
    id: "demo-chat-2",
    title: "API Design Best Practices",
    model: "gpt-4-turbo-preview",
    provider: "openai",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
    messages: [
      {
        id: "msg-5",
        role: "user",
        content: "What are the best practices for designing a RESTful API in 2024?",
        createdAt: twoDaysAgo,
        model: "gpt-4-turbo-preview",
        provider: "openai",
      },
      {
        id: "msg-6",
        role: "assistant",
        content: `Here are the key best practices for designing RESTful APIs in 2024:

## 1. Use Proper HTTP Methods
- **GET**: Retrieve resources (idempotent, cacheable)
- **POST**: Create new resources
- **PUT**: Update/replace entire resources
- **PATCH**: Partial updates
- **DELETE**: Remove resources

## 2. Resource Naming Conventions
\`\`\`
GET    /api/users           # List all users
GET    /api/users/123       # Get specific user
POST   /api/users           # Create new user
PUT    /api/users/123       # Update user
PATCH  /api/users/123       # Partial update
DELETE /api/users/123       # Delete user
\`\`\`

## 3. Versioning Strategy
Include version in URL or headers:
\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

## 4. Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## 5. Pagination & Filtering
\`\`\`
GET /api/users?page=2&limit=20&sort=-createdAt&role=admin
\`\`\`

## 6. Request/Response Format
Use JSON as default, support content negotiation:
\`\`\`json
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

## 7. Error Handling
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
\`\`\`

## 8. Security Best Practices
- Use HTTPS everywhere
- Implement OAuth 2.0 or JWT for authentication
- Rate limiting and throttling
- Input validation and sanitization
- CORS configuration
- API keys for service-to-service

## 9. Documentation
Use OpenAPI/Swagger specification:
- Interactive API documentation
- Automatic client generation
- Contract testing

## 10. Performance
- Implement caching (ETags, Cache-Control)
- Use compression (gzip, brotli)
- Consider GraphQL for complex queries
- Implement proper indexing
- Use CDN for static resources`,
        createdAt: new Date(twoDaysAgo.getTime() + 10000),
        model: "gpt-4-turbo-preview",
        provider: "openai",
      },
      {
        id: "msg-7",
        role: "user",
        content: "Can you show me an example Express.js implementation with these practices?",
        createdAt: new Date(twoDaysAgo.getTime() + 60000),
        model: "gpt-4-turbo-preview",
        provider: "openai",
      },
      {
        id: "msg-8",
        role: "assistant",
        content: `Here's a comprehensive Express.js API implementation following best practices:

\`\`\`typescript
import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import { body, validationResult, param, query } from 'express-validator'

const app = express()

// Security & Performance Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// Error response helper
interface ApiError {
  code: string
  message: string
  details?: any[]
}

const sendError = (res: Response, status: number, error: ApiError) => {
  res.status(status).json({ error })
}

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return sendError(res, 400, {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg
      }))
    })
  }
  next()
}

// User routes
app.get('/api/v1/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sort').optional().isString(),
    validate
  ],
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const sort = req.query.sort as string || '-createdAt'

      // Simulate database query
      const users = await getUsersFromDB({ page, limit, sort })
      const total = await getTotalUsersCount()

      res.json({
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      })
    } catch (error) {
      sendError(res, 500, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users'
      })
    }
  }
)

app.get('/api/v1/users/:id',
  [
    param('id').isUUID(),
    validate
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await getUserById(req.params.id)

      if (!user) {
        return sendError(res, 404, {
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      res.json({ data: user })
    } catch (error) {
      sendError(res, 500, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user'
      })
    }
  }
)

app.post('/api/v1/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('role').optional().isIn(['user', 'admin']),
    validate
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await createUser(req.body)
      res.status(201).json({ data: user })
    } catch (error: any) {
      if (error.code === 'DUPLICATE_EMAIL') {
        return sendError(res, 409, {
          code: 'CONFLICT',
          message: 'Email already exists'
        })
      }
      sendError(res, 500, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user'
      })
    }
  }
)

app.patch('/api/v1/users/:id',
  [
    param('id').isUUID(),
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    validate
  ],
  async (req: Request, res: Response) => {
    try {
      const user = await updateUser(req.params.id, req.body)

      if (!user) {
        return sendError(res, 404, {
          code: 'NOT_FOUND',
          message: 'User not found'
        })
      }

      res.json({ data: user })
    } catch (error) {
      sendError(res, 500, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update user'
      })
    }
  }
)

app.delete('/api/v1/users/:id',
  [
    param('id').isUUID(),
    validate
  ],
  async (req: Request, res: Response) => {
    try {
      await deleteUser(req.params.id)
      res.status(204).send()
    } catch (error) {
      sendError(res, 500, {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete user'
      })
    }
  }
)

// 404 handler
app.use((req, res) => {
  sendError(res, 404, {
    code: 'NOT_FOUND',
    message: 'Endpoint not found'
  })
})

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  sendError(res, 500, {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(\`API server running on port \${PORT}\`)
})

// Mock DB functions (replace with actual implementation)
async function getUsersFromDB(options: any) { return [] }
async function getTotalUsersCount() { return 0 }
async function getUserById(id: string) { return null }
async function createUser(data: any) { return data }
async function updateUser(id: string, data: any) { return data }
async function deleteUser(id: string) { }
\`\`\`

This implementation includes:
- Security headers (helmet)
- CORS configuration
- Rate limiting
- Request validation
- Proper error handling
- Pagination support
- Consistent response format
- Type safety with TypeScript`,
        createdAt: new Date(twoDaysAgo.getTime() + 65000),
        model: "gpt-4-turbo-preview",
        provider: "openai",
      },
    ],
    artifacts: [
      {
        id: "artifact-3",
        type: "code",
        title: "express-api.ts",
        language: "typescript",
        content: `import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import { body, validationResult, param, query } from 'express-validator'

const app = express()

// Security & Performance Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
})
app.use('/api/', limiter)

// Error response helper
interface ApiError {
  code: string
  message: string
  details?: any[]
}

const sendError = (res: Response, status: number, error: ApiError) => {
  res.status(status).json({ error })
}

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return sendError(res, 400, {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg
      }))
    })
  }
  next()
}

// Routes implementation...
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(\`API server running on port \${PORT}\`)
})`,
        createdAt: new Date(twoDaysAgo.getTime() + 65000),
        chatId: "demo-chat-2",
      },
    ],
  },
  {
    id: "demo-chat-3",
    title: "SQL Query Optimization",
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    createdAt: oneWeekAgo,
    updatedAt: oneWeekAgo,
    messages: [
      {
        id: "msg-9",
        role: "user",
        content: "I have a slow SQL query that's taking 5+ seconds. Can you help me optimize it?\n\n```sql\nSELECT u.*, COUNT(o.id) as order_count, SUM(o.total) as total_spent\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.created_at > '2023-01-01'\nGROUP BY u.id\nORDER BY total_spent DESC;\n```",
        createdAt: oneWeekAgo,
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
      {
        id: "msg-10",
        role: "assistant",
        content: `I'll help you optimize this query. Let's break down the performance issues and solutions:

## Performance Issues Identified:
1. **SELECT u.***: Retrieving all columns is inefficient
2. **Missing indexes**: Likely no index on \`user_id\` or \`created_at\`
3. **Large date range**: Scanning many rows
4. **Sorting on calculated field**: ORDER BY on aggregated column

## Optimized Query:

\`\`\`sql
-- Step 1: Create necessary indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_user_total ON orders(user_id, total);

-- Step 2: Optimized query
SELECT
  u.id,
  u.name,
  u.email,
  u.created_at,
  COALESCE(o.order_count, 0) as order_count,
  COALESCE(o.total_spent, 0) as total_spent
FROM users u
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as order_count,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id IN (
    SELECT id FROM users WHERE created_at > '2023-01-01'
  )
  GROUP BY user_id
) o ON u.id = o.user_id
WHERE u.created_at > '2023-01-01'
ORDER BY COALESCE(o.total_spent, 0) DESC
LIMIT 100; -- Add pagination
\`\`\`

## Key Optimizations:

### 1. **Specific Column Selection**
Instead of \`SELECT u.*\`, specify only needed columns to reduce data transfer.

### 2. **Index Strategy**
- \`idx_users_created_at\`: Fast filtering on user creation date
- \`idx_orders_user_id\`: Efficient JOIN operation
- \`idx_orders_user_total\`: Cover index for aggregation

### 3. **Subquery Optimization**
Pre-filter orders to only those belonging to users created after 2023-01-01, reducing the aggregation workload.

### 4. **COALESCE for NULL Handling**
Handle NULL values from LEFT JOIN efficiently.

### 5. **Pagination**
Add LIMIT to reduce result set size.

## Alternative: Materialized View Approach

For frequently accessed data:

\`\`\`sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT
  u.id as user_id,
  u.name,
  u.email,
  u.created_at,
  COUNT(o.id) as order_count,
  COALESCE(SUM(o.total), 0) as total_spent,
  MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Create index on materialized view
CREATE INDEX idx_user_stats_total ON user_order_stats(total_spent DESC);

-- Refresh periodically (e.g., hourly via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_stats;

-- Query becomes simple and fast
SELECT *
FROM user_order_stats
WHERE created_at > '2023-01-01'
ORDER BY total_spent DESC
LIMIT 100;
\`\`\`

## Performance Comparison:
- **Original**: 5+ seconds
- **Optimized with indexes**: ~500ms
- **Materialized view**: ~50ms

## Additional Tips:
1. Use EXPLAIN ANALYZE to verify query plan
2. Consider partitioning for very large tables
3. Monitor query performance over time
4. Set up query result caching if applicable`,
        createdAt: new Date(oneWeekAgo.getTime() + 15000),
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
    ],
    artifacts: [
      {
        id: "artifact-4",
        type: "code",
        title: "optimized-query.sql",
        language: "sql",
        content: `-- Step 1: Create necessary indexes
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_user_total ON orders(user_id, total);

-- Step 2: Optimized query
SELECT
  u.id,
  u.name,
  u.email,
  u.created_at,
  COALESCE(o.order_count, 0) as order_count,
  COALESCE(o.total_spent, 0) as total_spent
FROM users u
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) as order_count,
    SUM(total) as total_spent
  FROM orders
  WHERE user_id IN (
    SELECT id FROM users WHERE created_at > '2023-01-01'
  )
  GROUP BY user_id
) o ON u.id = o.user_id
WHERE u.created_at > '2023-01-01'
ORDER BY COALESCE(o.total_spent, 0) DESC
LIMIT 100;`,
        createdAt: new Date(oneWeekAgo.getTime() + 15000),
        chatId: "demo-chat-3",
      },
      {
        id: "artifact-5",
        type: "code",
        title: "materialized-view.sql",
        language: "sql",
        content: `-- Create materialized view
CREATE MATERIALIZED VIEW user_order_stats AS
SELECT
  u.id as user_id,
  u.name,
  u.email,
  u.created_at,
  COUNT(o.id) as order_count,
  COALESCE(SUM(o.total), 0) as total_spent,
  MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Create index on materialized view
CREATE INDEX idx_user_stats_total ON user_order_stats(total_spent DESC);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_stats;

-- Query becomes simple and fast
SELECT *
FROM user_order_stats
WHERE created_at > '2023-01-01'
ORDER BY total_spent DESC
LIMIT 100;`,
        createdAt: new Date(oneWeekAgo.getTime() + 15000),
        chatId: "demo-chat-3",
      },
    ],
  },
  {
    id: "demo-chat-4",
    title: "Welcome!",
    model: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 5 * 60 * 1000),
    messages: [
      {
        id: "msg-11",
        role: "assistant",
        content: "👋 Welcome to Catalyst Chat UI! I'm here to help you with:\n\n- **Code generation** in any language\n- **Debugging** and optimization\n- **Architecture** discussions\n- **Best practices** and design patterns\n- **API design** and implementation\n- **Database** queries and optimization\n\nWhat can I help you build today?",
        createdAt: new Date(now.getTime() - 5 * 60 * 1000),
        model: "claude-3-5-sonnet-20241022",
        provider: "anthropic",
      },
    ],
    artifacts: [],
  },
]
