//time picker
    $('.timepicker').timepicker({ 
        timeFormat: 'h:mm p',
        interval: 60,
        minTime: '6:00am',
        maxTime: '10:00pm',
        defaultTime: '7',
        dynamic: false,
        dropdown: true, 
        scrollbar: true
    });
    
//datepicker
    $('.datepicker').datepicker({
        format: 'yyyy-mm-dd',
    });

    $('.datepicker').datepicker('update', new Date());