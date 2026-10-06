// Tests run in a fixed time zone with daylight saving time, so date math is checked across DST changes
module.exports = async () => {
    process.env.TZ = 'Europe/Rome';
};
