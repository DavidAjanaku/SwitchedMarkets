function HeatmapUI(selector_name, arguments_function, type_calculator) {
    let self = this;
    this.strength_meter_holder = document.querySelector(selector_name);
    this.list_tf_checks = this.strength_meter_holder.querySelectorAll('.js-tf-check');
    this.list_currency_checks = this.strength_meter_holder.querySelectorAll('.js-currency-check');
    this.list_group_checks = this.strength_meter_holder.querySelectorAll('.js-group-check');
    this.color_buttons = this.strength_meter_holder.querySelectorAll('.js-choose-color');
    this.arguments_function = arguments_function;
    this.type_calculator = type_calculator;
    this.list_navitems=this.strength_meter_holder.querySelectorAll('.cpanel-item');
    // this.margin_between_blocks=margin_between_blocks;

    add_ui_listeners();
    update_group_buttons();

    function update_group_buttons() {
        let list_active_groups = [];
        self.list_currency_checks.forEach(check => {
            if (check.classList.contains('enabled')) {
                if (!list_active_groups.includes(check.dataset.group)) {
                    list_active_groups.push(check.dataset.group);
                }
            }
        })
        self.list_group_checks.forEach(group_check => {
            if (list_active_groups.includes(group_check.dataset.group)) {
                group_check.classList.add('enabled');
                group_check.innerHTML='Unmark all';
            } else {
                group_check.classList.remove('enabled');
                group_check.innerHTML='Mark all';
            }
        })
    }

    function add_ui_listeners() {
        //change themes buttons
        let color_class_div = self.strength_meter_holder.querySelector('.js-color-mode');
        let hero_div = document.querySelector('.hero');
        self.color_buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                self.color_buttons.forEach(button => {
                    button.classList = [];
                    button.classList.add('js-choose-color', 'btn');
                })
                if (btn.dataset.class == 'bg-dark') {
                    hero_div.classList.add('filter-black');
                } else {
                    hero_div.classList.remove('filter-black');
                }
                color_class_div.classList = [];
                color_class_div.classList.add('js-color-mode');
                color_class_div.classList.add(btn.dataset.class);

            })
        })
        //hide control panel button
        let hide_cp_button = self.strength_meter_holder.querySelector('.js-hide-buttons');
        let ui_cp = self.strength_meter_holder.querySelector('.ui-control-panel');
        if (hide_cp_button) {
            hide_cp_button.addEventListener('click', () => {
                ui_cp.classList.toggle('d-none');
                // console.log(ui_cp.classList.contains());
                if (ui_cp.classList.contains('d-none')) {
                    hide_cp_button.innerHTML = 'Show control panel';
                } else {
                    hide_cp_button.innerHTML = 'Hide control panel';
                }
            })
        }
        //bubbles
        let bubble_btn = self.strength_meter_holder.querySelector('.js-bubbles');
        let heatmap_div=self.strength_meter_holder.querySelector('.js-heatmap-canvas');
        bubble_btn.addEventListener('click',()=>{
            heatmap_div.classList.toggle('bubble-style');
            if (bubble_btn.innerHTML=='Bubbles'){
                bubble_btn.innerHTML='Normal';
            } else {
                bubble_btn.innerHTML='Bubbles';
            }
        })
        //currency/pair checks (within control panel)
        self.list_tf_checks.forEach(check => {
            check.addEventListener('click', () => {
                redraw_graphic(check);
            })
        })
        //tf checks (within control panel)
        self.list_currency_checks.forEach(check => {
            check.addEventListener('click', () => {
                redraw_graphic(check);
                update_group_buttons();
            })
        })
        //instruments groups checks (within control panel)
        self.list_group_checks.forEach(check => {
            check.addEventListener('click', () => {
                check.classList.toggle('enabled');
                let group_enabled = check.classList.contains('enabled');
                if (group_enabled){
                    check.innerHTML='Unmark all';
                } else {
                    check.innerHTML='Mark all';
                }
                let group_name = check.dataset.group;
                self.list_currency_checks.forEach(curr_check => {
                    if (curr_check.dataset.group == group_name) {
                        if (group_enabled) {
                            curr_check.classList.add('enabled');
                        } else {
                            curr_check.classList.remove('enabled');
                        }
                    }
                })
                trSocket.socket.emit('requestHistory', (instruments_data) => {
                    self.initialize_user_interface(instruments_data);
                });


            })
        })
        //navigation items on hover
        let buttons_groups=self.strength_meter_holder.querySelectorAll('.buttons-holder');
        let dropdown_body=self.strength_meter_holder.querySelector('.buttons-dropdown-body');
        self.list_navitems.forEach(nav_item=>{
            if (screen.width>=768){
                nav_item.addEventListener('mouseenter',()=>{
                    self.list_navitems.forEach(nav=>{
                        nav.classList.remove('bg-yellow');
                    })
                    nav_item.classList.add('bg-yellow');

                    buttons_groups.forEach(button_group=>{
                        if (button_group.dataset.navigation!=nav_item.dataset.navigation){
                            button_group.classList.add('d-none');
                        } else {
                            button_group.classList.remove('d-none');
                        }
                    })
                })

            } else {
                nav_item.addEventListener('click',()=>{
                    if (nav_item.classList.contains('bg-yellow')){
                        nav_item.classList.remove('bg-yellow');
                        dropdown_body.style.display='none';

                    } else {
                        self.list_navitems.forEach(nav=>{
                            nav.classList.remove('bg-yellow');
                        })
                        nav_item.classList.add('bg-yellow');
                        dropdown_body.style.display='block';
                        buttons_groups.forEach(button_group=>{
                            if (button_group.dataset.navigation!=nav_item.dataset.navigation){
                                button_group.classList.add('d-none');
                            } else {
                                button_group.classList.remove('d-none');
                            }
                        })

                    }
                })
            }
        })

        function redraw_graphic(check_div) {
            check_div.classList.toggle('enabled');
            trSocket.socket.emit('requestHistory', (instruments_data) => {
                self.initialize_user_interface(instruments_data);
            });

        }

    }

    this.initialize_user_interface = function (instrument_data) {

        let list_currencies = create_necessary_list(this.list_currency_checks);
        let timeframes = create_necessary_list(this.list_tf_checks);
        let list_groups = create_pair_groups(this.list_currency_checks);

        this.strengthMeter = new StrenghtMeter(this.strength_meter_holder, list_currencies, timeframes, instrument_data, this.arguments_function, this.type_calculator, list_groups);
        try {
            this.strengthMeter.draw_strength_meter();
        } catch (err) {
        }

    }

    function create_necessary_list(list_checks) {
        let result = [];

        list_checks.forEach(check => {
            if (check.classList.contains('enabled')) {
                result.push(check.dataset.name);
            }
        })
        return result;
    }

    function create_pair_groups(list_checks) {
        let result = {};
        list_checks.forEach(check => {
            if (check.classList.contains('enabled')) {
                let group = check.dataset.group;
                if (result[group]) {
                    result[group].push(check.dataset.name);
                } else {
                    result[group] = [];
                    result[group].push(check.dataset.name);
                }
            }
        })

        return result;
    }


}

