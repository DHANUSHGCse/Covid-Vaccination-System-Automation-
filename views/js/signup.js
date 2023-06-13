function validateForm(event) {
  event.preventDefault(); 

  var username = document.querySelector('input[type="text"]').value;
  var email = document.querySelector('input[type="email"]').value;
  var password = document.querySelector('input[type="password"]').value;
  var confirmPassword = document.querySelectorAll('input[type="password"]')[1].value;
  var mobileNumber = document.querySelector('input[type="tel"]').value;
  var dateOfBirth = document.querySelector('input[type="date"]').value;
  var gender = document.querySelector('select').value;
  var aadharNumber = document.querySelector('input[type="number"]').value;
  var errorElement = document.querySelector('h2');

  errorElement.textContent = '';


  var usernameRegex = /^[A-Za-z][A-Za-z0-9_]{5,29}$/;
  if (!usernameRegex.test(username)) {
    errorElement.textContent = 'Invalid username';
    return;
  }

  var emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(email)) {
    errorElement.textContent = 'Invalid email address';
    return;
  }

  var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/;
  if (!passwordRegex.test(password)) {
    errorElement.textContent = 'Invalid password. Must have: Uppercase, Lowercase, Special Character, Number, 8-30 characters';

    return;
  }

  if (password !== confirmPassword) {
    errorElement.textContent = 'Passwords do not match';
    return;
  }

  var mobileNumberRegex = /^[6-9][0-9]{9}$/;
  if (!mobileNumberRegex.test(mobileNumber)) {
    errorElement.textContent = 'Invalid mobile number';
    return;
  }
  var currentDate = new Date();
  var selectedDate = new Date(dateOfBirth);
  
  if (!selectedDate || isNaN(selectedDate) || selectedDate > currentDate) {
    errorElement.textContent = 'Please enter a valid date of birth';
    return;
  }
  
  var differenceInYears = currentDate.getFullYear() - selectedDate.getFullYear();
  
  if (differenceInYears < 10) {
    errorElement.textContent = 'You must be at least 10 years old';
    return;
  }
  

  if (gender === '') {
    errorElement.textContent = 'Please select a gender';
    return;
  }

  var aadharNumberRegex = /^[2-9]{1}[0-9]{11}$/;
  if (!aadharNumberRegex.test(aadharNumber)) {
    errorElement.textContent = 'Invalid Aadhar number';
    return;
  }

  var formData = {
    username: username,
    email: email,
    password: password,
    mobileNumber: mobileNumber,
    dateOfBirth: dateOfBirth,
    gender: gender,
    aadharNumber: aadharNumber
  };

  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      if (response.ok) {
        document.location.href = '/public';
      } else {
        if(response.status == 400){
          errorElement.textContent = 'Email Already Exists';
        }else{
        errorElement.textContent = 'Error submitting the form';
        }
      }
    })
    .catch(error => {
      console.error('Error:', error);
      errorElement.textContent = 'Error submitting the form';
    });
}
