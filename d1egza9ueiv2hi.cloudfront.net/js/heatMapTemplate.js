function HeatMap(all_assets) {
    this.all_assets = all_assets;
    this.list_value_cards = Array.from(document.querySelectorAll('.value-card'));

    let self = this;

    this.create_list_symbols = function (initial_quotes) {
        let result = [];
        let list_instruments = Object.keys(initial_quotes);
        for (let i = 0; i < list_instruments.length; i++) {
            let instrument = list_instruments[i];
            instrument = instrument.replace('OANDA:', '');
            let sep_index = instrument.indexOf('_');
            let base = instrument.slice(0, sep_index);
            let quote = instrument.slice(sep_index + 1);
            result[i] = {name: list_instruments[i], base: base, quote: quote};
        }
        return result;
    }
    this.change_timeframe=function (tf_div){
        if (!tf_div.classList.contains('active')){
            tf_div.classList.toggle('active')
            let all_tf_buttons=Array.from(document.querySelectorAll('.js-tf-button'));
            all_tf_buttons.forEach((tf_button)=>{
                tf_button.classList.remove('active')
            })
            tf_div.classList.add('active');
            this.list_value_cards.forEach(value_card => {
                self.update_cell(value_card)
            })
            this.sort_all_columns();

        }
    }

    this.fill_whole_table = function (pairs_data) {
        self.rates_calculator = new RatesCalculator(pairs_data);
        this.list_value_cards.forEach(value_card => {
            self.update_cell(value_card)
        })
        this.sort_all_columns();
        setInterval(this.sort_all_columns, 5000);

    }
    this.get_timeframe = function () {
        try {
            let all_tf_buttons=Array.from(document.querySelectorAll('.js-tf-button'));
            let active_tf_btn=all_tf_buttons.find(tf_btn=>{
                return tf_btn.classList.contains('active');
            })
            return active_tf_btn.dataset.timeframe;
        } catch {
            console.log('showing daily heatmap');
            return 'day';
        }
    }

    //this function is called on initial load of page
    this.update_cell = function (value_card) {
        let base = value_card.dataset.base;
        let quote = value_card.dataset.quote;
        let pair_history = self.rates_calculator.get_pair_history(base, quote, self.get_timeframe());
        let pair_rate = self.rates_calculator.get_pair_rate(base, quote);
        let tooltip_rate_div = value_card.querySelector('.js-tooltip-rate');
        let previous_high = pair_history.high;
        let previous_close = pair_history.close;
        let previous_low = pair_history.low;
        let current_open = pair_history.close;
        value_card.dataset.previous_high = previous_high;
        value_card.dataset.previous_close = previous_close;
        value_card.dataset.previous_low = previous_low;
        value_card.dataset.current_open = current_open;
        value_card.dataset.pip_size = get_pip_size(value_card.dataset.base, value_card.dataset.quote);
        value_card.dataset.current_rate = pair_rate;
        update_tradable(value_card);
        tooltip_rate_div.innerText = pair_rate.toFixed(4);
        value_card.classList.add('twinkle');
        this.update_class(value_card);

        function update_tradable(value_card) {
            let tradable_div = value_card.querySelector('.js-tooltip-cantrade');
            let base = value_card.dataset.base;
            let quote = value_card.dataset.quote;
            if (self.rates_calculator.is_tradable(base, quote)) {
                tradable_div.innerText = 'tradable';
                tradable_div.classList.add('js-tradable');
            } else {
                tradable_div.innerText = 'not tradable';
                tradable_div.classList.add('js-not-tradable');
            }
        }

        function get_pip_size(base, quote) {
            let result = 10000;
            let includes_jpy = base == 'JPY';
            if (quote == 'JPY') {
                result = 100;
            }
            if (base == 'JPY') {
                result = 1000000;
            }

            return result
        }
    }
    this.update_class = function (value_card) {
        let current_rate = parseFloat(value_card.dataset.current_rate);
        let previuos_high = parseFloat(value_card.dataset.previous_high);
        let previous_close = parseFloat(value_card.dataset.previous_close);
        let prevoius_low = parseFloat(value_card.dataset.previous_low);
        let current_open = parseFloat(value_card.dataset.current_open);

        if (current_rate > previuos_high && current_rate > current_open) {
            value_card.classList.add('strong-positive-rate');
            value_card.classList.remove('normal-positive-rate', 'flat-rate', 'normal-negative-rate', 'strong-negative-rate');
        } else if (current_rate > current_open) {
            value_card.classList.add('normal-positive-rate');
            value_card.classList.remove('strong-positive-rate', 'flat-rate', 'normal-negative-rate', 'strong-negative-rate');

        } else if (current_rate == current_open) {
            value_card.classList.add('flat-rate');
            value_card.classList.remove('strong-positive-rate', 'normal-positive-rate', 'normal-negative-rate', 'strong-negative-rate');

        } else if (current_rate < prevoius_low && current_rate < current_open) {
            value_card.classList.add('strong-negative-rate');
            value_card.classList.remove('strong-positive-rate', 'normal-positive-rate', 'normal-negative-rate', 'flat-rate');

        } else if (current_rate >= prevoius_low && current_rate < current_open) {
            value_card.classList.add('normal-negative-rate');
            value_card.classList.remove('strong-positive-rate', 'normal-positive-rate', 'flat-rate', 'strong-negative-rate');
        }
        let delta_text = this.get_delta_text(current_rate, current_open, value_card.dataset.pip_size);
        value_card.children[0].innerText = delta_text;
        value_card.querySelector('.js-tooltip-percent').innerText = delta_text;
        value_card.classList.toggle('twinkle');
        value_card.classList.toggle('twinkle-2');
    }

    this.get_delta_text = function (current_rate, current_open, pip_size) {
        let calc_mode = document.querySelector('.chosen-mode').children[1].innerText;
        let result_percent = ((current_rate / current_open - 1) * 100).toFixed(3);
        let result_pips = ((current_rate - current_open) * pip_size).toFixed(1);
        if (calc_mode == 'Percentage') {
            return result_percent + '%';
        } else {
            return result_pips + ' pip';
        }
    }
    this.change_mode = function (mode_button) {
        let active_mode_button = document.getElementsByClassName('chosen-mode')[0];
        active_mode_button.classList.remove('chosen-mode');
        mode_button.classList.add('chosen-mode');
        this.list_value_cards.forEach(card => {
            this.update_class(card);
        })
        this.sort_all_columns();
    }

    this.process_raw_quote = function (list_quotes) {
        try {
            this.rates_calculator.update_rates(JSON.parse(list_quotes));
        } catch {
            console.log('waiting for initial history');
            return;
        }
        let delay = 0;
        this.list_value_cards.forEach(value_card => {
            let base = value_card.dataset.base;
            let quote = value_card.dataset.quote;
            let rate = self.rates_calculator.get_pair_rate(base, quote);
            let existing_rate = value_card.dataset.current_rate;
            if (rate != existing_rate) {
                setTimeout(() => {
                    value_card.dataset.current_rate = rate;
                    value_card.querySelector('.js-tooltip-rate').innerText = rate.toFixed(5)
                    self.update_class(value_card);
                }, delay);
                delay = delay + 80;
            }
        })
    }

    //sorting cells
    this.sort_all_columns = function () {
        let all_columns = Array.from(document.querySelectorAll('.js-currency-col'));
        //sorting cells in each column
        all_columns.forEach((column) => {
            self.sort_column(column);
        });
        //sorting columns in table
        let table = all_columns[0].parentNode;
        let cols_with_ratings = create_objects_array(all_columns);
        cols_with_ratings.sort((a, b) => {
            return b.value - a.value;
        });
        cols_with_ratings.forEach((col) => {
            table.appendChild(col.col);
        })

        function create_objects_array(all_columns) {
            let result = [];
            for (let i = 0; i < all_columns.length; i++) {
                let column = all_columns[i];
                let value = parseFloat(column.dataset.rating);
                result[i] = {'col': column, 'value': value};
            }
            return result;

        }
    }
    this.sort_column = function (column) {
        let list_cells = Array.from(column.getElementsByClassName('js-currency-cell'));
        let cells_with_values = create_objects_array(list_cells, column);
        cells_with_values.sort((a, b) => {
            return b.value - a.value;
        });
        cells_with_values.forEach((cell) => {
            column.appendChild(cell.cell);
        })

        function create_objects_array(list_cells) {
            let result = [];
            let column_rating = 0;
            let curr_index = 0;
            for (let i = 0; i < list_cells.length; i++) {
                let cell = list_cells[i];
                let value = cell.children[0].innerText.replace('%', '');
                value = value.replace(' pip', '');
                value = parseFloat(value);
                result[i] = {'cell': cell, 'value': value};
                if (value > 0) {
                    column_rating = column_rating + 1;
                }
                curr_index = curr_index + value;


            }
            column.dataset.rating = column_rating;
            return result;
        }
    }
    this.show_opposite_tooltip = function (value_card) {
        let base = value_card.dataset.base;
        let quote = value_card.dataset.quote;
        let opposite_card = this.list_value_cards.find((card) => {
            return card.dataset.base == quote && card.dataset.quote == base;
        })
        value_card.querySelector('.cell-tooltip').classList.toggle('opacity-1');
        opposite_card.querySelector('.cell-tooltip').classList.toggle('opacity-1');

    }
    this.toggle_column = function (asset_button) {
        asset_button.classList.toggle('active');
        let is_active = asset_button.classList.contains('active');
        let asset = asset_button.dataset.asset;
        let existing_assets = [];
        let all_columns = Array.from(document.querySelectorAll('.js-currency-col'));
        let table = document.querySelector('.heatmap-table');
        all_columns.forEach(column => {
            let column_asset = column.dataset.asset;
            if (is_active) {
                add_cell(column, column_asset, asset);
            } else {
                remove_cell(column, column_asset, asset);

            }
            existing_assets.push(column_asset);
        })
        if (is_active) {
            insert_new_column(asset, existing_assets);
            self.sort_all_columns();
        } else {
            let existing_column = all_columns.find(column => {
                return column.dataset.asset == asset;
            })
            existing_column.classList.add('remove-column');
            setTimeout(() => {
                table.removeChild(existing_column);
            }, 300)
        }
        self.list_value_cards = Array.from(document.querySelectorAll('.value-card'));

        function insert_new_column(asset, existing_assets) {
            let new_column = document.createElement('div');
            let icon_link = self.all_assets[asset].icon_link;
            new_column.innerHTML = '<div class="d-flex flex-column currency-column js-currency-col insert-column" style="flex-grow: 1" data-asset="' + asset + '">\n' +
                '                        <div class="d-flex align-items-center justify-content-center currency-card-header flex-wrap">\n' +
                get_flag_div(icon_link) +
                '                            <div>' + asset + '</div>\n' +
                '                        </div></div>';
            new_column = new_column.children[0];
            existing_assets.forEach(existing_asset => {
                add_cell(new_column, asset, existing_asset);
            })

            table.appendChild(new_column);
            setTimeout(() => {
                new_column.classList.remove('insert-column');
            }, 400)

            function get_flag_div(icon_link){
                if (icon_link!=''){
                    return '<img src="' + icon_link + '" alt="country flag">\n';
                } else {
                    return '';
                }
            }
        }

        function remove_cell(column, column_asset, asset) {
            let list_cells = Array.from(column.querySelectorAll('.js-currency-cell'));
            for (let i = 0; i < list_cells.length; i++) {
                if (list_cells[i].dataset.quote == asset) {
                    column.removeChild(list_cells[i]);
                    break;
                }
            }

        }

        function add_cell(column, column_asset, new_asset) {
            let new_cell = document.createElement('div');
            new_cell.innerHTML = '                                    <div style="position: relative"\n' +
                '                                         class="d-flex justify-content-between js-currency-cell value-card"\n' +
                '                                         data-base="' + column_asset + '" data-quote="' + new_asset + '"\n' +
                '                                         onmouseover="heat_map.show_opposite_tooltip(this)"\n' +
                '                                         onmouseout="heat_map.show_opposite_tooltip(this)">\n' +
                '                                        <div style="align-self: flex-end" class="font-weight-bold js-percent-number">0%\n' +
                '                                        </div>\n' +
                '                                        <div class="font-weight-bold">' + new_asset + '</div>\n' +
                '                                        <div class="d-flex justify-content-between flex-wrap font-weight-bold cell-tooltip">\n' +
                '                                            <div class="font-weight-bold">' + column_asset + '/' + new_asset + '</div>\n' +
                '                                            <div class="d-flex flex-column">\n' +
                '                                                <div class="js-tooltip-cantrade"></div>\n' +
                '                                                <div class="js-tooltip-rate"></div>\n' +
                '                                                <div class="js-tooltip-percent"></div>\n' +
                '                                            </div>\n' +
                '                                        </div>\n' +
                '                                    </div>\n'
            new_cell = new_cell.children[0];
            self.update_cell(new_cell);
            column.appendChild(new_cell);

        }

    }
    this.list_corresponding_symbols={

        'OANDA:EUR_USD':'EURUSD',
        'OANDA:GBP_USD':'GBPUSD',
        'OANDA:USD_CAD':'USDCAD',
        'OANDA:EUR_GBP':'EURGBP',
        'OANDA:USD_CHF':'USDCHF',
        'OANDA:USD_JPY':'USDJPY',
        'OANDA:AUD_USD':'AUDUSD',
        'OANDA:EUR_AUD':'EURAUD',
        'OANDA:EUR_CHF':'EURCHF',
        'OANDA:EUR_JPY':'EURJPY',
        'OANDA:GBP_CHF':'GBPCHF',
        'OANDA:CAD_JPY':'CADJPY',
        'OANDA:GBP_JPY':'GBPJPY',
        'OANDA:AUD_NZD':'AUDNZD',
        'OANDA:AUD_CAD':'AUDCAD',
        'OANDA:AUD_CHF':'AUDCHF',
        'OANDA:AUD_JPY':'AUDJPY',
        'OANDA:CHF_JPY':'CHFJPY',
        'OANDA:EUR_NZD':'EURNZD',
        'OANDA:EUR_CAD':'EURCAD',
        'OANDA:CAD_CHF':'CADCHF',
        'OANDA:NZD_JPY':'NZDJPY',
        'OANDA:NZD_USD':'NZDUSD',
        'OANDA:GBP_AUD':'GBPAUD',
        'OANDA:GBP_CAD':'GBPCAD',
        'OANDA:GBP_NZD':'GBPNZD',
        'OANDA:NZD_CAD':'NZDCAD',
        'OANDA:NZD_CHF':'NZDCHF',
        'OANDA:USD_SGD':'USDSGD',
        'OANDA:USD_HKD':'USDHKD',
        'OANDA:XAU_USD':'XAUUSD',
        'OANDA:USD_CNH':'USDCNH',
        'OANDA:USD_SEK':'USDSEK',
        'OANDA:USD_NOK':'USDNOK',
        'OANDA:USD_PLN':'USDPLN',
        'OANDA:USD_MXN':'USDMXN',
        'OANDA:USD_ZAR':'USDZAR',

    };


}

