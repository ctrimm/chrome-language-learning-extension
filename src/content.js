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
          var splitText = text.split(' ');
          for(var k = 0; k < splitText.length; k++) {
            // Only add the word if it is not capitalized
            if(splitText[k] && !splitText[k].match(/^[A-Z]/) && Math.random() < result.replacementPercentage / 100) {
              words.add(splitText[k]);  // Add the word to the Set
            }
          }
        }
      }
    }

    // Convert the Set back to an Array for the join operation
    words = Array.from(words);

    // Send the text to the OpenAI translation API
    var text = words.join(" $$$ ");
    var prompt = "Translate the following English text to " + result.language + ", keeping ' $$$ ' as a delimiter: '" + text + "'";

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
          // Remove the delimiter from the translated text
          var cleanedText = response.translatedText.replace(/ \$\$\$ /g, ' ');

          // Split the cleaned text back into individual words
          var translatedWords = cleanedText.split(" ");
    
          // Create a translations object
          var translations = {};
          var wordsArray = Array.from(words);
          for(var i = 0; i < wordsArray.length; i++) {
            translations[wordsArray[i]] = translatedWords[i];
          }
    
          // Replace the original words with the translated words in the page
          for(var i = 0; i < elements.length; i++) {
            var element = elements[i];
            for(var j = 0; j < element.childNodes.length; j++) {
              var node = element.childNodes[j];
              if(node.nodeType === 3) {  // text node
                var text = node.nodeValue;
                var splitText = text.split(' ');
                for(var k = 0; k < splitText.length; k++) {
                  if(translations[splitText[k]]) {
                    splitText[k] = translations[splitText[k]];
                  }
                }
                node.nodeValue = splitText.join(' ');
              }
            }
          }
        } else {
          console.log("Unexpected response: ", response);
        }
      }
    });
  }
});
