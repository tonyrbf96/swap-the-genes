// Simplified popup without Supabase authentication
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Swap the Genes popup loaded');
  
  // Get DOM elements
  const famousPersonSelect = document.getElementById('famousPerson');
  const falApiKeyInput = document.getElementById('falApiKey');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const status = document.getElementById('status');
  
  // Load saved data
  await loadSavedData();
  
  // Set up event listeners
  setupEventListeners();

async function loadSavedData() {
  try {
    const data = await chrome.storage.local.get(['falApiKey', 'selectedPerson']);
    
    // Load API key (but don't show it in UI for security)
    if (data.falApiKey) {
      document.getElementById('falApiKey').placeholder = 'API key saved (hidden)';
      showStatus('API key loaded', 'success');
    }
    
    // Load selected person
    if (data.selectedPerson) {
      document.getElementById('famousPerson').value = data.selectedPerson;
    }
  } catch (error) {
    console.error('Error loading saved data:', error);
  }
}

function setupEventListeners() {
  // Save API key
  document.getElementById('saveApiKeyBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('falApiKey').value.trim();
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }
    
    try {
      await chrome.storage.local.set({ falApiKey: apiKey });
      showStatus('API key saved successfully', 'success');
      document.getElementById('falApiKey').value = '';
      document.getElementById('falApiKey').placeholder = 'API key saved (hidden)';
    } catch (error) {
      showStatus('Error saving API key', 'error');
      console.error('Error saving API key:', error);
    }
  });
  
  // Save selected person when changed
  document.getElementById('famousPerson').addEventListener('change', async (e) => {
    const selectedPerson = e.target.value;
    try {
      await chrome.storage.local.set({ selectedPerson: selectedPerson });
      showStatus(`Selected: ${selectedPerson}`, 'success');
      
      // Also notify background script
      chrome.runtime.sendMessage({
        action: 'setSelectedPerson',
        person: selectedPerson
      });
    } catch (error) {
      console.error('Error saving selected person:', error);
    }
  });
}

function showStatus(message, type = 'info') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  
  // Clear after 3 seconds
  setTimeout(() => {
    status.textContent = '';
    status.className = '';
  }, 3000);
}


});