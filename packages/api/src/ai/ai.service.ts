import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly ollamaUrl = 'http://localhost:11434/api/generate';
  private readonly model = 'qwen2.5:3b';

  async assist(prompt: string, lang: string = 'es') {
    const systemPrompt = lang === 'es'
      ? `Sos un asistente clínico experto para psicólog@s y profesionales de la salud mental. Ayudás a redactar notas clínicas profesionales, concisas y objetivas, sin imponer ninguna corriente terapéutica específica.

Reglas:
- Usá lenguaje técnico pero claro
- Sé objetivo, no interpretativo
- No diagnosticar, solo describir lo observado/refere el paciente
- No sugerir ninguna corriente terapéutica (TCC, psicoanálisis, gestalt, etc.)
- Si se menciona un plan, usá términos genéricos como "continuar con el abordaje", "seguimiento", "intervención", "trabajo terapéutico"
- Formato: párrafos cortos, bullet points si aplica`
      : `You are an expert clinical assistant for mental health professionals. You help write professional, concise, and objective clinical notes, without imposing any specific therapeutic approach.

Rules:
- Use technical but clear language
- Be objective, not interpretive
- Do not diagnose, only describe what was observed/reported
- Do not suggest any specific therapeutic approach (CBT, psychoanalysis, gestalt, etc.)
- If mentioning a plan, use generic terms like "continue with the approach", "follow-up", "intervention", "therapeutic work"
- Format: short paragraphs, bullet points when applicable`;

    return this.callOllama({
      prompt: `${systemPrompt}\n\nContexto del paciente/sesión:\n${prompt}\n\nRedactá la nota clínica profesional:`,
      temperature: 0.4,
      numPredict: 600,
    });
  }

  async organize(text: string, lang: string = 'es') {
    const systemPrompt = lang === 'es'
      ? `Sos un asistente clínico experto. Tomá el texto que te pase el profesional (que puede estar desordenado, con faltas de ortografía, o en formato de borrador) y organizalo como una nota clínica profesional, clara y estructurada.

Reglas:
- Mantené TODA la información que el profesional escribió
- Corregí ortografía y puntuación
- Estructurá en secciones si aplica
- No agregues secciones vacías
- No sugerir ninguna corriente terapéutica específica`
      : `You are an expert clinical assistant. Take the text the professional wrote and organize it as a professional, clear, structured clinical note.

Rules:
- Keep ALL the information the professional wrote
- Fix spelling and punctuation
- Structure in sections if applicable
- Do not add empty sections
- Do not suggest any specific therapeutic approach`;

    return this.callOllama({
      prompt: `${systemPrompt}\n\nTexto original del profesional:\n${text}\n\nNota clínica organizada:`,
      temperature: 0.3,
      numPredict: 800,
    });
  }

  private async callOllama(params: { prompt: string; temperature: number; numPredict: number }) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 2 min for first load

      const res = await fetch(this.ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: params.prompt,
          stream: false,
          options: {
            temperature: params.temperature,
            num_predict: params.numPredict,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`Ollama HTTP ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        content: data.response?.trim() || '',
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'El asistente tardó demasiado. El modelo puede estar cargando por primera vez (tarda 1-2 minutos en CPU). Intentá de nuevo.' };
      }
      console.error('[Ollama] Error:', err.message || err);
      return {
        success: false,
        error: 'El asistente de IA no está disponible. Verificá que Ollama esté corriendo.',
      };
    }
  }
}
