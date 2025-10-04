function showAlert(message, type = 0)
{
    const alert = document.querySelector('#status-alert');
    
    if (type == 0)
        alert.setAttribute('class', 'alert alert-success')
    else
        alert.setAttribute('class', 'alert alert-danger')

    alert.innerHTML = message;
}