function RatesCalculator(initial_data) {
    let self = this;
    this.all_instruments = initial_data.all_symbols;
    this._history_data = create_history_data(initial_data);
    //getter for history data
    Object.defineProperty(this, 'history_data', {
        get: function () {
            return JSON.parse(JSON.stringify(self._history_data))
        }
    });
    create_current_rates(initial_data);

    this.update_rates = function (list_quotes) {
        if (list_quotes.type == 'trade') {
            list_quotes = list_quotes.data;
            list_quotes.forEach(quote => {
                let quote_symbol = quote.s;
                let quote_price = quote.p;
                let instrument_to_change = self.all_instruments.find(instrument => {
                    return instrument.name == quote_symbol;
                })
                instrument_to_change.current_rate = quote_price;
            })
        }

    }
    this.get_pair_history = function (base, quote, time_frame) {
        if (base == quote) {
            return {open: 1, close: 1, high: 1, low: 1};
        }
        let instrument = self.get_instrument(base, quote);
        if (instrument.name != '') {
            if (instrument.opposite) {

                return opposite_history(instrument.name, time_frame)
            } else {
                return self.history_data[instrument.name][time_frame];
            }
        } else {
            let history1 = self.get_pair_history(base, 'USD', time_frame);
            let history2 = self.get_pair_history(quote, 'USD', time_frame);
            return divide_history(history1, history2);
        }

        function divide_history(history1, history2) {
            let result = {};
            for (let param in history1) {
                if (param != 'timestamp') {
                    result[param] = history1[param] / history2[param]
                } else {
                    result[param] = history1[param];
                }
            }
            return result;
        }

        function opposite_history(instrument_name, time_frame) {
            let history = self.history_data[instrument_name][time_frame];
            for (let parameter in history) {
                if (parameter != 'timestamp') {
                    history[parameter] = 1 / history[parameter];
                }
            }
            return history;
        }

    }
    this.get_instrument = function (base, quote) {
        let result = {name: '', opposite: false}
        let instrument = self.all_instruments.find(symbol => {
            return symbol.base == base && symbol.quote == quote;
        })
        let opposite_instrument = self.all_instruments.find(symbol => {
            return symbol.quote == base && symbol.base == quote;
        })
        if (instrument || opposite_instrument) {
            instrument = instrument || opposite_instrument;
            result.name = instrument.name;
            result.base = instrument.base;
            result.quote = instrument.quote;
            result.current_rate = instrument.current_rate;
        }
        if (opposite_instrument) {
            result.opposite = true;
        }
        return result;
    }

    this.get_pair_rate = function (base, quote) {
        if (base == quote) {
            return 1;
        }
        let instrument = self.get_instrument(base, quote);
        if (instrument.name != '') {
            let result_inst = self.all_instruments.find(inst => {
                return inst.name == instrument.name;
            })
            if (instrument.opposite) {

                return 1 / (result_inst.current_rate);
            } else {
                return result_inst.current_rate;
            }
        } else {
            let rate1 = self.get_pair_rate(base, 'USD');
            let rate2 = self.get_pair_rate(quote, 'USD');
            return rate1 / rate2;
        }
    }

    function create_current_rates(initial_data) {
        self.all_instruments.forEach(instrument => {
            let instrument_name = instrument.name;
            instrument.current_rate = initial_data[instrument_name].current_rate;
        })
    }

    function create_history_data(initial_data) {
        let history_data = {}
        for (let instrument_name in initial_data) {
            if (instrument_name != 'all_symbols') {
                history_data[instrument_name] = {};
                history_data[instrument_name].day = get_history_data(initial_data[instrument_name].history);
                history_data[instrument_name].week = get_history_data(initial_data[instrument_name].history_week);
                history_data[instrument_name].h4 = get_history_data(initial_data[instrument_name].history_4h);
                history_data[instrument_name].h1 = get_history_data(initial_data[instrument_name].history_1h);
            }
        }
        return history_data;

        function get_history_data(raw_candle) {
            let result_candle = {};
            try {
                result_candle.timestamp = raw_candle[0];
                result_candle.open = raw_candle[1];
                result_candle.high = raw_candle[2];
                result_candle.low = raw_candle[3];
                result_candle.close = raw_candle[4];
                return result_candle;

            } catch (err) {
                return {};
            }
        }

    }

    let all_symbols = [{
        "description": "Oanda Europe 50",
        "displaySymbol": "EU50/EUR",
        "symbol": "OANDA:EU50_EUR"
    }, {
        "description": "Oanda US SPX 500",
        "displaySymbol": "SPX500/USD",
        "symbol": "OANDA:SPX500_USD"
    }, {
        "description": "Oanda SGD/CHF",
        "displaySymbol": "SGD/CHF",
        "symbol": "OANDA:SGD_CHF"
    }, {
        "description": "Oanda NZD/USD",
        "displaySymbol": "NZD/USD",
        "symbol": "OANDA:NZD_USD"
    }, {
        "description": "Oanda EUR/GBP",
        "displaySymbol": "EUR/GBP",
        "symbol": "OANDA:EUR_GBP"
    }, {
        "description": "Oanda HKD/JPY",
        "displaySymbol": "HKD/JPY",
        "symbol": "OANDA:HKD_JPY"
    }, {
        "description": "Oanda ZAR/JPY",
        "displaySymbol": "ZAR/JPY",
        "symbol": "OANDA:ZAR_JPY"
    }, {
        "description": "Oanda USD/MXN",
        "displaySymbol": "USD/MXN",
        "symbol": "OANDA:USD_MXN"
    }, {
        "description": "Oanda Soybeans",
        "displaySymbol": "SOYBN/USD",
        "symbol": "OANDA:SOYBN_USD"
    }, {
        "description": "Oanda US 10Y T-Note",
        "displaySymbol": "USB10Y/USD",
        "symbol": "OANDA:USB10Y_USD"
    }, {
        "description": "Oanda Gold/NZD",
        "displaySymbol": "XAU/NZD",
        "symbol": "OANDA:XAU_NZD"
    }, {
        "description": "Oanda EUR/PLN",
        "displaySymbol": "EUR/PLN",
        "symbol": "OANDA:EUR_PLN"
    }, {
        "description": "Oanda USD/SGD",
        "displaySymbol": "USD/SGD",
        "symbol": "OANDA:USD_SGD"
    }, {
        "description": "Oanda EUR/HUF",
        "displaySymbol": "EUR/HUF",
        "symbol": "OANDA:EUR_HUF"
    }, {
        "description": "Oanda USD/PLN",
        "displaySymbol": "USD/PLN",
        "symbol": "OANDA:USD_PLN"
    }, {
        "description": "Oanda NZD/CAD",
        "displaySymbol": "NZD/CAD",
        "symbol": "OANDA:NZD_CAD"
    }, {
        "description": "Oanda GBP/USD",
        "displaySymbol": "GBP/USD",
        "symbol": "OANDA:GBP_USD"
    }, {
        "description": "Oanda Gold/AUD",
        "displaySymbol": "XAU/AUD",
        "symbol": "OANDA:XAU_AUD"
    }, {
        "description": "Oanda US Russ 2000",
        "displaySymbol": "US2000/USD",
        "symbol": "OANDA:US2000_USD"
    }, {
        "description": "Oanda USD/DKK",
        "displaySymbol": "USD/DKK",
        "symbol": "OANDA:USD_DKK"
    }, {
        "description": "Oanda Silver/GBP",
        "displaySymbol": "XAG/GBP",
        "symbol": "OANDA:XAG_GBP"
    }, {
        "description": "Oanda EUR/SGD",
        "displaySymbol": "EUR/SGD",
        "symbol": "OANDA:EUR_SGD"
    }, {
        "description": "Oanda USD/HKD",
        "displaySymbol": "USD/HKD",
        "symbol": "OANDA:USD_HKD"
    }, {
        "description": "Oanda NZD/JPY",
        "displaySymbol": "NZD/JPY",
        "symbol": "OANDA:NZD_JPY"
    }, {
        "description": "Oanda GBP/AUD",
        "displaySymbol": "GBP/AUD",
        "symbol": "OANDA:GBP_AUD"
    }, {
        "description": "Oanda NZD/SGD",
        "displaySymbol": "NZD/SGD",
        "symbol": "OANDA:NZD_SGD"
    }, {
        "description": "Oanda Gold/Silver",
        "displaySymbol": "XAU/XAG",
        "symbol": "OANDA:XAU_XAG"
    }, {
        "description": "Oanda GBP/ZAR",
        "displaySymbol": "GBP/ZAR",
        "symbol": "OANDA:GBP_ZAR"
    }, {
        "description": "Oanda EUR/SEK",
        "displaySymbol": "EUR/SEK",
        "symbol": "OANDA:EUR_SEK"
    }, {
        "description": "Oanda USD/THB",
        "displaySymbol": "USD/THB",
        "symbol": "OANDA:USD_THB"
    }, {
        "description": "Oanda USD/NOK",
        "displaySymbol": "USD/NOK",
        "symbol": "OANDA:USD_NOK"
    }, {
        "description": "Oanda CAD/SGD",
        "displaySymbol": "CAD/SGD",
        "symbol": "OANDA:CAD_SGD"
    }, {
        "description": "Oanda Silver/JPY",
        "displaySymbol": "XAG/JPY",
        "symbol": "OANDA:XAG_JPY"
    }, {
        "description": "Oanda Gold/SGD",
        "displaySymbol": "XAU/SGD",
        "symbol": "OANDA:XAU_SGD"
    }, {
        "description": "Oanda SGD/JPY",
        "displaySymbol": "SGD/JPY",
        "symbol": "OANDA:SGD_JPY"
    }, {
        "description": "Oanda USD/JPY",
        "displaySymbol": "USD/JPY",
        "symbol": "OANDA:USD_JPY"
    }, {
        "description": "Oanda Silver",
        "displaySymbol": "XAG/USD",
        "symbol": "OANDA:XAG_USD"
    }, {
        "description": "Oanda GBP/NZD",
        "displaySymbol": "GBP/NZD",
        "symbol": "OANDA:GBP_NZD"
    }, {
        "description": "Oanda AUD/SGD",
        "displaySymbol": "AUD/SGD",
        "symbol": "OANDA:AUD_SGD"
    }, {
        "description": "Oanda GBP/HKD",
        "displaySymbol": "GBP/HKD",
        "symbol": "OANDA:GBP_HKD"
    }, {
        "description": "Oanda China A50",
        "displaySymbol": "CN50/USD",
        "symbol": "OANDA:CN50_USD"
    }, {
        "description": "Oanda Copper",
        "displaySymbol": "XCU/USD",
        "symbol": "OANDA:XCU_USD"
    }, {
        "description": "Oanda USD/HUF",
        "displaySymbol": "USD/HUF",
        "symbol": "OANDA:USD_HUF"
    }, {
        "description": "Oanda India 50",
        "displaySymbol": "IN50/USD",
        "symbol": "OANDA:IN50_USD"
    }, {
        "description": "Oanda Wheat",
        "displaySymbol": "WHEAT/USD",
        "symbol": "OANDA:WHEAT_USD"
    }, {
        "description": "Oanda France 40",
        "displaySymbol": "FR40/EUR",
        "symbol": "OANDA:FR40_EUR"
    }, {
        "description": "Oanda AUD/JPY",
        "displaySymbol": "AUD/JPY",
        "symbol": "OANDA:AUD_JPY"
    }, {
        "description": "Oanda EUR/DKK",
        "displaySymbol": "EUR/DKK",
        "symbol": "OANDA:EUR_DKK"
    }, {
        "description": "Oanda GBP/JPY",
        "displaySymbol": "GBP/JPY",
        "symbol": "OANDA:GBP_JPY"
    }, {
        "description": "Oanda EUR/CHF",
        "displaySymbol": "EUR/CHF",
        "symbol": "OANDA:EUR_CHF"
    }, {
        "description": "Oanda Platinum",
        "displaySymbol": "XPT/USD",
        "symbol": "OANDA:XPT_USD"
    }, {
        "description": "Oanda USD/INR",
        "displaySymbol": "USD/INR",
        "symbol": "OANDA:USD_INR"
    }, {
        "description": "Oanda US 5Y T-Note",
        "displaySymbol": "USB05Y/USD",
        "symbol": "OANDA:USB05Y_USD"
    }, {
        "description": "Oanda Germany 30",
        "displaySymbol": "DE30/EUR",
        "symbol": "OANDA:DE30_EUR"
    }, {
        "description": "Oanda NZD/CHF",
        "displaySymbol": "NZD/CHF",
        "symbol": "OANDA:NZD_CHF"
    }, {
        "description": "Oanda EUR/HKD",
        "displaySymbol": "EUR/HKD",
        "symbol": "OANDA:EUR_HKD"
    }, {
        "description": "Oanda CAD/HKD",
        "displaySymbol": "CAD/HKD",
        "symbol": "OANDA:CAD_HKD"
    }, {
        "description": "Oanda USD/ZAR",
        "displaySymbol": "USD/ZAR",
        "symbol": "OANDA:USD_ZAR"
    }, {
        "description": "Oanda GBP/CAD",
        "displaySymbol": "GBP/CAD",
        "symbol": "OANDA:GBP_CAD"
    }, {
        "description": "Oanda CAD/JPY",
        "displaySymbol": "CAD/JPY",
        "symbol": "OANDA:CAD_JPY"
    }, {
        "description": "Oanda UK 100",
        "displaySymbol": "UK100/GBP",
        "symbol": "OANDA:UK100_GBP"
    }, {
        "description": "Oanda Gold/CHF",
        "displaySymbol": "XAU/CHF",
        "symbol": "OANDA:XAU_CHF"
    }, {
        "description": "Oanda Australia 200",
        "displaySymbol": "AU200/AUD",
        "symbol": "OANDA:AU200_AUD"
    }, {
        "description": "Oanda AUD/HKD",
        "displaySymbol": "AUD/HKD",
        "symbol": "OANDA:AUD_HKD"
    }, {
        "description": "Oanda EUR/CZK",
        "displaySymbol": "EUR/CZK",
        "symbol": "OANDA:EUR_CZK"
    }, {
        "description": "Oanda USD/CZK",
        "displaySymbol": "USD/CZK",
        "symbol": "OANDA:USD_CZK"
    }, {
        "description": "Oanda Corn",
        "displaySymbol": "CORN/USD",
        "symbol": "OANDA:CORN_USD"
    }, {
        "description": "Oanda Gold/CAD",
        "displaySymbol": "XAU/CAD",
        "symbol": "OANDA:XAU_CAD"
    }, {
        "description": "Oanda EUR/JPY",
        "displaySymbol": "EUR/JPY",
        "symbol": "OANDA:EUR_JPY"
    }, {
        "description": "Oanda TRY/JPY",
        "displaySymbol": "TRY/JPY",
        "symbol": "OANDA:TRY_JPY"
    }, {
        "description": "Oanda Bund",
        "displaySymbol": "DE10YB/EUR",
        "symbol": "OANDA:DE10YB_EUR"
    }, {
        "description": "Oanda EUR/ZAR",
        "displaySymbol": "EUR/ZAR",
        "symbol": "OANDA:EUR_ZAR"
    }, {
        "description": "Oanda Silver/CHF",
        "displaySymbol": "XAG/CHF",
        "symbol": "OANDA:XAG_CHF"
    }, {
        "description": "Oanda GBP/CHF",
        "displaySymbol": "GBP/CHF",
        "symbol": "OANDA:GBP_CHF"
    }, {
        "description": "Oanda AUD/NZD",
        "displaySymbol": "AUD/NZD",
        "symbol": "OANDA:AUD_NZD"
    }, {
        "description": "Oanda Gold/HKD",
        "displaySymbol": "XAU/HKD",
        "symbol": "OANDA:XAU_HKD"
    }, {
        "description": "Oanda EUR/TRY",
        "displaySymbol": "EUR/TRY",
        "symbol": "OANDA:EUR_TRY"
    }, {
        "description": "Oanda Silver/NZD",
        "displaySymbol": "XAG/NZD",
        "symbol": "OANDA:XAG_NZD"
    }, {
        "description": "Oanda CAD/CHF",
        "displaySymbol": "CAD/CHF",
        "symbol": "OANDA:CAD_CHF"
    }, {
        "description": "Oanda UK 10Y Gilt",
        "displaySymbol": "UK10YB/GBP",
        "symbol": "OANDA:UK10YB_GBP"
    }, {
        "description": "Oanda Silver/CAD",
        "displaySymbol": "XAG/CAD",
        "symbol": "OANDA:XAG_CAD"
    }, {
        "description": "Oanda Natural Gas",
        "displaySymbol": "NATGAS/USD",
        "symbol": "OANDA:NATGAS_USD"
    }, {
        "description": "Oanda EUR/CAD",
        "displaySymbol": "EUR/CAD",
        "symbol": "OANDA:EUR_CAD"
    }, {
        "description": "Oanda Silver/EUR",
        "displaySymbol": "XAG/EUR",
        "symbol": "OANDA:XAG_EUR"
    }, {
        "description": "Oanda Silver/AUD",
        "displaySymbol": "XAG/AUD",
        "symbol": "OANDA:XAG_AUD"
    }, {
        "description": "Oanda Gold/GBP",
        "displaySymbol": "XAU/GBP",
        "symbol": "OANDA:XAU_GBP"
    }, {
        "description": "Oanda Palladium",
        "displaySymbol": "XPD/USD",
        "symbol": "OANDA:XPD_USD"
    }, {
        "description": "Oanda Brent Crude Oil",
        "displaySymbol": "BCO/USD",
        "symbol": "OANDA:BCO_USD"
    }, {
        "description": "Oanda USD/CNH",
        "displaySymbol": "USD/CNH",
        "symbol": "OANDA:USD_CNH"
    }, {
        "description": "Oanda GBP/SGD",
        "displaySymbol": "GBP/SGD",
        "symbol": "OANDA:GBP_SGD"
    }, {
        "description": "Oanda GBP/PLN",
        "displaySymbol": "GBP/PLN",
        "symbol": "OANDA:GBP_PLN"
    }, {
        "description": "Oanda EUR/AUD",
        "displaySymbol": "EUR/AUD",
        "symbol": "OANDA:EUR_AUD"
    }, {
        "description": "Oanda AUD/CHF",
        "displaySymbol": "AUD/CHF",
        "symbol": "OANDA:AUD_CHF"
    }, {
        "description": "Oanda USD/CAD",
        "displaySymbol": "USD/CAD",
        "symbol": "OANDA:USD_CAD"
    }, {
        "description": "Oanda US T-Bond",
        "displaySymbol": "USB30Y/USD",
        "symbol": "OANDA:USB30Y_USD"
    }, {
        "description": "Oanda Gold",
        "displaySymbol": "XAU/USD",
        "symbol": "OANDA:XAU_USD"
    }, {
        "description": "Oanda CHF/JPY",
        "displaySymbol": "CHF/JPY",
        "symbol": "OANDA:CHF_JPY"
    }, {
        "description": "Oanda USD/TRY",
        "displaySymbol": "USD/TRY",
        "symbol": "OANDA:USD_TRY"
    }, {
        "description": "Oanda Silver/SGD",
        "displaySymbol": "XAG/SGD",
        "symbol": "OANDA:XAG_SGD"
    }, {
        "description": "Oanda EUR/NZD",
        "displaySymbol": "EUR/NZD",
        "symbol": "OANDA:EUR_NZD"
    }, {
        "description": "Oanda US 2Y T-Note",
        "displaySymbol": "USB02Y/USD",
        "symbol": "OANDA:USB02Y_USD"
    }, {
        "description": "Oanda CHF/HKD",
        "displaySymbol": "CHF/HKD",
        "symbol": "OANDA:CHF_HKD"
    }, {
        "description": "Oanda Netherlands 25",
        "displaySymbol": "NL25/EUR",
        "symbol": "OANDA:NL25_EUR"
    }, {
        "description": "Oanda Gold/JPY",
        "displaySymbol": "XAU/JPY",
        "symbol": "OANDA:XAU_JPY"
    }, {
        "description": "Oanda USD/SEK",
        "displaySymbol": "USD/SEK",
        "symbol": "OANDA:USD_SEK"
    }, {
        "description": "Oanda Sugar",
        "displaySymbol": "SUGAR/USD",
        "symbol": "OANDA:SUGAR_USD"
    }, {
        "description": "Oanda Japan 225",
        "displaySymbol": "JP225/USD",
        "symbol": "OANDA:JP225_USD"
    }, {
        "description": "Oanda US Wall St 30",
        "displaySymbol": "US30/USD",
        "symbol": "OANDA:US30_USD"
    }, {
        "description": "Oanda US Nas 100",
        "displaySymbol": "NAS100/USD",
        "symbol": "OANDA:NAS100_USD"
    }, {
        "description": "Oanda Singapore 30",
        "displaySymbol": "SG30/SGD",
        "symbol": "OANDA:SG30_SGD"
    }, {
        "description": "Oanda West Texas Oil",
        "displaySymbol": "WTICO/USD",
        "symbol": "OANDA:WTICO_USD"
    }, {
        "description": "Oanda AUD/CAD",
        "displaySymbol": "AUD/CAD",
        "symbol": "OANDA:AUD_CAD"
    }, {
        "description": "Oanda Gold/EUR",
        "displaySymbol": "XAU/EUR",
        "symbol": "OANDA:XAU_EUR"
    }, {
        "description": "Oanda AUD/USD",
        "displaySymbol": "AUD/USD",
        "symbol": "OANDA:AUD_USD"
    }, {
        "description": "Oanda EUR/NOK",
        "displaySymbol": "EUR/NOK",
        "symbol": "OANDA:EUR_NOK"
    }, {
        "description": "Oanda EUR/USD",
        "displaySymbol": "EUR/USD",
        "symbol": "OANDA:EUR_USD"
    }, {
        "description": "Oanda CHF/ZAR",
        "displaySymbol": "CHF/ZAR",
        "symbol": "OANDA:CHF_ZAR"
    }, {
        "description": "Oanda Silver/HKD",
        "displaySymbol": "XAG/HKD",
        "symbol": "OANDA:XAG_HKD"
    }, {
        "description": "Oanda Hong Kong 33",
        "displaySymbol": "HK33/HKD",
        "symbol": "OANDA:HK33_HKD"
    }, {
        "description": "Oanda USD/CHF",
        "displaySymbol": "USD/CHF",
        "symbol": "OANDA:USD_CHF"
    }, {
        "description": "Oanda NZD/HKD",
        "displaySymbol": "NZD/HKD",
        "symbol": "OANDA:NZD_HKD"
    }, {"description": "Oanda Taiwan Index", "displaySymbol": "TWIX/USD", "symbol": "OANDA:TWIX_USD"}];

    this.is_tradable = function (base, quote) {
        let result = false;
        for (let i = 0; i < all_symbols.length; i++) {
            let symbol_name = all_symbols[i].displaySymbol;
            let divider_index = symbol_name.indexOf('/');
            let symb_base = symbol_name.substr(0, divider_index);
            let symb_quote = symbol_name.substr(divider_index + 1, symbol_name.length);
            if (base == symb_base && quote == symb_quote) {
                result = true;
                break;
            }

        }
        return result;
    }
}