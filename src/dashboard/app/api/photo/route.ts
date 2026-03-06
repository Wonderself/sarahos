import { NextRequest, NextResponse } from 'next/server';

const FAL_KEY = process.env['FAL_KEY'];

// Style presets mapping — appended to the user prompt
const STYLE_PRESETS: Record<string, string> = {
  realistic: 'photorealistic, high detail, 8k',
  illustration: 'digital illustration, clean lines, vibrant colors',
  'flat-design': 'flat design, minimal, geometric, vector style',
  watercolor: 'watercolor painting, soft edges, artistic',
  '3d-render': '3D render, octane render, volumetric lighting',
  minimalist: 'minimalist, clean, simple composition, white space',
  cinematic: 'cinematic, dramatic lighting, film grain, movie still',
  portrait: 'professional portrait photography, studio lighting, shallow depth of field',
  bw: 'black and white photography, high contrast, monochrome, dramatic shadows',
  'film-grain': 'film photography, Kodak Portra 400, grain, warm faded tones, nostalgic',
  polaroid: 'instant polaroid photo, slightly saturated, warm golden light, retro',
  vintage: 'vintage sepia tones, aged film, faded colors, nostalgic atmosphere',
  'oil-painting': 'oil painting, visible brush strokes, classical chiaroscuro, fine art',
  'pencil-sketch': 'pencil drawing, graphite, detailed hatching, paper texture, naturalistic sketch',
  impressionist: 'impressionist painting, visible color touches, diffuse light, Monet style',
  surrealist: 'surrealist art, dreamlike, impossible geometry, Salvador Dali style',
  'pop-art': 'pop art, Andy Warhol style, halftone dots, neon vivid colors, bold graphic',
  'pixel-art': 'pixel art, 16-bit retro gaming, limited palette, SNES style',
  comics: 'comic book style, bold ink outlines, action lines, vivid primary colors',
  'neon-cyberpunk': 'cyberpunk neon, pink and blue neon signs, rain, holographic, futuristic night',
  anime: 'anime style, Japanese animation, pastel sunset, Studio Ghibli inspired',
  'movie-poster': 'movie poster style, dramatic lighting, cinematic composition, bold typography space',
  gothic: 'gothic atmosphere, dark, moonlight, fog, broken stained glass, mysterious',
  'art-deco': 'art deco style, 1920s, gold and black geometric patterns, elegant typography',
  vaporwave: 'vaporwave aesthetic, Greek statue, palm trees, purple pink sunset, retro grid',
  'food-photo': 'professional food photography, natural side lighting, shallow depth of field, warm tones, magazine quality',
  architecture: 'real estate photography, bright interior, wide angle lens, natural light, professional staging',
  'cartoon-avatar': 'modern 3D cartoon style, Pixar quality, soft studio lighting, clean gradient background, expressive',
};

// Dimension presets
const DIMENSION_PRESETS: Record<string, { width: number; height: number }> = {
  'square': { width: 1024, height: 1024 },
  'landscape': { width: 1344, height: 768 },
  'portrait': { width: 768, height: 1344 },
  'social-story': { width: 768, height: 1344 },
  'social-post': { width: 1024, height: 1024 },
  'banner': { width: 1536, height: 512 },
  'thumbnail': { width: 512, height: 512 },
  'youtube-thumb': { width: 1280, height: 720 },
  'pinterest': { width: 1000, height: 1500 },
  'linkedin': { width: 1200, height: 627 },
  'ig-portrait': { width: 1080, height: 1350 },
};

export async function POST(req: NextRequest) {
  if (!FAL_KEY) {
    return NextResponse.json({
      error: 'fal.ai API key not configured',
      configured: false,
      message: 'Add FAL_KEY to your .env to enable photo generation.',
    }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { prompt, negativePrompt, style, dimensions, hd } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build enhanced prompt with style
    let enhancedPrompt = prompt;
    if (style && STYLE_PRESETS[style]) {
      enhancedPrompt = `${prompt}, ${STYLE_PRESETS[style]}`;
    }
    if (negativePrompt) {
      // Append negative prompt as negative guidance note (Flux doesn't support neg prompt natively but we include it for quality)
      enhancedPrompt = `${enhancedPrompt}. Avoid: ${negativePrompt}`;
    }

    // Resolve dimensions
    const dims = DIMENSION_PRESETS[dimensions || 'square'] ?? DIMENSION_PRESETS['square']!;

    // Schnell = fast (4 steps), Dev = HD quality (28 steps)
    const model = hd ? 'fal-ai/flux/dev' : 'fal-ai/flux/schnell';

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60_000);
    const res = await fetch(`https://fal.run/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: { width: dims.width, height: dims.height },
        num_inference_steps: hd ? 28 : 4,
        num_images: 1,
        enable_safety_checker: false,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `fal.ai error: ${errText}` }, { status: res.status });
    }

    const data = await res.json();
    const imageUrl = data.images?.[0]?.url as string | undefined;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image returned by fal.ai' }, { status: 500 });
    }

    // fal.ai Flux is synchronous — return completed immediately
    return NextResponse.json({ imageUrl, status: 'completed', model });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Photo generation error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: !!FAL_KEY,
    provider: 'fal.ai',
    models: ['fal-ai/flux/schnell', 'fal-ai/flux/dev'],
    status: FAL_KEY ? 'active' : 'not_configured',
    message: FAL_KEY
      ? 'Photo generation active via fal.ai Flux'
      : 'Add FAL_KEY to .env to enable AI photo generation.',
    styles: Object.keys(STYLE_PRESETS),
    dimensions: Object.keys(DIMENSION_PRESETS),
  });
}
