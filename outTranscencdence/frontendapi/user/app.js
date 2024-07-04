/*
fetch(`http://localhost:8000/user/${user_id}/`)
    .then(response => response.json())
    .then(data => {
        console.log(data);

        // Extract user data
        const { id, username, email, friends, games } = data;

        // HTML structure
        let htmlOfProfile = `
            <div>
                <h2>User Profile</h2>
                <p>ID: ${id}</p>
                <p>Username: ${username}</p>
                <p>Email: ${email}</p>
                <h3>Friends:</h3>
                <ul>
        `;

        // List friends
        friends.forEach(friend => {
            htmlOfProfile += `<li>${friend.username}</li>`;
        });

        htmlOfProfile += `
                </ul>
                <h3>Game History:</h3>
                <ul>
        `;

        // List games
        games.forEach(game => {
            htmlOfProfile += `<li>${game.name}</li>`;
        });

        htmlOfProfile += `
                </ul>
                <h3>Actions:</h3>
                <form id="actionsForm">
                    <label for="addFriend">Add Friend:</label>
                    <input type="text" id="addFriend" name="addFriend">
                    <button type="submit">Add</button>
                    <br>
                    <label for="removeFriend">Remove Friend:</label>
                    <input type="text" id="removeFriend" name="removeFriend">
                    <button type="submit">Remove</button>
                    <br>
                    <label for="changePassword">Change Password:</label>
                    <input type="password" id="changePassword" name="changePassword">
                    <button type="submit">Change</button>
                    <br>
                    <label for="changeUsername">Change Username:</label>
                    <input type="text" id="changeUsername" name="changeUsername">
                    <button type="submit">Change</button>
                </form>
            </div>
        `;

        // Append to the body or any other container
        document.body.innerHTML = htmlOfProfile;

        // Optional: Handle form submissions for add/remove friend, change password, change username
        const actionsForm = document.getElementById('actionsForm');
        actionsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(actionsForm);
            // Handle form submission logic here (e.g., fetch POST requests to API endpoints)
        });
    })
    .catch(error => console.error('Error:', error));


*/

document.addEventListener('DOMContentLoaded', function() {
    let body = document.querySelector('body');

    fetch(`http://localhost:8000/user/2`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        // Extract user data
        const { id, username, email, friends, games } = data;

        // HTML structure
        let htmlOfProfile = `
            <div>
                <h2>User Profile</h2>
                <p>ID: ${id}</p>
                <p>Username: ${username}</p>
                <p>Email: ${email}</p>
                <h3>Friends:</h3>
                <ul>
        `;

        // List friends
        friends.forEach(friend => {
            htmlOfProfile += `<li>${friend.username}</li>`;
        });

        htmlOfProfile += `
                </ul>
                <h3>Game History:</h3>
                <ul>
        `;

        // List games
        games.forEach(game => {
            htmlOfProfile += `<li>${game.name}</li>`;
        });

        htmlOfProfile += `
                </ul>
                <h3>Actions:</h3>
                <form id="actionsForm">
                    <label for="addFriend">Add Friend:</label>
                    <input type="text" id="addFriend" name="addFriend">
                    <button type="submit">Add</button>
                    <br>
                    <label for="removeFriend">Remove Friend:</label>
                    <input type="text" id="removeFriend" name="removeFriend">
                    <button type="submit">Remove</button>
                    <br>
                    <label for="changePassword">Change Password:</label>
                    <input type="password" id="changePassword" name="changePassword">
                    <button type="submit">Change</button>
                    <br>
                    <label for="changeUsername">Change Username:</label>
                    <input type="text" id="changeUsername" name="changeUsername">
                    <button type="submit">Change</button>
                </form>
            </div>
        `;

        // Append HTML to the body
        body.innerHTML = htmlOfProfile;

        // Handle form submissions
        const actionsForm = document.getElementById('actionsForm');
        actionsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(actionsForm);
            // Implement fetch requests based on form submission
            // Example: fetch('/api/addFriend', { method: 'POST', body: formData })
        });
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle errors or display a message to the user
    });
});
