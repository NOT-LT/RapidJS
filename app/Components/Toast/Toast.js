// This is a simple componentToast notification component for RapidJS
import { loadStyle } from "../../../src/framework.js";

export class Toast {
    static container = null;
    static currentToast = null;
    static timeout = null;

    static init() {
        if (!this.container) {
            loadStyle('./components/Toast/toast.css');
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();

        // Clear existing toast
        this.clear();

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} toast-show`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Close">×</button>
            </div>
        `;

        // Add event listeners
        toast.querySelector('.toast-close').addEventListener('click', () => this.remove(toast));
        toast.addEventListener('click', () => this.remove(toast));

        // Add to container
        this.container.appendChild(toast);
        this.currentToast = toast;

        // Auto remove
        this.timeout = setTimeout(() => this.remove(toast), duration);

        return toast;
    }

    static remove(toast) {
        if (!toast || !toast.parentNode) return;

        clearTimeout(this.timeout);
        toast.classList.add('toast-removing');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            if (this.currentToast === toast) {
                this.currentToast = null;
            }
        }, 200);
    }

    static clear() {
        if (this.currentToast) {
            this.remove(this.currentToast);
        }
        clearTimeout(this.timeout);
    }

    static getIcon(type) {
        const icons = {
            error: '❌',
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️'
        };
        return icons[type] || icons.info;
    }

    // Convenience methods
    static success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    static info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    static warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    }
}