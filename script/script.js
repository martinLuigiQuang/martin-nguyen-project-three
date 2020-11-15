const timerApp ={};

timerApp.timer = {};
// Caching variables
timerApp.timer.form = $('form');
timerApp.timer.startButton = $('.button');
timerApp.timer.display = $('.display');
timerApp.timer.userInputs = [$('#years'), $('#days'), $('#hours'), $('#minutes'), $('#seconds')];
// Array of conversion factors
timerApp.timer.conversionFactors = [365 * 24 * 60 * 60, 24 * 60 *60, 60 * 60, 60, 1];
// Empty array to store processed time values
timerApp.timer.timeValues = [];
// myTimer variable and boolean value timerOn to switch on/off the countdown timer
timerApp.timer.myTimer;
timerApp.timer.On = true;

// General purpose functions to get and reset user input fields
timerApp.timer.getInputValues = function(userInputs) {
    return userInputs.map( (input) => {
        if (input.val() < 0) {
            input = 0;
        } else {
            input = input.val(); 
        }
        return input;
    });
}
timerApp.timer.resetInputValues = function(form, userInputs) {
    form.toggleClass('hidden');
    userInputs.map( (input) => input.val('') );
}

// Main function - convertUnits(inputValues) - to process raw input data into standard format
// Helper functions - findTotalTimeInSeconds(inputValues) and conversionCalculator(totalTimeInSeconds, factor) - to help main function convert raw input data
timerApp.timer.convertUnits = function(inputValues) {
    let totalTimeInSeconds
    let convertedValues;
    if (inputValues.length > 1) {
        totalTimeInSeconds = timerApp.timer.findTotalTimeInSeconds(inputValues) + 1;
        if (totalTimeInSeconds <= 0) {
            convertedValues = [0, 0, 0, 0, 0];
        } else {
            convertedValues = inputValues.map( (value, index) => {
                // each time value starting from number of years is calculated by finding the quotient of the total time in seconds divided by the corresponding conversion factor
                // Math formula: ( numerator (i.e. total) - remainder ) / divisor (i.e. conversion factor) = quotient (i.e required value)
                value = timerApp.timer.conversionCalculator(totalTimeInSeconds, timerApp.timer.conversionFactors[index]);
                // the value of the next largest time unit is calculated by finding the remaining total time in seconds. Then apply the same conversion calculation as above to the reduced total time in seconds.
                totalTimeInSeconds -= value * timerApp.timer.conversionFactors[index];
                // return each converted value to the convertedValues array
                return value;
            });
        }
    } else {
        totalTimeInSeconds = inputValues;
        if (totalTimeInSeconds <= 0) {
            convertedValues = [0, 0, 0, 0, 0];
        } else {
            convertedValues = timerApp.timer.conversionFactors.map( (value) => {
                let convertedValue = timerApp.timer.conversionCalculator(totalTimeInSeconds, value);
                totalTimeInSeconds -= convertedValue * value;
                return convertedValue;
            });
        }
    }
    return convertedValues;
}
timerApp.timer.findTotalTimeInSeconds = function(inputValues) {
    let totalTimeInSeconds = 0;
    inputValues.forEach( (value, index) => {
        // total time in seconds is calculated by adding each input value with corresponding conversion factor (e.g. 1 hour = 60 * 60 seconds, etc...)
        totalTimeInSeconds += value * timerApp.timer.conversionFactors[index];
    });
    totalTimeInSeconds = timerApp.timer.checkTotal(totalTimeInSeconds);
    return totalTimeInSeconds;
}
timerApp.timer.checkTotal = function(rawTotal) {
    if (rawTotal > Number.MAX_SAFE_INTEGER) {
        rawTotal = Number.MAX_SAFE_INTEGER;
    }
    return rawTotal;
}
timerApp.timer.conversionCalculator = function(totalTimeInSeconds, factor) {
    // return formula to be used in the main convertUnits(inputValues) function
    // Math formula: quotient (i.e required value) = ( numerator (i.e. total) - remainder ) / divisor (i.e. conversion factor)
    return (totalTimeInSeconds - totalTimeInSeconds % factor) / factor;
} 

