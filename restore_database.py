"""
Database Restore Script for ZeroTec
Supports both SQLite (local) and PostgreSQL (production)
"""

import os
import sys
import django
import shutil
import subprocess
import glob

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.conf import settings


def list_backups():
    """List available backups"""
    db_engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in db_engine:
        db_path = settings.DATABASES['default']['NAME']
        backup_dir = os.path.join(os.path.dirname(db_path), 'backups')
        pattern = 'zerotec_backup_*.sqlite3'
    else:
        backup_dir = 'backups'
        pattern = 'zerotec_backup_*.sql*'
    
    if not os.path.exists(backup_dir):
        print("❌ Nenhum backup encontrado!")
        return []
    
    # Find backup files
    backup_files = glob.glob(os.path.join(backup_dir, pattern))
    backup_files.sort(reverse=True)  # Newest first
    
    return backup_files


def restore_sqlite(backup_path):
    """Restore SQLite database"""
    db_path = settings.DATABASES['default']['NAME']
    
    if not os.path.exists(backup_path):
        print(f"❌ Backup não encontrado: {backup_path}")
        return False
    
    try:
        # Create backup of current database
        if os.path.exists(db_path):
            current_backup = f"{db_path}.before_restore"
            shutil.copy2(db_path, current_backup)
            print(f"📦 Backup atual salvo em: {current_backup}")
        
        # Restore backup
        shutil.copy2(backup_path, db_path)
        
        print(f"✅ Database restaurado com sucesso!")
        print(f"📁 De: {backup_path}")
        print(f"📁 Para: {db_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao restaurar: {e}")
        return False


def restore_postgresql(backup_path):
    """Restore PostgreSQL database"""
    db_config = settings.DATABASES['default']
    
    if not os.path.exists(backup_path):
        print(f"❌ Backup não encontrado: {backup_path}")
        return False
    
    # Decompress if needed
    if backup_path.endswith('.gz'):
        import gzip
        decompressed_path = backup_path[:-3]
        
        try:
            with gzip.open(backup_path, 'rb') as f_in:
                with open(decompressed_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            backup_path = decompressed_path
            print(f"🗜️  Backup descomprimido")
        except Exception as e:
            print(f"❌ Erro ao descomprimir: {e}")
            return False
    
    # Build psql command
    cmd = [
        'psql',
        '-h', db_config.get('HOST', 'localhost'),
        '-p', str(db_config.get('PORT', 5432)),
        '-U', db_config['USER'],
        '-d', db_config['NAME'],
        '-f', backup_path
    ]
    
    # Set password environment variable
    env = os.environ.copy()
    env['PGPASSWORD'] = db_config['PASSWORD']
    
    try:
        # Drop and recreate database (optional, comment if not needed)
        print("⚠️  ATENÇÃO: Isso vai APAGAR todos os dados atuais!")
        confirm = input("Digite 'SIM' para confirmar: ")
        
        if confirm != 'SIM':
            print("❌ Restauração cancelada")
            return False
        
        subprocess.run(cmd, env=env, check=True, capture_output=True)
        
        print(f"✅ Database restaurado com sucesso!")
        print(f"📁 De: {backup_path}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao restaurar: {e.stderr.decode()}")
        return False
    except Exception as e:
        print(f"❌ Erro ao restaurar: {e}")
        return False


def main():
    """Main restore function"""
    print("=" * 50)
    print("🔄 ZeroTec - Restore do Banco de Dados")
    print("=" * 50)
    print()
    
    # List available backups
    backups = list_backups()
    
    if not backups:
        print("❌ Nenhum backup disponível!")
        sys.exit(1)
    
    print("📦 Backups disponíveis:")
    print()
    
    for i, backup in enumerate(backups, 1):
        filename = os.path.basename(backup)
        size = os.path.getsize(backup) / (1024 * 1024)  # MB
        print(f"{i}. {filename} ({size:.2f} MB)")
    
    print()
    
    # Select backup
    try:
        choice = int(input("Escolha o backup (número): "))
        if choice < 1 or choice > len(backups):
            print("❌ Opção inválida!")
            sys.exit(1)
        
        selected_backup = backups[choice - 1]
        
    except ValueError:
        print("❌ Entrada inválida!")
        sys.exit(1)
    
    print()
    print(f"📁 Backup selecionado: {os.path.basename(selected_backup)}")
    print()
    
    # Restore
    db_engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in db_engine:
        print("📊 Tipo: SQLite")
        success = restore_sqlite(selected_backup)
    elif 'postgresql' in db_engine:
        print("📊 Tipo: PostgreSQL")
        success = restore_postgresql(selected_backup)
    else:
        print(f"❌ Banco de dados não suportado: {db_engine}")
        success = False
    
    print()
    print("=" * 50)
    
    if success:
        print("✅ Restore concluído com sucesso!")
    else:
        print("❌ Restore falhou!")
        sys.exit(1)


if __name__ == '__main__':
    main()
