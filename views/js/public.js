document.addEventListener('DOMContentLoaded', () => {
    const target = document.getElementById('target');
    const locationSelect = document.createElement('select');
    const centerSelect = document.createElement('select');
    var currentDosageName = 'Dosage 1'; 
    const bookSlotButton = document.createElement('button');
    document.getElementById("logoutButton").addEventListener("click", function() {
    
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (confirmed) {
     
      fetch("/clearsession")
        .then(function(response) {
          if (response.ok) {
            console.log("Session cleared successfully.");
          
            window.location.href = "/";
          } else {
            console.log("Error clearing session.");
          }
        })
        .catch(function(error) {
          console.log("Error occurred:", error);
        });
    }
    });
    
    bookSlotButton.textContent = 'Book Slot';
  
    function handleLocationChange() {
      const selectedLocation = locationSelect.value;
  
      fetchCenters(selectedLocation)
        .then(function(centers) {
         
          centerSelect.innerHTML = '';
  
         
          centers.forEach(function(center) {
            const optionElement = document.createElement('option');
            optionElement.value = center;
            optionElement.textContent = center;
            centerSelect.appendChild(optionElement);
          });
        })
        .catch(function(error) {
          console.error('Error getting centers:', error);
         
        });
    }
  
 
    locationSelect.addEventListener('change', handleLocationChange);
  
    function fetchDosageDetails() {
      fetch('/getdosagedetails')
        .then(response => response.json())
        .then(data => {
         
          const tableBody = document.querySelector('#dosageTable tbody');
  
         
          tableBody.innerHTML = '';
          let val = 1;
          let name = '';
          let firstdosagedate ;
          let contentexist = 0;
         
          data.forEach(dosage => {
            const row = document.createElement('tr');
            const dosageNumberCell = document.createElement('td');
            dosageNumberCell.textContent = val;
            const dosageNameCell = document.createElement('td');
            dosageNameCell.textContent = dosage.dosagename;
            const dosageDateCell = document.createElement('td');
            dosageDateCell.textContent = dosage.date || 'Not Yet Vaccinated';
            const vaccinatedCell = document.createElement('td');
            vaccinatedCell.textContent = '-';
            row.appendChild(dosageNumberCell);
            row.appendChild(dosageNameCell);
            row.appendChild(dosageDateCell);
 
            const dosageDate = new Date(dosage.date);
            const today = new Date();
            if(dosage.dosagename === 'Dosage 1'){
                firstdosagedate = dosage.date;
            }
            if (dosage.dosagename === 'Dosage 1' && dosage.vaccinated === 'no') {
                contentexist=1;
            currentDosageName = 'Dosage 1';
            vaccinatedCell.innerHTML = '';

          
            const bookButton = document.createElement('button');
            bookButton.textContent = 'Book';

           
            bookButton.addEventListener('click', handleBookButtonClick);

          
            vaccinatedCell.appendChild(bookButton);
            
            } else if (dosageDate < today && dosage.vaccinated === 'yes') {
           
            vaccinatedCell.innerHTML = 'Vaccinated';
            } else if (dosageDate > today && dosage.vaccinated === 'yes'){
            
            vaccinatedCell.innerHTML = 'Booked';
            
            const data = { centreName: dosage.center };

          
            fetch('/centerworkinghours', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then(data => {
                    document.querySelector('h2').innerText = 'You Booked a Slot at '+dosage.center+' you can Vaccinate between '+ data.workingHours; 
                })
                .catch(error => {
                console.error('Error:', error);
                
                });
           
            } else if (dosage.dosagename === 'Dosage 2' && dosage.vaccinated === 'no' && contentexist!=1) {
                const firstDosageDate = new Date(firstdosagedate);
                const daysDifference = Math.floor(( today -firstDosageDate) / (1000 * 60 * 60 * 24));
                console.log(firstDosageDate);
                if (daysDifference > 60) {
                    currentDosageName = 'Dosage 2';
                    vaccinatedCell.innerHTML = '';
        
                   
                    const bookButton = document.createElement('button');
                    bookButton.textContent = 'Book';
        
                    
                    bookButton.addEventListener('click', handleBookButtonClick);
        
                    
                    vaccinatedCell.appendChild(bookButton);
                } else if(daysDifference>0){
                  vaccinatedCell.innerHTML = '<b>'+Math.abs(daysDifference)+' days</b> to Go for Dosage 2 Eligibility';
                }
              } else {
              
                vaccinatedCell.innerHTML = '-';
              }
              
            row.appendChild(vaccinatedCell);
            tableBody.appendChild(row);
  
            val += 1;
            name = dosage.name;
          });
  
          const h1 = document.querySelector('h1');
          h1.innerHTML = `Welcome to Our Vaccination Hub! <br>Take charge of your health and secure your vaccine appointment today, ${name} <br> Together, let's build a healthier and safer tomorrow.`;
        })
        .catch(error => {
          console.error('Error fetching dosage details:', error);
        });
    }
  
    function handleBookButtonClick() {
      target.innerHTML = '';
  
      fetchLocations()
        .then(locations => {
          
          locationSelect.innerHTML = '';
  
        
          locations.forEach(location => {
            const optionElement = document.createElement('option');
            optionElement.value = location;
            optionElement.textContent = location;
            locationSelect.appendChild(optionElement);
          });
  
        
          target.appendChild(locationSelect);
          handleLocationChange();
          target.appendChild(centerSelect);
  
        
          const availabilityButton = document.createElement('button');
          availabilityButton.textContent = 'Availability';
  
        
          availabilityButton.addEventListener('click', handleAvailabilityButtonClick);
  
         
          target.appendChild(availabilityButton);
        })
        .catch(error => {
          console.error('Error getting locations:', error);
        });
    }
  
    function handleAvailabilityButtonClick() {
        const selectedLocation = locationSelect.value;
        const selectedCenter = centerSelect.value;
      
  
        fetch('/checkavailability', {
          method: 'POST',
          body: JSON.stringify({ location: selectedLocation, center: selectedCenter, dosageName: currentDosageName }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            document.querySelector('h2').innerText = '';
            if (data.available) {
                document.querySelector('h2').innerText = 'Slots Available : '+data.total+' Working Hours for Centre : '+data.workingHours;
      
            
              bookSlotButton.addEventListener('click', () => {
              
                const confirmation = confirm("Are you sure you want to book the slot?");
                
                if (confirmation) {
            
                  fetch('/bookslot', {
                    method: 'POST',
                    body: JSON.stringify({ center: selectedCenter, dosageName: currentDosageName }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  })
                    .then((data) => {
                      console.log(data);
                      document.getElementById('target').innerHTML = '';
                      document.querySelector('h2').innerText = '';
                 
                      fetchDosageDetails();
                    })
                    .catch(error => {
                  
                    });
                }
              });
              
             
              target.appendChild(bookSlotButton);
            } else {
              try{
                target.removeChild(bookSlotButton);
              }catch(e){
                console.log(e);
              }
             document.querySelector('h2').innerText = "No slots available";
            }
          })
          .catch(error => {
            console.error('Error checking availability:', error);
           
          });
      }
      
    function fetchLocations() {
      return fetch('/getlocations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json());
    }
  
    function fetchCenters(location) {
      return fetch('/getcenters', {
        method: 'POST',
        body: JSON.stringify({ location }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json());
    }
  
    fetchDosageDetails();
  });
  