function StrenghtMeter(holder_div, currencies, timeframes, instrument_data, list_blocks_function, type_calculator, list_groups) {

    let self = this;
    try {
        this.ui_div = holder_div;
        this.parent_div = holder_div.querySelector('.js-heatmap-canvas');
        this.strength_calculator = new StrengthCalculator(type_calculator);
        this.strength_calculator.initialize_str_calculator(instrument_data, currencies, timeframes);
        this.list_currencies = currencies;//list_currencies;
        this.time_frames = timeframes;//time_frames;
        this.list_groups = list_groups;
        this.parent_div.style.height = get_heatmap_height();
        this.popup_manager = new PopupManager(this);

        let list_blocks = list_blocks_function(this);
        this.heatmap = new SquaresBlock({
            'name': list_blocks.name,
            'css_class': list_blocks.css_class,
            'children': list_blocks.children,
            'margin': list_blocks.margin,
        }, this.popup_manager);

    } catch (err) {
        console.log(err)
    }


    this.draw_strength_meter = function () {
        this.parent_div.innerHTML = '';
        this.popup_manager.popup.innerHTML = '';
        this.heatmap.draw_elements(this.parent_div);
        this.add_listeners();
    }


    this.add_listeners = function () {
        //moving popup over heatmap
        // alert(window.ontouchstart !== 'undefined');
        let left_border = this.parent_div.getBoundingClientRect().left;
        let right_border = this.parent_div.getBoundingClientRect().right;
        let header_height=document.querySelector('header').offsetHeight;
        let list_currency_blocks = this.parent_div.querySelectorAll('.currency-block');
        if (true) {
            list_currency_blocks = this.parent_div.querySelectorAll(('.pair-block'));
        }
        list_currency_blocks.forEach(currency_block => {
            currency_block.addEventListener('click', () => {
                if (screen.width<768){
                    return;
                }
                self.popup_manager.popup.classList.toggle('d-none');
                // currency_block.dispatchEvent(new Event('mouseenter'));
            })
            currency_block.addEventListener('mouseenter', (event) => {
                var rect = currency_block.getBoundingClientRect();
                let left_coord = rect.right + 35;
                let right_coord = rect.left - 35 - self.popup_manager.popup.offsetWidth;
                let bottom_coord=rect.bottom;
                if (screen.width<768){
                    // console.log(left_border,bottom_border);
                    self.popup_manager.popup.style.left = left_border + 'px';
                    self.popup_manager.popup.style.top = rect.top+window.scrollY+rect.height + 'px';
                    return;
                }

                if (Math.abs(right_coord - left_border) > Math.abs(right_border - left_coord)) {
                    if (right_coord<0){
                        self.popup_manager.popup.style.left = '10px';

                    } else {
                        self.popup_manager.popup.style.left = right_coord + 'px';
                    }
                } else {
                    self.popup_manager.popup.style.left = left_coord + 'px';

                }
                self.popup_manager.popup.style.top = rect.top + 0 + window.scrollY + 'px';
                if (rect.top<header_height+40){
                    self.popup_manager.popup.style.top = window.scrollY+header_height+40 + 'px';
                } else {
                    self.popup_manager.popup.style.top = rect.top + 0 + window.scrollY + 'px';
                }
            })
            currency_block.addEventListener('mouseover', (event) => {
                if (screen.width<768){
                    return;
                }
                if (!self.popup_manager.popup.classList.contains('d-none')){
                    var rect = currency_block.getBoundingClientRect();
                    if (rect.top<header_height+40){
                        self.popup_manager.popup.style.top = window.scrollY+header_height+40 + 'px';
                    } else {
                        self.popup_manager.popup.style.top = rect.top + 0 + window.scrollY + 'px';
                    }

                }
            })

        })
        //    hiding popup
        this.parent_div.addEventListener('mouseleave', () => {
            // console.log('over parent');
            this.popup_manager.popup.classList.add('d-none');
        })
        this.parent_div.addEventListener('mouseenter', () => {
            this.popup_manager.popup.classList.remove('d-none');
        })

    }

    function get_heatmap_height() {
        let header_height = document.querySelector('header').getBoundingClientRect().height;
        let pairs_num = self.strength_calculator.list_index[0].list_pairs.length * self.strength_calculator.list_index.length;
        let number_of_cells = pairs_num * self.time_frames.length;
        let heatmap_width = self.parent_div.getBoundingClientRect().width;
        let free_height = window.innerHeight * 0.98 - header_height;
        let heatmap_square = number_of_cells * 3000;
        let heatmap_height = heatmap_square / heatmap_width;
        if (heatmap_height < free_height) {
            heatmap_height = free_height;
        }
        return heatmap_height + 'px';


    }


}


