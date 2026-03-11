const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const parseJSON = (text) => {
  if (!text) throw new Error('Empty AI response');

  let cleaned = text.trim();

  cleaned = cleaned.replace(/```json/g, '');
  cleaned = cleaned.replace(/```/g, '');

  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);

  if (!jsonMatch) {
    throw new Error('Invalid JSON response');
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('JSON Parse Failed:', jsonMatch[0]);
    throw new Error('Invalid JSON response');
  }
};

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = 'llama-3.3-70b-versatile';
  }

  async chat(messages, systemPrompt = null) {
    try {
      const chatMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: this.model,
          messages: chatMessages,
          temperature: 0.3,
          max_tokens: 2048
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Groq API Error:', error.response?.data || error.message);

      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error(
        error.response?.data?.error?.message || 'Failed to get response from AI'
      );
    }
  }

  async generateQuestions(topic, category, difficulty, count = 5) {
    const systemPrompt = `You are an expert technical interviewer. Generate ${count} interview questions.

Topic: ${topic}
Category: ${category}
Difficulty: ${difficulty}

Return ONLY JSON array in this format:

[
 {
   "title": "Question title",
   "description": "Question description",
   "category": "${category}",
   "difficulty": "${difficulty}",
   "keywords": ["keyword1","keyword2"],
   "answer": "Simple answer",
   "explanation": "Explanation"
 }
]`;

    const userMessage = {
      role: 'user',
      content: `Generate ${count} ${difficulty} ${category} interview questions about ${topic}.`
    };

    const result = await this.chat([userMessage], systemPrompt);
    return parseJSON(result);
  }

  async generateMockInterviewQuestions(role, focusAreas, count = 5) {
    const focusStr = focusAreas.join(', ');

    const systemPrompt = `You are an expert interviewer.

Generate ${count} realistic interview questions for role ${role}.
Focus areas: ${focusStr}

Return ONLY JSON array:

[
 {
   "title":"Question title",
   "description":"Scenario",
   "category":"Technical or Behavioral or System Design",
   "difficulty":"Easy or Medium or Hard",
   "keywords":["keyword1","keyword2"],
   "answer":"Key answer points",
   "explanation":"What interviewer expects"
 }
]`;

    const userMessage = {
      role: 'user',
      content: `Generate ${count} interview questions for ${role} focusing on ${focusStr}`
    };

    const result = await this.chat([userMessage], systemPrompt);
    return parseJSON(result);
  }

  async evaluateAnswer(question, userAnswer) {
    const systemPrompt = `You are an interviewer evaluating an answer.

Question: ${question.title}
Description: ${question.description}

Return JSON:

{
 "score":0-100,
 "strengths":["strength1"],
 "weaknesses":["weakness1"],
 "feedback":"feedback text",
 "sampleBetterAnswer":"better answer"
}`;

    const userMessage = {
      role: 'user',
      content: `User Answer: ${userAnswer}`
    };

    const result = await this.chat([userMessage], systemPrompt);
    return parseJSON(result);
  }

  async explainQuestion(question) {
    const systemPrompt = `Explain this interview question clearly for a candidate.`;

    const userMessage = {
      role: 'user',
      content: `
Question: ${question.title}
Description: ${question.description}

Explain:
1 What interviewer wants
2 Key points to answer
3 Example answer
4 Tips
`
    };

    return await this.chat([userMessage], systemPrompt);
  }

  async chatbot(userMessage, history = []) {
    const systemPrompt = `You are an AI interview coach helping candidates prepare for interviews.`;

    const messages = history.map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    messages.push({
      role: 'user',
      content: userMessage
    });

    return await this.chat(messages, systemPrompt);
  }

  async getBehavioralQuestions() {
    const systemPrompt = `Generate 20 behavioral interview questions.

Return ONLY JSON:

[
 {
   "question":"Tell me about yourself",
   "answer":"Sample STAR answer",
   "keyPoints":["point1"],
   "whatLookFor":"what interviewer wants",
   "tips":"tips"
 }
]`;

    const userMessage = {
      role: 'user',
      content: 'Generate behavioral interview questions.'
    };

    const result = await this.chat([userMessage], systemPrompt);
    return parseJSON(result);
  }

  async compareAnswers(userAnswer, correctAnswer, question) {
    const systemPrompt = `Compare two answers.

Return JSON:

{
 "score":0-100,
 "strengths":["strength"],
 "missing":["missing"],
 "improvements":["improvement"],
 "betterAnswer":"better version"
}`;

    const userMessage = {
      role: 'user',
      content: `
Question: ${question}

User Answer:
${userAnswer}

Correct Answer:
${correctAnswer}
`
    };

    const result = await this.chat([userMessage], systemPrompt);
    return parseJSON(result);
  }
}

module.exports = new GroqService();