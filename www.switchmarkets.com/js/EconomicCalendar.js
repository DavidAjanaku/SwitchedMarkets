function EconomicCalendar(calendar_socket) {

    this.socket = calendar_socket;
    this.lastConnected = new Date();
    let self=this;

    if((new Date().getTime()-this.lastConnected.getTime())/60000 > 15){
        this.loadEconomicCalendar(sm_app.economicCalendar.startts,sm_app.economicCalendar.endts,1);
    }



    this.joinEconomicCalendar = () => {
        var tableRef = document.querySelector('#calendarBody');
        var date = new Date();
        sm_app.economicCalendar.startts =  helper_functions.startts(date);
        sm_app.economicCalendar.endts =  helper_functions.endts(date);

        setTimeout ( () => {
            self.socket.emit ( 'joinEconomicCalendar' );
        } , 500 );

        setTimeout(()=>{
            self.socket.emit ( 'economicCalendar',sm_app.economicCalendar.startts,sm_app.economicCalendar.endts,1000,(data)=>{
                while (tableRef.hasChildNodes()) {
                    tableRef.removeChild(tableRef.lastChild);
                }
                for (var i = 0; i < data.length; i++) {
                    if(!document.getElementById("event-"+data[i].id)){
                        var row = tableRef.insertRow(0);
                        row.id="event-" + data[i].id;
                        fs_template_economicCalendar.insert(data[i],row);
                    }
                    sm_app.economicCalendar.tableHeight = tableRef.offsetHeight;
                }
            } );
        },500)
        setTimeout(()=>{
            var filterCountries = document.querySelector(".filter-countries");
            self.socket.emit ( 'economicCalendarCountries', (data)=>{
                for (var i = 0; i < data.length; i++) {
                    if(!document.getElementById("filter-"+data[i].code)){
                        var html = fs_template_economicCalendar.filterList(data[i]);
                        var newElement = document.createElement('li');
                        newElement.id = "filter-" + data[i].code;
                        newElement.classList.add("filter-country","pointer");
                        newElement.setAttribute ( "data-country" , data[i].code );
                        newElement.innerHTML = html;
                        filterCountries.appendChild(newElement);
                    }
                }
                const btnFilterCountry = document.querySelectorAll ( '.filter-country' );
                btnFilterCountry.forEach ( el => el.addEventListener ( 'click' , ( e ) => {
                    sm_app.economicCalendar.filter.country = el.dataset.country;
                    fs_template_economicCalendar.filterEvents();
                } ) );
            } );
        },500)
    }

    this.loadEconomicCalendar = (startts,endts,update) =>{
        sm_app.economicCalendar.startts = startts;
        sm_app.economicCalendar.endts = endts;
        var tableRef = document.querySelector('#calendarBody');
        self.socket.emit ( 'economicCalendar',startts,endts,1000,(data)=>{
            if(!update){
                while (tableRef.hasChildNodes()) {
                    tableRef.removeChild(tableRef.lastChild);
                }
            }
            if(data.length == 0){
                var row = tableRef.insertRow(0);
                var cell = row.insertCell(0);
                cell.innerHTML = 'No events for this date';
                cell.colSpan = 10;
                cell.style.width = "100%";
            }else{
                for (var i = 0; i < data.length; i++) {
                    if(!document.getElementById("event-"+data[i].id)){
                        var row = tableRef.insertRow(0);
                        row.id="event-" + data[i].id;
                        fs_template_economicCalendar.insert(data[i],row);
                    }else{
                        if(document.getElementById("event-"+data[i].id).dataset.updatedat < data[i].updatedAt){
                            fs_template_economicCalendar.update(data[i],document.getElementById("event-"+data[i].id));
                        }
                    }
                }
            }
            fs_template_economicCalendar.filterEvents();
        } );
    }
}