function SquaresBlock(args, popup_manager) {

    let self = this;
    for (let key in args) {
        this[key] = args[key];
    }
    this.popup_manager = popup_manager;

    this.children = create_children(this.children);
    this.total_value = calculate_total_value(this);
    sort_children(this);


    this.create_positioning = function (width, height, name) {
        let values_data = [];
        if (this.children) {
            for (let i = 0; i < this.children.length; i++) {
                let child = this.children[i];
                let child_data = {value: child.total_value, name: child.name};
                if (child_data.value) {
                    values_data.push(child_data);
                }
            }

        }
        width = width || 1;
        height = height || 1;
        if (values_data.length > 0) {
            this.positions_data = Treemap.getTreemap({
                data: values_data,
                width: width, // the width and height of your treemap
                height: height,
            });

        }

    }
    this.draw_elements = function (parent_div) {
        if (!parent_div) {
            return;
        }
        let width = parent_div.offsetWidth-this.margin;
        let height = parent_div.offsetHeight-this.margin;
        this.create_positioning(width, height, this.name);

        let wrapper_div = document.createElement('DIV');
        wrapper_div.classList.add('children_wrapper');
        wrapper_div.style.width=width+'px';
        wrapper_div.style.height=height+'px';
        if (this.children) {
            for (let i = 0; i < this.children.length; i++) {
                if (!this.positions_data) {
                    break;
                }
                if (this.positions_data[i]) {
                    let child_position = this.positions_data[i];
                    let child_div = document.createElement('DIV');
                    child_div.classList.add('child-div');
                    child_div.style.left = child_position.x + this.margin+'px';
                    child_div.style.top = child_position.y + +this.margin+'px';
                    child_div.style.width = child_position.width-1 + 'px';
                    child_div.style.height = child_position.height-1 + 'px';

                    let list_css_wrapper = this.children[i].css_class;
                    let list_css_classes_wrapper = this.children[i].css_class_wrapper;
                    for (let ind in list_css_wrapper) {
                        child_div.classList.add(list_css_wrapper[ind]);
                    }
                    for (let ind in list_css_classes_wrapper) {
                        wrapper_div.classList.add(list_css_classes_wrapper[ind]);
                    }
                    wrapper_div.append(child_div);
                    this.children[i].initial_div = child_div;
                }
            }
        }
        let block_name_div = document.createElement('DIV');
        let block_name_div2= document.createElement('DIV');
        block_name_div.classList.add('block-name');
        block_name_div2.classList.add('block-name-2');
        block_name_div.innerHTML = this['name'];

        if (this.value){
            // console.log(this.name,this.value);
            block_name_div2.innerHTML=Math.round(this.value*10)/10+'%';
        }
        let font_size=Math.sqrt(width * height) * 0.11;
        if (font_size<8&&font_size>=3){
            font_size=8;
        } else if(font_size<3){
            font_size=0;
        }
        block_name_div.style.fontSize = font_size + 'px';
        block_name_div2.style.fontSize = font_size*0.8 + 'px';
        parent_div.append(wrapper_div);
        parent_div.append(block_name_div);
        parent_div.append(block_name_div2);
        this.overall_div = parent_div;
        this.add_listeners();

        if (this.children) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].draw_elements(this.children[i].initial_div);
            }
        }


    }


    this.add_listeners = function () {

        if (this.fill_popup) {
            add_hover_listeners('fill');
        }
        if (this.sort_popup) {
            add_hover_listeners('sort');
        }

        function add_hover_listeners(type_action) {

            if (type_action == 'fill') {
                self.overall_div.addEventListener('mouseenter', () => {
                    self.popup_manager.fill_popup(self);
                })


            } else if (type_action == 'sort') {
                self.overall_div.addEventListener('mouseenter', () => {
                    self.popup_manager.sort_popup(self);
                })

            }
        }

        //zoom effect
        // let section_name_div = this.overall_div.querySelector('.block-name');
        // let old_font_size = parseInt(section_name_div.style.fontSize);
        //
        // this.overall_div.addEventListener('mouseover', () => {
        //     if (old_font_size < 18) {
        //         // section_name_div.style.fontSize = '18px';
        //     } else {
        //         // section_name_div.style.fontSize = old_font_size * 1.07 + 'px';
        //     }
        // })
        // this.overall_div.addEventListener('mouseout', () => {
        //     section_name_div.style.fontSize = old_font_size + 'px';
        // })
    }

    this.get_children_data = function () {
        let result = [];
        if (this.pair_name) {
            let element = {
                'pair_name': this.pair_name,
                'time_frame': this.time_frame,
                'pair_change': this.value,
                'pair_rate': this.pair_rate,
            }
            result.push(element);
        }

        if (this.children) {
            for (let i in this.children) {
                result = result.concat(this.children[i].get_children_data());
            }
        }

        result.sort(function compareNumbers(a, b) {
            return b.pair_change - a.pair_change;
        });


        return result;
    }


    function create_children(children) {
        let result = [];
        if (children) {
            for (let i = 0; i < children.length; i++) {
                let args = {
                    'name': children[i]['name'],
                    'css_class': children[i]['css_class'],
                    'children': children[i].children,
                    'margin': children[i].margin,
                    'value': children[i].value,
                    'css_class_wrapper': children[i].css_class_wrapper,
                    'fill_popup': children[i].fill_popup,
                    'sort_popup': children[i].sort_popup,
                    'pair_name': children[i].pair_name,
                    'time_frame': children[i].time_frame,
                    'pair_rate': children[i].pair_rate,
                }
                let child = new SquaresBlock(args, self.popup_manager);
                result.push(child);
            }

        }
        return result;
    }

    function calculate_total_value(square_block) {
        let result = 0;
        if (square_block.value) {
            result = result + Math.abs(square_block.value);
        }
        if (square_block.children) {
            for (let i = 0; i < square_block.children.length; i++) {
                result = result + calculate_total_value(square_block.children[i]);
            }
        }

        return result;

    }

    function sort_children(square_block, real_value) {
        if (square_block.children) {
            square_block.children.sort(function compareNumbers(a, b) {
                if (real_value) {
                    return b.total_value_real - a.total_value_real;
                } else {
                    return b.total_value - a.total_value;
                }
            });
            for (let i in square_block.children) {
                sort_children(square_block.children[i], real_value)

            }
        }
    }

}

