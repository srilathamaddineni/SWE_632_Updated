document.addEventListener('DOMContentLoaded', function () {
    const expenseForm = document.getElementById('expense-form');
    const expenseTableBody = document.querySelector('#expense-table tbody');
    const feedbackMessage = document.getElementById('feedback-message');
    const addExpenseButton = document.querySelector('.cta-button');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseDateInput = document.getElementById('expense-date');
    const expenseCategorySelect = document.getElementById('expense-category');
    let customCategoryInput = null;
    let editingRow = null;
    let lastDeletedExpenseData = null;
    let feedbackTimeout;

    // Setting up date limits
    const currentDate = new Date();
    const minDate = new Date(currentDate.getFullYear() - 100, 0, 1).toISOString().split('T')[0];
    const maxDate = new Date(currentDate.getFullYear(), 11, 31).toISOString().split('T')[0];
    expenseDateInput.setAttribute('min', minDate);
    expenseDateInput.setAttribute('max', maxDate);

    // Initial button state
    addExpenseButton.disabled = true;

    // Function to validate the form
    function checkFormValidity() {
        const expenseName = expenseNameInput.value.trim();
        const expenseAmount = expenseAmountInput.value.trim();
        const expenseCategory = expenseCategorySelect.value;
        const expenseDate = expenseDateInput.value;
        const customCategory = customCategoryInput ? customCategoryInput.value.trim() : '';

        // Enable button only if all fields are filled and valid
        if (
            expenseName &&
            expenseAmount &&
            expenseDate &&
            expenseCategory !== "" && // Ensure category is selected
            (expenseCategory !== 'other' || customCategory)
        ) {
            addExpenseButton.disabled = false;
        } else {
            addExpenseButton.disabled = true;
        }
    }

    // Add event listeners to inputs
    expenseNameInput.addEventListener('input', checkFormValidity);
    expenseAmountInput.addEventListener('input', checkFormValidity);
    expenseDateInput.addEventListener('change', checkFormValidity);

    // Handle category selection and custom input field
    expenseCategorySelect.addEventListener('change', function () {
        if (expenseCategorySelect.value === 'other') {
            if (!customCategoryInput) {
                customCategoryInput = document.createElement('input');
                customCategoryInput.type = 'text';
                customCategoryInput.id = 'custom-category';
                customCategoryInput.placeholder = 'Enter custom category';
                customCategoryInput.required = true;
                expenseCategorySelect.parentNode.insertBefore(customCategoryInput, expenseCategorySelect.nextSibling);
                customCategoryInput.addEventListener('input', checkFormValidity);
            }
            customCategoryInput.style.display = 'inline-block';
        } else if (customCategoryInput) {
            customCategoryInput.style.display = 'none';
            customCategoryInput.value = '';
        }
        checkFormValidity();
    });

    // Initial validation
    checkFormValidity();

    // Handle form submission
    expenseForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const expenseName = expenseNameInput.value.trim();
        const expenseAmount = parseFloat(expenseAmountInput.value).toFixed(2);
        const expenseDate = expenseDateInput.value;
        let expenseCategory = expenseCategorySelect.value;

        if (expenseCategory === 'other' && customCategoryInput) {
            expenseCategory = customCategoryInput.value.trim();
            if (!expenseCategory) {
                showFeedback('Please enter a valid category name.', 'error');
                return;
            }
        }

        if (!expenseName || !expenseAmount || !expenseCategory || !expenseDate) {
            showFeedback('Please fill in all fields!', 'error');
            return;
        }

        if (editingRow) {
            // Update an existing row
            editingRow.cells[0].textContent = expenseName;
            editingRow.cells[1].textContent = `$${expenseAmount}`;
            editingRow.cells[2].textContent = expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1);
            editingRow.cells[3].textContent = expenseDate;
            editingRow = null;
            showFeedback('Expense updated successfully!', 'success');
        } else {
            // Add a new row
            const newRow = createRow(expenseName, expenseAmount, expenseCategory, expenseDate);
            expenseTableBody.appendChild(newRow);
            showFeedback('Expense added successfully!', 'success');
        }

        expenseForm.reset();
        if (customCategoryInput) customCategoryInput.style.display = 'none';
        checkFormValidity();
    });

    // Function to create a new row
    function createRow(name, amount, category, date) {
        const newRow = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        newRow.appendChild(nameCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = `$${amount}`;
        newRow.appendChild(amountCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        newRow.appendChild(categoryCell);

        const dateCell = document.createElement('td');
        dateCell.textContent = date;
        newRow.appendChild(dateCell);

        const actionsCell = document.createElement('td');

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', function () {
            expenseNameInput.value = nameCell.textContent;
            expenseAmountInput.value = amountCell.textContent.slice(1);
            expenseCategorySelect.value = categoryCell.textContent.toLowerCase();

            if (expenseCategorySelect.value === 'other') {
                customCategoryInput.value = categoryCell.textContent;
                customCategoryInput.style.display = 'inline-block';
            }

            expenseDateInput.value = dateCell.textContent;
            editingRow = newRow;
        });
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            lastDeletedExpenseData = { name, amount, category, date };
            newRow.remove();
            showUndoOption('Expense deleted successfully!');
        });
        actionsCell.appendChild(deleteButton);

        newRow.appendChild(actionsCell);
        return newRow;
    }

    // Feedback display function
    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = '';
        feedbackMessage.classList.add(type);
        feedbackMessage.style.display = 'block';
        setTimeout(() => feedbackMessage.style.display = 'none', 2000);
    }

    // Undo delete
    function showUndoOption(message) {
        feedbackMessage.innerHTML = `${message} <button id="undo-button" class="undo-button">Undo</button>`;
        feedbackMessage.className = 'success';
        feedbackMessage.style.display = 'block';

        document.getElementById('undo-button').addEventListener('click', function () {
            if (lastDeletedExpenseData) {
                const restoredRow = createRow(
                    lastDeletedExpenseData.name,
                    lastDeletedExpenseData.amount,
                    lastDeletedExpenseData.category,
                    lastDeletedExpenseData.date
                );
                expenseTableBody.appendChild(restoredRow);
                lastDeletedExpenseData = null;
                showFeedback('Expense restored!', 'success');
            }
        });

        feedbackTimeout = setTimeout(() => {
            feedbackMessage.style.display = 'none';
            feedbackMessage.textContent = '';
        }, 10000);
    }
});
