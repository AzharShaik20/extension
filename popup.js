// AI Prompter Chrome Extension - Popup Script (Localhost Version)
class AIPrompter {
    constructor() {
        // For development, prioritize localhost first
        this.apiUrl = 'http://localhost:5000';
        this.fallbackApiUrl = 'https://ai-prompter-extension.vercel.app/api';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        
        console.log('AI Prompter initialized with API URL:', this.apiUrl);
        
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
        this.historyBtn = document.getElementById('historyBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.historyModal = document.getElementById('historyModal');
        this.closeModal = document.getElementById('closeModal');
        this.closeHistoryModal = document.getElementById('closeHistoryModal');
        this.historyList = document.getElementById('historyList');
        this.generateStatus = document.getElementById('generate-status');
        this.srStatus = document.getElementById('sr-status');
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

        // History modal
        this.historyBtn.addEventListener('click', () => {
            this.showHistory();
        });

        this.closeHistoryModal.addEventListener('click', () => {
            this.hideHistory();
        });

        // Close modals on outside click
        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.hideHelp();
            }
        });

        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) {
                this.hideHistory();
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
        const maxCount = 1000;
        const percentage = (count / maxCount) * 100;
        
        this.charCount.textContent = count;
        
        // Update progress bar
        const progressBar = document.getElementById('charProgressBar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        // Change color based on character count
        if (count > 900) {
            this.charCount.style.color = '#ef4444';
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)';
            }
        } else if (count > 700) {
            this.charCount.style.color = '#f59e0b';
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)';
            }
        } else {
            this.charCount.style.color = '#64748b';
            if (progressBar) {
                progressBar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
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
        console.log('Checking server status...');
        try {
            // Try localhost API first (for development)
            console.log('Trying localhost API:', this.apiUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                console.log('Localhost API is working');
                this.updateStatus('Ready (Local)', 'success');
                return;
            }
        } catch (error) {
            console.log('Localhost API failed:', error.message);
        }
        
        // Try fallback API (production)
        try {
            console.log('Trying production API:', this.fallbackApiUrl);
            const fallbackController = new AbortController();
            const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000);
            
            const fallbackResponse = await fetch(`${this.fallbackApiUrl}/health`, {
                method: 'GET',
                signal: fallbackController.signal
            });
            
            clearTimeout(fallbackTimeoutId);
            
            if (fallbackResponse.ok) {
                console.log('Production API is working');
                this.apiUrl = this.fallbackApiUrl;
                this.updateStatus('Ready', 'success');
            } else {
                console.log('Production API returned error:', fallbackResponse.status);
                this.updateStatus('Server Error', 'error');
            }
        } catch (fallbackError) {
            console.log('Production API failed:', fallbackError.message);
            this.updateStatus('Server Offline', 'error');
        }
    }

    updateStatus(message, type = 'success') {
        this.statusText.textContent = message;
        this.statusIndicator.className = `status-section ${type}`;

        // Update screen reader status
        if (this.srStatus) {
            this.srStatus.textContent = message;
        }
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
            console.log('Calling API with input:', input);
            const response = await fetch(`${this.apiUrl}/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: input }),
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            console.log('API response status:', response.status);

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
            // If production API fails and we haven't tried fallback yet, try localhost
            if (retryCount === 0 && this.apiUrl.includes('vercel.app')) {
                console.log('Production API failed, trying localhost...');
                this.apiUrl = this.fallbackApiUrl;
                return this.callAPI(input, retryCount + 1);
            }
            
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
            return 'Cannot connect to server. Please check your internet connection and try again.';
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

            // Update screen reader status for generation
            if (this.generateStatus) {
                this.generateStatus.textContent = 'Generating prompt, please wait.';
            }
        } else {
            this.generateBtn.classList.remove('loading');

            // Clear generation status
            if (this.generateStatus) {
                this.generateStatus.textContent = '';
            }
        }
    }

    showOutput(content) {
        this.outputContent.textContent = content;
        this.outputSection.style.display = 'block';
        this.errorSection.style.display = 'none';
        
        // Save to history
        const input = this.userInput.value.trim();
        if (input && content) {
            this.saveToHistory(input, content);
        }
        
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
            
            // Enhanced visual feedback
            this.copyBtn.classList.add('copied');
            const copyText = this.copyBtn.querySelector('.copy-text');
            if (copyText) {
                copyText.textContent = 'Copied!';
            }

            // Update screen reader status
            if (this.srStatus) {
                this.srStatus.textContent = 'Prompt copied to clipboard successfully.';
            }

            // Add subtle success animation with stable styling
            this.copyBtn.style.backgroundColor = 'var(--color-success)';
            this.copyBtn.style.color = 'var(--color-white)';
            setTimeout(() => {
                this.copyBtn.style.backgroundColor = '';
                this.copyBtn.style.color = '';
            }, 150);

            // Reset after 2 seconds
            setTimeout(() => {
                this.copyBtn.classList.remove('copied');
                if (copyText) {
                    copyText.textContent = 'Copy';
                }

                // Clear screen reader status
                if (this.srStatus) {
                    this.srStatus.textContent = '';
                }
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

    showHistory() {
        this.historyModal.style.display = 'block';
        this.loadHistory();
        this.closeHistoryModal.focus();
    }

    hideHistory() {
        this.historyModal.style.display = 'none';
    }

    async loadHistory() {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            const history = result.promptHistory || [];
            
            if (history.length === 0) {
                this.historyList.innerHTML = `
                    <div class="history-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <p>No prompts generated yet</p>
                    </div>
                `;
                return;
            }

            this.historyList.innerHTML = history.map((item, index) => `
                <div class="history-item" data-index="${index}">
                    <div class="history-input">"${item.input}"</div>
                    <div class="history-output">${item.output}</div>
                    <div class="history-meta">
                        <span>${new Date(item.timestamp).toLocaleString()}</span>
                        <div class="history-actions">
                            <button class="history-action" onclick="app.useHistoryItem(${index})" title="Use this prompt">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="history-action" onclick="app.copyHistoryItem(${index})" title="Copy prompt">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                            <button class="history-action" onclick="app.deleteHistoryItem(${index})" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    async saveToHistory(input, output) {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            const history = result.promptHistory || [];
            
            const newItem = {
                input: input,
                output: output,
                timestamp: Date.now()
            };
            
            // Add to beginning of array
            history.unshift(newItem);
            
            // Keep only last 50 items
            if (history.length > 50) {
                history.splice(50);
            }
            
            await chrome.storage.local.set({ promptHistory: history });
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    async useHistoryItem(index) {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            const history = result.promptHistory || [];
            const item = history[index];
            
            if (item) {
                this.userInput.value = item.input;
                this.updateCharacterCount();
                this.validateInput();
                this.hideHistory();
                this.userInput.focus();
            }
        } catch (error) {
            console.error('Error using history item:', error);
        }
    }

    async copyHistoryItem(index) {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            const history = result.promptHistory || [];
            const item = history[index];
            
            if (item) {
                await navigator.clipboard.writeText(item.output);
                this.updateStatus('Copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Error copying history item:', error);
        }
    }

    async deleteHistoryItem(index) {
        try {
            const result = await chrome.storage.local.get(['promptHistory']);
            const history = result.promptHistory || [];
            
            history.splice(index, 1);
            await chrome.storage.local.set({ promptHistory: history });
            
            // Reload the history display
            this.loadHistory();
        } catch (error) {
            console.error('Error deleting history item:', error);
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
