// Load saved values when the popup is opened
window.onload = function() {
  chrome.storage.sync.get(['apiKey', 'language', 'replacementPercentage'], function(result) {
    if(result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    if(result.language) {
      document.getElementById('language').value = result.language;
    }
    if(result.replacementPercentage) {
      document.getElementById('replacementPercentage').value = result.replacementPercentage;
    }
  });
}

// Save the values when the save button is clicked
document.getElementById('saveButton').addEventListener('click', function() {
  var apiKey = document.getElementById('apiKey').value;
  var language = document.getElementById('language').value;
  var replacementPercentage = document.getElementById('replacementPercentage').value;

  // Save these values using chrome.storage
  chrome.storage.sync.set({'apiKey': apiKey, 'language': language, 'replacementPercentage': replacementPercentage}, function() {
    console.log("Settings saved");
  });
});
