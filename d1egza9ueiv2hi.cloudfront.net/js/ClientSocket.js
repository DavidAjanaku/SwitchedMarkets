function ClientSocket(socket_url,connect_event_name){
    this.socket_url=socket_url;
    let self=this;

    var socket_load = setInterval(() => {
        if (typeof (io) === 'function') {
            clearInterval(socket_load);
            this.connect();
        }
    }, 250)

    this.connect = () => {
        if (this.socket_url.length > 0) {
            this.socket = io.connect(this.socket_url);
            this.initLoad = false;

            this.socket.on('connect', () => {
                console.log(connect_event_name);

                document.dispatchEvent(new CustomEvent(connect_event_name));
            });

            this.socket.on('price', (data) => {
                // Pass this data to the pair function and let it handle it.
                if (typeof (sm_price) === 'object') {
                    sm_price.update(data);
                } else {
                    console.error("sm_price function does not exist");
                }
            });

            this.socket.on ( 'liveQuote' ,  ( quote ) =>{
                heat_map.process_raw_quote(quote);
            });

            this.socket.on ( 'economicData' ,  ( data ) =>{
                var tableRef = document.querySelector('#calendarBody');
                //Check if we're on the date that the update came
                if(data.timestamp > sm_app.economicCalendar.startts && data.timestamp < sm_app.economicCalendar.endts){
                    if(!document.getElementById("event-"+data.id)){
                        var row = tableRef.insertRow(0);
                        row.id="event-" + data.id;
                        fs_template_economicCalendar.insert(data,row);
                    }else{
                        if(document.getElementById("event-"+data.id).dataset.updatedat < data.updatedAt){
                            fs_template_economicCalendar.update(data,document.getElementById("event-"+data.id));
                        }
                    }
                }
            } );

            this.socket.on ( 'connect_error' , function (err) {
                // Unable to connect...
                console.log ( err );
            } );


        }
        this.getChartData = function (params){
            return new Promise((resolv)=> {
                this.socket.emit('requestHistory', params, (history) => {
                    resolv(history);
                })
            })
        }
    }


}