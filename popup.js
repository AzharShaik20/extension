// AI Prompter Chrome Extension - Popup Script
class AIPrompter {
    constructor() {
        this.apiUrl = 'http://localhost:5000';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateCharacterCount();
        this.checkServerStatus();
    }

    initializeElements() {
        this.userInput = document.getElementById('userInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.outputSection = document.getElementById('outputSection');
        this.outputContent = document.getElementById('outputContent');
        this.errorSection = document.getElementById('errorSection');
        this.errorContent = document.getElementById('errorContent');
        this.charCount = document.getElementById('charCount');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = this.statusIndicator.querySelector('.status-text');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.closeModal = document.getElementById('closeModal');
    }

    setupEventListeners() {
        // Input validation
        this.userInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.validateInput();
        });

        // Generate button
        this.generateBtn.addEventListener('click', () => {
            this.generatePrompt();
        });

        // Copy button
        this.copyBtn.addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        // Help modal
        this.helpBtn.addEventListener('click', () => {
            this.showHelp();
        });

        this.closeModal.addEventListener('click', () => {
            this.hideHelp();
        });

        // Close modal on outside click
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideHelp();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        if (!this.generateBtn.disabled) {
                            this.generatePrompt();
                        }
                        break;
                    case 'c':
                        if (this.outputSection.style.display !== 'none') {
                            e.preventDefault();
                            this.copyToClipboard();
                        }
                        break;
                }
            }
        });
    }

    updateCharacterCount() {
        const count = this.userInput.value.length;
        this.charCount.textContent = count;
        
        // Change color based on character count
        if (count > 900) {
            this.charCount.style.color = '#e53e3e';
        } else if (count > 700) {
            this.charCount.style.color = '#ed8936';
        } else {
            this.charCount.style.color = '#718096';
        }
    }

    validateInput() {
        const input = this.userInput.value.trim();
        const isValid = input.length > 0 && input.length <= 1000;
        
        this.generateBtn.disabled = !isValid;
        
        if (input.length > 1000) {
            this.showError('Input is too long. Please keep it under 1000 characters.');
        } else {
            this.hideError();
        }
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.updateStatus('Ready', 'success');
            } else {
                this.updateStatus('Server Error', 'error');
            }
        } catch (error) {
            this.updateStatus('Server Offline', 'error');
            console.warn('Server status check failed:', error);
        }
    }

    updateStatus(message, type = 'success') {
        this.statusText.textContent = message;
        this.statusIndicator.className = `status-indicator ${type}`;
    }

    async generatePrompt() {
        const input = this.userInput.value.trim();
        
        if (!input) {
            this.showError('Please enter your idea first.');
            return;
        }

        this.setLoading(true);
        this.hideError();
        this.hideOutput();

        try {
            const result = await this.callAPI(input);
            this.showOutput(result);
            this.updateStatus('Success', 'success');
            
            // Store in chrome storage for history
            this.saveToHistory(input, result);
            
        } catch (error) {
            console.error('Generate prompt error:', error);
            this.showError(this.getErrorMessage(error));
            this.updateStatus('Error', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async callAPI(input, retryCount = 0) {
        try {
            const response = await fetch(`${this.apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: input }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.result) {
                throw new Error('Invalid response from server');
            }

            return data.result;

        } catch (error) {
            // Retry logic for network errors
            if (retryCount < this.maxRetries && this.isRetryableError(error)) {
                console.log(`Retrying... (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.callAPI(input, retryCount + 1);
            }
            
            throw error;
        }
    }

    isRetryableError(error) {
        return error.name === 'TypeError' || 
               error.name === 'AbortError' ||
               error.message.includes('fetch');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getErrorMessage(error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
            return 'Cannot connect to server. Make sure the backend is running on localhost:5000.';
        }
        
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        
        if (error.message.includes('HTTP 429')) {
            return 'Too many requests. Please wait a moment and try again.';
        }
        
        if (error.message.includes('HTTP 500')) {
            return 'Server error. Please check your API key configuration.';
        }
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    setLoading(loading) {
        this.generateBtn.disabled = loading;
        
        if (loading) {
            this.generateBtn.classList.add('loading');
            this.updateStatus('Generating...', 'success');
        } else {
            this.generateBtn.classList.remove('loading');
        }
    }

    showOutput(content) {
        this.outputContent.textContent = content;
        this.outputSection.style.display = 'block';
        this.errorSection.style.display = 'none';
        
        // Scroll to output
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideOutput() {
        this.outputSection.style.display = 'none';
    }

    showError(message) {
        this.errorContent.textContent = message;
        this.errorSection.style.display = 'block';
        this.outputSection.style.display = 'none';
        
        // Scroll to error
        this.errorSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideError() {
        this.errorSection.style.display = 'none';
    }

    async copyToClipboard() {
        const content = this.outputContent.textContent;
        
        if (!content) {
            this.showError('Nothing to copy.');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            this.copyBtn.classList.add('copied');
            this.copyBtn.title = 'Copied!';
            
            setTimeout(() => {
                this.copyBtn.classList.remove('copied');
                this.copyBtn.title = 'Copy to clipboard';
            }, 2000);
            
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Failed to copy to clipboard.');
        }
    }

    clearAll() {
        this.userInput.value = '';
        this.updateCharacterCount();
        this.validateInput();
        this.hideOutput();
        this.hideError();
        this.updateStatus('Ready', 'success');
        this.userInput.focus();
    }

    showHelp() {
        this.helpModal.style.display = 'flex';
    }

    hideHelp() {
        this.helpModal.style.display = 'none';
    }

    async saveToHistory(input, output) {
        try {
            const history = await this.getHistory();
            const entry = {
                input,
                output,
                timestamp: new Date().toISOString()
            };
            
            history.unshift(entry);
            
            // Keep only last 10 entries
            if (history.length > 10) {
                history.splice(10);
            }
            
            await chrome.storage.local.set({ promptHistory: history });
        } catch (error) {
            console.warn('Failed to save history:', error);
        }
    }

    async getHistory() {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            return result.promptHistory || [];
        } catch (error) {
            console.warn('Failed to get history:', error);
            return [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIPrompter();
});

// Handle extension lifecycle
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('AI Prompter extension installed');
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPrompter;
}
