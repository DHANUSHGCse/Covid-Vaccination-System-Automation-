
  function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return {
      hours: parseInt(hours),
      minutes: parseInt(minutes)
    };
  }
  
  function formatTime(time) {
    const hours = time.hours % 12 || 12; 
    const minutes = time.minutes.toString().padStart(2, '0'); 
    const period = time.hours >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${period}`;
  }
  
  
function isValidTimeRange(startTime, endTime) {
    const allowedStartTime = { hours: 9, minutes: 0 };
    const allowedEndTime = { hours: 18, minutes: 0 };
  
    if (compareTimes(startTime, endTime) >= 0) {
      return false; 
    }
  
    if (compareTimes(startTime, allowedStartTime) < 0 || compareTimes(endTime, allowedEndTime) > 0) {
      return false; 
    }
  
    return true;
  }
  
  function compareTimes(time1, time2) {
    if (time1.hours === time2.hours) {
      return time1.minutes - time2.minutes;
    }
    return time1.hours - time2.hours;
  }
  export  {parseTime,formatTime,isValidTimeRange}