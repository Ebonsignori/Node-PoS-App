module.exports = {
    // Returns a new date object "days_ago" from today. Defaults to 1 day ago
    daysAgo: (days_ago = 1) => {
        return new Date(Date.now() - days_ago * 24 * 3600 * 1000)
    },

    // Returns a new date object "days_forward" from today. Defaults to 1 day in future
    daysForward: (days_forward = 1) => {
        return new Date(Date.now() + days_forward * 24 * 3600 * 1000)
    }
};