// Functions to handle counting down
// startTimer function applies the convertedValues array to the countdownMain function
timerApp.timer.startTimer = function(convertedValues) {
    timerApp.timer.countdownMain.apply(null, convertedValues);
}
// countdownMain function handles the mechanics of counting down starting from seconds, then minutes, then hours, and so on.
// Recursions are used in place of looping. The purpose is to keep counting down until the timer reads zeros across the board.
timerApp.timer.countdownMain = function(years, days, hours, minutes, seconds) {
    // first decrease the number of seconds by 1 every time the function is called
    seconds--;
    timerApp.countdownAnimation(years, days, hours, minutes, seconds);
    // if the number of seconds is greater than zero, recursively call countdownMain function every 1 second which decreases the number of seconds by 1 every time it is called.
    if (seconds >= 0) {
        // display the new time on the screen
        timerApp.timer.displayTimeValues([years, days, hours, minutes, seconds]);
        if (seconds > 0) {
            timerApp.timer.myTimer = setTimeout(timerApp.timer.countdownMain, 1000, years, days, hours, minutes, seconds);  
        } else {
            timerApp.timer.countdownMain(years, days, hours, minutes, seconds);
        }
    } else if (timerApp.timer.checkTime([minutes, hours, days, years])) {
        // if the number of seconds dips below 0, reset it to 60
        seconds = 60;
        // then decrease the number of minutes following the steps defined by the helper countdown function
        minutes = timerApp.timer.countdown(minutes, 59);
        if (minutes === 59 && timerApp.timer.checkTime([hours, days, years])) {
            // if the number of minutes is reset to 59 and one of the larger time unit is non-zero, decrease the number of hours
            hours = timerApp.timer.countdown(hours, 23);
            if (hours === 23 && timerApp.timer.checkTime([days, years])) {
                // if the number of hours is reset to 23 and one of the larger time unit is non-zero, decrease the number of days
                days = timerApp.timer.countdown(days, 364);
                if (days === 364 && years > 0) {
                    // if the number of days is reset to 364 and the number of years is non-zero, decrease the number of years but do not reset it
                    years--;
                }
            }
        }
        // Recursive call to countdownMain function to continue counting down
        timerApp.timer.countdownMain(years, days, hours, minutes, seconds);
    } else {
        timerApp.animation.start(timerApp.randomNumberGenerator(1,100), timerApp.animation.canvas);
    }
}
// helper function checkTime(timeValues) checks if any of the input time values is greater than zero
timerApp.timer.checkTime = function(timeValues) {
    let nonZeroValues = false;
    timeValues.forEach( (value) => nonZeroValues = (nonZeroValues || (value > 0)) );
    return nonZeroValues;
}
// helper countdown function provides the template to be used in the countdownMain function
timerApp.timer.countdown = function(timeValue, maxValue) {
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
    if (seconds <= 10 && !timerApp.timer.checkTime([minutes, hours, days, years])) {
        timerApp.animation.canvas.removeClass('hidden');
        timerApp.animation.explosion(1);
    }
}

