import { API_URL_TRANSACTIONS, API_URL_USERS } from "../helpers/config.js"
import { getJson } from "../helpers/helpers.js"

export const state = {
    user: {},
    transactions:[]

}

export const loadUser = async function(id){
    try {
        let req = await getJson(`${API_URL_USERS}${id}`)
        state.user = {
            id: req?.id,
            firstname: req?.first_name,
            lastname: req?.last_name,
            username: req?.username,
            email: req?.email,
            phone: req.profile?.phone_number
        }

        // LOAD TRANSACTIONS FOR USER
        await loadTransactions(id);
        
        console.log(state.transactions);

    } catch (error) {
        throw error;
    }
}


const loadTransactions = async function(id){
    try {
        const  req = await getJson(`${API_URL_TRANSACTIONS}`);
        state.transactions = req.filter(tran => tran.user === +id);
    } catch (error) {
        throw error;
    }
}