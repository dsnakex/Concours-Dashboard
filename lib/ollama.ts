// Ollama API client for local AI inference
// Can be easily switched to Claude API or OpenAI

interface OllamaRequest {
  model: string
  prompt: string
  stream?: boolean
  temperature?: number
  num_predict?: number
}

interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
}

const DEFAULT_MODEL = process.env.IA_MODEL || 'llama2:7b'
const OLLAMA_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'

export async function callOllama(
  prompt: string,
  options?: Partial<OllamaRequest>
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model || DEFAULT_MODEL,
        prompt,
        stream: false,
        temperature: options?.temperature ?? 0,
        num_predict: options?.num_predict ?? 200,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data: OllamaResponse = await response.json()
    return data.response
  } catch (error: any) {
    console.error('Ollama API call failed:', error)

    // Fallback: return empty response if Ollama is not available
    if (error.name === 'AbortError' || error.message.includes('fetch')) {
      console.warn('Ollama not available, using fallback')
      return ''
    }

    throw error
  }
}

// Alternative: Claude API (Anthropic)
export async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    console.error('Claude API call failed:', error)
    throw error
  }
}

// Main function that switches based on configuration
export async function callAI(prompt: string): Promise<string> {
  const model = process.env.IA_MODEL

  if (model === 'claude') {
    return callClaude(prompt)
  }

  // Default to Ollama
  return callOllama(prompt)
}
