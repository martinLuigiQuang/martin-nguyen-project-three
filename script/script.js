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

timerApp.getInputValues = function(userInputs) {
    return userInputs.map( (input) => input.val() );
}
timerApp.resetInputValues = function(form, userInputs) {
    form.toggleClass('hidden');
    userInputs.map( (input) => input.val('') );
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
    totalTimeInSeconds = timerApp.checkTotal(totalTimeInSeconds);
    return totalTimeInSeconds;
}
timerApp.checkTotal = function(rawTotal) {
    if (rawTotal > Number.MAX_SAFE_INTEGER) {
        rawTotal = Number.MAX_SAFE_INTEGER;
    }
    return rawTotal;
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
    timerApp.countdownAnimation(years, days, hours, minutes, seconds);
    // if the number of seconds is greater than zero, recursively call countdownMain function every 1 second which decreases the number of seconds by 1 every time it is called.
    if (seconds >= 0) {
        // display the new time on the screen
        timerApp.displayTimeValues([years, days, hours, minutes, seconds]);
        if (seconds > 0) {
            timerApp.myTimer = setTimeout(timerApp.countdownMain, 1000, years, days, hours, minutes, seconds);  
        } else {
            timerApp.countdownMain(years, days, hours, minutes, seconds);
        }
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
        timerApp.startAnimation(timerApp.randomNumberGenerator(1,100), timerApp.animationCanvas);
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
timerApp.countdownAnimation = function(years, days, hours, minutes, seconds) {
    if (seconds <= 10 && !timerApp.checkTime([minutes, hours, days, years])) {
        timerApp.animationCanvas.removeClass('hidden');
        timerApp.explosion(1);
    }
}

// Main function to display the time values on screen
timerApp.displayTimeValues = function(convertedValues) {
    let stringValues = convertedValues.map(timerApp.toString);
    let timeUnits = ['year', 'day', 'hour', 'minute', 'second'];
    timerApp.display.html('');
    stringValues.forEach( (value, index) => {
        timerApp.show(timerApp.display, timeUnits[index], value, index); 
    });
}
// Helper function to convert numerical value array into an array of string values for display
timerApp.toString = function(numericalValue) {
    if (numericalValue < 10) { 
        return '0' + numericalValue; 
    } else if (numericalValue > 999) {
        return '999'; 
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
timerApp.show = function(display, timeUnit, value, index) {
    display.append(`
        <span id="${timeUnit}1">${value.charAt(0)}</span>
        <span id="${timeUnit}2">${value.charAt(1)}</span>
    `);
    if (index < 4) { display.append(`<span id="${timeUnit}Colon">:</span>`) }
    if (value.length === 3) {
        display.append(`<span id="${timeUnit}3">${value.charAt(2)}</span>`);
        $(`#${timeUnit}3`).insertBefore(`#${timeUnit}Colon`);
    }
    return display;
}

timerApp.buttonControl = function(button) {
    button.toggleClass('cancel');
    if (button.hasClass('cancel')) {
        button.html('<h3>cancel</h3>');
    } else {
        button.html('<h3>start</h3>');
    }
}
timerApp.startSequence = function() {
    timerApp.buttonControl(timerApp.startButton);
    timerApp.display.toggleClass('hidden');
    timerApp.timeValues = timerApp.convertUnits(timerApp.getInputValues(timerApp.userInputs));
    timerApp.resetInputValues(timerApp.form, timerApp.userInputs);
    timerApp.displayTimeValues(timerApp.timeValues);
    if (timerApp.timerOn) {
        timerApp.startTimer(timerApp.timeValues);
    } else {
        clearTimeout(timerApp.myTimer);
    }
    timerApp.timerOn = !timerApp.timerOn;
    
}


timerApp.emojis = ['127809','127810','127809','127810','127811'];
timerApp.animationCanvas = $('.endingAnimations');
timerApp.startAnimation = function(randomNumber, canvas) {
    canvas.removeClass('hidden');
    if (randomNumber > 50) {
        isFinished = timerApp.explosion(50);
    } else {
        isFinished = timerApp.fountain(100);
    }
}
timerApp.stopAnimation = function(canvas) {
    canvas.on('click', () => {
        canvas.addClass('hidden');
    });
}
timerApp.explosion = function(numberOfEmojis) {
    let prep = timerApp.prepareAnimation(numberOfEmojis, [-100, 200], [-100, 200], [50, 100], 0.2);
    timerApp.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        timerApp.explosion(numberOfEmojis);
    }
}
timerApp.fountain = function(numberOfEmojis) {
    let prep = timerApp.prepareAnimation(numberOfEmojis, [-100, 20], [-100, 200], [10, 100], 0.8);
    prep[0].css('top', '100%');
    timerApp.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        setTimeout( () => timerApp.fountain(numberOfEmojis), 20);
    }
}
timerApp.prepareAnimation = function(numberOfEmojis, topValues, leftValues, fontSizes, opacity) {
    let emoji = timerApp.emojis[timerApp.randomNumberGenerator(0, timerApp.emojis.length)];
    let positionTop = timerApp.randomNumberGenerator.apply(null, topValues);
    let positionLeft = timerApp.randomNumberGenerator.apply(null, leftValues);
    let fontSize = timerApp.randomNumberGenerator.apply(null, fontSizes);
    let animationDuration = timerApp.randomNumberGenerator(1000, 2000);
    timerApp.animationCanvas.append(`<div class="emojiContainer number${numberOfEmojis}">&#${emoji}</div>`);
    emoji = $(`.number${numberOfEmojis}`);
    return [emoji, positionTop, positionLeft, opacity, fontSize, animationDuration];
}
timerApp.animate = function(emoji, positionTop, positionLeft, opacity, fontSize, animationDuration) {
    emoji.animate({
        'left': `${positionLeft}vw`,
        'top': `${positionTop}vh`,
        'opacity': `${opacity}`,
        'font-size': `${fontSize}px`
    }, {
        'duration': animationDuration,
        'step': function(now) {
            emoji.css({'transform': `rotate(${now*10}deg) translateY(${now}px)`});
        }
    });
    setTimeout(() => timerApp.terminateAnimation(emoji), animationDuration / 1.2);
}
timerApp.terminateAnimation = function(numberedEmoji) {
    numberedEmoji.remove();
}
timerApp.randomNumberGenerator = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

timerApp.init = function() {
    timerApp.startButton.on('click', () => {
        timerApp.startSequence();
    });
    timerApp.form.on('keyup', (event) => {
        if (event.keyCode === 13) {
            timerApp.startSequence();
        }
    });
    timerApp.stopAnimation(timerApp.animationCanvas);
    // timerApp.test.playCatherineWheel(1000, 0);
}

$(document).ready(function() {
    timerApp.init()
})



timerApp.today = new Date();
timerApp.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
timerApp.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
timerApp.daysInWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
timerApp.isLeapYear = (timerApp.today.getFullYear() % 4 === 0);
timerApp.addDayInLeapYear = function(isLeapYear) {
    if (isLeapYear) { return 29; }
}
console.log(365.25%365)



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
timerApp.test.playCatherineWheel = function(numberOfEmojis, angle) {
    timerApp.animationCanvas.removeClass('hidden');
    let prep = timerApp.prepareAnimation(numberOfEmojis, [50, 100], [-10, 80], [30, 31], 0.5);
    angle += 2 * Math.PI / 50;
    prep[0].css({
        'top': `+=${70*Math.sin(angle)}px`,
        'left': `+=${70*Math.cos(angle)}px`
    });
    timerApp.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        setTimeout( () => timerApp.test.playCatherineWheel(numberOfEmojis, angle), 10);
    }
}