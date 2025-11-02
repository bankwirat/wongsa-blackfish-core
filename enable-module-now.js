// Quick script to enable sales-order module
// Run this in browser console after logging in

const token = document.cookie.match(/access_token=([^;]+)/)?.[1];

if (!token) {
  console.error('❌ No auth token found. Please log in first.');
} else {
  fetch('http://localhost:3000/modules/sales-order/enable', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Module enabled!', data);
    console.log('🔄 Reloading page in 2 seconds...');
    setTimeout(() => window.location.reload(), 2000);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    alert('Error enabling module. Check console for details.');
  });
}
