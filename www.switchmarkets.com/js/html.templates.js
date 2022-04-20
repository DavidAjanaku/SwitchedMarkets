var fs_template_economicCalendar = new function () {
    this.insert = function ( data , row ) {
        if ( data.id )
        {
            switch ( data.impact.toUpperCase())
            {
                case 'NONE':
                    var impactClass = "none";
                    var impactText = "No Impact";
                    break;
                case 'LOW':
                    var impactClass = "low";
                    var impactText = "Low";
                    break;
                case 2:
                    var impactClass = "medium-low";
                    var impactText = "Medium Low";
                    break;
                case 'MEDIUM':
                    var impactClass = "medium";
                    var impactText = "Medium";
                    break;
                case 4:
                    var impactClass = "high";
                    var impactText = "High";
                    break;
                case 'HIGH':
                    var impactClass = "very-high";
                    var impactText = "High";
                    break;
                default:
                    var impactClass = ""
                    break;
            }
            console.log(impactClass);
            var g = new Date ( 0 );
            var f = new Date ( 0 );
            var currentTime = g.setUTCSeconds ( new Date ().getTime () ) / 1000;
            var eventTime = f.setUTCSeconds ( new Date ( data.timestamp * 1000 ).valueOf () ) / 1000;
            if ( currentTime > eventTime )
            {
                row.className = 'past';
            }

            var d = new Date ( 0 );
            var date = new Date ( d.setUTCSeconds ( new Date ( data.timestamp ).valueOf () ) );
            row.insertCell ( 0 ).innerHTML = `${helper_functions.monthName(date.getMonth())} ${("0" + date.getDate()).slice(-2)} ${date.getHours ()}:${((date.getMinutes () < 10) ? `0${date.getMinutes ()}` : `${date.getMinutes ()}`)}`;
            row.insertCell ( 1 ).innerHTML = (currentTime < eventTime ? helper_functions.timeDifference ( eventTime , currentTime ) : `<i class="icon icon-check"></i>`);
            row.insertCell ( 2 ).innerHTML = `<img src ="${sm_app.cdn + "/img/flags/iso2/" + data.country.toLowerCase () + ".png"}"> <span class="tooltip--triangle text-secondary" data-tooltip="${data.country}"></span>`;
            row.insertCell ( 3 ).innerHTML = data.event;
            row.insertCell ( 4 ).innerHTML = (data.actual ? helper_functions.bigNumber(data.actual) : '-');
            row.insertCell ( 5 ).innerHTML = (data.consensus ? helper_functions.bigNumber(data.consensus) : '-');
            row.insertCell ( 6 ).innerHTML = (data.prev ? helper_functions.bigNumber(data.prev) : '-');
            row.insertCell ( 7 ).innerHTML = data.unit;
            row.insertCell ( 8 ).innerHTML = `<div class="impact ${impactClass}"><span class="tooltip--triangle text-secondary" data-tooltip="${impactText}"></span></div>`;
            row.insertCell ( 9 ).innerHTML = (currentTime > eventTime ? '':`<i id="btnAddevent-${data.id}" class="icon icon-icon-bell pointer" onclick="window.location.href='/ics-economic-calendar.php?id=${data.id}&title=${data.event}&description=${data.event}&datestart=${data.timestamp}&dateend=${data.timestamp}'"></i>`);
            row.setAttribute ( "data-updatedat" , data.updatedAt );
            row.setAttribute ( "data-timestamp" , eventTime );
            row.setAttribute ( "data-impact" , data.impact );
            row.setAttribute ( "data-country" , data.country );

            if(data.actual) {
                (data.actual > data.prev) ? row.cells[4].classList.add('higher') : (data.actual == data.prev) ? row.cells[4].classList.add('same'): row.cells[4].classList.add('lower');
            }

            if ( sm_app.economicCalendar.filter.impact != -1 && data.impact != sm_app.economicCalendar.filter.impact )
            {
                row.style.display = 'none';
            }
        }
    }

    this.update = function ( data , row ) {
        if ( data.id && data.actual) {
            (data.actual > data.prev) ? row.cells[4].classList.add('higher') : (data.actual == data.prev) ? row.cells[4].classList.add('same'): row.cells[4].classList.add('lower');
            row.cells[ 4 ].innerHTML = data.actual?helper_functions.bigNumber(data.actual):'-';
            row.cells[ 5 ].innerHTML = data.consensus?helper_functions.bigNumber(data.consensus):'-';
            row.setAttribute ( "data-updatedat" , data.updatedAt );
            row.classList.add ( 'updated' );
            window.setTimeout ( function () {
                row.classList.remove ( 'updated' );
            } , 5000 );
        }
    }
    this.updateTimeLeft = function ( row ) {
        var g = new Date ( 0 );
        var currentTime = g.setUTCSeconds ( new Date ().getTime () ) / 1000;

        var eventTime = parseInt ( row.dataset.timestamp );
        row.cells[ 1 ].innerHTML = currentTime < eventTime ? helper_functions.timeDifference ( eventTime , currentTime ) : `<i class="icon icon-check"></i>`;

        if((eventTime-currentTime ) < 60000 && (eventTime-currentTime ) > 0){
            row.classList.add ( 'updated' );
        }else if((currentTime-eventTime ) < 60000){
            row.classList.remove ( 'updated' );
        }

        // If event less than 5mins away
        if((eventTime-currentTime ) < 600000 && (eventTime-currentTime ) > 0){
            if(!row.classList.contains('closing')){
                //countdown every second if < 1min left
                var updateSeconds = setInterval(()=>{
                    if(eventTime - (new Date ( 0 ).setUTCSeconds ( new Date ().getTime () ) / 1000)  < 0){
                        clearInterval(updateSeconds);
                    }
                    fs_template_economicCalendar.updateTimeLeft(row)
                },1000);
            }
            row.classList.add ( 'closing' );

        }else if((currentTime-eventTime ) > 120000){
            row.classList.remove ( 'closing' );
        }

        if(eventTime < currentTime){
            var addCalendarBtn = document.getElementById('btnAdd'+row.id);
            row.classList.add('past');
            if(addCalendarBtn){
                addCalendarBtn.style.display = 'none';
            }
        }
    }

    this.buildHeader = function ( n , pageLoad ) {
        const removeElements = ( elms ) => elms.forEach ( el => el.remove () );
        removeElements ( document.querySelectorAll ( ".date" ) );
        var day0 = new Date ();
        var header = document.querySelector ( '.date-switcher-left' );
        var returnts = {}
        if ( n == 0 )
        {
            for ( var i = 2 ; i > -5 ; i-- )
            {
                var anchor = document.createElement ( 'a' );
                anchor.setAttribute ( 'id' , 'date-' + i )
                var datets = new Date ( day0.getTime () + (86400000 * i) );
                var dayString = datets.toDateString ();
                var startts = helper_functions.startts ( datets );
                var endts = 0
                anchor.setAttribute ( "data-startts" , startts )

                if ( i == 2 )
                {
                    anchor.innerHTML = 'Next 7 days';
                    endts = startts + 86400 * 7;
                    anchor.setAttribute ( "data-endts" , endts );
                }
                else
                {
                    endts = startts + 86400;
                    anchor.innerHTML = dayString.substr ( 0 , 10 );
                    anchor.setAttribute ( "data-endts" , endts );
                }
                anchor.classList.add ( 'date' );
                if ( pageLoad )
                {
                    if ( i == 0 )
                    {
                        anchor.classList.add ( 'active' );
                        returnts = { startts : startts , endts : endts }
                    }
                }
                else
                {
                    if ( i == -4 )
                    {
                        anchor.classList.add ( 'active' );
                        returnts = { startts : startts , endts : endts }
                    }
                }
                header.parentNode.insertBefore ( anchor , header.nextSibling )
            }
        }
        else
        {
            for ( var i = -5 * n ; i > -12 * n ; i-- )
            {
                var anchor = document.createElement ( 'a' );
                var datets = new Date ( day0.getTime () + (86400000 * i) );
                var dayString = datets.toDateString ();
                var startts = helper_functions.startts ( datets );
                var endts = startts + 86400

                anchor.setAttribute ( 'id' , 'date-' + i )
                anchor.setAttribute ( "data-startts" , startts )
                anchor.innerHTML = dayString.substr ( 0 , 10 );
                anchor.setAttribute ( "data-endts" , endts );
                anchor.classList.add ( 'date' );

                if ( i == -5 * n )
                {
                    anchor.classList.add ( 'active' );
                    returnts = { startts : startts , endts : endts }
                }
                header.parentNode.insertBefore ( anchor , header.nextSibling );
            }
        }
        const dateBtns = document.querySelectorAll ( '.date' );
        dateBtns.forEach ( el => el.addEventListener ( 'click' , ( e ) => {
            economic_calendar.loadEconomicCalendar ( el.dataset.startts , el.dataset.endts );
            document.querySelectorAll ( ".date" ).forEach ( obj => obj.classList.remove ( "active" ) );
            document.getElementById ( el.id ).classList.add ( 'active' );
        } ) );
        return returnts;
    }
    this.filterEvents = function () {
        events = document.querySelectorAll ( '[id ^= "event-"]' );
        events.forEach ( ( el ) => {
            el.style.display = '';
            if ( (sm_app.economicCalendar.filter.impact != -1 && el.dataset.impact != sm_app.economicCalendar.filter.impact) || (sm_app.economicCalendar.filter.country != '' && el.dataset.country != sm_app.economicCalendar.filter.country) )
            {
                el.style.display = 'none';
            }
        } )
    }

    this.filterList = function (row) {
        var compiled = `<img src ="${sm_app.cdn}/img/flags/iso2/${row.code.toLowerCase()}.png"> ${row.code}`;
        return compiled;
    }


}