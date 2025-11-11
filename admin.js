// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJLWZALQ16kY6a2n_s78dLtd8IcngbSSQ",
    authDomain: "snoepie-b6b51.firebaseapp.com",
    databaseURL: "https://snoepie-b6b51-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "snoepie-b6b51",
    storageBucket: "snoepie-b6b51.firebasestorage.app",
    messagingSenderId: "641299312197",
    appId: "1:641299312197:web:dca2f6de92c55107257d2c",
    measurementId: "G-52XW256RGP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM elements
const addButton = document.getElementById('add_item');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');
const displayDiv = document.getElementById('item-list');

// Add new item
addButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);

    if (name && !isNaN(price)) {
        const itemsRef = database.ref('items');
        itemsRef.push({
            name: name,
            price: price,
            inStock: true
        })
            .then(() => {
                nameInput.value = '';
                priceInput.value = '';
            })
            .catch((error) => alert("Error adding item: " + error.message));
    } else {
        alert("Please enter both a name and valid price.");
    }
});

// Live list of items
const itemsRef = database.ref('items');
itemsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    displayDiv.innerHTML = '';

    if (data) {
        Object.keys(data).forEach((key) => {
            const item = data[key];
            const itemDiv = document.createElement('div');
            itemDiv.className = 'admin-item';

            // strikethrough if out of stock
            itemDiv.style.textDecoration = item.inStock ? 'none' : 'line-through';
            itemDiv.style.color = item.inStock ? 'black' : 'red';

            itemDiv.innerHTML = `
                <div id="dingdong">
                    <h3>${item.name}</h3>
                    <p id="admin-price">Price: R${item.price.toFixed(2)}</p>
                    <label>
                        <input type="checkbox" id="stock-${key}" ${item.inStock ? 'checked' : ''}>
                        In Stock
                    </label>
                    <button id="delete-${key}" class="delete-btn">Delete</button>
                <div id="dingdong">
            `;

            const checkbox = itemDiv.querySelector('input[type="checkbox"]');
            const deleteButton = itemDiv.querySelector('button');

            // toggle stock
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    const updatedStatus = checkbox.checked;
                    database.ref(`items/${key}/inStock`).set(updatedStatus);
                });
            };

            // delete item
            deleteButton.addEventListener('click', () => {
                if (confirm(`Delete "${item.name}"?`)) {
                    database.ref('items/' + key).remove();
                }
            });

            displayDiv.appendChild(itemDiv);
        });
    } else {
        displayDiv.innerHTML = '<p>No items yet.</p>';
    }
});
