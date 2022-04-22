import View from "./View.js";

class transactionView extends View{
    _parentEl = document.querySelector('.transactions');

    _generateMarkup(){
        return this._data.map(this._generateMarkupPreview).join('');
    }

    _generateMarkupPreview(data){
        return `
            <tr>
                <td>#${data.tid}</td>
                <td>
                    ${
                        Intl.DateTimeFormat('en-GB',{
                            month: 'long',
                            day:'2-digit',
                            year:'numeric'
                        }).format(new Date(data.time))
                        
                    }
                </td>
                <td>${data.type}</td>
                <td>${data.amount}</td>
                <td>${data.status}</td>
                <td>${data.amount}</td>
            </tr>
        `;
    }
}

export default new transactionView();