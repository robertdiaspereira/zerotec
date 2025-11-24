"""
Database Backup Script for ZeroTec
Supports both SQLite (local) and PostgreSQL (production)
"""

import os
import sys
import django
from datetime import datetime
import shutil
import subprocess

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.conf import settings
from django.core.management import call_command


def backup_sqlite():
    """Backup SQLite database"""
    db_path = settings.DATABASES['default']['NAME']
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return False
    
    # Create backups directory
    backup_dir = os.path.join(os.path.dirname(db_path), 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'zerotec_backup_{timestamp}.sqlite3'
    backup_path = os.path.join(backup_dir, backup_filename)
    
    # Copy database file
    try:
        shutil.copy2(db_path, backup_path)
        file_size = os.path.getsize(backup_path) / (1024 * 1024)  # MB
        print(f"✅ Backup criado com sucesso!")
        print(f"📁 Arquivo: {backup_path}")
        print(f"📊 Tamanho: {file_size:.2f} MB")
        
        # Keep only last 10 backups
        cleanup_old_backups(backup_dir, keep=10)
        
        return True
    except Exception as e:
        print(f"❌ Erro ao criar backup: {e}")
        return False


def backup_postgresql():
    """Backup PostgreSQL database"""
    db_config = settings.DATABASES['default']
    
    # Create backups directory
    backup_dir = 'backups'
    os.makedirs(backup_dir, exist_ok=True)
    
    # Generate backup filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'zerotec_backup_{timestamp}.sql'
    backup_path = os.path.join(backup_dir, backup_filename)
    
    # Build pg_dump command
    cmd = [
        'pg_dump',
        '-h', db_config.get('HOST', 'localhost'),
        '-p', str(db_config.get('PORT', 5432)),
        '-U', db_config['USER'],
        '-d', db_config['NAME'],
        '-f', backup_path,
        '--no-owner',
        '--no-acl'
    ]
    
    # Set password environment variable
    env = os.environ.copy()
    env['PGPASSWORD'] = db_config['PASSWORD']
    
    try:
        subprocess.run(cmd, env=env, check=True, capture_output=True)
        file_size = os.path.getsize(backup_path) / (1024 * 1024)  # MB
        print(f"✅ Backup criado com sucesso!")
        print(f"📁 Arquivo: {backup_path}")
        print(f"📊 Tamanho: {file_size:.2f} MB")
        
        # Compress backup
        compress_backup(backup_path)
        
        # Keep only last 10 backups
        cleanup_old_backups(backup_dir, keep=10)
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao criar backup: {e.stderr.decode()}")
        return False
    except Exception as e:
        print(f"❌ Erro ao criar backup: {e}")
        return False


def compress_backup(backup_path):
    """Compress backup file using gzip"""
    try:
        import gzip
        
        compressed_path = f"{backup_path}.gz"
        
        with open(backup_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remove uncompressed file
        os.remove(backup_path)
        
        original_size = os.path.getsize(backup_path) / (1024 * 1024)
        compressed_size = os.path.getsize(compressed_path) / (1024 * 1024)
        ratio = (1 - compressed_size / original_size) * 100
        
        print(f"🗜️  Backup comprimido: {compressed_path}")
        print(f"📉 Redução: {ratio:.1f}%")
        
    except Exception as e:
        print(f"⚠️  Erro ao comprimir: {e}")


def cleanup_old_backups(backup_dir, keep=10):
    """Keep only the most recent backups"""
    try:
        # Get all backup files
        backups = []
        for filename in os.listdir(backup_dir):
            if filename.startswith('zerotec_backup_'):
                filepath = os.path.join(backup_dir, filename)
                backups.append((filepath, os.path.getmtime(filepath)))
        
        # Sort by modification time (newest first)
        backups.sort(key=lambda x: x[1], reverse=True)
        
        # Remove old backups
        removed = 0
        for filepath, _ in backups[keep:]:
            os.remove(filepath)
            removed += 1
        
        if removed > 0:
            print(f"🗑️  Removidos {removed} backups antigos")
            print(f"📦 Mantidos {min(len(backups), keep)} backups mais recentes")
            
    except Exception as e:
        print(f"⚠️  Erro ao limpar backups antigos: {e}")


def main():
    """Main backup function"""
    print("=" * 50)
    print("🔄 ZeroTec - Backup do Banco de Dados")
    print("=" * 50)
    print()
    
    db_engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in db_engine:
        print("📊 Tipo: SQLite")
        success = backup_sqlite()
    elif 'postgresql' in db_engine:
        print("📊 Tipo: PostgreSQL")
        success = backup_postgresql()
    else:
        print(f"❌ Banco de dados não suportado: {db_engine}")
        success = False
    
    print()
    print("=" * 50)
    
    if success:
        print("✅ Backup concluído com sucesso!")
    else:
        print("❌ Backup falhou!")
        sys.exit(1)


if __name__ == '__main__':
    main()