function PopupManager(str_meter) {
    let self = this;
    this.str_meter = str_meter;
    this.popup = create_heatmap_popup();

    this.fill_popup = function (square_block) {
        let children_data = square_block.get_children_data();
        this.popup.innerHTML = '';
        let popup_header = document.createElement('DIV');
        popup_header.innerHTML = square_block.name;
        popup_header.classList.add('popup-header');
        let close_popup=document.createElement('DIV');
        close_popup.classList.add('close');
        close_popup.innerHTML='x';
        popup_header.append(close_popup);
        self.popup.append(popup_header);
        let rows_wrapper = document.createElement('DIV');
        rows_wrapper.classList.add('rows-wrapper');
        children_data.forEach(cell_data => {
            let row_div = document.createElement('DIV');
            row_div.classList.add('popup-grid');
            let pair_name_div = create_row_cell(cell_data, 'pair_name', row_div);
            let timeframe_div = create_row_cell(cell_data, 'time_frame', row_div);
            let pair_change_div = create_row_cell(cell_data, 'pair_change', row_div);
            let pair_rate_div = create_row_cell(cell_data, 'pair_rate', row_div);
            row_div.append(pair_name_div);
            row_div.append(pair_rate_div);
            row_div.append(timeframe_div);
            row_div.append(pair_change_div);
            rows_wrapper.append(row_div);

        })
        this.popup.append(rows_wrapper);

        function create_row_cell(cell_data, data_name, row_div) {
            let result = document.createElement('DIV');
            result.classList.add(data_name);
            let cell_text = cell_data[data_name];
            if (data_name == 'pair_change') {
                cell_text = parseFloat(cell_text).toFixed(2);
                if (cell_text < 0) {
                    row_div.classList.add('negative-text');
                } else {
                    row_div.classList.add('positive-text');
                }
                cell_text = cell_text + '%';
            } else if (data_name == 'pair_rate') {
                cell_text = parseFloat(cell_text).toFixed(5);
            }
            if (data_name == 'pair_name' || data_name == 'time_frame') {
                row_div.dataset[data_name] = cell_data[data_name];
            }
            result.innerHTML = cell_text;
            return result;
        }
    }

    this.sort_popup = function (square_block) {
        let block_data = square_block.get_children_data();
        let rows_wrapper = this.popup.querySelector('.rows-wrapper');
        let all_rows = this.popup.querySelectorAll('.popup-grid');
        all_rows.forEach(row => {
            block_data.forEach(child_data => {

                if (child_data.pair_name == row.dataset.pair_name && child_data.time_frame == row.dataset.time_frame) {
                    rows_wrapper.prepend(row);
                    row.classList.add('primary-row');
                } else {
                    row.classList.remove('primary-row');
                }
                if (child_data.pair_name == row.dataset.pair_name) {
                    row.classList.add('hovered-row');
                } else {
                    row.classList.remove('hovered-row');
                }
            })
        })
    }


    this.popup.addEventListener('mouseenter', () => {
        this.popup.classList.remove('d-none');

    })
    if (screen.width<768){
        this.popup.addEventListener('click', () => {
            this.popup.classList.add('d-none');

        })
    }

    function create_heatmap_popup() {
        //removing old popup if needed
        let popup = str_meter.ui_div.querySelector('.js-heatmap-popup');
        if (!popup) {
            popup = document.createElement('DIV');
            popup.classList.add('js-heatmap-popup', 'd-none');

            str_meter.ui_div.querySelector('.ui-wrapper').append(popup);
        } else {
            popup.classList.add('d-none');
        }
        return popup

    }

}

