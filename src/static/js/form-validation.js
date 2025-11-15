/**
 * Client-Side Form Validation
 * Enhances UX with immediate feedback (server-side validation still required)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Resource creation/edit form validation
    const resourceForm = document.querySelector('form[action*="resource"]');
    if (resourceForm) {
        validateResourceForm(resourceForm);
    }

    // Booking creation form validation
    const bookingForm = document.querySelector('form[action*="booking"]');
    if (bookingForm) {
        validateBookingForm(bookingForm);
    }

    // Registration form validation
    const registerForm = document.querySelector('form[action*="register"]');
    if (registerForm) {
        validateRegistrationForm(registerForm);
    }
});

/**
 * Resource Form Validation
 */
function validateResourceForm(form) {
    const titleInput = form.querySelector('[name="title"]');
    const descInput = form.querySelector('[name="description"]');
    const locationInput = form.querySelector('[name="location"]');
    const capacityInput = form.querySelector('[name="capacity"]');

    // Title validation (3-200 chars)
    if (titleInput) {
        titleInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length < 3) {
                showError(this, 'Title must be at least 3 characters');
            } else if (value.length > 200) {
                showError(this, 'Title must not exceed 200 characters');
            } else {
                clearError(this);
            }
        });
    }

    // Description validation (10-5000 chars)
    if (descInput) {
        descInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length < 10) {
                showError(this, 'Description must be at least 10 characters');
            } else if (value.length > 5000) {
                showError(this, 'Description must not exceed 5000 characters');
            } else {
                clearError(this);
            }
        });

        // Character counter
        descInput.addEventListener('input', function() {
            updateCharCounter(this, 5000);
        });
    }

    // Location validation (2-255 chars)
    if (locationInput) {
        locationInput.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value.length < 2) {
                showError(this, 'Location must be at least 2 characters');
            } else if (value.length > 255) {
                showError(this, 'Location must not exceed 255 characters');
            } else {
                clearError(this);
            }
        });
    }

    // Capacity validation (1-1000)
    if (capacityInput) {
        capacityInput.addEventListener('blur', function() {
            const value = parseInt(this.value);
            if (this.value && (value < 1 || value > 1000)) {
                showError(this, 'Capacity must be between 1 and 1000');
            } else {
                clearError(this);
            }
        });
    }

    // Form submission validation
    form.addEventListener('submit', function(e) {
        let isValid = true;

        // Validate all required fields
        const requiredFields = form.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            const firstError = form.querySelector('.is-invalid');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

/**
 * Booking Form Validation
 */
function validateBookingForm(form) {
    const startInput = form.querySelector('[name="start_datetime"]');
    const endInput = form.querySelector('[name="end_datetime"]');

    // Real-time datetime validation
    if (startInput && endInput) {
        const validateDates = () => {
            const start = new Date(startInput.value);
            const end = new Date(endInput.value);
            const now = new Date();

            // Check if start is in the past
            if (start < now) {
                showError(startInput, 'Start time must be in the future');
                return false;
            } else {
                clearError(startInput);
            }

            // Check if end is after start
            if (endInput.value && end <= start) {
                showError(endInput, 'End time must be after start time');
                return false;
            } else {
                clearError(endInput);
            }

            // Check duration (min 30 minutes, max 7 days)
            if (endInput.value) {
                const durationHours = (end - start) / (1000 * 60 * 60);

                if (durationHours < 0.5) {
                    showError(endInput, 'Booking must be at least 30 minutes');
                    return false;
                } else if (durationHours > 168) {
                    showError(endInput, 'Booking cannot exceed 7 days');
                    return false;
                } else {
                    clearError(endInput);
                }
            }

            return true;
        };

        startInput.addEventListener('change', validateDates);
        endInput.addEventListener('change', validateDates);

        form.addEventListener('submit', function(e) {
            if (!validateDates()) {
                e.preventDefault();
            }
        });
    }
}

/**
 * Registration Form Validation
 */
function validateRegistrationForm(form) {
    const emailInput = form.querySelector('[name="email"]');
    const passwordInput = form.querySelector('[name="password"]');
    const confirmInput = form.querySelector('[name="confirm_password"]');

    // Email validation
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!emailRegex.test(email)) {
                showError(this, 'Please enter a valid email address');
            } else if (!email.endsWith('@iu.edu')) {
                showError(this, 'Only @iu.edu email addresses are allowed');
            } else {
                clearError(this);
            }
        });
    }

    // Password strength validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const requirements = {
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                digit: /\d/.test(password)
            };

            updatePasswordStrength(this, requirements);
        });
    }

    // Confirm password validation
    if (confirmInput && passwordInput) {
        confirmInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                showError(this, 'Passwords do not match');
            } else {
                clearError(this);
            }
        });
    }
}

/**
 * Helper Functions
 */
function showError(input, message) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');

    // Remove existing feedback
    const existingFeedback = input.parentElement.querySelector('.invalid-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Add new feedback
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback d-block';
    feedback.textContent = message;
    input.parentElement.appendChild(feedback);
}

function clearError(input) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');

    const feedback = input.parentElement.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

function updateCharCounter(textarea, maxLength) {
    const current = textarea.value.length;
    const remaining = maxLength - current;

    let counter = textarea.parentElement.querySelector('.char-counter');
    if (!counter) {
        counter = document.createElement('small');
        counter.className = 'char-counter text-muted d-block mt-1';
        textarea.parentElement.appendChild(counter);
    }

    counter.textContent = `${current} / ${maxLength} characters`;

    if (remaining < 100) {
        counter.classList.add('text-warning');
    } else {
        counter.classList.remove('text-warning');
    }

    if (remaining < 0) {
        counter.classList.add('text-danger');
        counter.classList.remove('text-warning');
    } else {
        counter.classList.remove('text-danger');
    }
}

function updatePasswordStrength(input, requirements) {
    let strengthIndicator = input.parentElement.querySelector('.password-strength');

    if (!strengthIndicator) {
        strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength mt-2';
        input.parentElement.appendChild(strengthIndicator);
    }

    const allMet = Object.values(requirements).every(req => req);
    const metCount = Object.values(requirements).filter(req => req).length;

    let html = '<small class="d-block">Password must contain:</small><ul class="small mb-0">';
    html += `<li class="${requirements.length ? 'text-success' : 'text-muted'}">At least 8 characters</li>`;
    html += `<li class="${requirements.uppercase ? 'text-success' : 'text-muted'}">One uppercase letter</li>`;
    html += `<li class="${requirements.lowercase ? 'text-success' : 'text-muted'}">One lowercase letter</li>`;
    html += `<li class="${requirements.digit ? 'text-success' : 'text-muted'}">One digit</li>`;
    html += '</ul>';

    // Strength bar
    let strength = 'weak';
    let strengthClass = 'bg-danger';
    if (metCount >= 4) {
        strength = 'strong';
        strengthClass = 'bg-success';
    } else if (metCount >= 2) {
        strength = 'medium';
        strengthClass = 'bg-warning';
    }

    html += `<div class="progress mt-2" style="height: 5px;">
        <div class="progress-bar ${strengthClass}" role="progressbar"
             style="width: ${(metCount / 4) * 100}%"
             aria-valuenow="${metCount}" aria-valuemin="0" aria-valuemax="4"></div>
    </div>`;

    strengthIndicator.innerHTML = html;

    if (allMet) {
        clearError(input);
    }
}
