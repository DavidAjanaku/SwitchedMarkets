'use strict';
const form = document.querySelector('.form__form');
console.log(form);
form.addEventListener('submit', async function(e){
    e.preventDefault();

    
    try {
        const formData = {
            Email_Address: document.querySelector('#email').value,
            password: document.querySelector('#password').value
        }

        const inputs = Array.from(this.querySelectorAll('input'));
        inputs.forEach(inp => inp.value = null);

        const response = await fetch('https://pygod-api.herokuapp.com/login/', {
            method: 'POST',
            headers:  {
                'Authorization': `Basic ${btoa('pygod:pygod')}`,
                'Content-Type': 'application/json',
        },
            body: JSON.stringify(formData)
        });
    
        const result = await response.json();
        console.log(result);
        const userID = result.data.user;

        if(!userID) throw new Error("Invalid cridentials");

       redirectPage(`/www.switchmarkets.com/dashboard/account-overview.html#${userID}`);


        
    } catch (error) {
        console.error(error);
    }

})

const redirectPage = function(pathName){
    const {origin} = window.location;
   window.location.replace(`${origin}/${pathName}`)
}

