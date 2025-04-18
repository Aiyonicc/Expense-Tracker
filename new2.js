document.addEventListener("DOMContentLoaded", () => {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalAmount = document.getElementById("total-amount");
    const filterCategory = document.getElementById("filter-category");

    const sortDateAsc = document.getElementById("sort-date-asc");
    const sortDateDesc = document.getElementById("sort-date-desc");
    const sortAmountAsc = document.getElementById("sort-amount-asc");
    const sortAmountDesc = document.getElementById("sort-amount-desc");

    const showDailyChartBtn = document.getElementById("show-daily-chart");
    const showMonthlyChartBtn = document.getElementById("show-monthly-chart");
    const showWeeklyChartBtn = document.getElementById("show-weekly-chart");

    const logoutBtn = document.getElementById("logout-btn");

    let expenses = [];
    let expenseChart = null;
    let monthlyExpenseChart = null;
    let weeklyExpenseChart = null;
    let currentChartView = 'daily';

    function saveExpenses() {
        localStorage.setItem("expenses_data", JSON.stringify(expenses));
    }

    function loadExpenses() {
        const storedExpenses = JSON.parse(localStorage.getItem("expenses_data"));
        expenses = Array.isArray(storedExpenses) ? storedExpenses : [];
        displayExpenses(expenses);
        updateTotalAmount();
        updateCharts();
        showCurrentChart();
    }

    logoutBtn.addEventListener("click", () => {
        if (confirm("Do you want to clear all data and logout?")) {
            localStorage.removeItem("expenses_data");
            expenses = [];
            displayExpenses([]);
            updateTotalAmount();
            updateCharts();
        }
    });

    expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("expense-name").value.trim();
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;

        if (!name || isNaN(amount) || amount <= 0 || !category || !date) {
            alert("Please fill out all fields correctly!");
            return;
        }

        const expense = { id: Date.now(), name, amount, category, date };
        expenses.push(expense);

        filterCategory.value = "All";
        displayExpenses(expenses);
        updateTotalAmount();
        saveExpenses();
        updateCharts();
        showCurrentChart();

        expenseForm.reset();
    });

    expenseList.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);

        if (e.target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this expense?")) {
                expenses = expenses.filter(exp => exp.id !== id);
                displayExpenses(getFilteredExpenses());
                updateTotalAmount();
                saveExpenses();
                updateCharts();
                showCurrentChart();
            }
        }

        if (e.target.classList.contains("edit-btn")) {
            const exp = expenses.find(exp => exp.id === id);
            if (exp) {
                document.getElementById("expense-name").value = exp.name;
                document.getElementById("expense-amount").value = exp.amount;
                document.getElementById("expense-category").value = exp.category;
                document.getElementById("expense-date").value = exp.date;

                expenses = expenses.filter(exp => exp.id !== id);
                displayExpenses(getFilteredExpenses());
                updateTotalAmount();
                saveExpenses();
                updateCharts();
                showCurrentChart();
            }
        }
    });

    sortDateAsc.addEventListener("click", () => {
        expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
        displayExpenses(getFilteredExpenses());
    });

    sortDateDesc.addEventListener("click", () => {
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        displayExpenses(getFilteredExpenses());
    });

    sortAmountAsc.addEventListener("click", () => {
        expenses.sort((a, b) => a.amount - b.amount);
        displayExpenses(getFilteredExpenses());
    });

    sortAmountDesc.addEventListener("click", () => {
        expenses.sort((a, b) => b.amount - a.amount);
        displayExpenses(getFilteredExpenses());
    });

    filterCategory.addEventListener("change", () => {
        displayExpenses(getFilteredExpenses());
        updateCharts();
        showCurrentChart();
    });

    showDailyChartBtn.addEventListener("click", showDailyChart);
    showMonthlyChartBtn.addEventListener("click", showMonthlyChart);
    showWeeklyChartBtn.addEventListener("click", showWeeklyChart);

    function showDailyChart() {
        currentChartView = 'daily';
        document.getElementById('expenseChart').style.display = 'block';
        document.getElementById('daily-chart-heading').style.display = 'block';
        document.getElementById('monthlyExpenseChart').style.display = 'none';
        document.getElementById('monthly-chart-heading').style.display = 'none';
        document.getElementById('weeklyExpenseChart').style.display = 'none';
        document.getElementById('weekly-chart-heading').style.display = 'none';
    }

    function showMonthlyChart() {
        currentChartView = 'monthly';
        document.getElementById('expenseChart').style.display = 'none';
        document.getElementById('daily-chart-heading').style.display = 'none';
        document.getElementById('monthlyExpenseChart').style.display = 'block';
        document.getElementById('monthly-chart-heading').style.display = 'block';
        document.getElementById('weeklyExpenseChart').style.display = 'none';
        document.getElementById('weekly-chart-heading').style.display = 'none';
    }

    function showWeeklyChart() {
        currentChartView = 'weekly';
        document.getElementById('expenseChart').style.display = 'none';
        document.getElementById('daily-chart-heading').style.display = 'none';
        document.getElementById('monthlyExpenseChart').style.display = 'none';
        document.getElementById('monthly-chart-heading').style.display = 'none';
        document.getElementById('weeklyExpenseChart').style.display = 'block';
        document.getElementById('weekly-chart-heading').style.display = 'block';
    }

    function showCurrentChart() {
        if (currentChartView === 'daily') showDailyChart();
        else if (currentChartView === 'monthly') showMonthlyChart();
        else if (currentChartView === 'weekly') showWeeklyChart();
    }

    function getFilteredExpenses() {
        const category = filterCategory.value;
        return category === "All" ? expenses : expenses.filter(exp => exp.category === category);
    }

    function displayExpenses(expensesToDisplay) {
        expenseList.innerHTML = "";
        expensesToDisplay.forEach(exp => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${exp.name}</td>
                <td>${exp.amount}</td>
                <td>${exp.category}</td>
                <td>${exp.date}</td>
                <td>
                    <button class="edit-btn" data-id="${exp.id}">Edit</button>
                    <button class="delete-btn" data-id="${exp.id}">Delete</button>
                </td>
            `;
            expenseList.appendChild(row);
        });
    }

    function updateTotalAmount() {
        const total = getFilteredExpenses().reduce((sum, exp) => sum + exp.amount, 0);
        totalAmount.textContent = total.toFixed(2);
    }

    function updateCharts() {
        updateDailyChart();
        updateMonthlyChart();
        updateWeeklyChart();
    }

    function updateDailyChart() {
        const data = getFilteredExpenses();
        const expenseByDate = {};
        data.forEach(exp => {
            expenseByDate[exp.date] = (expenseByDate[exp.date] || 0) + exp.amount;
        });

        const sortedDates = Object.keys(expenseByDate).sort();
        const amounts = sortedDates.map(date => expenseByDate[date]);

        const ctx = document.getElementById('expenseChart').getContext('2d');
        if (expenseChart) expenseChart.destroy();

        expenseChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Daily Expenses (₹)',
                    data: amounts,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    pointBackgroundColor: '#4caf50',
                    fill: true
                }]
            }
        });
    }

    function updateMonthlyChart() {
        const data = getFilteredExpenses();
        const expenseByMonth = {};
        data.forEach(exp => {
            const dateObj = new Date(exp.date);
            const monthYear = `${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            expenseByMonth[monthYear] = (expenseByMonth[monthYear] || 0) + exp.amount;
        });

        const sortedMonths = Object.keys(expenseByMonth).sort((a, b) => {
            const [am, ay] = a.split('/').map(Number);
            const [bm, by] = b.split('/').map(Number);
            return new Date(ay, am - 1) - new Date(by, bm - 1);
        });

        const amounts = sortedMonths.map(month => expenseByMonth[month]);

        const ctx = document.getElementById('monthlyExpenseChart').getContext('2d');
        if (monthlyExpenseChart) monthlyExpenseChart.destroy();

        monthlyExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: 'Monthly Expenses (₹)',
                    data: amounts,
                    backgroundColor: '#2196f3'
                }]
            }
        });
    }

    function getWeekNumber(dateString) {
        const date = new Date(dateString);
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    function updateWeeklyChart() {
        const data = getFilteredExpenses();
        const expenseByWeek = {};

        data.forEach(exp => {
            const dateObj = new Date(exp.date);
            const weekYear = `Week ${getWeekNumber(exp.date)} - ${dateObj.getFullYear()}`;
            expenseByWeek[weekYear] = (expenseByWeek[weekYear] || 0) + exp.amount;
        });

        const sortedWeeks = Object.keys(expenseByWeek).sort((a, b) => {
            const [aW, aY] = a.match(/\d+/g).map(Number);
            const [bW, bY] = b.match(/\d+/g).map(Number);
            return aY === bY ? aW - bW : aY - bY;
        });

        const amounts = sortedWeeks.map(week => expenseByWeek[week]);

        const ctx = document.getElementById('weeklyExpenseChart').getContext('2d');
        if (weeklyExpenseChart) weeklyExpenseChart.destroy();

        weeklyExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedWeeks,
                datasets: [{
                    label: 'Weekly Expenses (₹)',
                    data: amounts,
                    backgroundColor: '#ff9800'
                }]
            }
        });
    }

    loadExpenses();
});
