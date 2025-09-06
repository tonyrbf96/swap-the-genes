document.addEventListener('DOMContentLoaded', async function() {
  const authSection = document.getElementById('authSection');
  const userDashboard = document.getElementById('userDashboard');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const authMessage = document.getElementById('authMessage');
  
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const signoutBtn = document.getElementById('signoutBtn');
  const showSignup = document.getElementById('showSignup');
  const showLogin = document.getElementById('showLogin');
  
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const userEmail = document.getElementById('userEmail');
  
  // Removed actionBtn and result elements
  
  const imageInput = document.getElementById('imageInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const imagePreview = document.getElementById('imagePreview');
  const uploadProgress = document.getElementById('uploadProgress');
  const imageGallery = document.getElementById('imageGallery');
  
  let selectedFiles = [];
  let currentUser = null;

  function showMessage(message, type = 'error') {
    authMessage.textContent = message;
    authMessage.className = type;
    authMessage.style.display = 'block';
    setTimeout(() => {
      authMessage.style.display = 'none';
    }, 5000);
  }

  function showAuthSection() {
    authSection.style.display = 'block';
    userDashboard.style.display = 'none';
  }

  function showUserDashboard(user) {
    console.log('Setting currentUser to:', user); // Debug log
    authSection.style.display = 'none';
    userDashboard.style.display = 'block';
    userEmail.textContent = user.email;
    currentUser = user;
    loadUserImages();
  }

  function toggleForms() {
    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
  }

  async function checkAuthState() {
    try {
      const { user, error } = await supabase.getUser();
      if (user && !error) {
        showUserDashboard(user);
      } else {
        showAuthSection();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      showAuthSection();
    }
  }

  function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }
    
    return { valid: true };
  }

  function updateImagePreview() {
    imagePreview.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'preview-remove';
      removeBtn.textContent = '×';
      removeBtn.onclick = () => removeSelectedImage(index);
      
      previewItem.appendChild(img);
      previewItem.appendChild(removeBtn);
      imagePreview.appendChild(previewItem);
    });
    
    updateUploadButtonState();
  }

  function removeSelectedImage(index) {
    selectedFiles.splice(index, 1);
    updateImagePreview();
  }

  function updateUploadButtonState() {
    const totalImages = selectedFiles.length;
    
    if (totalImages >= 5) {
      uploadBtn.textContent = 'Maximum 5 images selected';
      uploadBtn.disabled = true;
    } else if (totalImages === 0) {
      uploadBtn.textContent = 'Choose Images';
      uploadBtn.disabled = false;
    } else {
      uploadBtn.textContent = `Upload ${totalImages} image${totalImages > 1 ? 's' : ''}`;
      uploadBtn.disabled = false;
    }
  }

  async function loadUserImages() {
    console.log('loadUserImages - currentUser:', currentUser); // Debug log
    if (!currentUser) return;
    
    try {
      console.log('Loading images for user ID:', currentUser.id); // Debug log
      const { data: images, error } = await supabase.listUserImages(currentUser.id);
      
      if (error) {
        console.error('Failed to load images:', error);
        return;
      }
      
      displayUserImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  function displayUserImages(images) {
    imageGallery.innerHTML = '';
    
    console.log('Displaying images:', images); // Debug log
    
    if (!images || images.length === 0) {
      imageGallery.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center; width: 100%;">No images uploaded yet</p>';
      return;
    }
    
    images.forEach((image) => {
      console.log('Processing image:', image); // Debug log
      
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      
      const img = document.createElement('img');
      img.src = image.publicUrl;
      img.alt = 'User image';
      img.onclick = () => openImageModal(image.publicUrl);
      
      // Add error handling for image loading
      img.onerror = () => {
        console.error('Failed to load image:', image.publicUrl);
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiPkVycm9yPC90ZXh0Pgo8L3N2Zz4K';
      };
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteUserImage(image.name);
      };
      
      galleryItem.appendChild(img);
      galleryItem.appendChild(deleteBtn);
      imageGallery.appendChild(galleryItem);
    });
  }

  function openImageModal(imageUrl) {
    window.open(imageUrl, '_blank');
  }

  async function deleteUserImage(fileName) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    console.log('Attempting to delete image:', fileName, 'for user:', currentUser); // Debug log
    
    if (!currentUser || !currentUser.id) {
      console.error('Current user or user ID not available:', currentUser);
      showMessage('User not authenticated');
      return;
    }
    
    try {
      const { error } = await supabase.deleteImage(fileName, currentUser.id);
      
      if (error) {
        showMessage('Failed to delete image: ' + error.message);
        return;
      }
      
      showMessage('Image deleted successfully!', 'success');
      loadUserImages();
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Error deleting image');
    }
  }

  async function uploadImages() {
    if (selectedFiles.length === 0 || !currentUser) return;
    
    uploadProgress.style.display = 'block';
    uploadProgress.textContent = 'Uploading images...';
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        uploadProgress.textContent = `Uploading image ${index + 1} of ${selectedFiles.length}...`;
        const result = await supabase.uploadImage(file, currentUser.id);
        return result;
      });
      
      const results = await Promise.all(uploadPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        showMessage(`Some uploads failed: ${errors.map(e => e.error.message).join(', ')}`);
      } else {
        showMessage('All images uploaded successfully!', 'success');
        selectedFiles = [];
        updateImagePreview();
        loadUserImages();
      }
    } catch (error) {
      showMessage('Upload error: ' + error.message);
    } finally {
      uploadProgress.style.display = 'none';
      updateUploadButtonState();
    }
  }

  uploadBtn.addEventListener('click', () => {
    if (selectedFiles.length === 0) {
      imageInput.click();
    } else {
      uploadImages();
    }
  });

  imageInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    const currentTotal = selectedFiles.length;
    const maxAllowed = 5 - currentTotal;
    
    if (files.length > maxAllowed) {
      showMessage(`You can only upload ${maxAllowed} more image${maxAllowed !== 1 ? 's' : ''}`);
      files.splice(maxAllowed);
    }
    
    const validFiles = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        showMessage(validation.error);
      }
    }
    
    selectedFiles.push(...validFiles);
    updateImagePreview();
    
    imageInput.value = '';
  });

  showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
  });

  showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    toggleForms();
  });

  loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
      showMessage('Please fill in all fields');
      return;
    }

    try {
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;
      
      const { user, error } = await supabase.signIn(email, password);
      
      if (error) {
        showMessage(error.message || 'Login failed');
      } else if (user) {
        showMessage('Login successful!', 'success');
        showUserDashboard(user);
        loginEmail.value = '';
        loginPassword.value = '';
      }
    } catch (error) {
      showMessage('Network error. Please try again.');
    } finally {
      loginBtn.textContent = 'Sign In';
      loginBtn.disabled = false;
    }
  });

  signupBtn.addEventListener('click', async () => {
    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    
    if (!email || !password) {
      showMessage('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters');
      return;
    }

    try {
      signupBtn.textContent = 'Signing up...';
      signupBtn.disabled = true;
      
      const { user, error } = await supabase.signUp(email, password);
      
      if (error) {
        showMessage(error.message || 'Signup failed');
      } else if (user) {
        showMessage('Account created successfully!', 'success');
        showUserDashboard(user);
        signupEmail.value = '';
        signupPassword.value = '';
      }
    } catch (error) {
      showMessage('Network error. Please try again.');
    } finally {
      signupBtn.textContent = 'Sign Up';
      signupBtn.disabled = false;
    }
  });

  signoutBtn.addEventListener('click', async () => {
    try {
      signoutBtn.textContent = 'Signing out...';
      signoutBtn.disabled = true;
      
      await supabase.signOut();
      showMessage('Signed out successfully!', 'success');
      showAuthSection();
    } catch (error) {
      showMessage('Error signing out');
    } finally {
      signoutBtn.textContent = 'Sign Out';
      signoutBtn.disabled = false;
    }
  });

  // Removed actionBtn event listener and URL display functionality

  await checkAuthState();
});