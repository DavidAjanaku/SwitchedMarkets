const compound_calculator = new function() {

    const form = document.querySelector(".js_compound-calc");
    form.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const formId = ev.currentTarget.id;
        const form = ev.currentTarget;
        const results = document.getElementById('results-section');
        let fields = {};
        fields.starting = parseInt(form.starting.value, 10);
        fields.years = parseInt(form.years.value, 10);
        fields.months = parseInt(form.months.value, 10);
        fields.percent = parseInt(form.percentage.value, 10);
        fields.percentType = form.percentType.value;
        fields.accountCurrency = form.accountCurrency.value;


        // Validation before any calculations
        const valid = compound_calculator.validate_compound_form(formId, fields);
        const errorMessages = document.querySelectorAll('.calc-err');
        if (valid.valid) {
            errorMessages.forEach((message) => {
                message.innerHTML = '';
                message.style.display = 'none';
            })
            results.classList.add('show');
            compound_calculator.calculate_cagr(form, fields);
            setTimeout(function () {
                document.getElementById('results-section-shortcut').scrollIntoView({behavior: 'smooth'});
            }, 500)
        } else {
            // invalid form - show errors
            errorMessages.forEach((message) => {
                message.innerHTML = valid.message;
                message.style.display = 'block';
            })
        }
    })

    const symbolSelector = document.getElementById('account-currency');
    symbolSelector.addEventListener('change', (ev) => {
        const currencySymbols = {
            'USD': '$', // US Dollar
            'GBP': '£', // British Pound Sterling
            'CAD': '$', // Canadian Dollar
            'AUD': '$', // Australian Dollar
            'JPY': '¥', // Japanese Yen
            'EUR': '€', // Euro
            'NZD': '$', // New Zealand Dollar
            'CHF': 'CHF' // Swiss Franc
        };
        const symbol = document.getElementById('currency-symbol');
        const starting = document.getElementsByName('starting')[0];
        if (ev.currentTarget.value === 'CHF') {
            starting.style.paddingLeft = '45px';
        } else {
            starting.style.paddingLeft = '20px';
        }
        symbol.innerText = currencySymbols[ev.currentTarget.value];
    })

    // Declare chart data and configs so it can be modified from both update and new chart functions
    const ctxYearly = document.getElementById('chart-yearly');
    const ctxMonthly = document.getElementById('chart-monthly');

    let chartDataYearly = {
        labels: [],
        datasets: [{
            label: 'Value',
            data: [],
            backgroundColor: '#04d189',
        }]
    };

    let chartDataMonthly = {
        labels: [],
        datasets: [{
            label: 'Value',
            data: [],
            backgroundColor: '#04d189',
        }]
    };

    let chartConfigYearly = {
        type: 'bar',
        data: chartDataYearly,
        options: {
            layout: {
                padding: {
                    bottom: 0
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    grid: {
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: false,
                        drawTicks: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: true,
                        drawTicks: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    position: 'top',
                    text: 'Yearly Projection',
                    font: {
                        weight: 'bold',
                        size: 18
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: false
                    // position: 'bottom',
                    // labels: {
                    //     boxWidth: 20,
                    //     boxHeight: 20,
                    //     pointStyle: 'circle',
                    //     usePointStyle: true
                    // }
                }
            }
        }
    };

    let chartConfigMonthly = {
        type: 'bar',
        data: chartDataMonthly,
        options: {
            layout: {
                padding: {
                    bottom: 0
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    },
                    grid: {
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: false,
                        drawTicks: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: true,
                        drawTicks: false
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    position: 'top',
                    text: 'Monthly Projection',
                    font: {
                        weight: 'bold',
                        size: 18
                    },
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                },
                legend: {
                    display: false
                    // position: 'bottom',
                    // labels: {
                    //     boxWidth: 20,
                    //     boxHeight: 20,
                    //     pointStyle: 'circle',
                    //     usePointStyle: true
                    // }
                }
            }
        }
    };

    let chartMonthly;
    let chartYearly;

    this.validate_compound_form = (formId, form_fields) => {
        let response = {
            valid: true,
            message: ''
        };
        // TODO add some validation rules
        if (form_fields.years === 0 && form_fields.months === 0) {
            response.valid = false;
            response.message = 'Years or Months must be at least 1';
        }

        return response;
    }

    this.calculate_cagr = (calculator_form, form_fields) => {

        // future value
        let t;
        let n;
        const r = form_fields.percent / 100;
        if (form_fields.percentType === 'monthly') {
            n = 12;
            t = (form_fields.years * 12) + form_fields.months;
        } else if (form_fields.percentType === 'yearly') {
            n = 1
            t = form_fields.years + (form_fields.months / 12);
        }

        const futureValue = form_fields.starting * (Math.pow((1 + (r / n)), (n * t)));
        const totalInterest = futureValue - form_fields.starting;


        // Set the monthlyButton selector to access inside the below if condition
        // durationButtons[0] will be monthly
        // durationButtons[1] will be yearly
        const durationButtons = document.querySelectorAll('.btn-tabs');
        const navPanels = document.querySelectorAll('.tab-panel');

        let monthlyBalance = [];
        let monthlyTotalEarnings = [];
        let monthlyEarnings = [];

        let yearlyBalance = [];
        let yearlyTotalEarnings = [];
        let yearlyEarnings = [];

        if (form_fields.percentType === 'monthly') {
            
            // Figures for monthly table
            const monthlyTime = (form_fields.years * 12) + form_fields.months;

            for (let i = 0; i <= monthlyTime; i++) {
                if (i === 0) {
                    monthlyEarnings.push(0);
                    monthlyTotalEarnings.push(0);
                    monthlyBalance.push(form_fields.starting);
                } else {
                    const tempEarnings = monthlyBalance[i - 1] * r;
                    monthlyEarnings.push(tempEarnings);
                    monthlyTotalEarnings.push(monthlyEarnings[i] + monthlyTotalEarnings[i - 1]);
                    monthlyBalance.push(monthlyBalance[i - 1] + monthlyEarnings[i]);
                }
            }

            // If monthly we can display both yearly and monthly tables - and make sure the button is showing
            this.update_yearly_table(monthlyBalance, monthlyTotalEarnings, monthlyEarnings, form_fields);
            this.update_monthly_table(monthlyBalance, monthlyTotalEarnings, monthlyEarnings, form_fields);
            navPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            durationButtons.forEach(tab => {
                tab.classList.remove('active');
            });
            navPanels[0].classList.add('active');
            durationButtons[0].style.display = 'block';
            durationButtons[0].classList.add('active');
        } else if (form_fields.percentType === 'yearly') {

            // Figures for yearly table
            const yearlyTime = form_fields.years + (form_fields.months / 12);

            for (let i = 0; i <= yearlyTime; i++) {
                if (i === 0) {
                    yearlyEarnings.push(0);
                    yearlyTotalEarnings.push(0);
                    yearlyBalance.push(form_fields.starting);
                } else {
                    const tempEarnings = yearlyBalance[i - 1] * r;
                    yearlyEarnings.push(tempEarnings);
                    yearlyTotalEarnings.push(yearlyEarnings[i] + yearlyTotalEarnings[i - 1]);
                    yearlyBalance.push(yearlyBalance[i - 1] + yearlyEarnings[i]);
                }
            }

            if (form_fields.months > 0 && form_fields.years > 0) {
                const finalYears = yearlyTime - form_fields.years;
                const finalPercent = r * finalYears;
                const tempEarnings = yearlyBalance[yearlyBalance.length - 1] * finalPercent;
                yearlyEarnings.push(tempEarnings);
                yearlyTotalEarnings.push(yearlyEarnings[yearlyEarnings.length - 1] + yearlyTotalEarnings[yearlyTotalEarnings.length - 1]);
                yearlyBalance.push(yearlyBalance[yearlyBalance.length - 1] + yearlyEarnings[yearlyEarnings.length - 1]);
            }

            // If yearly, we only display the yearly table and hide the monthly button
            this.update_yearly_table(yearlyBalance, yearlyTotalEarnings, yearlyEarnings, form_fields);
            navPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            durationButtons.forEach(tab => {
                tab.classList.remove('active');
            });
            navPanels[1].classList.add('active');
            durationButtons[0].style.display = 'none';
            durationButtons[1].classList.add('active');
        }

        const cagr = ((( futureValue / form_fields.starting ) ** (1 / (t / n))) - 1) * 100;

        this.update_stats(futureValue, totalInterest, cagr, form_fields);
        this.update_summary(form_fields);

        // Check if chart already exists
        if (ctxMonthly.$chartjs === undefined || ctxYearly.$chartjs === undefined) {
            if (form_fields.percentType === 'monthly') {
                this.new_chart(monthlyBalance, form_fields);
            } else if (form_fields.percentType === 'yearly') {
                this.new_chart(yearlyBalance, form_fields);
            }
        } else {
            if (form_fields.percentType === 'monthly') {
                this.update_chart(monthlyBalance, form_fields);
            } else if (form_fields.percentType === 'yearly') {
                this.update_chart(yearlyBalance, form_fields);
            }
        }
    }

    this.update_stats = (futureValue, totalInterest, cagr, form_fields) => {
        const initialFields = document.querySelectorAll('.js_compound_stats_initial');
        const cagrFields = document.querySelectorAll('.js_compound_stats_cagr');
        const futureFields = document.querySelectorAll('.js_compound_stats_future-value');
        const totalFields = document.querySelectorAll('.js_compound_stats_total');
        initialFields.forEach((element) => {
            element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(form_fields.starting.toFixed(0));
        })
        cagrFields.forEach((element) => {
            element.innerText = cagr.toFixed(2) + '%';
        })
        futureFields.forEach((element) => {
            if (futureValue >= 9999999999) {
                futureValue = 9999999999;
                element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(futureValue.toFixed(0)) + '+';
            } else {
                element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(futureValue.toFixed(0));
            }
        })
        totalFields.forEach((element) => {
            if (totalInterest >= 9999999999) {
                totalInterest = 9999999999;
                element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(totalInterest.toFixed(0)) + '+';
            } else {
                element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(totalInterest.toFixed(0));
            }
        })
    }

    this.update_summary = (form_fields) => {
        let timeString;
        if (form_fields.years >= 2) {
            timeString = form_fields.years + ' years';
        } else if (form_fields.years === 1) {
            timeString = form_fields.years + ' year';
        } else if (form_fields.years === 0) {
            timeString = '';
        }
        if (form_fields.years >= 1) {
            if (form_fields.months === 1) {
                timeString += ' and ' + form_fields.months + ' month';
            } else if (form_fields.months >= 2) {
                timeString += ' and ' + form_fields.months + ' months';
            }
        } else {
            if (form_fields.months === 1) {
                timeString += form_fields.months + ' month';
            } else if (form_fields.months >= 2) {
                timeString += form_fields.months + ' months';
            }
        }
        const initialDeposit = document.querySelectorAll('.js_summary-initial-deposit');
        const percentage = document.querySelectorAll('.js_summary-percentage');
        const time = document.querySelectorAll('.js_summary-time');
        const compounding = document.querySelectorAll('.js_summary-compounding');
        initialDeposit.forEach((element) => {
            element.innerText = new Intl.NumberFormat('en-US', {style: 'currency', currency: form_fields.accountCurrency}).format(form_fields.starting.toFixed(0));
        })
        percentage.forEach((element) => {
            element.innerText = form_fields.percent + '% ' + form_fields.percentType[0].toUpperCase() + form_fields.percentType.substring(1);
        })
        time.forEach((element) => {
            element.innerText = timeString;

        })
        compounding.forEach((element) => {
            element.innerText = form_fields.percentType[0].toUpperCase() + form_fields.percentType.substring(1);
        })
    }

    this.update_yearly_table = (balance, totalEarnings, earnings, form_fields) => {
        const table = document.getElementById('yearly-table-body');
        const rows = document.querySelectorAll('#yearly-table-body tr').length;
        let row;
        const formatOptions = {
            style: 'currency',
            currency: form_fields.accountCurrency
        };
        for (let i = rows - 1; i >= 0; i--) {
            table.deleteRow(i);
        }

        let i = 0;
        let j = 0;
        if (form_fields.percentType === 'monthly') {
            while (i < balance.length) {
                if (j < balance.length) {

                    let formattedEarnings, formattedTotalEarnings, formattedBalance;
                    let largeEarnings = '';
                    let largeTotal = '';
                    let largeBalance = '';

                    if (earnings[j] >= 999999999999) {
                        earnings[j] = 999999999999;
                        largeEarnings = '+';
                    }
                    formattedEarnings = new Intl.NumberFormat('en-US', formatOptions).format(earnings[j].toFixed(2)) + largeEarnings;

                    if (totalEarnings[j] >= 999999999999) {
                        totalEarnings[j] = 999999999999;
                        largeTotal = '+';
                    }
                    formattedTotalEarnings = new Intl.NumberFormat('en-US', formatOptions).format(totalEarnings[j].toFixed(2)) + largeTotal;
                    

                    if (balance[j] >= 999999999999) {
                        balance[j] = 999999999999;
                        largeBalance = '+';
                    }
                    formattedBalance = new Intl.NumberFormat('en-US', formatOptions).format(balance[j].toFixed(2))+ largeBalance;

                    row = `<tr>`;
                        row += `<td data-label="Year">${ i == balance.length - 1 ? 'Final' : i }</td>`;
                        row += `<td data-label="Earnings">${ formattedEarnings }</td>` ;
                        row += `<td data-label="Total Earnings">${ formattedTotalEarnings }</td>`;
                        row += `<td data-label="Balance">${ formattedBalance }</td>`;
                    row += `</tr>`;
                    table.innerHTML += row;

                    j = j + 12;
                }
                i++;
            }
            if (form_fields.years > 0 && form_fields.months > 0) {
                let formattedEarnings, formattedTotalEarnings, formattedBalance;
                let largeEarnings = '';
                let largeTotal = '';
                let largeBalance = '';

                if (earnings[earnings.length - 1] >= 999999999999) {
                    earnings[earnings.length - 1] = 999999999999;
                    largeEarnings = '+';
                }
                formattedEarnings = new Intl.NumberFormat('en-US', formatOptions).format(earnings[earnings.length - 1].toFixed(2))+ largeEarnings;

                if (totalEarnings[totalEarnings.length - 1] >= 999999999999) {
                    totalEarnings[totalEarnings.length - 1] = 999999999999;
                    largeTotal = '+';
                }
                formattedTotalEarnings = new Intl.NumberFormat('en-US', formatOptions).format(totalEarnings[totalEarnings.length - 1].toFixed(2))+ largeTotal;

                if (balance[balance.length - 1] >= 999999999999) {
                    balance[balance.length - 1] = 999999999999;
                    largeBalance = '+';
                }
                formattedBalance = new Intl.NumberFormat('en-US', formatOptions).format(balance[balance.length - 1].toFixed(2))+ largeBalance;
                row = `<tr>`;
                    row += `<td data-label="Year">Final</td>`;
                    row += `<td data-label="Earnings">${ formattedEarnings }</td>` ;
                    row += `<td data-label="Total Earnings">${ formattedTotalEarnings }</td>`;
                    row += `<td data-label="Balance">${ formattedBalance }</td>`;
                row += `</tr>`;
                table.innerHTML += row;
            }
        } else if (form_fields.percentType === 'yearly') {
            while (i < balance.length) {
                let formattedEarnings, formattedTotalEarnings, formattedBalance;
                let largeEarnings = '';
                let largeTotal = '';
                let largeBalance = '';

                if (earnings[i] >= 999999999999) {
                    earnings[i] = 999999999999;
                    largeEarnings = '+';
                }
                formattedEarnings = new Intl.NumberFormat('en-US', formatOptions).format(earnings[i].toFixed(2))+ largeTotal;

                if (totalEarnings[i] >= 999999999999) {
                    totalEarnings[i] = 999999999999;
                    largeTotal = '+';
                }
                formattedTotalEarnings = new Intl.NumberFormat('en-US', formatOptions).format(totalEarnings[i].toFixed(2))+ largeTotal;

                if (balance[i] >= 999999999999) {
                    balance[i] = 999999999999;
                    largeBalance = '+';
                }
                formattedBalance = new Intl.NumberFormat('en-US', formatOptions).format(balance[i].toFixed(2))+ largeTotal;

                row = `<tr>`;
                    row += `<td data-label="Year">${ i == balance.length - 1 ? 'Final' : i }</td>`;
                    row += `<td data-label="Earnings">${ formattedEarnings }</td>` ;
                    row += `<td data-label="Total Earnings">${ formattedTotalEarnings }</td>`;
                    row += `<td data-label="Balance">${ formattedBalance }</td>`;
                row += `</tr>`;
                table.innerHTML += row;

                i++;
            }
        }
    }

    this.update_monthly_table = (balance, totalEarnings, earnings, form_fields) => {
        const table = document.getElementById('monthly-table-body');
        const rows = document.querySelectorAll('#monthly-table-body tr').length;
        let row;
        const formatOptions = {
            style: 'currency',
            currency: form_fields.accountCurrency
        };
        for (let i = rows - 1; i >= 0; i--) {
            table.deleteRow(i);
        }

        table.innerHTML = '';

        for (let i = 0; i < balance.length; i++) {
            let formattedEarnings, formattedTotalEarnings, formattedBalance;
            let largeEarnings = '';
            let largeTotal = '';
            let largeBalance = '';

            if (earnings[i] >= 999999999999) {
                earnings[i] = 999999999999;
                largeEarnings = '+';
            }
            formattedEarnings = new Intl.NumberFormat('en-US', formatOptions).format(earnings[i].toFixed(2)) + largeEarnings;


            if (totalEarnings[i] >= 999999999999) {
                totalEarnings[i] = 999999999999;
                largeTotal = '+';
            }
            formattedTotalEarnings = new Intl.NumberFormat('en-US', formatOptions).format(totalEarnings[i].toFixed(2)) + largeTotal;

            if (balance[i] >= 999999999999) {
                balance[i] = 999999999999;
                largeBalance = '+';
            }
            formattedBalance = new Intl.NumberFormat('en-US', formatOptions).format(balance[i].toFixed(2)) + largeBalance;

            row = `<tr>`;
                row += `<td data-label="Month">${ i == balance.length - 1 ? 'Final' : i }</td>`;
                row += `<td data-label="Earnings">${ formattedEarnings }</td>` ;
                row += `<td data-label="Total Earnings">${ formattedTotalEarnings }</td>`;
                row += `<td data-label="Balance">${ formattedBalance }</td>`;
            row += `</tr>`;
            table.innerHTML += row;
        }
    }

    // Chart functions

    // Create new chart
    this.new_chart = (balance, form_fields) => {
        let i = 0;
        let j = 0;

        if (form_fields.percentType === 'monthly') {
            while (i < balance.length) {
                if (j < balance.length) {
                    chartDataYearly.labels.push(i);
                    chartDataYearly.datasets[0].data.push(balance[j]);
                    j = j + 12;
                }
                i++;
            }
            if (form_fields.years > 0 && form_fields.months > 0) {
                chartDataYearly.labels.push('Final');
                chartDataYearly.datasets[0].data.push(balance[balance.length - 1]);
            }
            for (let i = 0; i < balance.length; i++) {
                if (i == balance.length - 1) {
                    chartDataMonthly.labels.push('Final');
                } else {
                    chartDataMonthly.labels.push(i);
                }
                chartDataMonthly.datasets[0].data.push(balance[i]);
            }
        } else if (form_fields.percentType === 'yearly') {
            for (let i = 0; i < balance.length; i++) {
                if (i == balance.length - 1) {
                    chartDataMonthly.labels.push('Final');
                    chartDataYearly.labels.push('Final');
                } else {
                    chartDataMonthly.labels.push(i);
                    chartDataYearly.labels.push(i);
                }
                chartDataMonthly.datasets[0].data.push(balance[i]);
                chartDataYearly.datasets[0].data.push(balance[i]);
            }
        }
        this.init_chart();
    }

    // If already existing will need to destroy the existing first, then render new one
    this.update_chart = (balance, form_fields) => {
        // Clear existing charts and reset data
        chartYearly.destroy();
        chartMonthly.destroy();
        chartDataMonthly.labels = [];
        chartDataMonthly.datasets[0].data = [];
        chartDataYearly.labels = [];
        chartDataYearly.datasets[0].data = [];

        // Fill with new data
        let i = 0;
        let j = 0;

        if (form_fields.percentType === 'monthly') {
            while (i < balance.length) {
                if (j < balance.length) {
                    chartDataYearly.labels.push(i);
                    chartDataYearly.datasets[0].data.push(balance[j]);
                    j = j + 12;
                }
                i++;
            }
            if (form_fields.years > 0 && form_fields.months > 0) {
                chartDataYearly.labels.push('Final');
                chartDataYearly.datasets[0].data.push(balance[balance.length - 1]);
            }
            for (let i = 0; i < balance.length; i++) {
                if (i == balance.length - 1) {
                    chartDataMonthly.labels.push('Final');
                } else {
                    chartDataMonthly.labels.push(i);
                }
                chartDataMonthly.datasets[0].data.push(balance[i]);
            }
        } else if (form_fields.percentType === 'yearly') {
            for (let i = 0; i < balance.length; i++) {
                if (i == balance.length - 1) {
                    chartDataMonthly.labels.push('Final');
                    chartDataYearly.labels.push('Final');
                } else {
                    chartDataMonthly.labels.push(i);
                    chartDataYearly.labels.push(i);
                }
                chartDataMonthly.datasets[0].data.push(balance[i]);
                chartDataYearly.datasets[0].data.push(balance[i]);
            }
        }
        this.init_chart();
    }

    this.init_chart = () => {
        document.getElementById('chart-monthly').style.width = "100%";
        document.getElementById('chart-monthly').style.height = "auto";
        chartMonthly = new Chart(document.getElementById('chart-monthly'), chartConfigMonthly);

        document.getElementById('chart-yearly').style.width = "100%";
        document.getElementById('chart-yearly').style.height = "auto";
        chartYearly = new Chart(document.getElementById('chart-yearly'), chartConfigYearly);
    }


}



