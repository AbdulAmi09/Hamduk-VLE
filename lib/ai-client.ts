import { openai } from "@ai-sdk/openai"
import { generateText, streamText } from "ai"

export const aiModels = {
  tutor: openai("gpt-4-turbo"),
  summarizer: openai("gpt-4-turbo"),
  questionGenerator: openai("gpt-4-turbo"),
}

// AI Tutor: Explains concepts in simpler terms
export async function explainConcept(topic: string, currentLevel: string, courseContext: string) {
  const { text } = await generateText({
    model: aiModels.tutor,
    messages: [
      {
        role: "user",
        content: `You are an expert tutor for a course on "${courseContext}". 
        
A student with ${currentLevel} understanding is struggling with: "${topic}"

Explain this concept in simpler, more relatable terms. Use analogies and real-world examples. Keep it concise (2-3 paragraphs).`,
      },
    ],
    temperature: 0.7,
  })
  return text
}

// AI Tutor: Answer questions based on course content
export async function answerCourseQuestion(question: string, courseContent: string, lessonTitle: string) {
  const { text } = await generateText({
    model: aiModels.tutor,
    messages: [
      {
        role: "user",
        content: `You are a teaching assistant for the lesson "${lessonTitle}".
        
Course Content Context:
${courseContent}

Student Question: ${question}

Provide a helpful, accurate answer based on the course content. If the answer isn't in the course content, say so and suggest where to find it.`,
      },
    ],
    temperature: 0.7,
  })
  return text
}

// AI Tutor: Streaming response for real-time chat
export async function streamTutorResponse(messages: Array<{ role: "user" | "assistant"; content: string }>) {
  return streamText({
    model: aiModels.tutor,
    messages,
    temperature: 0.7,
  })
}

// Summarizer: Create video/PDF summaries
export async function summarizeContent(content: string, contentType: "video" | "pdf" | "article") {
  const { text } = await generateText({
    model: aiModels.summarizer,
    messages: [
      {
        role: "user",
        content: `Create a concise summary of this ${contentType} content. 
        
Highlight:
- Main concepts (bullet points)
- Key takeaways
- Important terms

Content:
${content.substring(0, 4000)}`, // Limit content size
      },
    ],
    temperature: 0.5,
  })
  return text
}

// Question Generator: Auto-generate practice quizzes
export async function generatePracticeQuiz(topic: string, difficulty: "easy" | "medium" | "hard", count = 5) {
  const { text } = await generateText({
    model: aiModels.questionGenerator,
    messages: [
      {
        role: "user",
        content: `Generate ${count} practice quiz questions on "${topic}" at ${difficulty} difficulty level.

Format each question as JSON:
{
  "id": number,
  "question": "string",
  "options": ["A", "B", "C", "D"],
  "correct": "A",
  "explanation": "string"
}

Return as a JSON array.`,
      },
    ],
    temperature: 0.8,
  })
  try {
    return JSON.parse(text)
  } catch {
    return { error: "Failed to parse questions", raw: text }
  }
}

// Knowledge gap detector: Identify weak areas
export async function detectKnowledgeGaps(scores: { topic: string; score: number }[]) {
  const { text } = await generateText({
    model: aiModels.tutor,
    messages: [
      {
        role: "user",
        content: `Analyze these assessment scores and identify knowledge gaps:

${scores.map((s) => `${s.topic}: ${s.score}%`).join("\n")}

For each gap, suggest:
1. Why this concept is important
2. Recommended resources
3. Practice exercises needed

Format as JSON array with {topic, gap_identified, importance, recommendations, practice_focus}`,
      },
    ],
    temperature: 0.7,
  })
  try {
    return JSON.parse(text)
  } catch {
    return { error: "Failed to parse gaps", raw: text }
  }
}
