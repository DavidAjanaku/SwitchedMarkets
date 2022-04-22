import dashLoader from "../views/dashLoaderView.js";
import linkMenu from "../views/linkMenuView.js";
import profileCard from "../views/profileCardView.js";
import * as model from '../models/model.js';
import transactionView from "../views/transactionView.js";




const controlLoadEntireView = async function(){
    try {
        const userID = window.location.hash.slice(1);
        if(!userID || userID == "") throw new Error("ID is null");
        await model.loadUser(userID);

        Array.from([
            dashLoader,
            linkMenu,
            profileCard
        ]).forEach(view => view.render(model.state.user));

        transactionView.render(model.state.transactions);
        

          
      } catch (error) {
          console.error(error);
      }
    
}

Array.from(['load','hashchange']).forEach(evt => window.addEventListener(evt,controlLoadEntireView ))



