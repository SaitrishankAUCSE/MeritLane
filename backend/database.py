import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase
try:
    if not firebase_admin._apps:
        # Use application default credentials or explicit cert
        # This mirrors the Node.js admin SDK setup
        firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Warning: Firebase not fully initialized: {e}")
    db = None

# Initialize MySQL
def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "meritlane")
        )
        return conn
    except Exception as e:
        print(f"Warning: MySQL not connected: {e}")
        return None
