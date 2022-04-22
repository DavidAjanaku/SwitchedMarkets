import View from "./View.js";

class DashLoader extends View{
    _parentEl = document.querySelector('.page-title-content');
    
    _generateMarkup(){
        return `
            <p>
                Welcome Back,
                <span> ${this._data.firstname} ${this._data.lastname}</span>
            </p>
        `;
    }


}

export default new DashLoader();
