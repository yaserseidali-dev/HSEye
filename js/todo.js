class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.sortBy = 'date';
        this.init();
    }

    init() {
        this.elements = {
            input: document.getElementById('todoInput'),
            prioritySelect: document.getElementById('prioritySelect'),
            addBtn: document.getElementById('addBtn'),
            tasksList: document.getElementById('tasksList'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            sortByDateBtn: document.getElementById('sortByDateBtn'),
            sortByPriorityBtn: document.getElementById('sortByPriorityBtn'),
            clearCompletedBtn: document.getElementById('clearCompletedBtn'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            pendingTasks: document.getElementById('pendingTasks')
        };

        this.loadTodos();
        this.attachEventListeners();
        this.render();
    }

    attachEventListeners() {
        // Add task
        this.elements.addBtn.addEventListener('click', () => this.addTodo());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.elements.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.closest('.filter-btn').classList.add('active');
                this.currentFilter = e.target.closest('.filter-btn').dataset.filter;
                this.render();
            });
        });

        // Sort
        this.elements.sortByDateBtn.addEventListener('click', () => {
            this.sortBy = this.sortBy === 'date' ? 'none' : 'date';
            this.updateSortButtons();
            this.render();
        });

        this.elements.sortByPriorityBtn.addEventListener('click', () => {
            this.sortBy = this.sortBy === 'priority' ? 'none' : 'priority';
            this.updateSortButtons();
            this.render();
        });

        // Clear
        this.elements.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAll());
    }

    addTodo() {
        const text = this.elements.input.value.trim();
        if (!text) {
            this.showNotification('Please enter a task', 'error');
            return;
        }

        const todo = {
            id: Date.now(),
            text,
            priority: this.elements.prioritySelect.value,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.todos.unshift(todo);
        this.saveTodos();
        this.render();

        this.elements.input.value = '';
        this.elements.prioritySelect.value = 'medium';
        this.showNotification('Task added successfully!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
            this.showNotification(
                todo.completed ? 'Task completed!' : 'Task marked as pending',
                'success'
            );
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.render();
        this.showNotification('Task deleted', 'success');
    }

    clearCompleted() {
        const count = this.todos.filter(t => t.completed).length;
        if (count === 0) {
            this.showNotification('No completed tasks to clear', 'error');
            return;
        }
        
        if (confirm(`Delete ${count} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.render();
            this.showNotification('Completed tasks cleared!', 'success');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('No tasks to clear', 'error');
            return;
        }
        
        if (confirm('Delete all tasks? This cannot be undone!')) {
            this.todos = [];
            this.saveTodos();
            this.render();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    getFilteredTodos() {
        let filtered = this.todos;

        // Apply filter
        if (this.currentFilter === 'pending') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }

        // Apply sort
        if (this.sortBy === 'priority') {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (this.sortBy === 'date') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return filtered;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;

        this.elements.totalTasks.textContent = total;
        this.elements.completedTasks.textContent = completed;
        this.elements.pendingTasks.textContent = pending;
    }

    updateSortButtons() {
        this.elements.sortByDateBtn.classList.toggle('active', this.sortBy === 'date');
        this.elements.sortByPriorityBtn.classList.toggle('active', this.sortBy === 'priority');
    }

    render() {
        const filtered = this.getFilteredTodos();

        if (filtered.length === 0) {
            this.elements.tasksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>${this.todos.length === 0 ? 'No tasks yet. Add one to get started!' : 'No tasks match the current filter.'}</p>
                </div>
            `;
        } else {
            this.elements.tasksList.innerHTML = filtered.map(todo => `
                <div class="task-item ${todo.priority}-priority ${todo.completed ? 'completed' : ''}">
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="app.toggleTodo(${todo.id})"
                    >
                    <div class="task-content">
                        <div class="task-text">${this.escapeHtml(todo.text)}</div>
                        <div class="task-date"><i class="fas fa-clock"></i> ${todo.createdAt}</div>
                    </div>
                    <div class="priority-badge priority-${todo.priority}">
                        ${todo.priority.toUpperCase()}
                    </div>
                    <button class="task-delete" onclick="app.deleteTodo(${todo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
        }

        this.updateStats();
        this.updateSortButtons();
        this.updateButtonStates();
    }

    updateButtonStates() {
        const hasCompleted = this.todos.some(t => t.completed);
        this.elements.clearCompletedBtn.disabled = !hasCompleted;
        this.elements.clearAllBtn.disabled = this.todos.length === 0;
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        this.todos = saved ? JSON.parse(saved) : [];
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'error' ? '#f56565' : '#48bb78'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Initialize app
let app;
window.addEventListener('load', () => {
    app = new TodoApp();
});