// Main function to display the time values on screen
timerApp.timer.displayTimeValues = function(convertedValues) {
    let stringValues = convertedValues.map(timerApp.timer.toString);
    let timeUnits = ['year', 'day', 'hour', 'minute', 'second'];
    timerApp.timer.display.html('');
    stringValues.forEach( (value, index) => {
        timerApp.timer.show(timerApp.timer.display, timeUnits[index], value, index); 
    });
}
// Helper function to convert numerical value array into an array of string values for display
timerApp.timer.toString = function(numericalValue) {
    if (numericalValue < 10) { 
        return '0' + numericalValue; 
    } else if (numericalValue > 999) {
        return '999'; 
    } else {
        return '' + numericalValue;
    }
}
// Helper function to display Year and Day values as these are displayed differently from the rest
timerApp.timer.show = function(display, timeUnit, value, index) {
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
timerApp.timer.startSequence = function() {
    timerApp.buttonControl(timerApp.timer.startButton);
    timerApp.timer.display.toggleClass('hidden');
    timerApp.timer.timeValues = timerApp.timer.convertUnits(timerApp.timer.getInputValues(timerApp.timer.userInputs));
    timerApp.timer.resetInputValues(timerApp.timer.form, timerApp.timer.userInputs);
    timerApp.timer.displayTimeValues(timerApp.timer.timeValues);
    if (timerApp.timer.On) {
        timerApp.timer.startTimer(timerApp.timer.timeValues);
    } else {
        clearTimeout(timerApp.timer.myTimer);
    }
    timerApp.timer.On = !timerApp.timer.On;
}

timerApp.animation = {}
timerApp.animation.emojis = ['127809','127810','127809','127810','127811'];
timerApp.animation.canvas = $('.endingAnimations');
timerApp.animation.endingTimeout;
timerApp.animation.start = function(randomNumber) {
    if (randomNumber > 50) {
        timerApp.animation.explosion(25);
        timerApp.animation.explosion(25);
        timerApp.animation.explosion(25);
        timerApp.animation.explosion(25);
        timerApp.animation.endingTimeout = setTimeout(timerApp.timer.startSequence, 750);
    } else {
        timerApp.animation.fountain(100);
        timerApp.animation.endingTimeout = setTimeout(timerApp.timer.startSequence, 2000);
    }
}
timerApp.animation.explosion = function(numberOfEmojis) {
    let prep = timerApp.animation.prep(numberOfEmojis, [-100, 200], [-150, 100], [50, 100], 0.2);
    prep[0].css({
        'top': `${timerApp.randomNumberGenerator(45, 55)}vh`,
        'left': `${timerApp.randomNumberGenerator(45, 55)}vw`
    });
    prep.push(timerApp.animation.animateFunction);
    timerApp.animation.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        timerApp.animation.explosion(numberOfEmojis);
    }
}
timerApp.animation.fountain = function(numberOfEmojis) {
    let prep = timerApp.animation.prep(numberOfEmojis, [-100, 20], [-100, 200], [10, 100], 0.8);
    prep[0].css({
        'top': '100vh',
        'left': '50vw',
    });
    timerApp.animation.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        setTimeout(() => timerApp.animation.fountain(numberOfEmojis), 10);
    }
}
timerApp.animation.prep = function(numberOfEmojis, topValues, leftValues, fontSizes, opacity) {
    let emoji = timerApp.animation.emojis[timerApp.randomNumberGenerator(0, timerApp.animation.emojis.length)];
    let positionTop = timerApp.randomNumberGenerator.apply(null, topValues);
    let positionLeft = timerApp.randomNumberGenerator.apply(null, leftValues);
    let fontSize = timerApp.randomNumberGenerator.apply(null, fontSizes);
    let animationDuration = timerApp.randomNumberGenerator(1000, 2000);
    timerApp.animation.canvas.append(`<div class="emojiContainer number${numberOfEmojis}">&#${emoji}</div>`);
    emoji = $(`.number${numberOfEmojis}`);
    return [emoji, positionTop, positionLeft, opacity, fontSize, animationDuration];
}
timerApp.animation.animate = function(emoji, positionTop, positionLeft, opacity, fontSize, animationDuration) {
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
    setTimeout(() => timerApp.animation.terminate(emoji), animationDuration / 1.2);
}
timerApp.animation.terminate = function(emoji) {
    emoji.remove();
}
timerApp.randomNumberGenerator = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


timerApp.calendar = {};
timerApp.calendar.calendar = $('.calendar');
timerApp.calendar.calendarNav = $('.calendarNav');
timerApp.calendar.previousButton = $('.fa-chevron-left');
timerApp.calendar.nextButton = $('.fa-chevron-right');
timerApp.calendar.calendarDisplay = $('.calendarDisplay ul');
timerApp.calendar.calendarIcon = $('.calendarIcon');
timerApp.calendar.today = new Date();
timerApp.calendar.chosenDate = [timerApp.calendar.today.getFullYear(), timerApp.calendar.today.getMonth()];
timerApp.calendar.userChosenDate;
timerApp.calendar.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


