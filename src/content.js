chrome.storage.sync.get(['apiKey', 'language', 'replacementPercentage'], function(result) {
  if (!result.apiKey || !result.language || !result.replacementPercentage) {
    alert("Please set the OpenAI API key, target language and replacement percentage in the extension settings.");
  } else {
    var words = new Set();  // Use a Set instead of an Array
    var elements = document.body.getElementsByTagName('*');
    for(var i = 0; i < elements.length; i++) {
      var element = elements[i];
      for(var j = 0; j < element.childNodes.length; j++) {
        var node = element.childNodes[j];
        if(node.nodeType === 3) {  // text node
          var text = node.nodeValue;
          text.replace(/\b([a-zA-Z]{3,})\b/g, function(match) {  // Match words of 3 or more letters
            if (!match.match(/^[A-Z]/) && Math.random() < result.replacementPercentage / 100) {
              words.add(match);  // Add the word to the Set
            }
            return match;  // Return the original match
          });
        }
      }
    }

    // Create an object to store translations
    var translations = {};

    // Convert Set to Array
    var wordsArray = Array.from(words);

    // Chunk the wordsArray into groups of 50
    var chunks = [];
    for (var i = 0; i < wordsArray.length; i += 50) {
      chunks.push(wordsArray.slice(i, i + 50));
    }

    // Send each chunk to the translation API
    chunks.forEach(function(chunk) {
      var text = chunk.join(", ");
      var prompt = "Translate the following English words to " + result.language + ": '" + text + "'";
      console.log("ORIGINAL TEXT: ", text);

      chrome.runtime.sendMessage({contentScriptQuery: "translateText", prompt: prompt}, function(response) {
        if(chrome.runtime.lastError) {
          // An error occurred
          console.log("ERROR: ", chrome.runtime.lastError);
        } else if(response) {
          // We have a response
          if(response.error) {
            // The API returned an error
            console.log("API ERROR: ", response.error);
          } else if(response.translatedText) {
            console.log("TRANSLATED TEXT: ", response.translatedText);
            // Split the translated text back into individual words
            var translatedWords = response.translatedText.split(", ");

            // Store the translations
            for (var i = 0; i < chunk.length; i++) {
              translations[chunk[i]] = translatedWords[i];
            }
          } else {
            console.log("Unexpected response: ", response);
          }
        }
      });
    });

    // Wait for all translations to finish
    var interval = setInterval(function() {
      if(Object.keys(translations).length === words.size) {
        clearInterval(interval);

        // Replace the original words with the translated words in the page
        for(var i = 0; i < elements.length; i++) {
          var element = elements[i];
          for(var j = 0; j < element.childNodes.length; j++) {
            var node = element.childNodes[j];
            if(node.nodeType === 3) {  // text node
              var text = node.nodeValue;
              text = text.replace(/\b([a-zA-Z]{3,})\b/g, function(match) {  // Match words of 3 or more letters
                var translated = translations[match];
                if (translated) {
                  return translated;
                } else {
                  return match;
                }
              });
              node.nodeValue = text;
            }
          }
        }
      }
    }, 100);
  }
});
