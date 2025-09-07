// Background script for fal.ai API integration using direct calls

// Get API key from storage
async function getApiKey() {
  try {
    const result = await chrome.storage.local.get(['falApiKey']);
    return result.falApiKey || null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
}

// Submit image processing job using fal.ai synchronous API (no queue)
async function submitImageProcessingJob(base64Image, prompt) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('No fal.ai API key found. Please add your API key in the popup.');
    }

    console.log('Submitting to fal.ai (synchronous):', { prompt, imageUrl: base64Image.substring(0, 50) + '...' });

    // Use the synchronous endpoint instead of queue
    const response = await fetch('https://fal.run/fal-ai/nano-banana/edit', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        image_urls: [base64Image],
        num_images: 1,
        output_format: "jpeg"
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API error response:', errorData);
      throw new Error(`fal.ai API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('fal.ai synchronous response:', data);
    
    // For synchronous API, we get the result directly
    if (data && data.images && data.images.length > 0) {
      return {
        success: true,
        imageUrl: data.images[0].url
      };
    } else {
      throw new Error('No images returned from API');
    }
  } catch (error) {
    console.error('Submit error:', error);
    throw error;
  }
}

// Check job result - simplified approach using only the main endpoint
async function checkJobResult(requestId) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      throw new Error('No fal.ai API key found');
    }

    console.log(`Checking job result: ${requestId}`);

    const response = await fetch(`https://queue.fal.run/fal-ai/nano-banana/edit/requests/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${apiKey}`
      }
    });

    if (!response.ok) {
      // 404 means job is still processing or not found
      if (response.status === 404) {
        console.log('Job still processing (404)');
        return { status: 'IN_PROGRESS' };
      }
      
      const errorData = await response.text();
      console.error(`Request failed: ${response.status} ${errorData}`);
      throw new Error(`Request failed: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Job result response:', data);
    
    // Check if we have the completed result
    if (data && data.images && data.images.length > 0) {
      console.log('Job completed successfully');
      return { status: 'COMPLETED', result: data };
    }
    
    // If no images yet, still processing
    console.log('Job not completed yet (no images)');
    return { status: 'IN_PROGRESS' };
    
  } catch (error) {
    console.error('Job check error:', error);
    throw error;
  }
}

// Poll job until completion - simplified version
async function pollJobUntilComplete(requestId, maxAttempts = 60, intervalMs = 5000) {
  console.log(`Starting to poll job ${requestId} (max ${maxAttempts} attempts, ${intervalMs}ms intervals)`);
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${maxAttempts}: Checking job ${requestId}`);
      
      const result = await checkJobResult(requestId);
      
      if (result.status === 'COMPLETED') {
        console.log('Job completed successfully!');
        return result.result;
      }
      
      if (result.status === 'FAILED') {
        throw new Error(result.error || 'Job failed');
      }

      // Status is IN_PROGRESS - keep polling
      const remainingTime = (maxAttempts - attempt - 1) * intervalMs / 1000;
      console.log(`Job still processing. Waiting ${intervalMs/1000}s (${remainingTime}s remaining)`);
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error.message);
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying on error
      console.log(`Retrying in ${intervalMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  throw new Error(`Job polling timeout after ${maxAttempts} attempts (${maxAttempts * intervalMs / 1000}s total)`);
}

// Process image with AI using synchronous API (no polling needed)
async function processImage(imageData, prompt, selectedPerson) {
  try {
    console.log('Processing image with AI (synchronous)...');
    
    // Submit job and get result directly
    const result = await submitImageProcessingJob(imageData, prompt);
    console.log('Processing completed:', result);
    
    return result;
    
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  if (request.action === 'processImage') {
    // Handle async processing
    processImage(request.imageData, request.prompt, request.selectedPerson)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({
          success: false,
          error: error.message
        });
      });
    
    // Return true to indicate we'll send response asynchronously
    return true;
  }
  
  if (request.action === 'setSelectedPerson') {
    chrome.storage.local.set({ selectedPerson: request.person })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
  
  if (request.action === 'setApiKey') {
    chrome.storage.local.set({ falApiKey: request.apiKey })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  }
});

console.log('Swap the Genes background script loaded');