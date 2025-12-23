# Leonardo AI Images

Generate stunning custom images for your website using Leonardo AI.

## What is Leonardo AI?

Leonardo AI is a powerful image generation platform integrated into Stargate. It creates:
- Hero backgrounds
- Product photography
- Team portraits
- Illustrations
- Icons and graphics
- Lifestyle imagery

## Accessing Leonardo

### Via Visual Editor
1. Select an image element
2. Click **Generate Image**
3. Enter your prompt
4. Choose style options
5. Click Generate

### Via Merlin Chat
Ask Merlin to generate images:
> "Generate a hero image of a modern coffee shop interior with warm lighting"

### Via Image Panel
Click the Leonardo AI tab in the right sidebar for quick generation.

## Writing Effective Prompts

### Basic Structure

```
[Subject], [style], [lighting], [mood], [details]
```

### Examples

**Hero Background:**
> "Modern office building at sunset, aerial view, cinematic lighting, professional atmosphere, 8k quality"

**Product Photo:**
> "Artisan coffee cup on marble table, steam rising, warm natural light, minimalist background, product photography style"

**Team Portrait:**
> "Professional business headshot, friendly smile, neutral gray background, soft lighting, corporate style"

**Lifestyle Image:**
> "Happy family cooking together in modern kitchen, natural daylight, candid moment, warm colors"

## Style Options

### Photography Styles
- **PHOTOGRAPHY** - Realistic photo quality
- **CINEMATIC** - Movie-like dramatic lighting
- **PRODUCT_PHOTOGRAPHY** - Clean product shots
- **PORTRAIT** - Professional headshots

### Art Styles
- **ILLUSTRATION** - Digital art style
- **3D_RENDER** - 3D rendered graphics
- **ANIME** - Japanese animation style
- **WATERCOLOR** - Painted effect

### Presets
- **DYNAMIC** - High contrast, vibrant
- **NONE** - Pure prompt-based
- **VIBRANT** - Saturated colors
- **FILM_NOIR** - Black and white classic

## Image Settings

### Dimensions

| Aspect Ratio | Size | Use Case |
|--------------|------|----------|
| 16:9 | 1024x576 | Hero banners |
| 1:1 | 1024x1024 | Profile photos |
| 4:3 | 1024x768 | Gallery images |
| 3:4 | 768x1024 | Portrait mode |

### Quality

- **Fast** - Quick generation, good quality
- **Standard** - Balanced speed/quality
- **High** - Best quality, slower

### Number of Images

Generate 1-4 variations at once to choose the best.

## Integration with Website

### Automatic Sizing
Images are automatically optimized:
- Converted to WebP format
- Responsive srcset generated
- Lazy loading applied
- Proper alt text added

### Direct Insertion
Generated images insert directly into your project with proper structure.

## Prompt Tips

### Do's
- Be specific about subject and setting
- Include lighting descriptions
- Specify the mood/atmosphere
- Mention quality level (4k, 8k, photorealistic)
- Include camera angle if relevant

### Don'ts
- Avoid text in images (AI struggles with text)
- Don't request specific brands/logos
- Avoid real people's names
- Don't use copyrighted characters

## API Configuration

Add to your `.env`:

```env
LEONARDO_AI_API_KEY=your-api-key
LEONARDO_MODEL_ID=optional-specific-model
```

## Troubleshooting

### Generation Failed?
- Check API key validity
- Verify API credits remaining
- Simplify your prompt
- Try different style

### Wrong Style?
- Be more explicit in prompt
- Use style presets
- Add negative prompts
- Try different model

### Poor Quality?
- Use "8k, detailed, high quality" in prompt
- Select High quality setting
- Generate more variations
- Refine your prompt
