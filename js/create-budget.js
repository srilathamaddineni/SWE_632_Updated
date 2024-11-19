document.addEventListener('DOMContentLoaded', function () {
    
    let totalBudget = 0;
    let allocatedTotal = 0;
    let currentRow = null;  
    let rowToDelete = null; 
    let amountToDelete = 0;   

    const totalBudgetInput = document.getElementById('total-budget');
    const remainingBudgetDisplay = document.getElementById('remainingBudget');
    const allocatedTotalDisplay = document.getElementById('allocatedTotal');
    const budgetForm = document.getElementById('budget-form');
    const budgetTableBody = document.querySelector('#budget-table tbody');
    const progressBar = document.getElementById('progressBar');
    const confirmModal = document.getElementById('confirm-modal');  
    const confirmDeleteButton = document.getElementById('confirm-delete');  
    const cancelDeleteButton = document.getElementById('cancel-delete'); 
    const categoryColors = {
        'Food': '#D32F2F',        
        'Housing': '#1976D2',     
        'Utilities': '#FBC02D',  
        'Entertainment': '#00796B', 
        'Transportation': '#512DA8',
        'Other': '#E65100'      
    };
    
    updateColorLegend();

    totalBudgetInput.addEventListener('input', function () {
        totalBudget = parseFloat(this.value) || 0;
        updateRemainingBudget();
    });

    budgetForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const budgetName = document.getElementById('budget-name').value;
        const budgetAmount = parseFloat(document.getElementById('budget-amount').value) || 0;
        const budgetCategory = document.getElementById('budget-category').value;

        if (allocatedTotal + budgetAmount > totalBudget && !currentRow) {
            alert('You cannot allocate more than the remaining budget!');
            return;
        }

        // If editing an existing row
        if (currentRow) {
            const oldAmount = parseFloat(currentRow.querySelector('td:nth-child(2)').textContent);
            allocatedTotal = allocatedTotal - oldAmount + budgetAmount;
            updateRow(currentRow, budgetName, budgetAmount, budgetCategory);
        } else {
            allocatedTotal += budgetAmount;
            addBudgetToTable(budgetName, budgetAmount, budgetCategory);
        }

        updateRemainingBudget();
        updateProgressBar();
        allocatedTotalDisplay.textContent = allocatedTotal.toFixed(2);
        budgetForm.reset();
        currentRow = null;  // Reset currentRow after edit
    });

    function updateRemainingBudget() {
        const remaining = totalBudget - allocatedTotal;
        remainingBudgetDisplay.textContent = remaining.toFixed(2);
    }

    function updateProgressBar() {
        let gradientSegments = [];
        let accumulatedPercentage = 0;
    
        // Calculate the percentage for each row's amount based on the total budget
        budgetTableBody.querySelectorAll('tr').forEach(row => {
            const category = row.querySelector('td:nth-child(3)').textContent;
            const amount = parseFloat(row.querySelector('td:nth-child(2)').textContent);
            const percentage = (amount / totalBudget) * 100;
    
            if (percentage > 0) {
                gradientSegments.push(`${categoryColors[category] || '#CCCCCC'} ${accumulatedPercentage}% ${accumulatedPercentage + percentage}%`);
                accumulatedPercentage += percentage;
            }
        });
    
        // Join the gradient segments and set it as the background of the progress bar
        progressBar.style.background = `linear-gradient(to right, ${gradientSegments.join(', ')})`;
        progressBar.style.width = `${(allocatedTotal / totalBudget) * 100}%`;
    }
    // Function to display the color legend
function updateColorLegend() {
    const colorLegend = document.getElementById('color-legend');
    colorLegend.innerHTML = ''; // Clear any existing content

    Object.keys(categoryColors).forEach(category => {
        // Create a legend item for each category
        const legendItem = document.createElement('div');
        legendItem.style.display = 'flex';
        legendItem.style.alignItems = 'center';
        legendItem.style.marginBottom = '5px';

        // Create the color box
        const colorBox = document.createElement('span');
        colorBox.style.width = '15px';
        colorBox.style.height = '15px';
        colorBox.style.backgroundColor = categoryColors[category];
        colorBox.style.display = 'inline-block';
        colorBox.style.marginRight = '8px';

        // Create the label for the category
        const label = document.createElement('span');
        label.textContent = category;

        // Append color box and label to the legend item
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);

        // Append legend item to the color legend container
        colorLegend.appendChild(legendItem);
    });
}
    

    function addBudgetToTable(name, amount, category) {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        const amountCell = document.createElement('td');
        amountCell.textContent = amount.toFixed(2);
        row.appendChild(amountCell);

        const categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        row.appendChild(categoryCell);

        const actionsCell = document.createElement('td');

        // Create Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', function () {
            loadBudgetForEdit(row);
        });
        actionsCell.appendChild(editButton);

        // Create Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
            rowToDelete = row;  // Save the row that will be deleted
            amountToDelete = amount;  // Save the amount to subtract
            confirmModal.style.display = 'block';  // Show the confirmation modal
        });
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        budgetTableBody.appendChild(row);
    }

    // Function to load a budget row for editing
    function loadBudgetForEdit(row) {
        const name = row.querySelector('td:nth-child(1)').textContent;
        const amount = row.querySelector('td:nth-child(2)').textContent;
        const category = row.querySelector('td:nth-child(3)').textContent;

        document.getElementById('budget-name').value = name;
        document.getElementById('budget-amount').value = amount;
        document.getElementById('budget-category').value = category;

        currentRow = row;  // Set currentRow to the row being edited
    }

    function updateRow(row, name, amount, category) {
        row.querySelector('td:nth-child(1)').textContent = name;
        row.querySelector('td:nth-child(2)').textContent = amount.toFixed(2);
        row.querySelector('td:nth-child(3)').textContent = category;
    }

    // Function to delete a budget entry
    confirmDeleteButton.addEventListener('click', function () {
        allocatedTotal -= amountToDelete;
        updateRemainingBudget();
        updateProgressBar();
        allocatedTotalDisplay.textContent = allocatedTotal.toFixed(2);
        rowToDelete.remove();  
        confirmModal.style.display = 'none';  
    });

    // When the user clicks "Cancel", just hide the modal
    cancelDeleteButton.addEventListener('click', function () {
        confirmModal.style.display = 'none';  
    });
});