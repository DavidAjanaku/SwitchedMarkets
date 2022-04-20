var helper_functions = new function () {
    this.monthName = function (monthId) {
        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return month[monthId];
    }
    this.timeAgo = function (inputTimestamp) {
        let now = new Date();
        let diff = (new Date().getTime() / 1000) - inputTimestamp;
        let timestamp = new Date(inputTimestamp * 1000);
        let time = "";
        let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


        if (diff < 86400 && timestamp.getDay() == now.getDay()) {
            time = (timestamp.getHours() >= 10 ? timestamp.getHours() : '0' + timestamp.getHours()) + ':' + (timestamp.getMinutes() >= 10 ? timestamp.getMinutes() : '0' + timestamp.getMinutes())
        } else if (diff < 86400) {
            time = "yesterday";
        } else if (diff < 604800) {
            time = Math.round(diff / 86400)+"d ago";
        } else {
            time = timestamp.getDate()+" "+month[timestamp.getMonth()];
        }
        return time;
    }
    this.flag = function (cc) {

        if(cc =='ERL'){
           return  "&#127466&#127482";
        }

        // Mild sanity check.
        if (cc.length !== 2)
            return cc;

        // Convert char to Regional Indicator Symbol Letter
        function risl(chr) {
            return String.fromCodePoint(0x1F1E6 - 65 + chr.toUpperCase().charCodeAt(0));
        }

        // Create RISL sequence from country code.
        return risl(cc[0]) + risl(cc[1]);
    }

    this.startts = function (date) {
        date.setHours(0,0,0,0)
        return new Date(0).setUTCSeconds(new Date(`${date.toISOString()}`).valueOf()/1000)/1000
    }

    this.endts = function (date) {
        date.setHours(23,59,59,999)
        return new Date(0).setUTCSeconds(new Date(`${date.toISOString()}`).valueOf()/1000)/1000
    }

    this.setAttributes = function(el) {
        for (var i = 1; i < arguments.length; i+=2) {
            el.setAttribute(arguments[i], arguments[i+1]);
        }
    }

    this.timeDifference = function(date1ts,date2ts) {

        var result = "";
        var date1 = new Date(date1ts);
        var date2 = new Date(date2ts);
        var difference = date1.getTime() - date2.getTime();

        var daysDifference = Math.floor(difference/1000/60/60/24);
        difference -= daysDifference*1000*60*60*24

        var hoursDifference = Math.floor(difference/1000/60/60);
        difference -= hoursDifference*1000*60*60

        var minutesDifference = Math.floor(difference/1000/60);
        var secondsDifference = Math.floor(difference/1000);
        if(daysDifference > 1)
            result = daysDifference+" days"
        else if(daysDifference == 1)
            result = daysDifference+" day"
        else {
            if(hoursDifference >= 1){
                result = hoursDifference+"h " + (minutesDifference <10 ? "0"+minutesDifference:minutesDifference)+"min";
            }else
            {
                result = (minutesDifference < 1 ? secondsDifference + "sec" : minutesDifference+"min");
            }

        }
        return result;
    }
    this.bigNumber = function (labelValue) {

            // Nine Zeroes for Billions
            return Math.abs(Number(labelValue)) >= 1.0e+9

                ? (Number(labelValue) / 1.0e+9).toString().substr(0,7) + "B"
                // Six Zeroes for Millions
                : Math.abs(Number(labelValue)) >= 1.0e+6

                    ? (Number(labelValue) / 1.0e+6).toString().substr(0,7) + "M"
                    // Three Zeroes for Thousands
                    : Math.abs(Number(labelValue)) >= 1.0e+3

                        ? (Number(labelValue) / 1.0e+3).toString().substr(0,7) + "K"

                        : Number(labelValue).toString().substr(0,7);
    }


}