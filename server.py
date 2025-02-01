from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dummy data for demonstration
dummy_captured_sessions = [
    {"email": "user1@example.com", "password": "pass1", "cookies": "cookie1", "ip": "192.168.1.10"},
    {"email": "user2@example.com", "password": "pass2", "cookies": "cookie2", "ip": "192.168.1.11"}
]

dummy_generated_links = [
    {"url": "http://phish.link/abc123", "clicked_location": "USA", "ip": "203.0.113.1"},
    {"url": "http://phish.link/def456", "clicked_location": "UK", "ip": "203.0.113.2"}
]

@app.route('/generate_link', methods=['GET'])
def generate_link():
    phishlet = request.args.get("phishlet")
    if phishlet:
        link = f"http://phish.link/{phishlet}_dummy"
    else:
        link = "http://phish.link/generic_dummy"
    return jsonify({"link": link})

@app.route('/captured_sessions', methods=['GET'])
def captured_sessions():
    return jsonify(dummy_captured_sessions)

@app.route('/generated_links', methods=['GET'])
def generated_links():
    return jsonify(dummy_generated_links)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
