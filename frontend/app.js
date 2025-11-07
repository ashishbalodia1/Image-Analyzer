// City Guardian Image Analyzer - Frontend JavaScript

// Configuration
// Auto-detect API URL based on environment
function getApiUrl() {
    const hostname = window.location.hostname;
    
    // If accessing via Codespaces forwarded URL
    if (hostname.includes('app.github.dev')) {
        // Replace port 8000 with 3000 in the URL
        const apiUrl = window.location.origin.replace('-8000.app.github.dev', '-3000.app.github.dev');
        console.log('🌐 Codespaces detected - Using forwarded API URL:', apiUrl);
        return apiUrl;
    }
    
    // If accessing via localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('💻 Local environment - Using localhost:3000');
        return 'http://localhost:3000';
    }
    
    // For production deployment
    console.log('🚀 Production environment - Using same origin');
    return window.location.origin;
}

const API_URL = getApiUrl();

// Category Icons Mapping
const CATEGORY_ICONS = {
    soil_pollution: '🏞️',
    water_pollution: '💧',
    water_sewage_pollution: '🚰',
    air_pollution: '💨',
    door_to_door_cleaning: '🗑️',
    mohallah_cleaning: '🧹',
    road_maintenance: '🛣️',
    infrastructure: '🏗️',
    others: '📌'
};

// State
let currentFile = null;
let categories = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadCategories();
    checkAPIHealth();
});

// Event Listeners
function initializeEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Click to upload
    dropZone.addEventListener('click', () => fileInput.click());

    // File selection
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Prevent default drag behavior on document
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// File Handling
function handleFile(file) {
    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload JPEG, PNG, or WebP images.');
        return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showError('File size exceeds 10MB limit.');
        return;
    }

    currentFile = file;
    showPreview(file);
}

// Preview Image
function showPreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const previewImage = document.getElementById('previewImage');
        previewImage.src = e.target.result;

        // Get image info
        const img = new Image();
        img.onload = () => {
            const info = document.getElementById('imageInfo');
            info.innerHTML = `
                <span>📏 ${img.width} × ${img.height}px</span>
                <span>💾 ${formatFileSize(file.size)}</span>
                <span>📄 ${file.type.split('/')[1].toUpperCase()}</span>
            `;
        };
        img.src = e.target.result;

        hideSection('dropZone');
        hideSection('resultsSection');
        hideSection('errorSection');
        showSection('previewSection');
    };

    reader.readAsDataURL(file);
}