//    ============arguments functions================
//    1) currency blocks
function get_assets_blocks(str_meter) {
    let result = {
        'name': '',
        css_class: ['general-block'],
        margin: 0,
        value: 0,
        children: []
    };
    str_meter.list_currencies.forEach(currency => {
        let currency_child = {
            'name': currency,
            css_class: ['currency-block'],
            margin: 5,
            value: 0,
            fill_popup: true,
            children: []
        }
        result.children.push(currency_child);
        str_meter.list_currencies.forEach(currency2 => {
            if (currency != currency2) {
                let pair_child = {
                    'name': currency + '/' + currency2,
                    css_class: ['pair-block',],
                    margin: 0,
                    value: 0,
                    sort_popup: true,
                    children: []
                };
                currency_child.children.push(pair_child)
                str_meter.time_frames.forEach(time_frame => {
                    let pair_change = str_meter.strength_calculator.get_pair_change(currency, currency2, time_frame);
                    let pair_rate = str_meter.strength_calculator.get_pair_rate(currency, currency2);
                    let css_class = get_css_class(pair_change);
                    let tf_child = {
                        name: '',
                        margin:1,
                        css_class: [css_class],
                        value: pair_change,
                        children: [],
                        css_class_wrapper: ['name-corner'],
                        sort_popup: true,
                        pair_name: currency + '/' + currency2,
                        time_frame: time_frame,
                        pair_rate: pair_rate,

                    };
                    pair_child.children.push(tf_child);
                })
            }
        })


    })
    return result;

}

