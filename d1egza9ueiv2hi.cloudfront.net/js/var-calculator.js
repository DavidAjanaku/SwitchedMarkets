
function VARCalculator(){
    let self=this;
    this.min_confidence=90;
    this.max_confidence=99.9;
    this.form=document.querySelector('.js-var-calculator');
    this.position_amount_field=this.form.querySelector('#position-amount');
    this.asset_volatility_field=this.form.querySelector('#asset-volatility');
    this.days_number_field=this.form.querySelector('#days-number');
    //initializing confidence level slider
    this.confidence_level_field=this.form.querySelector('#confidence-level');
    this.confidence_level_field.setAttribute("min", this.min_confidence);
    this.confidence_level_field.setAttribute("max", this.max_confidence);
    this.confidence_level_field.setAttribute("value", 99);
    this.min_confidence_div=this.form.querySelectorAll('.js-confidence-range')[0];
    this.max_confidence_div=this.form.querySelectorAll('.js-confidence-range')[1];
    this.min_confidence_div.innerHTML=this.min_confidence.toFixed(1);
    this.max_confidence_div.innerHTML=this.max_confidence.toFixed(1);


    this.result_div=this.form.querySelector('.js-var-result');
    this.result_number_div=this.form.querySelector('.value-number');
    this.confidence_number_div=this.form.querySelector('.js-confidence-number');


    place_confidence_number(this);
    //adding listeners
    this.confidence_level_field.addEventListener('input',()=>{
        place_confidence_number(self);
    })
    this.form.addEventListener('submit',(ev)=>{
        ev.preventDefault();
        let result=self.calculate_value_at_risk();
        self.result_div.style.display='flex';
        self.result_number_div.innerHTML=result.toFixed(0);

    })
    this.calculate_value_at_risk=function (){
        let amount=parseFloat(this.position_amount_field.value);
        let volatility=parseFloat(this.asset_volatility_field.value)*0.01;
        let confidence=parseFloat(this.confidence_level_field.value)*0.01;
        let days=parseFloat(this.days_number_field.value);
        return amount*volatility*confidence*days;
    }

    function place_confidence_number(var_calculator){
        let x_coord_in_percent=get_x_coord();
        var_calculator.confidence_number_div.style.left=x_coord_in_percent+'%';
        var_calculator.confidence_number_div.style.transform=`translateY(-60%) translateX(-${x_coord_in_percent}%)`;
        var_calculator.confidence_number_div.innerHTML=parseFloat(var_calculator.confidence_level_field.value).toFixed(1);
        function get_x_coord(){
            let conf_number=var_calculator.confidence_level_field.value-var_calculator.min_confidence;
            return conf_number/(var_calculator.max_confidence-var_calculator.min_confidence)*100;
        }

    }
}