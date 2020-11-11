const timerApp ={};
timerApp.form = $('form');
timerApp.startButton = $('.button');
timerApp.display = $('.display');
timerApp.userInputs = [$('#years'), $('#days'), $('#hours'), $('#minutes'), $('#seconds')];
timerApp.conversionFactors = [365 * 24 * 60 * 60, 24 * 60 *60, 60 * 60, 60, 1];
timerApp.timeValues = [];

timerApp.getInputValues = function() {
    return timerApp.userInputs.map( (value) => value.val() );
}
timerApp.resetInputValues = function() {
    timerApp.form.toggleClass('hidden');
    timerApp.userInputs.map( (value) => value.val('') );
}
timerApp.unitConversionHelper = function(totalTimeInSeconds) {
    return function(factor) {
        return (totalTimeInSeconds - totalTimeInSeconds % factor) / factor;
    }
} 
timerApp.findTotalTimeInSeconds = function(inputValues) {
    let totalTimeInSeconds = 0;
    inputValues.forEach( (value, index) => {
        totalTimeInSeconds += value * timerApp.conversionFactors[index];
    });
    return totalTimeInSeconds;
}
timerApp.toString = function(numericalValue) {
    if (numericalValue < 10) { 
        return '0' + numericalValue; 
    } else { 
        return '' + numericalValue;
    }
}
timerApp.toNum = function(stringValue) {
    return parseInt(stringValue);
}
timerApp.convertUnits = function(inputValues) {
    let totalTimeInSeconds = timerApp.findTotalTimeInSeconds(inputValues);
    let convert;
    let convertedValues = inputValues.map( (value, index) => {
        convert = timerApp.unitConversionHelper(totalTimeInSeconds);
        value = convert(timerApp.conversionFactors[index]);
        totalTimeInSeconds -= value * timerApp.conversionFactors[index];
        value = timerApp.toString(value);
        return value;
    });
    return convertedValues;
}
timerApp.countdownHelper = function(timeValue) {
    return function(isReduced) {
        return function(maxValue) {
            if (isReduced) { timeValue--; }
            if (timeValue === -1) { timeValue = maxValue; }
            return timeValue;
        }
    }
}
timerApp.countdown = function(convertedValues) {
    let numericalValues = convertedValues.map( timerApp.toNum );
    let isReduced = true;
    let checkTimeValue = timerApp.countdownHelper(numericalValues.pop);
    let updateTimeValue = checkTimeValue(isReduced);
    isReduced = updateTimeValue(59);
}

timerApp.displayYearAndDay = function(yearValue, dayValue) {
    let yearUnit = 'years';
    let dayUnit = 'days';
    if (yearValue === '01') { yearUnit = 'year'; }
    if (dayValue === '01') { dayUnit = 'day'; }
    if (yearValue !== 0 ) { 
        timerApp.display.append(`<div class="year"><span>${yearValue}</span><span>${yearUnit}</span></div>`); 
        timerApp.display.append(`<div class="day"><span>${dayValue}</span><span>${dayUnit}</span></div>`); 
    } else if (dayValue !== 0) {
        timerApp.display.append(`<div class="year"><span>${dayValue}</span><span>${dayUnit}</span></div>`);
    }
}

timerApp.displayTimeValues = function(convertedValues) {
    timerApp.displayYearAndDay(convertedValues[0], convertedValues[1]);
    convertedValues.forEach( (value, index) => {
        if (index > 1 && index < 4) {
            timerApp.display.append(`<span>${value}:</span>`);
        }
        if (index === 4) {
            timerApp.display.append(`<span>${value}</span>`);
        }
    });
    timerApp.display.toggleClass('hidden');
}

timerApp.handleButton = function() {
    timerApp.startButton.on('click', () => {
        timerApp.startButton.toggleClass('cancel');
        timerApp.display.html('');
        timerApp.timeValues = timerApp.convertUnits(timerApp.getInputValues());
        timerApp.resetInputValues();
        timerApp.displayTimeValues(timerApp.timeValues);
        timerApp.countdown(timerApp.timeValues);
        
    });
}


$(document).ready(function() {
    timerApp.handleButton();
})