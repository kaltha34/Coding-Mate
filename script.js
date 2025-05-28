// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const checklist = document.getElementById('checklist');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all-btn');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmClearBtn = document.getElementById('confirm-clear-btn');
const cancelClearBtn = document.getElementById('cancel-clear-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const exportBtn = document.getElementById('export-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const searchInput = document.getElementById('search-input');
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');
const categoryTags = document.getElementById('category-tags');
const categoryModal = document.getElementById('category-modal');
const categoryOptions = document.getElementById('category-options');
const newCategoryInput = document.getElementById('new-category-input');
const addCategoryBtn = document.getElementById('add-category-btn');
const saveCategoryBtn = document.getElementById('save-category-btn');
const cancelCategoryBtn = document.getElementById('cancel-category-btn');
const categoryModalCloseBtn = document.getElementById('category-modal-close-btn');
const toastContainer = document.getElementById('toast-container');

// Default deployment checklist items
const defaultChecklist = [
    { id: 1, text: 'Run unit tests', completed: false, timestamp: new Date().toISOString(), category: 'testing' },
    { id: 2, text: 'Lint codebase', completed: false, timestamp: new Date().toISOString(), category: 'testing' },
    { id: 3, text: 'Check environment variables', completed: false, timestamp: new Date().toISOString(), category: 'devops' },
    { id: 4, text: 'Build project', completed: false, timestamp: new Date().toISOString(), category: 'frontend' },
    { id: 5, text: 'Backup database', completed: false, timestamp: new Date().toISOString(), category: 'database' },
    { id: 6, text: 'Push to production', completed: false, timestamp: new Date().toISOString(), category: 'devops' }
];

// Default categories
const defaultCategories = ['frontend', 'backend', 'testing', 'database', 'devops'];

// State
let tasks = [];
let categories = [];
let activeFilter = 'all';
let searchQuery = '';
let currentTaskForCategory = null;

// Initialize app
function init() {
    loadTasks();
    loadCategories();
    loadThemePreference();
    renderTasks();
    updateProgressBar();
    setupEventListeners();
}

// Load tasks from localStorage or use default checklist
function loadTasks() {
    const savedTasks = localStorage.getItem('deploymentChecklist');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        // First visit, load default checklist
        tasks = defaultChecklist;
        saveTasks();
    }
}

// Load categories from localStorage or use defaults
function loadCategories() {
    const savedCategories = localStorage.getItem('deploymentCategories');
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    } else {
        // First visit, load default categories
        categories = defaultCategories;
        saveCategories();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('deploymentChecklist', JSON.stringify(tasks));
    updateProgressBar();
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('deploymentCategories', JSON.stringify(categories));
}

// Load theme preference from localStorage
function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Toggle theme between light and dark
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// Update progress bar based on completed tasks
function updateProgressBar() {
    if (tasks.length === 0) {
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        return;
    }
    
    const completedCount = tasks.filter(task => task.completed).length;
    const percentage = Math.round((completedCount / tasks.length) * 100);
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Generate unique ID for new tasks
function generateId() {
    return tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-circle';
    if (type === 'error') icon = 'times-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <div class="toast-content">${message}</div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode === toastContainer) {
            toast.remove();
        }
    }, duration);
}

// Add new task
function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        timestamp: new Date().toISOString(),
        category: null
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    showToast('Task added successfully');
}

// Delete task
function deleteTask(id) {
    const taskToDelete = tasks.find(task => task.id === id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    showToast(`Task "${taskToDelete.text.substring(0, 20)}${taskToDelete.text.length > 20 ? '...' : ''}" deleted`, 'warning');
}

// Toggle task completion status
function toggleTaskCompletion(id) {
    let completedTask = null;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            completedTask = { ...task, completed: !task.completed };
            return completedTask;
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    
    if (completedTask && completedTask.completed) {
        showToast(`Task completed!`);
    }
}

// Edit task
function editTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText.trim() };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    showToast('Task updated successfully');
}

// Set task category
function setTaskCategory(id, category) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, category };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    showToast(`Category set to "${category}"`);
}

