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
  // Save settings to chrome.storage.sync
  chrome.storage.sync.set({
    apiKey: document.getElementById('apiKey').value,
    language: document.getElementById('language').value,
    replacementPercentage: document.getElementById('replacementPercentage').value
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Settings saved successfully.';
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
});
