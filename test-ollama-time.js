const startTime = Date.now();

fetch('http://localhost:11434/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3',
    messages: [{ role: 'user', content: 'What are your core skills? Please give a short summary.' }]
  })
})
  .then(res => res.json())
  .then(data => {
    const timeTaken = (Date.now() - startTime) / 1000;
    console.log(`Response time: ${timeTaken} seconds`);
    console.log(`Content length: ${data.choices[0].message.content.length} characters`);
  })
  .catch(err => console.error(err));