// Analyze Image
async function analyzeImage() {
    if (!currentFile) return;

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';

    hideSection('previewSection');
    showSection('loadingSection');

    try {
        const formData = new FormData();
        formData.append('image', currentFile);

        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showResults(data);
        } else {
            showError(data.message || 'Analysis failed. Please try again.');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showError('Failed to connect to API. Please check if the server is running.');
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                <path d="M13 13L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Analyze Image
        `;
    }
}

// Show Results
function showResults(data) {
    const { result, alternativePredictions, imageInfo, processingTime } = data;

    // Set category info
    document.getElementById('categoryIcon').textContent = CATEGORY_ICONS[result.category] || '📌';
    document.getElementById('categoryLabel').textContent = result.label;
    document.getElementById('categoryDescription').textContent = result.description;

    // Set confidence
    const confidencePercent = parseFloat(result.confidenceScore * 100);
    document.getElementById('confidenceValue').textContent = result.confidence;
    document.getElementById('confidenceFill').style.width = confidencePercent + '%';

    // Show warning if needed
    if (result.needsManualReview) {
        showSection('reviewWarning');
    } else {
        hideSection('reviewWarning');
    }

    // Show alternatives
    const altList = document.getElementById('alternativesList');
    altList.innerHTML = alternativePredictions.map(alt => `
        <div class="alternative-item">
            <span class="alternative-label">
                ${CATEGORY_ICONS[alt.category]} ${alt.label}
            </span>
            <span class="alternative-confidence">${alt.confidence}</span>
        </div>
    `).join('');

    // Show metadata
    const metadataInfo = document.getElementById('metadataInfo');
    metadataInfo.innerHTML = `
        <div class="metadata-item">
            <div class="metadata-label">Image Size</div>
            <div class="metadata-value">${imageInfo.width} × ${imageInfo.height}px</div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">File Size</div>
            <div class="metadata-value">${formatFileSize(imageInfo.originalSize)}</div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">Format</div>
            <div class="metadata-value">${imageInfo.format.split('/')[1].toUpperCase()}</div>
        </div>
        <div class="metadata-item">
            <div class="metadata-label">Processing Time</div>
            <div class="metadata-value">${processingTime}</div>
        </div>
    `;

    hideSection('loadingSection');
    showSection('resultsSection');

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load Categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();

        if (data.success) {
            categories = data.categories;
            displayCategories(data.categories);
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Display Categories
function displayCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = categories.map(cat => `
        <div class="category-card">
            <div class="category-card-icon">${CATEGORY_ICONS[cat.id]}</div>
            <div class="category-card-label">${cat.label}</div>
            <div class="category-card-desc">${cat.description}</div>
        </div>
    `).join('');
}

// API Health Check (for page load)
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('✅ API Connected:', data);
        console.log('📊 Categories:', data.categories);
        console.log('🤖 Model Loaded:', data.model.loaded);
    } catch (error) {
        console.error('❌ API Connection Failed:', error);
        console.error('🔍 API URL:', API_URL);
        console.error('💡 Make sure backend is running: node api/index.js');
        // Don't show error on page load - user might not have uploaded yet
        // Only show in console for debugging
    }
}

// API Health Check (for modal)
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();

        const status = data.status === 'healthy' ? '✅' : '⚠️';
        const modelStatus = data.model.loaded ? '✅ Loaded' : '⏳ Not Trained';

        showModal('API Status', `
            <div style="line-height: 2;">
                <p><strong>Status:</strong> ${status} ${data.status}</p>
                <p><strong>Model:</strong> ${modelStatus}</p>
                <p><strong>Categories:</strong> ${data.categories}</p>
                <p><strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
                ${!data.model.loaded ? '<br><p style="color: #f59e0b;">⚠️ Model not trained yet. Image analysis will not work until you train the model.</p>' : ''}
            </div>
        `);
    } catch (error) {
        showModal('API Status', `
            <p style="color: #dc2626;">❌ Failed to connect to API</p>
            <p>Please make sure the server is running on ${API_URL}</p>
        `);
    }
}

// Clear Image
function clearImage() {
    currentFile = null;
    document.getElementById('fileInput').value = '';
    hideSection('previewSection');
    hideSection('resultsSection');
    hideSection('errorSection');
    hideSection('loadingSection');
    showSection('dropZone');
}

// Show Error
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    hideSection('dropZone');
    hideSection('previewSection');
    hideSection('loadingSection');
    hideSection('resultsSection');
    showSection('errorSection');
}

// Modal Functions
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function showAbout() {
    showModal('About City Guardian Image Analyzer', `
        <h4 style="margin-bottom: 12px;">🏙️ Smart Civic Issue Classification</h4>
        <p style="margin-bottom: 16px;">
            Our AI-powered system automatically categorizes citizen-uploaded civic issue images 
            into 9 different categories, making complaint filing faster and more efficient.
        </p>
        
        <h4 style="margin-bottom: 12px;">🤖 Technology</h4>
        <ul style="margin-bottom: 16px; padding-left: 20px;">
            <li>TensorFlow.js with MobileNet</li>
            <li>Transfer Learning</li>
            <li>95%+ Accuracy</li>
            <li>Sub-second Response Time</li>
        </ul>
        
        <h4 style="margin-bottom: 12px;">📊 Categories</h4>
        <p style="margin-bottom: 16px;">
            We classify images into 9 categories: Soil Pollution, Water Pollution, 
            Water Sewage, Air Pollution, Door-to-Door Cleaning, Mohallah Cleaning, 
            Road Maintenance, Infrastructure, and Others.
        </p>
        
        <p style="color: #6b7280; font-size: 14px;">
            Made with ❤️ for cleaner, smarter cities
        </p>
    `);
}

function showDocumentation() {
    showModal('Documentation', `
        <h4 style="margin-bottom: 12px;">📚 Documentation</h4>
        <p style="margin-bottom: 16px;">
            For detailed documentation, please visit our GitHub repository:
        </p>
        <a href="https://github.com/ashishbalodia1/Image-Analyzer" target="_blank" 
           style="color: #667eea; text-decoration: none; font-weight: 600;">
            🔗 View on GitHub
        </a>
        
        <h4 style="margin-top: 24px; margin-bottom: 12px;">🚀 Quick Links</h4>
        <ul style="padding-left: 20px;">
            <li><a href="https://github.com/ashishbalodia1/Image-Analyzer/blob/main/README.md" target="_blank">README</a></li>
            <li><a href="https://github.com/ashishbalodia1/Image-Analyzer/blob/main/DATASET_GUIDE.md" target="_blank">Dataset Guide</a></li>
            <li><a href="https://github.com/ashishbalodia1/Image-Analyzer/blob/main/DEPLOYMENT.md" target="_blank">Deployment Guide</a></li>
        </ul>
    `);
}

// Utility Functions
function showSection(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideSection(id) {
    document.getElementById(id).classList.add('hidden');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Click outside modal to close
document.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
