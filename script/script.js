const timerApp ={};
// Caching variables
timerApp.form = $('form');
timerApp.startButton = $('.button');
timerApp.display = $('.display');
timerApp.userInputs = [$('#years'), $('#days'), $('#hours'), $('#minutes'), $('#seconds')];

// Array of conversion factors
timerApp.conversionFactors = [365 * 24 * 60 * 60, 24 * 60 *60, 60 * 60, 60, 1];
// Empty array to store processed time values
timerApp.timeValues = [];
// myTimer variable and boolean value timerOn to switch on/off the countdown timer
timerApp.myTimer;
timerApp.timerOn = true;

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
    let totalTimeInSeconds = timerApp.findTotalTimeInSeconds(inputValues) + 1;
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
// Recursions are used in place of looping. The purpose is to keep counting down until the timer reads zeros across the board.
timerApp.countdownMain = function(years, days, hours, minutes, seconds) {
    // first decrease the number of seconds by 1 every time the function is called
    seconds--;
    // if the number of seconds is greater than zero, recursively call countdownMain function every 1 second which decreases the number of seconds by 1 every time it is called.
    if (seconds >= 0) {
        // display the new time on the screen
        timerApp.displayTimeValues([years, days, hours, minutes, seconds]);
        timerApp.myTimer = setTimeout(timerApp.countdownMain, 1000, years, days, hours, minutes, seconds);  
    } else if (timerApp.checkTime([minutes, hours, days, years])) {
        // if the number of seconds dips below 0, reset it to 60
        seconds = 60;
        // then decrease the number of minutes following the steps defined by the helper countdown function
        minutes = timerApp.countdown(minutes, 59);
        if (minutes === 59 && timerApp.checkTime([hours, days, years])) {
            // if the number of minutes is reset to 59 and one of the larger time unit is non-zero, decrease the number of hours
            hours = timerApp.countdown(hours, 23);
            if (hours === 23 && timerApp.checkTime([days, years])) {
                // if the number of hours is reset to 23 and one of the larger time unit is non-zero, decrease the number of days
                days = timerApp.countdown(days, 364);
                if (days === 364 && years > 0) {
                    // if the number of days is reset to 364 and the number of years is non-zero, decrease the number of years but do not reset it
                    years--;
                }
            }
        }
        // Recursive call to countdownMain function to continue counting down
        timerApp.countdownMain(years, days, hours, minutes, seconds);
    } else {
        return true;
    }
}
// helper function checkTime(timeValues) checks if any of the input time values is greater than zero
timerApp.checkTime = function(timeValues) {
    let nonZeroValues = false;
    timeValues.forEach( (value) => nonZeroValues = (nonZeroValues || (value > 0)) );
    return nonZeroValues;
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

// Main function to display the time values on screen
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
// Helper function to convert numerical value array into an array of string values for display
timerApp.toString = function(numericalValue) {
    if (numericalValue < 10) { 
        return '0' + numericalValue; 
    } else { 
        return '' + numericalValue;
    }
}
// Helper function to check for singular/plural noun form for simple cases
timerApp.checkPlural = function(value, noun) {
    if (value === '01') { return noun; }
    return noun + 's';
}
// Helper function to display Year and Day values as these are displayed differently from the rest
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

// Function to control button clicks and the sequence of events that follow
timerApp.handleButton = function() {
    timerApp.startButton.on('click', () => {
        timerApp.startButton.toggleClass('cancel');
        timerApp.display.toggleClass('hidden');
        timerApp.timeValues = timerApp.convertUnits(timerApp.getInputValues());
        timerApp.resetInputValues();
        timerApp.displayTimeValues(timerApp.timeValues);
        if (timerApp.timerOn) {
            timerApp.startTimer(timerApp.timeValues);
        } else {
            clearTimeout(timerApp.myTimer);
        }
        timerApp.timerOn = !timerApp.timerOn;
    });
}

timerApp.handleForm = function() {
    timerApp.form.on('keyup', (e) => {
        if (e.keyCode === 13) {
            timerApp.startButton.toggleClass('cancel');
            timerApp.display.toggleClass('hidden');
            timerApp.timeValues = timerApp.convertUnits(timerApp.getInputValues());
            timerApp.resetInputValues();
            timerApp.displayTimeValues(timerApp.timeValues);
            if (timerApp.timerOn) {
                timerApp.startTimer(timerApp.timeValues);
            } else {
                clearTimeout(timerApp.myTimer);
            }
            timerApp.timerOn = !timerApp.timerOn;
        }
    });
}
 
timerApp.emojis = ['127809','127810','127809','127810','127811'];
timerApp.animationCanvas = $('.endingAnimations');
timerApp.viewportHeight = $(window).height();
timerApp.viewportWidth = $(window).width();
timerApp.playExplosion = function(numberOfEmojis) {
    let emoji = timerApp.emojis[timerApp.randomNumberGenerator(0, timerApp.emojis.length)];
    let positionTop = timerApp.randomNumberGenerator(-100, 200);
    let positionLeft = timerApp.randomNumberGenerator(-100, 200);
    let fontSize = timerApp.randomNumberGenerator(10, 100);
    let animationDuration = timerApp.randomNumberGenerator(1000, 2000);
    timerApp.animationCanvas.append(`<div class="emojiContainer number${numberOfEmojis}">&#${emoji}</div>`);
    let numberedEmoji = $(`.number${numberOfEmojis}`);
    numberedEmoji.animate({
        'left': `${positionLeft}vw`,
        'top': `${positionTop}vh`,
        'opacity': '0.5',
        'font-size': `${fontSize}px`
    }, animationDuration);
    setTimeout(() => timerApp.terminateAnimation(numberedEmoji), animationDuration);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        timerApp.playExplosion(numberOfEmojis);
    }
}
timerApp.terminateAnimation = function(numberedEmoji) {
    numberedEmoji.remove();
}
timerApp.randomNumberGenerator = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


