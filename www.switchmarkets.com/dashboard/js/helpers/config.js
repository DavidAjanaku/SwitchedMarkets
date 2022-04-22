export const TIME_OUT_SEC = 15;
export const API_URL_USERS = 'https://pygod-api.herokuapp.com/links/users/';
export const API_URL_TRANSACTIONS = 'https://pygod-api.herokuapp.com/transactions/';
export const GET_AUTHENTICATION_CONFIG = {
    method: 'GET',
    headers:{
        'Authorization':`Basic ${btoa('pygod:pygod')}`
    }
}