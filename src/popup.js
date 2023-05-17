document.getElementById('saveButton').addEventListener('click', function() {
    var replacementPercentage = document.getElementById('replacementPercentage').value;
    localStorage.setItem('replacementPercentage', replacementPercentage);
  });
