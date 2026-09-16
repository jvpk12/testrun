const scriptURL = 'https://script.google.com/macros/s/AKfycbwLKQRm7ZwLivmx9Km_glnoKU3I2I9nrNlY3tcXdgQoW0LpCP609ValcGiYXIqk2-Ss/exec';
const form = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const statusMsg = document.getElementById('statusMsg');

form.addEventListener('submit', e => {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    statusMsg.classList.add('hidden');

    const formData = {
        name: document.getElementById('name').value,
        attendance: document.querySelector('input[name="attendance"]:checked').value
    };

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // Necessary for Google Apps Script cross-origin handling
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(() => {
        statusMsg.textContent = 'Thank you! Your response has been recorded.';
        statusMsg.className = 'text-center text-sm mt-2 text-green-600 font-medium';
        statusMsg.classList.remove('hidden');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Response';
    })
    .catch(error => {
        statusMsg.textContent = 'Error! Please try again.';
        statusMsg.className = 'text-center text-sm mt-2 text-red-600 font-medium';
        statusMsg.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Response';
    });
});