// Open category modal for a task
function openCategoryModal(id) {
    currentTaskForCategory = id;
    
    // Populate category options
    categoryOptions.innerHTML = '';
    
    const currentTask = tasks.find(task => task.id === id);
    
    categories.forEach(category => {
        const categoryOption = document.createElement('div');
        categoryOption.className = `category-option ${currentTask.category === category ? 'selected' : ''}`;
        categoryOption.dataset.category = category;
        categoryOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        categoryOption.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.category-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            categoryOption.classList.add('selected');
        });
        
        categoryOptions.appendChild(categoryOption);
    });
    
    categoryModal.style.display = 'flex';
}

// Save category selection
function saveCategorySelection() {
    const selectedOption = document.querySelector('.category-option.selected');
    
    if (selectedOption && currentTaskForCategory) {
        const category = selectedOption.dataset.category;
        setTaskCategory(currentTaskForCategory, category);
    }
    
    closeCategoryModal();
}

// Add new category
function addCategory(categoryName) {
    if (categoryName.trim() === '') return;
    
    const formattedCategory = categoryName.trim().toLowerCase();
    
    if (categories.includes(formattedCategory)) {
        showToast(`Category "${formattedCategory}" already exists`, 'warning');
        return;
    }
    
    categories.push(formattedCategory);
    saveCategories();
    
    // Add to category options
    const categoryOption = document.createElement('div');
    categoryOption.className = 'category-option';
    categoryOption.dataset.category = formattedCategory;
    categoryOption.textContent = formattedCategory.charAt(0).toUpperCase() + formattedCategory.slice(1);
    
    categoryOption.addEventListener('click', () => {
        // Remove selected class from all options
        document.querySelectorAll('.category-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        categoryOption.classList.add('selected');
    });
    
    categoryOptions.appendChild(categoryOption);
    newCategoryInput.value = '';
    
    showToast(`Category "${formattedCategory}" added`);
}

// Clear all tasks (with confirmation)
function clearAllTasks() {
    tasks = [];
    saveTasks();
    renderTasks();
    closeModal();
    showToast('All tasks cleared', 'warning');
}

// Filter tasks
function filterTasks(filter) {
    activeFilter = filter;
    
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Reset search when changing filters
    searchInput.value = '';
    searchQuery = '';
    
    // Reset active category
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    renderTasks();
    
    // Show toast message
    let message = 'Showing all tasks';
    if (filter === 'active') message = 'Showing active tasks';
    if (filter === 'completed') message = 'Showing completed tasks';
    showToast(message);
}

// Filter by category
function filterByCategory(category) {
    // Reset active filter to 'all'
    activeFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('filter-all').classList.add('active');
    
    // Set search to filter by category
    searchInput.value = category;
    searchQuery = category.toLowerCase();
    
    renderTasks();
    showToast(`Showing ${category} tasks`);
}

// Search tasks
function searchTasks(query) {
    searchQuery = query.trim().toLowerCase();
    renderTasks();
}

// Open confirmation modal
function openModal() {
    confirmationModal.style.display = 'flex';
}

// Close confirmation modal
function closeModal() {
    confirmationModal.style.display = 'none';
}

// Close category modal
function closeCategoryModal() {
    categoryModal.style.display = 'none';
    currentTaskForCategory = null;
}

// No longer needed - removed dropdown toggle function

// Export checklist as markdown file
function exportMarkdown() {
    let content = '# Deployment Checklist\n\n';
    
    // Group tasks by category
    const tasksByCategory = {};
    
    tasks.forEach(task => {
        const category = task.category || 'Uncategorized';
        
        if (!tasksByCategory[category]) {
            tasksByCategory[category] = [];
        }
        
        tasksByCategory[category].push(task);
    });
    
    // Generate markdown content
    for (const category in tasksByCategory) {
        content += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        
        tasksByCategory[category].forEach(task => {
            content += `${task.completed ? '[x]' : '[ ]'} ${task.text}\n`;
            content += `   Added: ${formatTimestamp(task.timestamp)}\n\n`;
        });
    }
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deployment-checklist.md';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
    
    showToast('Markdown file exported successfully');
}

// Export checklist as PDF using browser print functionality
function exportPDF() {
    try {
        // Create a modal with instructions
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Export as PDF</h2>
                <p>Follow these steps to export your checklist as PDF:</p>
                <ol>
                    <li>When the print dialog opens, select <strong>Save as PDF</strong> as the destination</li>
                    <li>Click <strong>Save</strong> to generate your PDF file</li>
                    <li>Choose a location to save your file</li>
                </ol>
                <button class="btn primary-btn" id="continue-pdf-export">Continue to PDF Export</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners for modal
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('#continue-pdf-export').addEventListener('click', () => {
            document.body.removeChild(modal);
            setTimeout(generatePDF, 100); // Small delay to ensure modal is gone
        });
        
        // Show the modal
        setTimeout(() => {
            modal.style.display = 'block';
        }, 10);
        
        return; // Exit function here, actual PDF generation happens after user clicks continue
    } catch (error) {
        console.error('Error in PDF export:', error);
        showToast('Error preparing PDF export. See console for details.', 'error');
    }
}

// Function to actually generate the PDF
function generatePDF() {
    try {
        // Add current date to header for print stylesheet
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now.toLocaleTimeString();
        document.querySelector('.app-header').setAttribute('data-date', `${dateString} at ${timeString}`);
        
        // Calculate and display progress information
        const completedCount = tasks.filter(task => task.completed).length;
        const percentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        
        // Create a progress element if it doesn't exist
        let progressInfo = document.getElementById('print-progress-info');
        if (!progressInfo) {
            progressInfo = document.createElement('div');
            progressInfo.id = 'print-progress-info';
            progressInfo.style.margin = '20px 0';
            progressInfo.style.fontSize = '14px';
            progressInfo.style.fontWeight = 'bold';
            progressInfo.style.color = '#2563eb'; // Primary color
            document.querySelector('.main-content').insertBefore(progressInfo, document.querySelector('.filter-container'));
        }
        
        progressInfo.textContent = `Overall Progress: ${percentage}% (${completedCount}/${tasks.length} tasks completed)`;
        
        // Add a title for the PDF
        let pdfTitle = document.getElementById('pdf-title');
        if (!pdfTitle) {
            pdfTitle = document.createElement('h1');
            pdfTitle.id = 'pdf-title';
            pdfTitle.style.display = 'none'; // Hidden in normal view
            pdfTitle.style.textAlign = 'center';
            pdfTitle.style.margin = '20px 0';
            pdfTitle.style.color = '#2563eb';
            pdfTitle.className = 'pdf-only';
            pdfTitle.textContent = 'Deployment Checklist';
            document.querySelector('.main-content').insertBefore(pdfTitle, progressInfo);
        }
        
        // Add print-only class to body for CSS targeting
        document.body.classList.add('printing');
        
        // Show all tasks for printing regardless of current filter
        const currentFilter = activeFilter;
        const currentSearch = searchQuery;
        
        // Temporarily reset filters to show all tasks
        activeFilter = 'all';
        searchQuery = '';
        renderTasks();
        
        // Print the page (this will use the print stylesheet)
        setTimeout(() => {
            window.print();
            
            // Restore the previous state after printing
            document.body.classList.remove('printing');
            activeFilter = currentFilter;
            searchQuery = currentSearch;
            renderTasks();
            
            // Remove the print-only elements
            if (progressInfo) progressInfo.style.display = 'none';
            if (pdfTitle) pdfTitle.style.display = 'none';
            
            showToast('PDF export completed');
        }, 300);
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF. See console for details.', 'error');
    }
}

// Render tasks to the DOM
function renderTasks() {
    checklist.innerHTML = '';
    
    // Filter tasks based on active filter and search query
    let filteredTasks = tasks;
    
    // Apply filter
    if (activeFilter === 'active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (activeFilter === 'completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Apply search
    if (searchQuery) {
        filteredTasks = filteredTasks.filter(task => 
            task.text.toLowerCase().includes(searchQuery) ||
            (task.category && task.category.toLowerCase().includes(searchQuery))
        );
    }
    
    // Show/hide empty state
    if (filteredTasks.length === 0) {
        checklist.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    } else {
        checklist.classList.remove('hidden');
        emptyState.classList.add('hidden');
    }
    
    // Render tasks
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.dataset.id = task.id;
        
        // Create checkbox container
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'task-checkbox-container';
        
        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        
        checkboxContainer.appendChild(checkbox);
        
        // Create task content wrapper
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        // Create task text
        const taskText = document.createElement('div');
        taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
        taskText.textContent = task.text;
        
        // Create task metadata
        const taskMetadata = document.createElement('div');
        taskMetadata.className = 'task-metadata';
        
        // Add category tag if exists
        if (task.category) {
            const categoryTag = document.createElement('span');
            categoryTag.className = 'task-tag';
            categoryTag.dataset.category = task.category;
            categoryTag.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);
            taskMetadata.appendChild(categoryTag);
        }
        
        // Create timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'task-timestamp';
        timestamp.textContent = formatTimestamp(task.timestamp);
        taskMetadata.appendChild(timestamp);
        
        // Add content elements
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskMetadata);
        
        // Create action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        // Category button
        const categoryBtn = document.createElement('button');
        categoryBtn.className = 'task-action-btn task-category-btn';
        categoryBtn.title = 'Set category';
        categoryBtn.innerHTML = '<i class="fas fa-tag"></i>';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'task-action-btn task-edit-btn';
        editBtn.title = 'Edit task';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-action-btn task-delete-btn';
        deleteBtn.title = 'Delete task';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        
        actionsDiv.appendChild(categoryBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        // Append all elements to list item
        li.appendChild(checkboxContainer);
        li.appendChild(taskContent);
        li.appendChild(actionsDiv);
        
        checklist.appendChild(li);
        
        // Add event listeners for task actions
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        
        categoryBtn.addEventListener('click', () => openCategoryModal(task.id));
        
        editBtn.addEventListener('click', () => {
            // Replace task text with input field
            const currentText = taskText.textContent;
            taskContent.removeChild(taskText);
            
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.className = 'task-edit-input';
            editInput.value = currentText;
            
            taskContent.insertBefore(editInput, taskMetadata);
            editInput.focus();
            
            // Handle input blur and enter key
            const handleEdit = () => {
                editTask(task.id, editInput.value);
            };
            
            editInput.addEventListener('blur', handleEdit);
            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleEdit();
                }
            });
        });
        
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add task
    addTaskBtn.addEventListener('click', () => addTask(taskInput.value));
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
        }
    });
    
    // Clear all tasks
    clearAllBtn.addEventListener('click', openModal);
    confirmClearBtn.addEventListener('click', clearAllTasks);
    cancelClearBtn.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            closeModal();
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Export buttons
    document.getElementById('export-pdf-btn').addEventListener('click', exportPDF);
    document.getElementById('export-md-btn').addEventListener('click', exportMarkdown);
    
    // Filter buttons
    filterAllBtn.addEventListener('click', () => filterTasks('all'));
    filterActiveBtn.addEventListener('click', () => filterTasks('active'));
    filterCompletedBtn.addEventListener('click', () => filterTasks('completed'));
    
    // Search input
    searchInput.addEventListener('input', (e) => searchTasks(e.target.value));
    
    // Category modal
    saveCategoryBtn.addEventListener('click', saveCategorySelection);
    cancelCategoryBtn.addEventListener('click', closeCategoryModal);
    categoryModalCloseBtn.addEventListener('click', closeCategoryModal);
    
    // Close category modal when clicking outside
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeCategoryModal();
        }
    });
    
    // Add new category
    addCategoryBtn.addEventListener('click', () => addCategory(newCategoryInput.value));
    newCategoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addCategory(newCategoryInput.value);
        }
    });
    
    // Category tag click in sidebar
    categoryTags.addEventListener('click', (e) => {
        const categoryTag = e.target.closest('.category-tag');
        if (categoryTag) {
            const category = categoryTag.dataset.category;
            filterByCategory(category);
            
            // Add visual indicator for active category
            document.querySelectorAll('.category-tag').forEach(tag => {
                tag.classList.remove('active');
            });
            categoryTag.classList.add('active');
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
