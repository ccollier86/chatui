# Database Storage Setup Guide

Your chat application currently stores everything in **localStorage** via the `LocalStorageAdapter`. This works but has limitations:

- **No multi-device sync** - Data locked to one browser
- **No server-side storage** - Lost if browser data cleared
- **No sharing** - Can't share chats with others
- **Size limits** - localStorage caps at ~5-10MB

This guide shows how to **swap to database storage** using the adapter pattern.

## Architecture

```
Your App Code (No Changes Needed)
        ↓
  Storage Adapter Interface
        ↓
┌───────┴───────┬─────────────┬──────────────┐
│               │             │              │
LocalStorage   Postgres    Supabase      MongoDB
(Current)      (Example)   (Example)    (Example)
```

**Key Point:** Your app code NEVER changes. Just swap the adapter.

## Current Setup (LocalStorage)

**File:** `lib/adapters/storage-adapter.ts`

```typescript
export const storageAdapter = new LocalStorageAdapter()
```

This is what you have now. It works, but everything is in browser localStorage.

## Swapping to Database Storage

### Option 1: Supabase (Recommended for Quick Start)

**Why Supabase?**
- Free tier
- Postgres database
- Built-in auth
- Real-time subscriptions
- REST API auto-generated

**Step 1: Install Supabase**
```bash
npm install @supabase/supabase-js
```

**Step 2: Create Supabase Project**
1. Go to https://supabase.com
2. Create new project
3. Get your URL and anon key

**Step 3: Set Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 4: Create Database Schema**

Run this SQL in Supabase SQL Editor:

```sql
-- Chats table
CREATE TABLE chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifacts table
CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  chat_id TEXT REFERENCES chats(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  theme TEXT DEFAULT 'system',
  default_provider TEXT DEFAULT 'anthropic',
  default_model TEXT DEFAULT 'claude-3-5-sonnet-20241022',
  user_avatar JSONB DEFAULT '{"style": "initials", "value": "U"}',
  api_keys JSONB DEFAULT '{}'
);

-- Row Level Security (RLS)
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies (users can only access their own data)
CREATE POLICY "Users can access own chats" ON chats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own messages" ON messages
  FOR ALL USING (auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id));

CREATE POLICY "Users can access own artifacts" ON artifacts
  FOR ALL USING (auth.uid() = (SELECT user_id FROM chats WHERE id = chat_id));

CREATE POLICY "Users can access own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

**Step 5: Implement Supabase Adapter**

Create `lib/adapters/supabase-storage-adapter.ts`:

```typescript
import { createClient } from "@supabase/supabase-js"
import { StorageAdapter, ChatOperations, MessageOperations, ArtifactOperations, SettingsOperations } from "./storage-adapter"
import { Chat, Message, Artifact, AppSettings } from "@/types"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class SupabaseStorageAdapter implements StorageAdapter {
  private ready = false

  async initialize(): Promise<void> {
    try {
      // Check connection
      const { error } = await supabase.from('chats').select('count').limit(0)
      this.ready = !error
    } catch (e) {
      console.error("Supabase initialization failed:", e)
      this.ready = false
    }
  }

  isReady(): boolean {
    return this.ready
  }

  chats: ChatOperations = {
    async get(chatId: string): Promise<Chat | null> {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages(*),
          artifacts(*)
        `)
        .eq('id', chatId)
        .single()

      if (error) throw error
      return data as Chat
    },

    async list(limit = 100, offset = 0): Promise<Chat[]> {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages(*),
          artifacts(*)
        `)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data as Chat[]
    },

    async create(chat): Promise<Chat> {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const newChat = {
        id: Math.random().toString(36).substring(2, 15),
        user_id: user.user.id,
        title: chat.title,
        model: chat.model,
        provider: chat.provider,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('chats')
        .insert(newChat)
        .select()
        .single()

      if (error) throw error
      return { ...data, messages: [], artifacts: [] } as Chat
    },

    async update(chatId: string, updates): Promise<Chat> {
      const { data, error } = await supabase
        .from('chats')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId)
        .select()
        .single()

      if (error) throw error
      return data as Chat
    },

    async delete(chatId: string): Promise<void> {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

      if (error) throw error
    },
  }

  messages: MessageOperations = {
    async add(chatId: string, message): Promise<Message> {
      const newMessage = {
        id: Math.random().toString(36).substring(2, 15),
        chat_id: chatId,
        ...message,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single()

      if (error) throw error

      // Update chat's updated_at
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId)

      return data as Message
    },

    async update(chatId: string, messageId: string, updates): Promise<Message> {
      const { data, error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId)
        .eq('chat_id', chatId)
        .select()
        .single()

      if (error) throw error
      return data as Message
    },

    async delete(chatId: string, messageId: string): Promise<void> {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('chat_id', chatId)

      if (error) throw error
    },

    async list(chatId: string): Promise<Message[]> {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as Message[]
    },
  }

  artifacts: ArtifactOperations = {
    async add(chatId: string, artifact): Promise<Artifact> {
      const newArtifact = {
        id: Math.random().toString(36).substring(2, 15),
        chat_id: chatId,
        ...artifact,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('artifacts')
        .insert(newArtifact)
        .select()
        .single()

      if (error) throw error
      return { ...data, chatId } as Artifact
    },

    async delete(chatId: string, artifactId: string): Promise<void> {
      const { error } = await supabase
        .from('artifacts')
        .delete()
        .eq('id', artifactId)
        .eq('chat_id', chatId)

      if (error) throw error
    },

    async list(chatId: string): Promise<Artifact[]> {
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('chat_id', chatId)

      if (error) throw error
      return data.map(d => ({ ...d, chatId: d.chat_id })) as Artifact[]
    },
  }

  settings: SettingsOperations = {
    async get(): Promise<AppSettings> {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single()

      if (error) {
        // Return defaults if no settings found
        return {
          theme: "system",
          defaultProvider: "anthropic",
          defaultModel: "claude-3-5-sonnet-20241022",
          userAvatar: { style: "initials", value: "U" },
          apiKeys: {},
        }
      }

      return data as AppSettings
    },

    async update(settings): Promise<AppSettings> {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.user.id,
          ...settings,
        })
        .select()
        .single()

      if (error) throw error
      return data as AppSettings
    },
  }

  async clearAll(): Promise<void> {
    const { data: user } = await supabase.auth.getUser()
    if (!user) return

    // Delete all user data
    await supabase.from('chats').delete().eq('user_id', user.user.id)
    await supabase.from('user_settings').delete().eq('user_id', user.user.id)
  }
}
```

**Step 6: Swap the Adapter**

In `lib/adapters/storage-adapter.ts`:

```typescript
// Before:
export const storageAdapter = new LocalStorageAdapter()

