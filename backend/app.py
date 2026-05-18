from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
import random

app = Flask(__name__)
CORS(app)

DB_NAME = "cargo.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            is_approved BOOLEAN DEFAULT 0,
            two_fa_enabled BOOLEAN DEFAULT 1
        )
    ''')
    
    # Inspections table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_of_lading TEXT NOT NULL,
            origin_port TEXT NOT NULL,
            cargo_type TEXT NOT NULL,
            weight REAL NOT NULL,
            image_url TEXT,
            risk_level TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            notes TEXT,
            inspector_email TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Audit Logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            user_role TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed default users if empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        users = [
            ("sysadmin", "pass", "sysadmin@nmpa.gov", "system_admin", 1, 1),
            ("auth1", "pass", "auth1@nmpa.gov", "port_authority", 1, 1),
            ("inspector1", "pass", "inspector1@nmpa.gov", "inspector", 1, 1)
        ]
        cursor.executemany("INSERT INTO users (username, password, email, role, is_approved, two_fa_enabled) VALUES (?, ?, ?, ?, ?, ?)", users)
        
    conn.commit()
    conn.close()

def log_action(action, role, details=""):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO audit_logs (action, user_role, details) VALUES (?, ?, ?)", (action, role, details))
    conn.commit()
    conn.close()

# Simulated Email Sending
def send_email_notification(to_email, subject, body):
    # In a real app, use SMTP or an email API like SendGrid
    print(f"--- MOCK EMAIL SENT ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print(f"-----------------------")
    log_action("Email Sent", "System", f"Sent to {to_email} - Subject: {subject}")

# AI Engine
def ai_risk_assessment(cargo_data):
    risk_score = 0
    cargo_type = cargo_data.get('cargoType', '').lower()
    origin_port = cargo_data.get('originPort', '').lower()
    weight = float(cargo_data.get('weight', 0))

    if cargo_type == 'hazardous': risk_score += 50
    elif cargo_type == 'perishable': risk_score += 20
        
    high_risk_ports = ['high-risk-port', 'sanctioned', 'unknown']
    if any(port in origin_port for port in high_risk_ports): risk_score += 40
        
    if weight > 10000: risk_score += 15
    risk_score += random.randint(-5, 5)
    
    if risk_score >= 50: return 'High'
    elif risk_score >= 30: return 'Medium'
    else: return 'Low'

# ---- USER AUTH & MANAGEMENT ENDPOINTS ----

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, role, is_approved, two_fa_enabled FROM users WHERE username=? AND password=? AND role=?", (username, password, role))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        if not user[4]: # is_approved
            return jsonify({"status": "error", "message": "Account pending approval from System Admin."}), 403
        log_action("Login", role, f"User {username} logged in")
        return jsonify({
            "status": "success", 
            "user": {"id": user[0], "username": user[1], "email": user[2], "role": user[3], "two_fa_enabled": user[5]}
        }), 200
    return jsonify({"status": "error", "message": "Invalid credentials or role."}), 401

@app.route('/api/users', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_users():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    if request.method == 'GET':
        cursor.execute("SELECT id, username, email, role, is_approved, two_fa_enabled FROM users")
        users = [{"id": r[0], "username": r[1], "email": r[2], "role": r[3], "is_approved": bool(r[4]), "two_fa_enabled": bool(r[5])} for r in cursor.fetchall()]
        conn.close()
        return jsonify(users), 200
        
    elif request.method == 'POST':
        # Create user (used by sysadmin or registration)
        data = request.json
        try:
            cursor.execute("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)", 
                           (data['username'], data['password'], data['email'], data['role']))
            conn.commit()
            log_action("Create User", "system_admin", f"Created user {data['username']}")
            conn.close()
            return jsonify({"status": "success"}), 201
        except sqlite3.IntegrityError:
            return jsonify({"status": "error", "message": "Username already exists"}), 400
            
    elif request.method == 'PUT':
        # Approve user or toggle 2FA
        data = request.json
        user_id = data.get('id')
        action = data.get('action') # 'approve' or 'toggle_2fa'
        
        if action == 'approve':
            cursor.execute("UPDATE users SET is_approved=1 WHERE id=?", (user_id,))
            cursor.execute("SELECT email, username FROM users WHERE id=?", (user_id,))
            user_data = cursor.fetchone()
            log_action("Approve User", "system_admin", f"Approved user ID {user_id}")
            if user_data:
                send_email_notification(user_data[0], "Account Approved", f"Hello {user_data[1]}, your NMPA account has been approved by the System Admin.")
        elif action == 'toggle_2fa':
            cursor.execute("UPDATE users SET two_fa_enabled = NOT two_fa_enabled WHERE id=?", (user_id,))
            log_action("Toggle 2FA", "system_admin", f"Toggled 2FA for user ID {user_id}")
            
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200
        
    elif request.method == 'DELETE':
        user_id = request.args.get('id')
        cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
        log_action("Delete User", "system_admin", f"Deleted user ID {user_id}")
        conn.commit()
        conn.close()
        return jsonify({"status": "success"}), 200

# ---- INSPECTION ENDPOINTS ----

@app.route('/api/evaluate', methods=['POST'])
def evaluate_cargo():
    data = request.json
    risk_level = ai_risk_assessment(data)
    inspector_email = data.get('inspectorEmail', 'unknown@nmpa.gov')
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO inspections (bill_of_lading, origin_port, cargo_type, weight, image_url, risk_level, inspector_email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (data.get('billOfLading'), data.get('originPort'), data.get('cargoType'), float(data.get('weight', 0)), data.get('imageUrl'), risk_level, inspector_email))
    
    inspection_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    log_action("Submit Cargo", "inspector", f"BoL {data.get('billOfLading')} submitted by {inspector_email}")
    return jsonify({"id": inspection_id, "risk_level": risk_level, "status": "Pending"}), 200

@app.route('/api/inspections', methods=['GET'])
def get_inspections():
    inspector_email = request.args.get('inspectorEmail')
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    if inspector_email:
        cursor.execute('SELECT * FROM inspections WHERE inspector_email=? ORDER BY id DESC', (inspector_email,))
    else:
        cursor.execute('SELECT * FROM inspections ORDER BY id DESC')
        
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        result.append({
            "id": row[0], "bill_of_lading": row[1], "origin_port": row[2], 
            "cargo_type": row[3], "weight": row[4], "image_url": row[5], 
            "risk_level": row[6], "status": row[7], "notes": row[8],
            "inspector_email": row[9], "date": row[10]
        })
    return jsonify(result), 200

@app.route('/api/inspections/review', methods=['POST'])
def review_inspection():
    data = request.json
    inspection_id = data.get('id')
    status = data.get('status') # 'Approved' or 'Rejected'
    notes = data.get('notes')
    
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("UPDATE inspections SET status=?, notes=? WHERE id=?", (status, notes, inspection_id))
    
    # Get inspector email to send notification
    cursor.execute("SELECT inspector_email, bill_of_lading FROM inspections WHERE id=?", (inspection_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    
    if row:
        inspector_email, bol = row
        subject = f"Cargo Inspection {status} - {bol}"
        body = f"Your cargo submission for Bill of Lading {bol} has been {status} by the Port Authority.\nNotes: {notes}"
        send_email_notification(inspector_email, subject, body)
        
    log_action("Review Inspection", "port_authority", f"Inspection {inspection_id} marked as {status}")
    return jsonify({"status": "success"}), 200

@app.route('/api/logs', methods=['GET'])
def get_logs():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC")
    logs = [{"id": r[0], "action": r[1], "role": r[2], "details": r[3], "date": r[4]} for r in cursor.fetchall()]
    conn.close()
    return jsonify(logs), 200

if __name__ == '__main__':
    init_db()
    app.run(port=5000, debug=True)
