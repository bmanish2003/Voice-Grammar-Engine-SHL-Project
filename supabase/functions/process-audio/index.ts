import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GrammarAnalysis {
  transcript: string;
  grammar_errors_count: number;
  sentence_structure_score: number;
  fluency_score: number;
  vocabulary_score: number;
  repetition_count: number;
  filler_words_count: number;
  feedback: string;
}

function calculateScore(a: GrammarAnalysis): number {
  const score = (
    0.30 * a.sentence_structure_score +
    0.25 * a.fluency_score +
    0.20 * a.vocabulary_score +
    0.15 * Math.max(0, (10 - a.grammar_errors_count)) / 10 * 10 +
    0.05 * Math.max(0, (10 - a.repetition_count)) / 10 * 10 +
    0.05 * Math.max(0, (10 - a.filler_words_count)) / 10 * 10
  ) * 10;
  return Math.round(Math.min(100, Math.max(0, score)));
}

function getGrade(score: number): string {
  if (score <= 40) return "Poor";
  if (score <= 60) return "Average";
  if (score <= 80) return "Good";
  return "Excellent";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) throw new Error('No audio file provided');

    // Read audio file and convert to base64
    const audioBytes = new Uint8Array(await audioFile.arrayBuffer());
    const audioBase64 = base64Encode(audioBytes);
    
    // Determine MIME type
    const mimeType = audioFile.type || (audioFile.name.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg');

    // Use Gemini to transcribe AND analyze in one call
    const prompt = `You are given an audio file of spoken English. Please do the following:

1. Transcribe the audio exactly as spoken.
2. Analyze the transcript for spoken English grammar quality.

Return ONLY a valid JSON object with these exact fields:
{
  "transcript": "<exact transcription of the audio>",
  "grammar_errors_count": <number 0-20>,
  "sentence_structure_score": <number 0-10>,
  "fluency_score": <number 0-10>,
  "vocabulary_score": <number 0-10>,
  "repetition_count": <number 0-20>,
  "filler_words_count": <number 0-20>,
  "feedback": "<2-3 sentences of actionable feedback for improving spoken grammar>"
}

No markdown, no code blocks, just the JSON object.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a linguistics expert and audio transcription specialist. Respond with ONLY valid JSON, no markdown, no code blocks.' },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:${mimeType};base64,${audioBase64}` 
                } 
              }
            ]
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('AI gateway error:', aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits in Settings → Workspace → Usage.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI analysis error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    let analysisText = aiData.choices?.[0]?.message?.content || '';
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let analysis: GrammarAnalysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Failed to parse analysis response');
    }

    const score = calculateScore(analysis);
    const grade = getGrade(score);

    return new Response(JSON.stringify({
      transcript: analysis.transcript,
      analysis: {
        grammar_errors_count: analysis.grammar_errors_count,
        sentence_structure_score: analysis.sentence_structure_score,
        fluency_score: analysis.fluency_score,
        vocabulary_score: analysis.vocabulary_score,
        repetition_count: analysis.repetition_count,
        filler_words_count: analysis.filler_words_count,
        feedback: analysis.feedback,
      },
      score,
      grade,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Process audio error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
