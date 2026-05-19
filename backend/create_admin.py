"""
create_admin.py — Create or update an admin account in the database.

Usage (run from the backend/ directory):
    python create_admin.py
    python create_admin.py --username admin --password secret123 --name "Platform Admin"

If no arguments are given, it prompts interactively.
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime

# Ensure the backend directory is on sys.path so local imports work
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import SessionLocal, engine, Base
from models.models import Admin
from auth import hash_password


def create_or_update_admin(username: str, password: str, name: str = "", email: str = "") -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.username == username).first()
        hashed = hash_password(password)

        if existing:
            existing.password = hashed
            if name:
                existing.name = name
            if email:
                existing.email = email
            db.commit()
            print(f"[✓] Admin '{username}' password updated successfully.")
        else:
            admin = Admin(
                username=username,
                password=hashed,
                name=name or username,
                email=email,
                created_at=datetime.utcnow().isoformat(),
            )
            db.add(admin)
            db.commit()
            print(f"[✓] Admin '{username}' created successfully.")

        # Show all admins
        admins = db.query(Admin).all()
        print(f"\nCurrent admins ({len(admins)}):")
        for a in admins:
            print(f"  • {a.username}  |  {a.name or '—'}  |  {a.email or '—'}  |  created {a.created_at[:10]}")

    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Create or update an admin account.")
    parser.add_argument("--username", help="Admin username")
    parser.add_argument("--password", help="Admin password")
    parser.add_argument("--name",     help="Display name (optional)", default="")
    parser.add_argument("--email",    help="Email address (optional)", default="")
    args = parser.parse_args()

    username = args.username
    password = args.password

    # Fall back to interactive prompts if not provided via CLI
    if not username:
        username = input("Admin username: ").strip()
    if not username:
        print("[✗] Username cannot be empty.")
        sys.exit(1)

    if not password:
        import getpass
        password = getpass.getpass("Admin password: ")
        confirm  = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("[✗] Passwords do not match.")
            sys.exit(1)

    if len(password) < 6:
        print("[✗] Password must be at least 6 characters.")
        sys.exit(1)

    name  = args.name  or input("Display name (press Enter to skip): ").strip()
    email = args.email or input("Email (press Enter to skip): ").strip()

    create_or_update_admin(username, password, name, email)


if __name__ == "__main__":
    main()