function get_tradable_instruments_blocks(str_meter) {
    let result = {
        'name': '',
        css_class: ['general-block'],
        margin: 2,
        value: 0,
        children: []
    };
    str_meter.list_currencies.forEach(pair => {
        let pair_child = {
            'name': pair,
            css_class: ['pair-block'],
            margin: 1,
            value: 0,
            children: []
        }
        result.children.push(pair_child);
        str_meter.time_frames.forEach(time_frame => {
            let pair_change = str_meter.strength_calculator.get_instrument_change(pair, time_frame);
            let css_class = get_css_class(pair_change);
            let tf_child = {
                name: '',
                css_class: [css_class],
                value: Math.abs(pair_change),
                real_value: pair_change,
                children: [],
                css_class_wrapper: ['name-corner']
            };
            pair_child.children.push(tf_child);
        })


    })
    return result;

}

function get_grouped_instruments_blocks(str_meter) {
    let result = {
        'name': '',
        css_class: ['general-block'],
        margin: 3,
        value: 0,
        children: []
    };

    for (let group in str_meter.list_groups) {
        let group_child = {
            'name': group,
            css_class: ['currency-block'],
            margin: 5,
            value: 0,
            fill_popup: true,
            children: []
        }
        result.children.push(group_child);

        str_meter.list_groups[group].forEach(pair => {
            let pair_child = {
                'name': pair,
                css_class: ['pair-block'],
                margin: 1,
                value: 0,
                sort_popup: true,
                children: []
            }
            group_child.children.push(pair_child);
            str_meter.time_frames.forEach(time_frame => {
                let pair_change = str_meter.strength_calculator.get_instrument_change(pair, time_frame);
                let pair_rate = str_meter.strength_calculator.get_instrument_rate(pair);
                let css_class = get_css_class(pair_change);
                let tf_child = {
                    name: time_frame,
                    css_class: [css_class,'tf-name'],
                    value: pair_change,
                    real_value: pair_change,
                    children: [],
                    css_class_wrapper: ['name-corner'],
                    sort_popup: true,
                    pair_name: pair,
                    time_frame: time_frame,
                    pair_rate: pair_rate,
                    margin:0,

                };
                pair_child.children.push(tf_child);
            })


        })
    }
    return result;
}

// function get_tf_instruments_blocks(str_meter) {
//     let result = {
//         'name': '',
//         css_class: ['general-block'],
//         margin: 4,
//         value: 0,
//         children: []
//     };
//     str_meter.time_frames.forEach(time_frame => {
//         let tf_child = {
//             'name': time_frame,
//             css_class: ['currency-block'],
//             margin: 2,
//             children: []
//         }
//         result.children.push(tf_child);
//         str_meter.list_currencies.forEach(pair => {
//             let pair_change = str_meter.strength_calculator.get_instrument_change(pair, time_frame);
//             let css_class = get_css_class(pair_change);
//             let pair_child = {
//                 'name': pair,
//                 css_class: [css_class,'pair-block'],
//                 margin: 0,
//                 value: Math.abs(pair_change),
//                 css_class_wrapper: ['name-corner'],
//
//             }
//             tf_child.children.push(pair_child);
//
//         })
//
//
//     })
//     return result;
//
// }


function get_css_class(pair_change) {
    if (pair_change < 0) {
        return 'negative';
    } else if (pair_change == 0) {
        return 'flat';
    } else {
        return 'positive';
    }
}