// After:
import { SupabaseStorageAdapter } from "./supabase-storage-adapter"
export const storageAdapter = new SupabaseStorageAdapter()
```

**Step 7: Initialize on App Load**

In your root layout or app component:

```typescript
import { storageAdapter } from "@/lib/adapters/storage-adapter"

useEffect(() => {
  storageAdapter.initialize()
}, [])
```

**Done!** Your app now uses Supabase instead of localStorage.

### Option 2: Prisma + Postgres

**Coming soon** - Guide for Prisma ORM with Postgres

### Option 3: MongoDB

**Coming soon** - Guide for MongoDB

### Option 4: Custom API

**Coming soon** - Guide for custom backend API

## Migration from localStorage to Database

When switching from localStorage to database, you'll want to migrate existing data:

```typescript
async function migrateLocalStorageToDatabase() {
  // Get data from localStorage
  const localAdapter = new LocalStorageAdapter()
  await localAdapter.initialize()
  const chats = await localAdapter.chats.list()

  // Initialize database adapter
  const dbAdapter = new SupabaseStorageAdapter()
  await dbAdapter.initialize()

  // Migrate each chat
  for (const chat of chats) {
    const { messages, artifacts, ...chatData } = chat

    // Create chat
    const newChat = await dbAdapter.chats.create(chatData)

    // Migrate messages
    for (const message of messages) {
      await dbAdapter.messages.add(newChat.id, message)
    }

    // Migrate artifacts
    for (const artifact of artifacts) {
      await dbAdapter.artifacts.add(newChat.id, artifact)
    }
  }

  // Migrate settings
  const settings = await localAdapter.settings.get()
  await dbAdapter.settings.update(settings)

  console.log("Migration complete!")
}
```

## Benefits of Database Storage

Once you switch to database storage:

✅ **Multi-device sync** - Access chats from any device
✅ **Never lose data** - Persisted on server
✅ **Share chats** - Share links to conversations
✅ **Unlimited storage** - No browser limits
✅ **Search** - Full-text search across all chats
✅ **Analytics** - Track usage, popular models, etc.
✅ **Backup/Export** - Easy data exports
✅ **Collaboration** - Multiple users per chat

## Summary

1. **Current:** Everything in localStorage (simple but limited)
2. **Future:** Choose your database (Supabase, Postgres, MongoDB, etc.)
3. **Migration:** Swap adapter, run migration script
4. **No app changes:** Store/components work identically

The adapter pattern means you can **swap storage without touching your app code**!
