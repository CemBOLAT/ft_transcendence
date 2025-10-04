function checkImgJs()
{
    const imgs = document.querySelectorAll('img');
    for (let i = 0; i < imgs.length; i++)
    {
        fetch(imgs[i].src, {
            method: 'GET'
        }).then(response => {
            if (!response.ok)
            {
                imgs[i].src = '/imgs/42.webp';
            }
        })
    }
}
