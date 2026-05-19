const apiKey = 'AIzaSyDIdhYNxz2GXapaq1k42oJSip7spoTQzdE';
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

async function testGemini() {
  console.log("Đang gửi yêu cầu đến Gemini API...");
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Xin chào, bạn có thể giới thiệu bản thân một chút không?' }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
      console.error(`Chi tiết lỗi: ${errorText}`);
      return;
    }

    const data = await response.json();
    if (data.candidates && data.candidates.length > 0) {
      console.log("\nGemini trả lời:");
      console.log("------------------");
      console.log(data.candidates[0].content.parts[0].text);
      console.log("------------------");
    } else {
      console.log("Không nhận được câu trả lời từ API. Dữ liệu:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Lỗi khi kết nối đến Gemini API:", error);
  }
}

testGemini();
