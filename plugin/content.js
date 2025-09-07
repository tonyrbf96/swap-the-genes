// Simple content script - just add buttons to American Eagle product images

// Only run on American Eagle website
if (window.location.hostname.includes('ae.com')) {
  console.log('Swap the Genes: Starting on American Eagle');
  
  // Add CSS for button
  const style = document.createElement('style');
  style.textContent = `
    .product-tile-image-container {
      position: relative;
    }
    
    .dressmeup-btn {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.95);
      color: #24272a;
      border: 1px solid rgba(36, 39, 42, 0.1);
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      z-index: 9999;
      pointer-events: auto;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(4px);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .dressmeup-btn:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .dressmeup-btn:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(style);
  
  // Function to add button to product container (not displacing images)
  function addButton(container) {
    // Skip if button already exists
    if (container.querySelector('.dressmeup-btn')) return;
    
    const button = document.createElement('button');
    button.className = 'dressmeup-btn';
    button.innerHTML = '🪄';
    button.title = 'Try this style on a celebrity';
    button.setAttribute('aria-label', 'Transform with AI');
    
    button.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await processImage(container, button);
    };
    
    // Add to the main container so it overlays without displacing content
    container.appendChild(button);
    console.log('Added button to product container');
  }
  
  // Process image with AI
  async function processImage(container, button) {
    try {
      // Show loading state
      button.innerHTML = '⏳';
      button.disabled = true;
      
      // Find the first product image - look in picture elements first
      const img = container.querySelector(
        'picture img, ' +
        'img[data-test="product-image"], ' +
        'img[src*="scene7"], ' +
        'img[src*="product"], ' +
        'img[src*="ae.com"], ' +
        'img[alt*="AE"], ' +
        'img[alt*="product"], ' +
        'img[class*="product"], ' +
        'img'
      );
      if (!img || !img.src) {
        console.error('No product image found in container:', container);
        throw new Error('No product image found');
      }
      
      console.log('Processing image:', img.src);
      
      // Get selected person from storage
      const selectedPerson = await getSelectedPerson();
      
      // Download image as base64
      const base64Image = await downloadImageAsBase64(img.src);
      
      // Create prompt
      const prompt = `Replace the model with ${selectedPerson}, replace the model skin tone, hair, and body composition but keep intact the image features like camera, clothes and position`;
      
      // Process with AI using background script
      console.log('Sending to background script:', { prompt, selectedPerson });
      const result = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'processImage',
          imageData: base64Image,
          prompt: prompt,
          selectedPerson: selectedPerson
        }, (response) => {
          console.log('Background response:', response);
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
      });
      
      if (result.success && result.imageUrl) {
        // Replace ALL product images in this container
        const allImages = container.querySelectorAll(
          'picture img, ' +
          'img[data-test="product-image"], ' +
          'img[src*="scene7"], ' +
          'img[src*="product"], ' +
          'img[src*="ae.com"], ' +
          'img[alt*="AE"], ' +
          'img[alt*="product"], ' +
          'img[class*="product"], ' +
          'img'
        );
        console.log(`Found ${allImages.length} product images to replace`);
        
        allImages.forEach((image, index) => {
          image.src = result.imageUrl;
          image.setAttribute('data-processed', 'true');
          console.log(`Replaced image ${index + 1}`);
        });
        
        // Also update any lazy loading sources in picture elements
        const allSources = container.querySelectorAll('picture source');
        allSources.forEach(source => {
          if (source.srcset) {
            source.srcset = result.imageUrl;
          }
        });
        
        console.log('All images replaced successfully');
      } else {
        throw new Error('AI processing failed');
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing image: ' + error.message);
    } finally {
      // Reset button state
      button.innerHTML = '🪄';
      button.disabled = false;
    }
  }
  
  // Get selected person from storage
  async function getSelectedPerson() {
    try {
      const result = await chrome.storage.local.get(['selectedPerson']);
      return result.selectedPerson || 'Will Smith';
    } catch (error) {
      console.error('Error getting selected person:', error);
      return 'Will Smith';
    }
  }
  
  // Download image as base64
  async function downloadImageAsBase64(imageUrl) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }
  
  // Find and add buttons
  function scanProducts() {
    // Look for product listing containers
    const listingContainers = document.querySelectorAll('.product-tile-image-container');
    
    // Look for product detail page - find parents of picture elements
    const pictures = document.querySelectorAll('picture img[alt*="AE"], picture img[src*="scene7"], picture img[class*="image"]');
    const pictureContainers = [];
    
    pictures.forEach(img => {
      // Get the parent of the picture element
      const picture = img.closest('picture');
      if (picture) {
        const container = picture.parentElement;
        if (container && !pictureContainers.includes(container)) {
          pictureContainers.push(container);
        }
      }
    });
    
    console.log(`Found ${listingContainers.length} listing containers and ${pictureContainers.length} picture containers`);
    
    const allContainers = [...listingContainers, ...pictureContainers];
    allContainers.forEach(container => {
      addButton(container);
    });
  }
  
  // Run scan after page loads
  setTimeout(scanProducts, 2000);
  
  // Watch for new content
  const observer = new MutationObserver(() => {
    scanProducts();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}