function StrengthCalculator(type_calculator) {
    let self = this;
    this.type = type_calculator;

    this.initialize_str_calculator = function (instruments_data, list_currencies, timeframes) {
        this.timeframes = timeframes;
        this.list_symbols = this.create_list_symbols(instruments_data);
        this.list_index = this.create_list_index(list_currencies);
        this.update_indexes_strength();


    }
    this.create_list_index = function (list_currencies) {
        let result = [];
        list_currencies.forEach(currency => {
            let index = new CurrencyIndex(currency, list_currencies, self.type, self.list_symbols);
            self.calculate_index(index, true);
            result.push(index);
        })
        return result;
    }
    this.calculate_index = function (index, is_initial) {
        index.list_pairs.forEach(pair => {
            pair.rate = self.calculate_rate(pair.base, pair.quote, 'rate');
            if (is_initial) {
                pair.start_rate = self.calculate_start_rate(pair.base, pair.quote, 'start_rate');
            }
        })
        index.update_rating(this.timeframes);
    }
    this.update_indexes_rates = function (raw_quote) {
        let list_quotes = raw_quote.data;
        if (list_quotes) {
            //updating symbol rates
            list_quotes.forEach(quote => {
                let quote_name = quote.s;
                let quote_rate = quote.p;
                try {
                    self.list_symbols[quote_name].rate = quote_rate;
                } catch (err) {
                    console.log('strength calculator was not initialized')
                }
            })
            //updating pairs in all indexes
            try {
                this.list_index.forEach(index => {
                    self.calculate_index(index, false);
                })
            } catch (err) {
                console.log('strength calculator was not initialized')
            }
        }
    }
    this.update_indexes_strength = function () {
        for (let i in this.timeframes) {
            update_indexes_strength(this.timeframes[i]);
        }


        function update_indexes_strength(time_frame) {
            let strongest_rating = Math.max.apply(Math, self.list_index.map(function (index) {
                return index.index_rating[time_frame];
            }));
            let weakest_rating = Math.min.apply(Math, self.list_index.map(function (index) {
                return index.index_rating[time_frame];
            }));
            let neutral_range = {
                from: weakest_rating + strongest_rating * 0.33,
                to: weakest_rating + strongest_rating * 0.66
            }
            self.list_index.forEach(index => {
                index.string_rating[time_frame] = get_string_rating(index.index_rating[time_frame], strongest_rating, weakest_rating, neutral_range);
            })

            function get_string_rating(index_rating, strongest_rating, weakest_rating, neutral_range) {
                if (index_rating == strongest_rating) {
                    return 'Strongest';
                } else if (index_rating == weakest_rating) {
                    return 'Weakest';
                } else if (index_rating <= neutral_range.from) {
                    return 'Weak';
                } else if (index_rating >= neutral_range.to) {
                    return 'Strong';
                } else {
                    return 'Neutral';
                }
            }

        }
    }

    this.calculate_rate = function (base, quote, type_rate) {
        let result = 0;
        if (base == quote) {
            return 1;
        }
        for (let symbol_name in this.list_symbols) {
            let symbol = this.list_symbols[symbol_name];
            if (base.toLowerCase() == symbol.base.toLowerCase() && quote.toLowerCase() == symbol.quote.toLowerCase()) {
                // console.log('here');
                result = symbol[type_rate];
                break;
            } else if (base.toLowerCase() == symbol.quote.toLowerCase() && quote.toLowerCase() == symbol.base.toLowerCase()) {
                result = 1 / symbol[type_rate];
                break;
            }
        }
        if (!result) {
            let base_usd_rate = self.calculate_rate(base, 'USD', type_rate);
            let quote_usd_rate = self.calculate_rate(quote, 'USD', type_rate);
            result = base_usd_rate / quote_usd_rate;
        }
        return result;

    }
    this.calculate_start_rate = function (base, quote) {
        let result = {};
        if (base == quote) {
            for (let i in this.timeframes) {
                result[this.timeframes[i]] = 1;
            }
            return result;
        }
        for (let symbol_name in this.list_symbols) {
            let symbol = this.list_symbols[symbol_name];
            if (base.toLowerCase() == symbol.base.toLowerCase() && quote.toLowerCase() == symbol.quote.toLowerCase()) {
                // console.log('here');
                // console.log(symbol);
                for (let i in this.timeframes) {
                    result[this.timeframes[i]] = symbol.start_rate[this.timeframes[i]];
                }
                break;
            } else if (base.toLowerCase() == symbol.quote.toLowerCase() && quote.toLowerCase() == symbol.base.toLowerCase()) {
                for (let i in this.timeframes) {
                    result[this.timeframes[i]] = 1 / symbol.start_rate[this.timeframes[i]];
                }
                break;
            }
        }

        if (Object.keys(result).length == 0) {
            let base_usd_rate = self.calculate_start_rate(base, 'usd');
            let quote_usd_rate = self.calculate_start_rate(quote, 'usd');
            for (let i in this.timeframes) {
                result[this.timeframes[i]] = base_usd_rate[this.timeframes[i]] / quote_usd_rate[this.timeframes[i]];
            }
        }

        return result;

    }
    this.create_list_symbols = function (instruments_data) {
        let result = {};
        let list_instruments = Object.keys(instruments_data);
        for (let i = 0; i < list_instruments.length; i++) {
            let instrument = list_instruments[i];
            let rate = instruments_data[instrument].current_rate;
            let base = instruments_data[instrument].base;
            let quote = instruments_data[instrument].quote;
            let start_rate = create_start_rate(instruments_data[instrument]);
            result[list_instruments[i]] = {base: base, quote: quote, rate: rate, start_rate: start_rate};
        }
        return result;

        function create_start_rate(instrument_data) {
            let result = {};
            for (let i in self.timeframes) {
                try {
                    result[self.timeframes[i]] = instrument_data[self.timeframes[i]][0][1];
                } catch (err) {
                }
                ;
            }
            return result;
        }
    }

    this.get_pair_change = function (base, quote, time_frame) {
        let result = 0;
        for (let i in this.list_index) {
            let index = this.list_index[i];
            for (let k in index.list_pairs) {
                let pair = index.list_pairs[k];
                if (pair.base == base && pair.quote == quote) {
                    result = (pair.rate - pair.start_rate[time_frame]) / pair.start_rate[time_frame] * 100;
                    break;
                }
            }
        }
        // console.log(base,quote,time_frame);
        return result;
    }
    this.get_pair_rate = function (base, quote) {
        let result = 0;
        for (let i in this.list_index) {
            let index = this.list_index[i];
            for (let k in index.list_pairs) {
                let pair = index.list_pairs[k];
                if (pair.base == base && pair.quote == quote) {
                    result = pair.rate;
                    break;
                }
            }
        }
        // console.log(base,quote,time_frame);
        return result;
    }
    this.get_instrument_rate = function (pair) {
        let index_needed = this.list_index.find(index => {
            return index.index_name == pair
        });
        return index_needed.list_pairs[0].rate;


    }
    this.get_instrument_change = function (pair, time_frame) {
        let index_needed = this.list_index.find(index => {
            return index.index_name == pair
        });
        let start_rate = index_needed.list_pairs[0].start_rate[time_frame];
        let rate = index_needed.list_pairs[0].rate;
        return (rate - start_rate) / rate * 100;
    }


}

