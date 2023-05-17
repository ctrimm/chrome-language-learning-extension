function fetchTranslation(prompt, sendResponse) {
  chrome.storage.sync.get(['apiKey', 'language'], function(result) {
    if (!result.apiKey || !result.language) {
      sendResponse({ error: "Please set the OpenAI API key and target language in the extension settings." });
      return;
    }

    var url = "https://api.openai.com/v1/completions";

    var headers = {
      'Authorization': 'Bearer ' + result.apiKey,
      'Content-Type': 'application/json'
    };

    var data = {
      "model": "text-davinci-003",
      "prompt": prompt,
      "max_tokens": 200,
      "temperature": 0.2
    };

    fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      if (data.choices && data.choices[0]) {
        sendResponse({ translatedText: data.choices[0].text.trim() });
      } else if (data.error) {
        sendResponse({ error: data.error.message });
      } else {
        sendResponse({ error: "Unexpected API response." });
      }
    })
    .catch(error => sendResponse({ error: error.toString() }));
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.contentScriptQuery == "translateText") {
    fetchTranslation(request.prompt, sendResponse);
    return true;  // will respond asynchronously
  }
});
