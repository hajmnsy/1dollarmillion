import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function editLogo() {
  const zai = await ZAI.create();

  // Read the source image
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/Gemini_Generated_Image_bkkorubkkorubkko.png');
  const base64Image = imageBuffer.toString('base64');
  const dataUrl = `data:image/png;base64,${base64Image}`;

  console.log('Calling image edit API...');

  const response = await zai.images.generations.edit({
    prompt: 'Modern brand logo: a stylized green dollar sign icon merged with the number 1, on a solid pure black background. The green color should be vibrant emerald green (#2a8754). Completely remove any white background and replace with pure black (#000000). High contrast, clean, professional fintech brand logo, centered composition, minimal design. Preserve the green icon exactly, only change the background from white to solid black.',
    images: [{ url: dataUrl }],
    size: '1024x1024',
  });

  const imageBase64 = response.data[0].base64;
  const outputBuffer = Buffer.from(imageBase64, 'base64');
  fs.writeFileSync('/home/z/my-project/public/logo-main.png', outputBuffer);

  console.log('✅ Logo saved to /home/z/my-project/public/logo-main.png');
  console.log(`File size: ${outputBuffer.length} bytes`);
}

editLogo().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
