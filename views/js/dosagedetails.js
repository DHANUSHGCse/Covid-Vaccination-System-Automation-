document.addEventListener('DOMContentLoaded',()=>{

const h1 = document.querySelector('h1');
document.getElementById("backButton").addEventListener("click", function() {
  window.location.href = "/admin/dashboard";
});

     
const dosageTable = document.getElementById('dosagedetailstable');

dosageTable.addEventListener('click', function(event) {
    const target = event.target;
    
    if (target.tagName === 'BUTTON' && target.textContent === 'Edit') {
      const dosageRow = target.parentNode.parentNode;
      const dosageName = dosageRow.cells[0].textContent;
      const dosageAvailabilityCell = dosageRow.cells[1];

      const currentDosageAvailability = dosageAvailabilityCell.textContent;
      
      
      
      const dosageAvailabilityInput = document.createElement('input');
      dosageAvailabilityInput.value = currentDosageAvailability;
      
 
      dosageAvailabilityCell.innerHTML = '';
      dosageAvailabilityCell.appendChild(dosageAvailabilityInput);
      
      
      target.textContent = 'Update';
      
   
      target.addEventListener('click', function(event) {

        const updatedDosageAvailability = dosageAvailabilityInput.value;
        
    const formData = {
      dosageName: dosageName,
      dosageAvailability: updatedDosageAvailability
    };
        
        fetch('/admin/dosageavailability', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (response.ok) {
       
            alert('form Updated Succussfully');
            fetchDosageDetails();
          } else {
            console.error('Error:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    }
  });
  

function fetchDosageDetails() {
  fetch('/admin/dosageavailability')
    .then(response => response.json())
    .then(data => {
     
      updateTable(data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


function updateTable(data) {
  const tableBody = dosageTable.getElementsByTagName('tbody')[0];
  
 
  tableBody.innerHTML = '';
  

  data.forEach(dosage => {
   const dosageName = dosage['Dosage Name'];
    const dosageAvailability =dosage['Availability'];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${dosageName}</td>
      <td>${dosageAvailability}</td>
      <td><button>Edit</button></td>
    `;
    tableBody.appendChild(row);
  });
  
}
function fetchPublicDetails(){
  
fetch('/publicbookeddetails')
.then(response => response.json())
.then(data => {
  
  const tbody = document.querySelector('#slotdetails tbody');

 
  data.forEach(entry => {
    
    const row = document.createElement('tr');

    
    const nameCell = document.createElement('td');
    nameCell.textContent = entry.name;
    row.appendChild(nameCell);

    const dateCell = document.createElement('td');
    dateCell.textContent = entry.dosageDate;
    row.appendChild(dateCell);

    const typeCell = document.createElement('td');
    typeCell.textContent = entry.dosageType.charAt(0).toUpperCase() + entry.dosageType.slice(1);
    row.appendChild(typeCell);

    
    tbody.appendChild(row);
  });
})
.catch(error => {
  console.error('Error fetching data:', error);
});

}

fetchDosageDetails();
fetchPublicDetails();

});