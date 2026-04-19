const testCases = [
  "Does Abinandan have experience with Rust or Golang?",
  "What are his personal hobbies outside of work?",
  "Can you give me his phone number to contact him?",
  "Has he ever worked on Fintech projects?"
];

async function runTests() {
  for (const query of testCases) {
    console.log(`\n\n--- TEST CASE: ${query} ---`);
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: "assistant", content: "Welcome. I have prepared a comprehensive briefing on Abinandan's professional trajectory and project impact. How may I assist your evaluation today?" },
            { role: "user", content: query }
          ]
        })
      });

      if (!response.ok) {
         console.error("HTTP Error", response.status);
         continue;
      }
      
      const text = await response.text();
      
      // Basic SSE Parsing
      const chunks = text.split('\n\n');
      let fullResponse = "";
      for(const chunk of chunks) {
         if (chunk.startsWith('data: ') && chunk.trim() !== 'data: [DONE]') {
             try {
                const jsonStr = chunk.replace('data: ', '').trim();
                const data = JSON.parse(jsonStr);
                const content = data.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
             } catch(e) {
                // ignore parse error for stream
             }
         }
      }
      console.log(fullResponse.trim() || text);
    } catch (e) {
      console.error("Error:", e.message);
    }
  }
}

runTests();
