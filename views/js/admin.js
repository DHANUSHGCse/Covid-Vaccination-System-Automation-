function ValidateForm(event){
    event.preventDefault();
    var adminid = document.querySelector('input[type="text"]').value;
    var password = document.querySelector('input[type="password"]').value;
    var error = document.querySelector('h2');
    error.textContent='';
    var formData= {
        adminid:adminid,
        password:password
    }
    fetch('/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
        .then(response => {
          if (response.ok) {
            window.location.href = '/admin/dashboard';
          } else {
            response.json().then(data => {
              error.textContent = data.error;
            });
          }
        })
        .catch(error => {
          error.textContent = 'An error occurred: ' + error.message;
        });      
}