function CurrencyIndex(currency, list_currencies, type_index, list_symbols) {
    let self = this;
    this.index_name = currency;
    this.list_pairs = create_list_pairs(list_currencies, type_index, list_symbols);
    this.string_rating = {};


    this.update_rating = function (timeframes) {
        let rating = {};
        for (let i in timeframes) {
            rating[timeframes[i]] = 0;
        }
        this.list_pairs.forEach(pair => {
            for (let tf in pair.start_rate) {
                if (pair.rate > pair.start_rate[tf]) {
                    rating[tf]++;
                    // console.log(pair.base,pair.quote,pair.rate,pair.start_rate);
                }
            }
        })
        this.index_rating = rating;
    }

    function create_list_pairs(list_currencies, type_index, list_symbols) {
        let result = [];
        if (!type_index) {
            list_currencies.forEach(curr => {
                let pair = {};
                pair.base = currency;
                pair.quote = curr;
                pair.start_rate = 0;
                pair.rate = 0;
                pair.name = currency + curr;
                if (currency != curr) {
                    result.push(pair);
                }
            })
        } else {
            let pair = {};
            pair.base = list_symbols[self.index_name].base;
            pair.quote = list_symbols[self.index_name].quote;
            pair.start_rate = 0;
            pair.rate = 0;
            pair.name = self.index_name;
            result.push(pair);
        }
        return result;

    }
}

function StrengthWidget(selector_name, timeframes) {

    this.all_timeframes = timeframes;
    this.calculator = new StrengthCalculator();
    this.widget = document.querySelector(selector_name);
    this.graph_percentage = {'strongest': 100, 'weakest': 0, 'strong': 75, 'weak': 25, 'neutral': 50}
    this.time_frame = timeframes[0];

    this.update_widget = function (quote) {
        if (quote) {
            this.calculator.update_indexes_rates(quote);
            this.calculator.update_indexes_strength();
        }
        this.calculator.list_index.forEach(index => {
            let currency_div = this.widget.querySelector('.' + index.index_name.toLowerCase());
            if (currency_div) {
                let string_rating_div = currency_div.querySelector('.currency-strength');
                let graph_rating_div = currency_div.querySelector('.currency-actual');
                string_rating_div.innerHTML = index.string_rating[this.time_frame];
                graph_rating_div.style.width = this.graph_percentage[index.string_rating[this.time_frame].toLowerCase()] + 'px';
            }
        })

    }
}

