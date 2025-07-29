import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';

// This line is the fix. It tells Astro to treat this file as a
// dynamic, server-side endpoint, even in the local dev server.
export const prerender = false;

// Type guard to check if an object has a 'text' property of type string
function isTextSubmission(body: unknown): body is { text: string } {
  return (
    typeof body === 'object' && body !== null && 'text' in body && typeof (body as { text: string }).text === 'string'
  );
}

export const POST: APIRoute = async (context) => {
  try {
    const bucket = context.locals.runtime.env.ECHOES_BUCKET;
    const ai = context.locals.runtime.env.AI;
    const request = context.request;

    if (!bucket || !ai) {
      throw new Error('Cloudflare bindings for R2 or AI not found.');
    }

    const contentType = request.headers.get('content-type');
    const echoId = uuidv4();

    if (contentType?.includes('audio/webm')) {
      // --- Handle Audio Submission ---
      const audioBlob = await request.blob();
      const audioBuffer = await audioBlob.arrayBuffer();

      // 1. Upload the original audio
      await bucket.put(`${echoId}.webm`, audioBlob);

      // 2. Transcribe the audio to text using Cloudflare AI
      const transcriptResponse: unknown = await ai.run('@cf/openai/whisper', {
        audio: [...new Uint8Array(audioBuffer)],
      });
      // Type check the AI response
      const transcript =
        typeof transcriptResponse === 'object' &&
        transcriptResponse !== null &&
        'text' in transcriptResponse &&
        typeof (transcriptResponse as { text: string }).text === 'string'
          ? (transcriptResponse as { text: string }).text
          : '[Could not transcribe audio]';

      // 3. Save the transcript text
      await bucket.put(`${echoId}.txt`, transcript);
    } else if (contentType?.includes('application/json')) {
      // --- Handle Text Submission ---
      const body: unknown = await request.json(); // Read body as 'unknown' for safety

      // Use the type guard to validate the body
      if (!isTextSubmission(body) || !body.text) {
        throw new Error('Invalid text submission format or empty text.');
      }
      const { text } = body;

      // 1. Save the original text
      await bucket.put(`${echoId}.txt`, text);

      // 2. Convert the text to speech using Cloudflare AI
      const ttsResponse: unknown = await ai.run('@cf/meta/m2m100-1.2b', {
        text: text,
        source_lang: 'english',
        target_lang: 'english',
      });
      // Type check the AI response
      if (!(ttsResponse instanceof ArrayBuffer)) {
        throw new Error('TTS AI did not return a valid audio buffer.');
      }

      // 3. Upload the generated audio
      await bucket.put(`${echoId}.webm`, ttsResponse);
    } else {
      throw new Error('Unsupported content type.');
    }

    return new Response(JSON.stringify({ success: true, message: 'Echo processed.' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error processing echo:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ success: false, message: errorMessage }), {
      status: 500,
    });
  }
};
