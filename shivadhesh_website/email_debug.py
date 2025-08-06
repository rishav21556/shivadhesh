# email_debug.py - Place this in your project root directory
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

# Get credentials from .env
email = os.getenv('EMAIL_ID')
password = os.getenv('EMAIL_PW')

print(f"Email: {email}")
print(f"Password length: {len(password) if password else 'None'}")
print(f"Password (first 4 chars): {password[:4] if password else 'None'}")

# Test SMTP connection
try:
    print("\n--- Testing SMTP Connection ---")
    
    # Connect to Gmail SMTP server
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()  # Enable security
    
    print("✓ Connected to Gmail SMTP server")
    
    # Try to login
    server.login(email, password)
    print("✓ Login successful!")
    
    # Send test email
    msg = MIMEText("Test email from Django debug script")
    msg['Subject'] = 'Django Email Test'
    msg['From'] = email
    msg['To'] = email  # Send to yourself
    
    server.send_message(msg)
    print("✓ Email sent successfully!")
    
    server.quit()
    print("✓ Connection closed")
    
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ Authentication failed: {e}")
    print("\nPossible issues:")
    print("1. App Password not generated correctly")
    print("2. 2FA not enabled on Gmail")
    print("3. Wrong email/password in .env file")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n--- Debugging Info ---")
print("Make sure:")
print("1. 2FA is enabled on your Gmail account")
print("2. App Password is generated (not regular password)")
print("3. .env file has correct EMAIL_ID and EMAIL_PW")
print("4. No extra spaces or quotes in .env file")