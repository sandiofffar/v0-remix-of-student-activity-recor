"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ActivityCategory {
  id: string
  name: string
  description: string
  points_multiplier: number
}

interface ActivityFormProps {
  categories: ActivityCategory[]
  initialData?: {
    id?: string
    title: string
    description: string
    category_id: string
    activity_date: string
    duration_hours?: number
    location?: string
    organizer?: string
    points_claimed: number
    evidence_urls?: string[]
  }
  mode: "create" | "edit"
}

export function ActivityForm({ categories, initialData, mode }: ActivityFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id || "",
    activity_date: initialData?.activity_date ? new Date(initialData.activity_date) : undefined,
    duration_hours: initialData?.duration_hours || "",
    location: initialData?.location || "",
    organizer: initialData?.organizer || "",
    points_claimed: initialData?.points_claimed || "",
    evidence_urls: initialData?.evidence_urls || [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [evidenceInput, setEvidenceInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const activityData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        activity_date: formData.activity_date?.toISOString().split("T")[0],
        duration_hours: formData.duration_hours ? Number.parseInt(formData.duration_hours.toString()) : null,
        location: formData.location || null,
        organizer: formData.organizer || null,
        points_claimed: Number.parseInt(formData.points_claimed.toString()),
        evidence_urls: formData.evidence_urls,
        student_id: user.id,
      }

      if (mode === "create") {
        const { error } = await supabase.from("activities").insert(activityData)
        if (error) throw error
      } else if (initialData?.id) {
        const { error } = await supabase.from("activities").update(activityData).eq("id", initialData.id)
        if (error) throw error
      }

      router.push("/dashboard/activities")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const addEvidenceUrl = () => {
    if (evidenceInput.trim()) {
      setFormData({
        ...formData,
        evidence_urls: [...formData.evidence_urls, evidenceInput.trim()],
      })
      setEvidenceInput("")
    }
  }

  const removeEvidenceUrl = (index: number) => {
    setFormData({
      ...formData,
      evidence_urls: formData.evidence_urls.filter((_, i) => i !== index),
    })
  }

  const selectedCategory = categories.find((cat) => cat.id === formData.category_id)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Submit New Activity" : "Edit Activity"}</CardTitle>
        <CardDescription>
          {mode === "create" ? "Add a new activity to your record for faculty review" : "Update your activity details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., National Science Fair Participation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed description of your activity, your role, and achievements..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex flex-col">
                      <span>{category.name}</span>
                      <span className="text-xs text-muted-foreground">Multiplier: {category.points_multiplier}x</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Activity Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.activity_date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.activity_date ? format(formData.activity_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.activity_date}
                    onSelect={(date) => setFormData({ ...formData, activity_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                placeholder="e.g., 8"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., University Auditorium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer">Organizer</Label>
              <Input
                id="organizer"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g., IEEE Student Chapter"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Points Claimed *</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={formData.points_claimed}
              onChange={(e) => setFormData({ ...formData, points_claimed: e.target.value })}
              placeholder="e.g., 50"
              required
            />
            {selectedCategory && (
              <p className="text-sm text-muted-foreground">
                Final points will be calculated with {selectedCategory.points_multiplier}x multiplier after approval
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Evidence/Supporting Documents</Label>
            <div className="flex space-x-2">
              <Input
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="Enter URL to certificate, photo, or document"
              />
              <Button type="button" onClick={addEvidenceUrl} variant="outline">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {formData.evidence_urls.length > 0 && (
              <div className="space-y-2">
                {formData.evidence_urls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {url}
                    </a>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidenceUrl(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : mode === "create" ? "Submit Activity" : "Update Activity"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
