document.addEventListener('DOMContentLoaded', function () {
    const expenseForm = document.getElementById('expense-form');
    const expenseTableBody = document.querySelector('#expense-table tbody');
    const feedbackMessage = document.getElementById('feedback-message');
    let editingRow = null;
    let lastDeletedExpenseData = null;
    let feedbackTimeout;

    // Setting up date limits
    const currentDate = new Date();
    const minDate = new Date(currentDate.getFullYear() - 100, 0, 1).toISOString().split('T')[0];
    const maxDate = new Date(currentDate.getFullYear(), 11, 31).toISOString().split('T')[0];
    const dateInput = document.getElementById('expense-date');
    dateInput.setAttribute('min', minDate);
    dateInput.setAttribute('max', maxDate);

    const expenseCategorySelect = document.getElementById('expense-category');
    let customCategoryInput = null;
    addExpenseButton.disabled = true;

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
            expenseCategory &&
            expenseDate &&
            (expenseCategory !== 'other' || customCategory)
        ) {
            addExpenseButton.disabled = false;
        } else {
            addExpenseButton.disabled = true;
        }
    }
    // Show custom category input when "Other" is selected
    expenseCategorySelect.addEventListener('change', function () {
        if (expenseCategorySelect.value === 'other') {
            if (!customCategoryInput) {
                customCategoryInput = document.createElement('input');
                customCategoryInput.type = 'text';
                customCategoryInput.id = 'custom-category';
                customCategoryInput.placeholder = 'Enter custom category';
                customCategoryInput.required = true;
                expenseCategorySelect.parentNode.insertBefore(customCategoryInput, expenseCategorySelect.nextSibling);
            }
            customCategoryInput.style.display = 'inline-block';
        } else if (customCategoryInput) {
            customCategoryInput.style.display = 'none';
            customCategoryInput.value = '';
        }
        checkFormValidity();
    });
    checkFormValidity();

    // Handle form submission
    expenseForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const expenseName = document.getElementById('expense-name').value;
        const expenseAmount = parseFloat(document.getElementById('expense-amount').value).toFixed(2);
        const expenseDate = document.getElementById('expense-date').value;
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

        // Add or edit the expense
        if (editingRow) {
            editingRow.cells[0].textContent = expenseName;
            editingRow.cells[1].textContent = `$${expenseAmount}`;
            editingRow.cells[2].textContent = expenseCategory.charAt(0).toUpperCase() + expenseCategory.slice(1);
            editingRow.cells[3].textContent = expenseDate;
            editingRow = null; // Reset after editing
            showFeedback('Expense updated successfully!', 'success');
        } else {
            // Create a new row if not editing
            const newRow = createRow(expenseName, expenseAmount, expenseCategory, expenseDate);
            expenseTableBody.appendChild(newRow);
            showFeedback('Expense added successfully!', 'success');
        }

        expenseForm.reset();
        if (customCategoryInput) customCategoryInput.style.display = 'none';
        checkFormValidity();
    });

    // Function to create a row with event listeners
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

        // Edit Button Functionality
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', function () {
            document.getElementById('expense-name').value = nameCell.textContent;
            document.getElementById('expense-amount').value = amountCell.textContent.slice(1); // Remove $ sign
            expenseCategorySelect.value = categoryCell.textContent.toLowerCase();
            
            if (expenseCategorySelect.value === 'other') {
                customCategoryInput.value = categoryCell.textContent;
                customCategoryInput.style.display = 'inline-block';
            }

            document.getElementById('expense-date').value = dateCell.textContent;
            editingRow = newRow; // Set the row that is being edited
        });
        actionsCell.appendChild(editButton);

        // Delete Button Functionality with Undo Option
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            lastDeletedExpenseData = { name, amount, category, date }; // Save deleted row data
            newRow.remove();
            showUndoOption('Expense deleted successfully!');
        });
        actionsCell.appendChild(deleteButton);

        newRow.appendChild(actionsCell);
        return newRow;
    }
    

    function showFeedback(message, type) {
        feedbackMessage.textContent = message;
        feedbackMessage.className = ''; // Reset classes
        feedbackMessage.classList.add(type);
        feedbackMessage.style.display = 'block';

        setTimeout(() => feedbackMessage.style.display = 'none', 2000);
    }

    // Show Undo Option after Deleting
    function showUndoOption(message) {
        feedbackMessage.innerHTML = `${message} <button id="undo-button" class="undo-button">Undo</button>`;
        feedbackMessage.className = 'success';
        feedbackMessage.style.display = 'block';

        document.getElementById('undo-button').addEventListener('click', function () {
            if (lastDeletedExpenseData) {
                // Recreate the row using the last deleted data
                const restoredRow = createRow(
                    lastDeletedExpenseData.name,
                    lastDeletedExpenseData.amount,
                    lastDeletedExpenseData.category,
                    lastDeletedExpenseData.date
                );
                expenseTableBody.appendChild(restoredRow); // Restore the deleted row
                lastDeletedExpenseData = null; // Clear saved data
                showFeedback('Expense restored!', 'success');
                clearFeedback(); // Clear feedback message immediately on restore
            }
        });

        feedbackTimeout = setTimeout(() => clearFeedback(), 10000); // 1 minute timeout

        function clearFeedback() {
            feedbackMessage.style.display = 'none';
            feedbackMessage.textContent = '';
            clearTimeout(feedbackTimeout);
        }
    }
});