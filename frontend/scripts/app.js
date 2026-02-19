// ============================================
// Demo Mode Toggle
// Set to true for standalone portfolio demo (no backend needed)
// Set to false to use the real FastAPI backend
// ============================================
const DEMO_MODE = true;

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// DOM Elements
const elements = {
    statusDot: document.getElementById('status-dot'),
    statusText: document.getElementById('status-text'),
    folderPath: document.getElementById('folderPath'),
    indexBtn: document.getElementById('indexBtn'),
    refreshDocsBtn: document.getElementById('refreshDocsBtn'),
    documentsList: document.getElementById('documentsList'),
    llmModel: document.getElementById('llmModel'),
    embeddingModel: document.getElementById('embeddingModel'),
    docCount: document.getElementById('docCount'),
    ramUsage: document.getElementById('ramUsage'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearChatBtn: document.getElementById('clearChatBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),
    toast: document.getElementById('toast'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebar: document.querySelector('.sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop')
};

// State
let hasDocuments = false;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    console.log('Initializing Local NotebookLM...');
    if (DEMO_MODE) {
        console.log('Running in DEMO MODE - responses are simulated');
        elements.folderPath.value = '~/Documents/Research';
    }
    await checkHealth();
    await loadDocuments();
    setupEventListeners();
}

// Sidebar Toggle (mobile drawer)
function toggleSidebar() {
    elements.sidebar.classList.toggle('open');
    elements.sidebarToggle.classList.toggle('active');
    elements.sidebarBackdrop.classList.toggle('active');
    document.body.style.overflow = elements.sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.sidebarToggle.classList.remove('active');
    elements.sidebarBackdrop.classList.remove('active');
    document.body.style.overflow = '';
}

// Event Listeners
function setupEventListeners() {
    elements.indexBtn.addEventListener('click', handleIndexDocuments);
    elements.refreshDocsBtn.addEventListener('click', loadDocuments);
    elements.sendBtn.addEventListener('click', handleSendMessage);
    elements.clearChatBtn.addEventListener('click', handleClearChat);

    // Sidebar toggle for mobile
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Enable send button when there's input and documents are indexed
    elements.chatInput.addEventListener('input', () => {
        const hasInput = elements.chatInput.value.trim().length > 0;
        elements.sendBtn.disabled = !(hasInput && hasDocuments);
    });

    // Send message on Enter (Shift+Enter for new line)
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!elements.sendBtn.disabled) {
                handleSendMessage();
            }
        }
    });
}

