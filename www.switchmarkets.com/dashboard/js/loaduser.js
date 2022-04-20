'use strict';
['load','hashchange'].forEach(evt => window.addEventListener(evt, async function(){
    try {
      const userID = window.location.hash.slice(1);
      if(!userID || userID == "") throw new Error("ID is null");
        const fetchOptions = {
            method: 'GET',
            headers:{
                'Authorization':`Basic ${btoa('pygod:pygod')}`
            }
        }
        const resp = await fetch(`https://pygod-api.herokuapp.com/links/users/${userID}`, fetchOptions);

        const userData = await resp.json();
        if(userData?.detail) throw new Error("User with id "+userData.detail);
        console.log(userData);
        new DashLoader().render(userData);   
        new ProfileCard().render(userData);   
    } catch (error) {
        console.error(error);
    }
  
  }))


  class View{
    _data = {};
    render(data){
        this._data = data;
        this._parentEl.innerHTML = null;
        this._parentEl.innerHTML = this._generateMarkup();
    }
  }


class DashLoader extends View{
    _parentEl = document.querySelector('.page-title-content');
    
    _generateMarkup(){
        return `
        <p>
            Welcome Back,
            <span> ${this._data.first_name} ${this._data.last_name}</span>
        </p>
        `;
    }


}

class ProfileCard extends View{
    _parentEl = document.querySelector('.profile_card');

    _generateMarkup(){
        return `
            <div class="card-body">
                <div class="d-flex">
                    <img class="me-3 rounded-circle me-0 me-sm-3" src="images/profile/2.png" width="60"
                        height="60" alt="">
                    <div class="flex-grow-1">
                        <span>Hello</span>
                        <h4 class="mb-2"> ${this._data.first_name} ${this._data.last_name}</h4>
                        <p class="mb-1"> <span><i class="fa fa-phone me-2 text-primary"></i></span>${this._data.profile.phone_number}</p>
                        <p class="mb-1"> <span><i class="fa fa-envelope me-2 text-primary"></i></span>
                            <a href="https://demo.quixlab.com/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="d6beb3babab996b3aeb7bba6bab3f8b5b9bb">[email&#160;protected]</a>
                        </p>
                    </div>
                </div>

                <ul class="card-profile__info">
                    <li>
                        <h5 class="me-4">Address</h5>
                        <span class="text-muted">House 14, Road 9, Gulshan, Dhaka</span>
                    </li>
                    <li class="mb-1">
                        <h5 class="me-4">Total Log</h5>
                        <span>103 Time (Today 5 Times)</span>
                    </li>
                    <li>
                        <h5 class="text-danger me-4">Last Log</h5>
                        <span class="text-danger">3 February,
                            <script data-cfasync="false" src="../cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script>
                                var CurrentYear = new Date().getFullYear()
                                document.write(CurrentYear)
                            </script> , 10:00 PM
                        </span>
                    </li>
                </ul>
                <div class="social-icons">
                    <a class="facebook text-center" href="javascript:void(0)"><span><i
                                class="fa fa-facebook"></i></span></a>
                    <a class="twitter text-center" href="javascript:void(0)"><span><i
                                class="fa fa-twitter"></i></span></a>
                    <a class="youtube text-center" href="javascript:void(0)"><span><i
                                class="fa fa-youtube"></i></span></a>
                    <a class="googlePlus text-center" href="javascript:void(0)"><span><i
                                class="fa fa-google"></i></span></a>
                </div>
            </div>        
        `;
    }
}