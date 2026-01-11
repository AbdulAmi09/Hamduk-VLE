"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lightbulb } from "lucide-react"

interface AiConceptExplainerProps {
  concept: string
  courseContext: string
}

export function AiConceptExplainer({ concept, courseContext }: AiConceptExplainerProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleExplain = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: concept,
          currentLevel: "intermediate",
          courseContext,
        }),
      })

      if (!response.ok) throw new Error("Failed to get explanation")

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (error) {
      console.error("[v0] Error:", error)
      setExplanation("Failed to generate explanation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <CardTitle>Need Help Understanding?</CardTitle>
        </div>
        <CardDescription>Ask AI to explain {concept} in simpler terms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!explanation ? (
          <Button onClick={handleExplain} disabled={loading} className="w-full">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Explain "{concept}"
          </Button>
        ) : (
          <>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-wrap">{explanation}</p>
            </div>
            <Button onClick={handleExplain} variant="outline" className="w-full bg-transparent">
              Get Another Explanation
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
