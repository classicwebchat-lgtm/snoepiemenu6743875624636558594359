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
const itemsRef = database.ref('items');

document.addEventListener('DOMContentLoaded', () => {
  const displayDiv = document.getElementById('item-display');
  const floatingTotalEl = document.getElementById('floating-total').querySelector('p');

  if (!displayDiv || !floatingTotalEl) {
    console.error("Required elements not found in HTML!");
    return;
  }

  let currentTotal = 0;

  // Render items dynamically
  itemsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    displayDiv.innerHTML = '';

    if (data) {
      Object.keys(data).forEach((key) => {
        const item = data[key];
        const inStock = item.inStock !== false;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-card';
        if (!inStock) itemDiv.classList.add('out-of-stock');

        // Input min is now 0
        itemDiv.innerHTML = `
          <h3>${item.name}</h3>
          <p>Price: R${item.price.toFixed(2)}</p>
          ${inStock ? `
            <input type="number" id="qty-${key}" min="0" placeholder="Qty">
          ` : '<p><em>Out of stock</em></p>'}
        `;

        displayDiv.appendChild(itemDiv);

        // Add input listener for live total update
        if (inStock) {
          const qtyInput = document.getElementById(`qty-${key}`);
          qtyInput.addEventListener('input', updateTotal);
        }
      });
    } else {
      displayDiv.innerHTML = '<p>No items yet.</p>';
    }

    // Update total immediately on render
    updateTotal();
  });

  // Calculate total for all quantities
  function updateTotal() {
    currentTotal = 0;
    itemsRef.once('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        floatingTotalEl.textContent = `Total: R0.00`;
        return;
      }

      Object.keys(data).forEach((key) => {
        const item = data[key];
        const inStock = item.inStock !== false;
        if (!inStock) return;

        const qtyInput = document.getElementById(`qty-${key}`);
        if (qtyInput && qtyInput.value) {
          const qty = parseInt(qtyInput.value);
          if (!isNaN(qty) && qty >= 0) {
            currentTotal += qty * item.price;
          }
        }
      });

      floatingTotalEl.textContent = `Total: R${currentTotal.toFixed(2)}`;
    });
  }
});
