document.addEventListener('DOMContentLoaded', function() {
  const actionBtn = document.getElementById('actionBtn');
  const result = document.getElementById('result');

  actionBtn.addEventListener('click', function() {
    result.textContent = 'Button clicked! Extension is working.';
    result.style.color = '#4CAF50';
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab) {
      const urlDisplay = document.createElement('p');
      urlDisplay.textContent = `Current URL: ${currentTab.url}`;
      urlDisplay.style.fontSize = '12px';
      urlDisplay.style.color = '#666';
      document.querySelector('.container').appendChild(urlDisplay);
    }
  });
});