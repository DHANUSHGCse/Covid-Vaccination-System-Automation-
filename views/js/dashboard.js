
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("logoutButton").addEventListener("click", function() {

   const confirmed = window.confirm("Are you sure you want to log out?");

   if (confirmed) {

     fetch("/admin/clearsession")
       .then(function(response) {
         if (response.ok) {
           console.log("Session cleared successfully.");
         
           window.location.href = "/admin/login";
         } else {
           console.log("Error clearing session.");
         }
       })
       .catch(function(error) {
         console.log("Error occurred:", error);
       });
   }
   });
  document.getElementById('btn').addEventListener('click',validateForm);
   function validateForm(event) {
    event.preventDefault();
    const centreName = document.getElementById('center').value;
    const location = document.getElementById('location').value;
    const error = document.querySelector('h2');
    const fromTime = document.getElementById('fromtime').value;
    const toTime = document.getElementById('totime').value;
    const startTime = parseTime(fromTime);
    const endTime = parseTime(toTime);
    const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`; 
    error.textContent = '';
  
    if (centreName.trim() === '') {
      error.textContent = 'Enter a Centre Name';
      return;
    }
  
    if (location.trim() === '') {
      error.textContent = 'Enter a Location Details';
      return;
    }
  
    if (!isValidTimeRange(startTime, endTime)) {
      error.textContent = 'Invalid time range! Please make sure the start time is before the end time and within the allowed range (9 AM - 6 PM).';
      return;
    }
    
    const formData = {
      centreName: centreName,
      location: location,
      timeRange: timeRange
    };
  
t
    fetch('/admin/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    }).then(response => {
   
      if (response.ok) {
        
        alert('Form submitted successfully');
        document.getElementById('center').value = '';
      document.getElementById('location').value = '';
      document.getElementById('fromtime').value = '';
      document.getElementById('totime').value = '';
      fetchCenterDetails();
        
      } else {
   
        response.json().then(data => {
          error.textContent = data.error;
        });
      }
    }).catch(error => {
     
      error.textContent = error;
    });
  }
  
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
  
  var fetchCenterDetails = async () => {
    try {
      const response = await fetch('/admin/centredetails');
      if (response.ok) {
        const data = await response.json();
        populateTable(data);
      } else {
        console.error('Failed to fetch center details');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const populateTable = (data) => {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = ''; 

    data.forEach((center) => {
      const { centreName, location, timeRange } = center;

      const row = document.createElement('tr');

    
      const centerNameCell = document.createElement('td');
      centerNameCell.textContent = centreName;
      row.appendChild(centerNameCell);

   
      const locationCell = document.createElement('td');
      locationCell.textContent = location;
      row.appendChild(locationCell);

      const workingHoursCell = document.createElement('td');
      workingHoursCell.textContent = timeRange;
      row.appendChild(workingHoursCell);

      const addSlotCell = document.createElement('td');
      const addSlotBtn = document.createElement('button');
      addSlotBtn.textContent = 'View Details';
      addSlotBtn.addEventListener('click', () => {
        const formData ={
          centreName : centreName
        }
        fetch('/admin/dosage',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
        }).then(response => {
          if (response.ok) {
            
            window.location.href = '/admin/dosage';
          } else {
            response.json().then(data => {
              error.textContent = data.error;
            });
          }
        }).catch(error =>{
              error.textContent = 'Error : ' + error;
        })
        console.log('Add Slot clicked for:', centreName);
      });
      addSlotCell.appendChild(addSlotBtn);
      row.appendChild(addSlotCell);

   
      const editCell = document.createElement('td');
     
      const  editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
     
        handleEdit(center, row);
      });
      editCell.appendChild(editBtn);
      row.appendChild(editCell);

     
      const deleteCell = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
          const formData = {
            centreName: centreName,
            location: location,
            timeRange: timeRange
          };
        
          fetch('/admin/center', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          })
            .then(response => {
          
              if (response.ok) {
                alert('Center deleted successfully');
                fetchCenterDetails(); 
              } else {
               
                response.json().then(data => {
                  console.error('Error:', data.error);
                });
              }
            })
            .catch(error => {
              
              console.error('Error:', error);
            });
        console.log('Delete clicked for:', centreName);
      });
      deleteCell.appendChild(deleteBtn);
      row.appendChild(deleteCell);

     
      tableBody.appendChild(row);
    });
  };

 
  fetchCenterDetails();
  const handleEdit = (center, row) => {
  
    const { centreName, location, timeRange } = center;
  
   
    const centreNameInput = createInputField(centreName);
    const locationInput = createInputField(location);
    const timeRangeInput = createInputField(timeRange);
  
    
    replaceTableCell(row, 0, centreNameInput);
    replaceTableCell(row, 1, locationInput);
    replaceTableCell(row, 2, timeRangeInput);
  
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
     
      const updatedCentreName = centreNameInput.value;
      const updatedLocation = locationInput.value;
      const updatedTimeRange = timeRangeInput.value;
  
      
      updateCenterDetails(row , updatedCentreName, updatedLocation, updatedTimeRange);
      sendCenterDetails(row,centreName, location, timeRange, updatedCentreName, updatedLocation, updatedTimeRange);
      fetchCenterDetails();
    });
    replaceTableCell(row, 4, saveBtn);
  };
  
  
  const createInputField = (value) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    return input;
  };
  
  
  const replaceTableCell = (row, index, newElement) => {
    const cell = row.children[index];
    cell.innerHTML = '';
    cell.appendChild(newElement);
  };
  

  const updateCenterDetails = (row, centreName, location, timeRange) => {
 
    const centreNameCell = createTableCell(centreName);
    const locationCell = createTableCell(location);
    const timeRangeCell = createTableCell(timeRange);
  
   
    replaceTableCell(row, 0, centreNameCell);
    replaceTableCell(row, 1, locationCell);
    replaceTableCell(row, 2, timeRangeCell);
    const  editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
    
        handleEdit(center, row);
      });
    replaceTableCell(row, 4, editBtn);
  };
  
 
  const createTableCell = (textContent) => {
    const cell = document.createElement('td');
    cell.textContent = textContent;
    return cell;
  };
  const sendCenterDetails = (row,centreName, location, timeRange, updatedCentreName, updatedLocation, updatedTimeRange) =>{
    console.log(centreName);
  const formData = {
    centreName: centreName,
    location: location,
    timeRange: timeRange,
    updatedCentreName:updatedCentreName, 
    updatedLocation: updatedLocation,
    updatedTimeRange:updatedTimeRange
  };
  fetch(`/admin/center`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
    
      if (response.ok) {
       
        alert('Center details updated successfully');
        fetchCenterDetails();
      } else {
        
        response.json().then(data => {
          console.error('Error:', data.error);
        });
      }
    })
    .catch(error => {
     
      console.error('Error:', error);
    });
  }
});
