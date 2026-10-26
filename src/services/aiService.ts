/**
 * Studyforge Intelligence Engine
 * Abstracted client-side and server-backed AI model interactions.
 */

export async function generateAcademicRoadmap(
  goalText: string,
  goalType: 'Submit Work' | 'Build Project' | 'Learn a Skill',
  currentLevel: string,
  timeAvailable: string
): Promise<any> {
  const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
Generate a realistic, detailed step-by-step roadmap tailored specifically for:
- Goal: "${goalText}"
- Current Starting Level / Context: "${currentLevel || 'Beginner'}"
- Category: "${goalType}"
- Strict Duration / Timeline: "${timeAvailable}"

CRITICAL TIMELINE RULES:
1. If Timeline is "3 Days": Structure exactly into 3 phases: "Day 1", "Day 2", "Day 3".
2. If Timeline is "1 Week": Structure exactly into 3 high-intensity phases: "Days 1-2 (Foundation)", "Days 3-5 (Core Execution)", "Days 6-7 (Testing & Wrap-up)". NEVER generate 3 weeks of content.
3. If Timeline is "3 Weeks": Break into "Week 1", "Week 2", "Week 3".
4. If Timeline is "3 Months": Break into "Month 1", "Month 2", "Month 3".

Return a valid JSON object matching this exact structure:
{
  "goal_title": "${goalText.trim()}",
  "goal_type": "${goalType}",
  "total_timeline": "${timeAvailable}",
  "summary": "string",
  "phases": [
    {
      "phase_number": 1,
      "title": "string",
      "timeline": "string",
      "description": "string",
      "tasks": [
        {
          "id": "t1",
          "title": "string",
          "duration": "string",
          "badge": "Action Item",
          "resourceText": "optional string",
          "completed": false
        }
      ]
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      if (text) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.phases)) {
            return parsed;
          }
        } catch {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && Array.isArray(parsed.phases)) {
              return parsed;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Intelligence engine network warning, using robust smart fallback:', err);
    }
  }

  // Intelligent fallback generator
  return {
    goal_title: goalText.trim() || 'Custom Academic & Project Goal',
    goal_type: goalType,
    total_timeline: timeAvailable,
    summary: `Structured execution plan tailored for ${goalText} at ${currentLevel} level over ${timeAvailable}.`,
    phases: [
      {
        phase_number: 1,
        title: timeAvailable.includes('3 Days') ? 'Day 1: Setup & Core Concepts' : 'Phase 1: Foundation & Architecture',
        timeline: timeAvailable.includes('3 Days') ? 'Day 1' : 'Initial Phase',
        description: 'Establish initial requirements, scoping, and core foundational architecture.',
        tasks: [
          { id: 'fb-1', title: `Initial scoping and requirement breakdown for ${goalText}`, duration: '3 hrs', badge: 'Action Item', resourceText: 'Documentation', completed: false },
          { id: 'fb-2', title: 'Environment setup and initial scaffolding', duration: '4 hrs', badge: 'Review Check', resourceText: 'Setup Guide', completed: false }
        ]
      },
      {
        phase_number: 2,
        title: timeAvailable.includes('3 Days') ? 'Day 2: Core Execution' : 'Phase 2: Core Execution & Implementation',
        timeline: timeAvailable.includes('3 Days') ? 'Day 2' : 'Middle Phase',
        description: 'Execute core deliverables, build out primary features, and review progress.',
        tasks: [
          { id: 'fb-3', title: 'Core milestone execution and milestone testing', duration: '6 hrs', badge: 'Action Item', resourceText: 'Execution Guide', completed: false },
          { id: 'fb-4', title: 'Progress check and feedback integration', duration: '3 hrs', badge: 'Review Check', completed: false }
        ]
      },
      {
        phase_number: 3,
        title: timeAvailable.includes('3 Days') ? 'Day 3: Wrap-up & Review' : 'Phase 3: Final Testing & Polish',
        timeline: timeAvailable.includes('3 Days') ? 'Day 3' : 'Final Phase',
        description: 'Final review, polish, testing, and submission handoff.',
        tasks: [
          { id: 'fb-5', title: 'Comprehensive testing and code verification', duration: '3 hrs', badge: 'Review Check', completed: false },
          { id: 'fb-6', title: 'Final submission / deployment check', duration: '2 hrs', badge: 'Submit', completed: false }
        ]
      }
    ]
  };
}