$(document).ready(function() {
    timerApp.handleButton();
    timerApp.handleForm();
    timerApp.playExplosion(15);
})

// Work in progress
// I am trying to replace the nested if statements in the countdownMain function with recursion
timerApp.test = {};
timerApp.test.countdownMain = function(convertedValues) {
    // Create a copy of the convertedValues to protect the input; only updated timeValues will be displayed
    let timeValues = convertedValues;
    // display time on the screen
    timerApp.displayTimeValues(timeValues);
    // Then decrease the number of seconds by 1 every time the function is called
    timeValues[4]--;
    // if the number of seconds is greater than zero, recursively call countdownMain function every 1 second which decreases the number of seconds by 1 every time it is called.
    if (timeValues[4] >= 0) {
        timerApp.myTimer = setTimeout(timerApp.countdownMain, 1000, timeValues);  
    } else if (timerApp.checkTime(timeValues)) {
        // then update the other time values
        timeValues = timerApp.updateTime(2, timeValues);
        // if the number of seconds dips below 0 AND there is a non-zero value for one of the higher time values, reset number of seconds to 59
        timeValues[4] = 59;
        // Recursive call to countdownMain function to continue counting down seconds
        timerApp.countdownMain(timeValues);
    }
}
timerApp.test.checkTime = function(timeValues) {
    let nonZeroValues = false;
    timeValues.slice(0, timeValues.length - 1).forEach( (value) => nonZeroValues = (nonZeroValues || (value > 0)) );
    return nonZeroValues;
}
timerApp.test.updateTime = function(index, timeValues) {
    let maxValues = [364, 23, 59];
    let length = timeValues.length;
    timeValues[length - 2] = timerApp.countdown(timeValues[length - 2], maxValues[index]);
    let nextArray = timeValues.slice(0, length - 1);
    if ((timeValues[length - 2] === maxValues[index]) && timerApp.checkTime(nextArray)) {
        index--;
        if (index >= 0) {
            console.log(index)
            timerApp.updateTime(index, nextArray);
        } else { 
            timeValues[0]--; 
        }
    }
    return timeValues;
}