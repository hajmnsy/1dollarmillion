import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function generateArabicVoiceover() {
  const zai = await ZAI.create();

  // Arabic script (under 1024 chars)
  const arabicScript = `أهلاً بك في 1دولار ميليون. أول يانصيب بدون خسارة في العالم. أودع دولار واحد فقط. ابقَ نشطاً بمعدل دولار يومياً. واربح مليون دولار. كيف؟ ودائعك تُستثمر في Aave V3 لتوليد عائد. العائد يموّل سحوبات إضافية. رأس مالك محمي دائماً. الفائز يُختار عشوائياً عبر Chainlink VRF. عادل وشفاف وموثّق. ادعُ أصدقاءك واربح 1% من جائزتهم إذا فازوا. انضم اليوم. المستقبل يبدأ بدولار.`;

  console.log('Generating Arabic voiceover...');
  console.log('Script length:', arabicScript.length, 'chars');

  const response = await zai.audio.tts.create({
    input: arabicScript,
    voice: 'tongtong',
    speed: 0.9,
    response_format: 'wav',
    stream: false,
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));

  fs.writeFileSync('/home/z/my-project/download/marketing/voiceover-arabic.wav', buffer);
  console.log('✅ Arabic voiceover saved!');
  console.log('File size:', (buffer.length / 1024).toFixed(1), 'KB');
}

generateArabicVoiceover().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
