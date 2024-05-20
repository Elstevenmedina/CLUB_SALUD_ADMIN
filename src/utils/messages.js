function formatMessage(username, text) {
    let time = new Date();
    time = time.toString()
    time = time.split(' ');
    time = time[4];
    time = time.split(':');
    time = time[0] + ':' + time[1];
    return {
        username,
        text,
        time
    }
}

module.exports = formatMessage;