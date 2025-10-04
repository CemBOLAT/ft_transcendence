function isExistOnLocalStorage(key)
{
    for (let i = 0; i < localStorage.key.length; i++)
    {
        if (localStorage.key[i] === key)
            return true;
    }
    return false;
}