// Health Check
async function checkHealth() {
    try {
        const data = DEMO_MODE
            ? await Demo.healthCheck()
            : await fetch(`${API_BASE_URL}/health`).then(r => r.json());

        if (data.status === 'healthy') {
            updateStatus('connected', 'Connected');

            // Update system info
            elements.llmModel.textContent = data.services.models.llm;
            elements.embeddingModel.textContent = data.services.models.embedding;
            elements.docCount.textContent = data.database.document_count;
            elements.ramUsage.textContent = `${data.system.ram_used_gb}/${data.system.ram_total_gb} GB (${data.system.ram_percent}%)`;

            // Check model availability
            if (!data.services.models.llm_available || !data.services.models.embedding_available) {
                showToast('Warning: Some models are not available. Please check Ollama.', 'warning');
            }
        } else {
            updateStatus('error', 'Unhealthy');
            showToast('System health check failed', 'error');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        updateStatus('error', 'Disconnected');
        showToast('Cannot connect to server. Make sure the backend is running.', 'error');
    }
}

// Update Status Indicator
function updateStatus(status, text) {
    elements.statusDot.className = `dot ${status}`;
    elements.statusText.textContent = text;
}

// Load Documents
async function loadDocuments() {
    try {
        const data = DEMO_MODE
            ? await Demo.listDocuments()
            : await fetch(`${API_BASE_URL}/documents/list?limit=100`).then(r => r.json());

        if (data.documents && data.documents.length > 0) {
            hasDocuments = true;
            renderDocumentsList(data.documents);
            elements.docCount.textContent = data.total;

            // Update send button state
            const hasInput = elements.chatInput.value.trim().length > 0;
            elements.sendBtn.disabled = !hasInput;
        } else {
            hasDocuments = false;
            elements.documentsList.innerHTML = '<p class="placeholder-text">No documents indexed yet</p>';
            elements.docCount.textContent = '0';
            elements.sendBtn.disabled = true;
        }
    } catch (error) {
        console.error('Failed to load documents:', error);
        showToast('Failed to load documents', 'error');
    }
}

// Render Documents List
function renderDocumentsList(documents) {
    if (!documents || documents.length === 0) {
        elements.documentsList.innerHTML = '<p class="placeholder-text">No documents indexed yet</p>';
        return;
    }

    const html = documents.map(doc => `
        <div class="document-item">
            <span class="filename">${doc.filename}</span>
            <span class="meta">${doc.file_type.toUpperCase()} • ${doc.chunk_count} chunks</span>
        </div>
    `).join('');

    elements.documentsList.innerHTML = html;
}

// Handle Index Documents
async function handleIndexDocuments() {
    const folderPath = elements.folderPath.value.trim();

    if (!folderPath) {
        showToast('Please enter a folder path', 'warning');
        return;
    }

    showLoading('Indexing documents... This may take a while.');

    try {
        let data;
        if (DEMO_MODE) {
            data = await Demo.indexDocuments(folderPath);
        } else {
            const response = await fetch(`${API_BASE_URL}/documents/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    folder_path: folderPath,
                    recursive: true,
                    file_types: null
                })
            });
            data = await response.json();
        }

        hideLoading();

        if (data.status === 'success') {
            showToast(`Successfully indexed ${data.indexed_files} files in ${data.processing_time.toFixed(2)}s`, 'success');
            await loadDocuments();
            await checkHealth(); // Update doc count
            closeSidebar(); // Close sidebar drawer on mobile after indexing
        } else {
            showToast(`Indexing completed with errors. ${data.failed_files} files failed.`, 'warning');
            if (data.errors && data.errors.length > 0) {
                console.error('Indexing errors:', data.errors);
            }
            await loadDocuments();
        }
    } catch (error) {
        hideLoading();
        console.error('Indexing failed:', error);
        showToast('Failed to index documents. Check console for details.', 'error');
    }
}

// Handle Send Message
async function handleSendMessage() {
    const message = elements.chatInput.value.trim();

    if (!message || !hasDocuments) {
        return;
    }

    // Add user message to chat
    addMessage('user', message);

    // Clear input
    elements.chatInput.value = '';
    elements.sendBtn.disabled = true;

    // Show typing indicator in chat
    const typingIndicator = addTypingIndicator();

    // showLoading('Generating response...'); // Removed - using typing indicator instead

    try {
        let data;
        if (DEMO_MODE) {
            data = await Demo.chat(message);
        } else {
            const response = await fetch(`${API_BASE_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    stream: false
                })
            });
            data = await response.json();
        }

        // Remove typing indicator
        typingIndicator.remove();
        // hideLoading(); // Not needed anymore

        if (data.response) {
            addMessage('assistant', data.response, data.sources);
        } else {
            showToast('Received empty response from server', 'error');
        }
    } catch (error) {
        // Remove typing indicator
        typingIndicator.remove();
        // hideLoading(); // Not needed anymore
        console.error('Chat failed:', error);
        addMessage('assistant', 'Sorry, I encountered an error while processing your message. Please try again.');
        showToast('Failed to get response', 'error');
    }
}

// Add Message to Chat
// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message message-assistant typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span class="typing-text">AI is thinking...</span>
        </div>
    `;

    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;

    return typingDiv;
}

function addMessage(role, content, sources = null) {
    // Remove welcome message if it exists
    const welcomeMsg = elements.chatMessages.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${role}`;

    if (role === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content">${escapeHtml(content)}</div>
        `;
    } else {
        let sourcesHtml = '';

        if (sources && sources.length > 0) {
            const sourcesItems = sources.map((src, idx) => `
                <div class="source-item">
                    <strong>Source ${idx + 1}:</strong> ${escapeHtml(src.filename)}
                    (Relevance: ${(src.relevance_score * 100).toFixed(1)}%)
                    ${src.page_number ? `• Page ${src.page_number}` : ''}
                </div>
            `).join('');

            sourcesHtml = `
                <div class="message-sources">
                    <h4>📚 Sources Referenced:</h4>
                    ${sourcesItems}
                </div>
            `;
        }

        messageDiv.innerHTML = `
            <div class="message-content">${formatMessage(content)}</div>
            ${sourcesHtml}
        `;
    }

    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Format Message (convert markdown-style formatting)
function formatMessage(text) {
    text = escapeHtml(text);

    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Line breaks
    text = text.replace(/\n/g, '<br>');

    return text;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle Clear Chat
function handleClearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        elements.chatMessages.innerHTML = `
            <div class="welcome-message">
                <h3>Welcome to Local NotebookLM!</h3>
                <p>To get started:</p>
                <ol>
                    <li>Enter a folder path containing your documents</li>
                    <li>Click "Index Folder" to process your documents</li>
                    <li>Ask questions about your documents in the chat</li>
                </ol>
                <p class="note">
                    <strong>Note:</strong> All processing happens locally on your machine.
                    Your documents never leave your computer!
                </p>
            </div>
        `;
        showToast('Chat cleared', 'success');
    }
}

// Loading Overlay
function showLoading(text = 'Processing...') {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    elements.loadingOverlay.style.display = 'none';
}

// Toast Notifications
let toastTimeout;

function showToast(message, type = 'info') {
    clearTimeout(toastTimeout);

    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;

    toastTimeout = setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 5000);
}

// Auto-refresh health every 30 seconds (skip in demo mode)
if (!DEMO_MODE) {
    setInterval(checkHealth, 30000);
}
