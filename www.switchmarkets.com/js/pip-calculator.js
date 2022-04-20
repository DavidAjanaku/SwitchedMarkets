var pip_calculator = new function () {

    this.pairs = [];
    this.update = (data) => {
        if (data) {
            data.forEach(row => {
                this.pairs[row.symbol] = row;
            })
        }
        //updating list of instruments in the form
        let instruments_list_input = document.getElementById('list-instruments');
        let curr_drop_down2 = document.getElementById('drop-down-instruments');
        for (let pair in this.pairs) {
            let option = document.createElement('div');
            option.innerText = pair;
            curr_drop_down2.appendChild(option);
            option.onclick = function () {
                instruments_list_input.value = option.innerText;
                curr_drop_down2.style.display = 'none';
            }
        }
    }

    this.CalculatorHTML=function () {
        //form fields
        let self = this;
        this.instrument_field = document.getElementById('list-instruments');
        this.deposit_currency_field = document.getElementById('deposit-currency');
        this.lot_size_field = document.querySelector('#lot-size');
        this.instruments_drop_down = document.getElementById('drop-down-instruments');

        //end form fields

        //adding listeners to inputs
        this.instrument_field.addEventListener('keyup', function () {
            self.filter_instruments(self.instrument_field.value);

        })
        this.instrument_field.addEventListener("click", function () {
            self.filter_instruments('');
            self.instruments_drop_down.style.display = 'block';
        })
        window.addEventListener("click", function (e) {
            if (!self.instrument_field.contains(e.target)) {
                self.instruments_drop_down.style.display = 'none';
            }
        })
        //    end of instrument field listeners
        document.querySelector('.pip-calc-form').addEventListener('submit', evt => {
            evt.preventDefault();
            let calculator = new PipCalculator(self.instrument_field.value, this.lot_size_field.value, this.deposit_currency_field.value);
            let pip_value = calculator.calculate_pip_value();
            self.show_result(pip_value);
        })

        this.filter_instruments = function (pair_string) {
            let list_instrument_divs = this.instruments_drop_down.children;
            for (let i = 0; i < list_instrument_divs.length; i++) {
                let pair = list_instrument_divs[i].innerText;
                if (pair.toLowerCase().includes(pair_string.toLowerCase())) {
                    list_instrument_divs[i].style.display = 'block';
                } else {
                    list_instrument_divs[i].style.display = 'none';
                }
            }

        }

        // result
        this.result_row = document.querySelector('.pip-value-result');
        this.result_cell = this.result_row.querySelector('.value-number');

        this.show_result = function (pip_value) {
            this.result_row.style.display = 'flex';
            this.result_cell.innerText = Math.round(pip_value * 100) / 100 + ' ' + this.deposit_currency_field.value;
        }

    }

    function PipCalculator(instrument, lot_size, deposit_currency) {
        this.list_pairs = pip_calculator.pairs;
        this.instrument = instrument;
        this.quote_curr = this.instrument.substring(3, 6);
        this.lot_size = lot_size;
        this.deposit_currency = deposit_currency;
        this.instrument_lot = 100000;

        this.calculate_pip_value = function () {
            let pip_size = 0.0001;
            if (this.quote_curr == 'JPY') {
                pip_size = 0.01;
            }
            let rate_quote_deposit = this._calculate_exrate(this.quote_curr, this.deposit_currency);
            return this.instrument_lot * this.lot_size * pip_size * rate_quote_deposit;
        }
        this._calculate_exrate = function (curr_one, curr_two) {
            if (curr_one === curr_two) {
                return 1;
            }
            let pair1 = this._get_pair(curr_one + curr_two);
            let pair2 = this._get_pair(curr_two + curr_one);
            if (pair1) {
                return (parseFloat(pair1.bid) + parseFloat(pair1.ask)) / 2;
            } else if (pair2) {

                return 1 / ((parseFloat(pair2.bid) + parseFloat(pair2.ask)) / 2);
            } else {
                return this._calculate_ex_rate_via_usd(curr_one, curr_two);
            }
        }

        this._calculate_ex_rate_via_usd = function (curr_one, curr_two) {
            let ex_rate1 = this._calculate_exrate(curr_one, 'USD');
            let ex_rate2 = this._calculate_exrate(curr_two, 'USD');
            return ex_rate1 / ex_rate2;
        }

        this._get_pair = function (pair_string) {
            let pair = this.list_pairs[pair_string];
            if (pair) {
                return pair;
            } else {
                return false;
            }
        }

    }

}