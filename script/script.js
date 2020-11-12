const timerApp ={};
timerApp.form = $('form');
timerApp.startButton = $('.button');
timerApp.display = $('.display');
timerApp.userInputs = [$('#years'), $('#days'), $('#hours'), $('#minutes'), $('#seconds')];
timerApp.conversionFactors = [365 * 24 * 60 * 60, 24 * 60 *60, 60 * 60, 60, 1];
timerApp.timeValues = [];
timerApp.myTimer;
timerApp.toggleInterval = true;

// General purpose functions to get and reset user input fields
timerApp.getInputValues = function() {
    return timerApp.userInputs.map( (input) => input.val() );
}
timerApp.resetInputValues = function() {
    timerApp.form.toggleClass('hidden');
    timerApp.userInputs.map( (input) => input.val('') );
}

// Main function - convertUnits(inputValues) - to process raw input data into standard format
// Helper functions - findTotalTimeInSeconds(inputValues) and conversionCalculator(totalTimeInSeconds, factor) - to help main function convert raw input data
timerApp.convertUnits = function(inputValues) {
    let totalTimeInSeconds = timerApp.findTotalTimeInSeconds(inputValues);
    let convertedValues = inputValues.map( (value, index) => {
        // each time value starting from number of years is calculated by finding the quotient of the total time in seconds divided by the corresponding conversion factor
        // Math formula: ( numerator (i.e. total) - remainder ) / divisor (i.e. conversion factor) = quotient (i.e required value)
        value = timerApp.conversionCalculator(totalTimeInSeconds, timerApp.conversionFactors[index]);
        // the value of the next largest time unit is calculated by finding the remaining total time in seconds. Then apply the same conversion calculation as above to the reduced total time in seconds.
        totalTimeInSeconds -= value * timerApp.conversionFactors[index];
        // return each converted value to the convertedValues array
        return value;
    });
    return convertedValues;
}
timerApp.findTotalTimeInSeconds = function(inputValues) {
    let totalTimeInSeconds = 0;
    inputValues.forEach( (value, index) => {
        // total time in seconds is calculated by adding each input value with corresponding conversion factor (e.g. 1 hour = 60 * 60 seconds, etc...)
        totalTimeInSeconds += value * timerApp.conversionFactors[index];
    });
    return totalTimeInSeconds;
}
timerApp.conversionCalculator = function(totalTimeInSeconds, factor) {
    // return formula to be used in the main convertUnits(inputValues) function
    // Math formula: quotient (i.e required value) = ( numerator (i.e. total) - remainder ) / divisor (i.e. conversion factor)
    return (totalTimeInSeconds - totalTimeInSeconds % factor) / factor;
} 

// Functions to handle counting down
// startTimer function applies the convertedValues array to the countdownMain function
timerApp.startTimer = function(convertedValues) {
    timerApp.countdownMain.apply(null, convertedValues);
}
// countdownMain function handles the mechanics of counting down starting from seconds, then minutes, then hours, and so on.
// Recursions are used in place of looping in order to keep counting down until the timer reads zeros across the board.
timerApp.countdownMain = function(years, days, hours, minutes, seconds) {
    // First decrease the number of seconds by 1 every time the function is called
    seconds--;
    // if the number of seconds is greater than zero, recursively call countdownMain function every 1 second which decreases the number of seconds by 1 every time it is called.
    if (seconds >= 0) {
        // display the new time on the screen
        timerApp.displayTimeValues([years, days, hours, minutes, seconds]);
        // Recursive call to countdownMain function; also bind setTimeout() method to myTimer so it can be cleared (toggled) when the cancel button is clicked.
        timerApp.myTimer = setTimeout(timerApp.countdownMain, 1000, years, days, hours, minutes, seconds);  
    } else if (minutes > 0 || hours > 0 || days > 0 || years > 0) {
        // if the number of seconds dips below 0, reset it to 60
        seconds = 60;
        // then decrease the number of minutes following the steps defined by the helper countdown function
        minutes = timerApp.countdown(minutes, 59);
        if (minutes === 59 && (hours > 0 || days > 0 || years > 0)) {
            // if the number of minutes is reset to 59 and one of the larger time unit is non-zero, decrease the number of hours
            hours = timerApp.countdown(hours, 23);
            if (hours === 23 && (days > 0 || years > 0)) {
                // if the number of hours is reset to 23 and one of the larger time unit is non-zero, decrease the number of days
                days = timerApp.countdown(days, 364);
                if (days === 364 && years > 0) {
                    // if the number of days is reset to 364 and the number of years is non-zero, decrease the number of years but do not reset it
                    years--;
                }
            }
        }
        // Recursive call to countdownMain function with the number of seconds reset to 60
        timerApp.countdownMain(years, days, hours, minutes, seconds);
    }
}
// helper countdown function provides the template to be used in the countdownMain function
timerApp.countdown = function(timeValue, maxValue) {
    // take the input timeValue (minutes, hours, etc...) and decrease it by 1
    timeValue--;
    // if the timeValue is lower than 0 after depreciation, reset it to maxValue
    if (timeValue < 0) {
        timeValue = maxValue;
    }
    // return the new timeValue
    return timeValue;
}


timerApp.displayTimeValues = function(convertedValues) {
    let stringValues = convertedValues.map(timerApp.toString);
    timerApp.display.html('');
    timerApp.displayYearAndDay.apply(null, stringValues.slice(0, 2));
    stringValues.forEach( (value, index) => {
        if (index > 1 && index < 4) {
            timerApp.display.append(`<span>${value}:</span>`);
        }
        if (index === 4) {
            timerApp.display.append(`<span>${value}</span>`);
        }
    });
}
timerApp.toString = function(numericalValue) {
    if (numericalValue < 10) { 
        return '0' + numericalValue; 
    } else { 
        return '' + numericalValue;
    }
}
timerApp.checkPlural = function(value, noun) {
    if (value === '01') { return noun; }
    return noun + 's';
}
timerApp.displayYearAndDay = function(yearValue, dayValue) {
    let yearNoun = timerApp.checkPlural(yearValue, 'year');
    let dayNoun = timerApp.checkPlural(dayValue, 'day');;
    if (yearValue !== '00') { 
        timerApp.display.append(`<div class="year"><span>${yearValue}</span><span>${yearNoun}</span></div>`); 
        timerApp.display.append(`<div class="day"><span>${dayValue}</span><span>${dayNoun}</span></div>`); 
    } else if (dayValue !== '00') {
        if ($('.year')) { $('.year').remove(); }
        timerApp.display.append(`<div class="day"><span>${dayValue}</span><span>${dayNoun}</span></div>`);
    } else if ($('.day')) { 
        $('.day').remove(); 
    }
}


timerApp.handleButton = function() {
    timerApp.startButton.on('click', () => {
        timerApp.startButton.toggleClass('cancel');
        timerApp.display.toggleClass('hidden');
        timerApp.timeValues = timerApp.convertUnits(timerApp.getInputValues());
        timerApp.resetInputValues();
        timerApp.displayTimeValues(timerApp.timeValues);
        timerApp.toggleInterval = !timerApp.toggleInterval;
        if (!timerApp.toggleInterval) {
            timerApp.startTimer(timerApp.timeValues);
        } else { 
            console.log('cleared');
            clearTimeout(timerApp.myTimer);
        }
    });
}

timerApp.emojis = ['😀','😁','😎','😍','😋'];
timerApp.animationCanvas = $('.endingAnimations');
timerApp.playExplosion = function() {

}


$(document).ready(function() {
    timerApp.handleButton();
})