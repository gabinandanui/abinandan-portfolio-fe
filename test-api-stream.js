const fetch = require('node-fetch');

async function testStream() {
  const startTime = Date.now();
  console.log('Sending request to API...');
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Count from 1 to 10 very slowly.' }]
    })
  });

  console.log(`Initial response in ${(Date.now() - startTime) / 1000}s. Status: ${res.status}`);
  
  const decoder = new TextDecoder();
  for await (const chunk of res.body) {
    const text = decoder.decode(chunk, { stream: true });
    console.log(`[+${(Date.now() - startTime) / 1000}s] Received chunk of length ${text.length}: ${JSON.stringify(text).substring(0, 50)}...`);
  }
  console.log(`Finished in ${(Date.now() - startTime) / 1000}s`);
}

testStream();