timerApp.calendar.calendarIconDisplay = function(calendar, today) {
    $(calendar[0].children[0]).text(today.getDate());
    $(calendar[0].children[1]).text(today.getMonth() + 1);
    timerApp.calendar.calendarIcon.on('click', () => {
        if (timerApp.timer.On) {
            timerApp.calendar.calendar.toggleClass('hidden');
            timerApp.calendar.chosenDate = [timerApp.calendar.today.getFullYear(), timerApp.calendar.today.getMonth()];
            timerApp.calendar.calendarNavControl(timerApp.calendar.calendarNav);
            timerApp.calendar.show(timerApp.calendar.calendarDisplay);
        }
    });
}
timerApp.calendar.changeMonth = function() {
    timerApp.calendar.previousButton.on('click', () => {
        timerApp.calendar.backward(); 
        timerApp.calendar.calendarNavControl(timerApp.calendarNav);
        timerApp.calendar.show(timerApp.calendarDisplay);
    });
    timerApp.calendar.nextButton.on('click', () => {
        timerApp.calendar.forward();
        timerApp.calendar.calendarNavControl(timerApp.calendarNav);
        timerApp.calendar.show(timerApp.calendarDisplay); 
    });
}
timerApp.calendar.calendarNavControl = function(calendarNav) {
    $(calendarNav[0].children[1]).text(`${timerApp.calendar.months[timerApp.calendar.chosenDate[1]]} ${timerApp.calendar.chosenDate[0]}`);
}
timerApp.calendar.forward = function() {
    timerApp.calendar.chosenDate[1]++;
    if (timerApp.calendar.chosenDate[1] > 11) {
        timerApp.calendar.chosenDate[1] = 0;
        timerApp.calendar.chosenDate[0]++;
    }
}
timerApp.calendar.backward = function() {
    timerApp.calendar.chosenDate[1]--;
    if (timerApp.calendar.chosenDate[1] < 0) {
        timerApp.calendar.chosenDate[1] = 11;
        timerApp.calendar.chosenDate[0]--;
    }
}
timerApp.calendar.show = function(calendarDisplay) {
    calendarDisplay.html('');
    let year = timerApp.calendar.chosenDate[0];
    let month = timerApp.calendar.chosenDate[1];
    let day = 1;
    let firstDayInMonth = new Date(year, month, 1);
    let weekday = firstDayInMonth.getDay();
    let daysInMonth = new Date(year, month + 1, 0).getDate();
    let maxNum = 35;
    if (weekday + daysInMonth > 35) {
        maxNum = 42;
    }
    for (let i = 0; i < maxNum; i++) {
        if (i < weekday || i >= weekday + daysInMonth) {
            timerApp.calendar.fillDays(calendarDisplay, '');
        } else {
            stringDate = timerApp.timer.toString(day);
            timerApp.calendar.fillDays(calendarDisplay, stringDate);
            day++;
        }
        if (day === (timerApp.calendar.today.getDate() + 1) && 
            month === timerApp.calendar.today.getMonth() && 
            year === timerApp.calendar.today.getFullYear()) {
            $(calendarDisplay[0].children[i].children).css({
                'color': 'crimson'
            });
            $(calendarDisplay[0].children[i]).css({
                'background-color': 'rgba(0, 0, 0, 0.8)'
            });
        } else {
            $(calendarDisplay[0].children[i]).css('background-color', 'rgba(0, 0, 0, 0.3)'); 
        }
    }
}
timerApp.calendar.fillDays = function(calendarDisplay, stringDate) {
    calendarDisplay.append(`
        <li>
            <span>${stringDate.charAt(0)}</span>
            <span>${stringDate.charAt(1)}</span>
        </li>
    `);
}

timerApp.calendar.calendarDisplay.on('click', 'li', function() {
    timerApp.calendar.calendar.toggleClass('hidden');
    let chosenDay = $($(this).find('span')[0]).text();
    chosenDay += $($(this).find('span')[1]).text();
    timerApp.calendar.userChosenDate = new Date(timerApp.calendar.chosenDate[0], timerApp.calendar.chosenDate[1], chosenDay);
    timerApp.timer.timeValues = timerApp.timer.convertUnits((timerApp.calendar.userChosenDate - timerApp.calendar.today.getTime())/1000);
    timerApp.timer.resetInputValues(timerApp.timer.form, timerApp.timer.userInputs);
    timerApp.timer.displayTimeValues(timerApp.timer.timeValues);
    timerApp.buttonControl(timerApp.timer.startButton);
    timerApp.timer.display.toggleClass('hidden');
    if (timerApp.timer.On) {
        timerApp.timer.startTimer(timerApp.timer.timeValues);
    } else {
        clearTimeout(timerApp.timer.myTimer);
    }
    timerApp.timer.On = !timerApp.timer.On;
});

timerApp.init = function() {
    timerApp.calendar.calendarIconDisplay(timerApp.calendar.calendarIcon, timerApp.calendar.today);
    timerApp.calendar.calendarNavControl(timerApp.calendar.calendarNav);
    timerApp.calendar.show(timerApp.calendar.calendarDisplay);
    timerApp.calendar.changeMonth();
    timerApp.timer.startButton.on('click', () => {
        timerApp.timer.startSequence();
        if (timerApp.timer.On) {
            clearTimeout(timerApp.calendar.endingTimeout);
        }
    });
    timerApp.timer.form.on('keyup', (event) => {
        if (event.keyCode === 13) {
            timerApp.timer.startSequence();
        }
    });
    // timerApp.test.playCatherineWheel(1000, 0);
}

$(document).ready(function() {
    timerApp.init()
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
timerApp.test.playCatherineWheel = function(numberOfEmojis, angle) {
    timerApp.animation.canvas.removeClass('hidden');
    let prep = timerApp.prep(numberOfEmojis, [50, 100], [-10, 110], [20, 30], 0.5);
    angle += 2 * Math.PI / 100;
    prep[0].css({
        'top': `50vh`,
        'left': `50vw`
    });
    prep[0].css({
        'top': `+=${70*Math.sin(angle)}px`,
        'left': `+=${70*Math.cos(angle)}px`
    });
    prep.push(timerApp.animateFunction);
    timerApp.animate.apply(null, prep);
    numberOfEmojis--;
    if (numberOfEmojis > 0) {
        setTimeout( () => timerApp.test.playCatherineWheel(numberOfEmojis, angle), 10);
    }
}