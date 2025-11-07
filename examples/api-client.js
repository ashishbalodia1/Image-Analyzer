/**
 * Sample API Client for City Guardian Frontend
 * Demonstrates how to integrate the Image Analyzer API
 */

class CityGuardianImageAnalyzer {
  constructor(apiUrl) {
    this.apiUrl = apiUrl || 'https://your-api.vercel.app';
  }

  /**
   * Check if API is healthy
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  /**
   * Get all available categories
   */
  async getCategories() {
    try {
      const response = await fetch(`${this.apiUrl}/api/categories`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Analyze a single image
   * @param {File} imageFile - The image file to analyze
   * @returns {Promise} - Analysis result
   */
  async analyzeImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze multiple images
   * @param {File[]} imageFiles - Array of image files
   * @returns {Promise} - Batch analysis results
   */
  async analyzeBatch(imageFiles) {
    try {
      const formData = new FormData();
      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${this.apiUrl}/api/analyze/batch`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch analysis failed:', error);
      throw error;
    }
  }
}

// React Component Example
function ImageUploadComponent() {
  const [analyzing, setAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);

  const analyzer = new CityGuardianImageAnalyzer('https://your-api.vercel.app');

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzer.analyzeImage(file);
      
      if (analysisResult.success) {
        setResult(analysisResult.result);
        
        // You can now use the category for your complaint form
        console.log('Detected Category:', analysisResult.result.label);
        console.log('Confidence:', analysisResult.result.confidence);
      } else {
        setError(analysisResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="image-upload-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={analyzing}
      />
      
      {analyzing && (
        <div className="analyzing">
          <p>🔍 Analyzing image...</p>
        </div>
      )}
      
      {result && (
        <div className="result">
          <h3>Analysis Result</h3>
          <p><strong>Category:</strong> {result.label}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
          <p><strong>Description:</strong> {result.description}</p>
          
          {result.needsManualReview && (
            <div className="warning">
              ⚠️ Low confidence - manual review recommended
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="error">
          <p>❌ Error: {error}</p>
        </div>
      )}
    </div>
  );
}

// Vanilla JavaScript Example
document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('image-upload');
  const resultDiv = document.getElementById('result');
  
  const analyzer = new CityGuardianImageAnalyzer('https://your-api.vercel.app');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resultDiv.innerHTML = '<p>🔍 Analyzing...</p>';

    try {
      const result = await analyzer.analyzeImage(file);
      
      if (result.success) {
        resultDiv.innerHTML = `
          <div class="success">
            <h3>✅ Analysis Complete</h3>
            <p><strong>Category:</strong> ${result.result.label}</p>
            <p><strong>Confidence:</strong> ${result.result.confidence}</p>
            <p><strong>Description:</strong> ${result.result.description}</p>
          </div>
        `;
        
        // Auto-fill the category in your form
        document.getElementById('category-select').value = result.result.category;
      }
    } catch (error) {
      resultDiv.innerHTML = `<p class="error">❌ ${error.message}</p>`;
    }
  });
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CityGuardianImageAnalyzer;
}
