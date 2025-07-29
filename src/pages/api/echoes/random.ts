import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  try {
    const bucket = context.locals.runtime.env.ECHOES_BUCKET;
    const publicUrl = context.locals.runtime.env.R2_PUBLIC_URL;

    if (!bucket || !publicUrl) {
      throw new Error('R2 bucket or public URL not configured.');
    }

    const listed = await bucket.list();
    // We only want the audio files to start, to ensure we have a valid pair.
    const audioFiles = listed.objects.filter((obj) => obj.key.endsWith('.webm'));

    if (audioFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'No echoes found.' }), { status: 404 });
    }

    const randomFile = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const echoId = randomFile.key.replace('.webm', '');

    // Now, get the corresponding text file
    const textObject = await bucket.get(`${echoId}.txt`);
    if (!textObject) {
      throw new Error(`Transcript for ${echoId} not found.`);
    }
    const transcript = await textObject.text();

    // Construct the full public URL for the audio
    const audioUrl = `${publicUrl}/${randomFile.key}`;

    return new Response(JSON.stringify({ audioUrl, transcript }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting random echo pair:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};
