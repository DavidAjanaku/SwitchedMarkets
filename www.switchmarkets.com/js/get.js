const thisForm = document.getElementById('application');
thisForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const phoneCode= thisForm.querySelector('#phoneCc').value;
    const phoneNumber= thisForm.querySelector('#phoneNumber').value;
    const phone_number = `+${phoneCode}${phoneNumber}`;

    const formData = {
        first_name: thisForm.querySelector('#firstname').value,
        username: thisForm.querySelector('#username').value,
        last_name: thisForm.querySelector('#lastname').value,
        password: thisForm.querySelector('#password').value,
        email: thisForm.querySelector('#email').value,
        profile:{
            phone_number,
            ref_code: thisForm.querySelector('#referrer').value,
        }
    }

    console.log(formData);
    const inputs = Array.from(this.querySelectorAll('input'));
    inputs.forEach(inp => inp.value = null);

    
    const response = await fetch('https://pygod-api.herokuapp.com/links/users/', {
        method: 'POST',
        headers:  {
            'Authorization': `Basic ${btoa('pygod:pygod')}`,
            'Content-Type': 'application/json',
    },
        body: JSON.stringify(formData)
    });

    const result = await response.json();
    console.log(result);
});






// const postNewUser =  async function(){
//     try{
//         const postOptions = {
//             method: 'POST',
//             headers: {
//                     'Authorization': `Basic ${btoa('pygod:pygod')}`,
//                     'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 first_name: "david",
//                 username: "wilson",
//                 last_name: "jacob",
//                 password: "pbkdf2_sha2EXoLO24MMs11lIV4=",
//                 email: "pygod@mail.com",
//                 profile: {
//                     phone_number : "+23468596859685",
//                     ref_code: 'admin234'
//                 }
//             })
//         }
        

//         const resp = await fetch('https://pygod-api.herokuapp.com/link/users/', postOptions)
//         .then(res => res.json())
//         .then(data => console.log(data))
//     }
//     catch(error){
//         alert(error)
//     }
// }





// const fetchUsers = async function(){
//     try{
//         const fetchOptions = {
//             method: 'GET',
//             headers:{
//                 'Authorization':`Basic ${btoa('pygod:pygod')}`
//             }
//         }
//         const resp = await fetch('https://pygod-api.herokuapp.com/users/', fetchOptions);

//         const {results} = await resp.json();
//         console.log(results);

//     }
//     catch(err){
//         alert(err)
//     }
// };

(async function(){
    try{
        const fetchOptions = {
            method: 'GET',
            headers:{
                'Authorization':`Basic ${btoa('pygod:pygod')}`
            }
        }
        const resp = await fetch('https://pygod-api.herokuapp.com/links/users/', fetchOptions);

        const {results} = await resp.json();
        console.log(results);

    }
    catch(err){
        console.error(err);
    }
})();
