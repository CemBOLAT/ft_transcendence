function showAuthDiv(isActive)
{
    const authDiv = document.querySelector('#auth-div-js')
    const toggleButton = document.querySelector('#navToggleBtn')
    if (isActive)
    {
        authDiv.setAttribute("style", "")
        toggleButton.setAttribute("style", "")
    }
    else
    {
        authDiv.setAttribute("style", "display: none;")
        toggleButton.setAttribute("style", "display: none;")
    }
}