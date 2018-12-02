module.exports = {
    // Returns a new date object "days_ago" from today. Defaults to 1 day ago
    daysAgo: (days_ago = 1) => {
        return new Date(Date.now() - days_ago * 24 * 3600 * 1000)
    }
};