"use client"

import * as React from "react"
import { useChatStore } from "@/lib/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AVAILABLE_MODELS } from "@/types"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings } = useChatStore()

  const [localSettings, setLocalSettings] = React.useState(settings)

  React.useEffect(() => {
    if (open) {
      setLocalSettings(settings)
    }
  }, [open, settings])

  const handleSave = () => {
    updateSettings(localSettings)
    onOpenChange(false)
  }

  const openAIModels = AVAILABLE_MODELS.filter((m) => m.provider === "openai")
  const anthropicModels = AVAILABLE_MODELS.filter((m) => m.provider === "anthropic")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and default preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Keys */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">API Keys</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Your API keys are stored locally and never sent to our servers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                value={localSettings.apiKeys.openai || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    apiKeys: {
                      ...localSettings.apiKeys,
                      openai: e.target.value,
                    },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anthropic-key">Anthropic API Key</Label>
              <Input
                id="anthropic-key"
                type="password"
                placeholder="sk-ant-..."
                value={localSettings.apiKeys.anthropic || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    apiKeys: {
                      ...localSettings.apiKeys,
                      anthropic: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Default Model */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Default Model</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Choose the default provider and model for new chats
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={localSettings.defaultProvider}
                onValueChange={(value: "openai" | "anthropic") =>
                  setLocalSettings({
                    ...localSettings,
                    defaultProvider: value,
                  })
                }
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={localSettings.defaultModel}
                onValueChange={(value) =>
                  setLocalSettings({
                    ...localSettings,
                    defaultModel: value,
                  })
                }
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {localSettings.defaultProvider === "openai" && (
                    <>
                      {openAIModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {localSettings.defaultProvider === "anthropic" && (
                    <>
                      {anthropicModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Theme */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">Appearance</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={localSettings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  setLocalSettings({
                    ...localSettings,
                    theme: value,
                  })
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
