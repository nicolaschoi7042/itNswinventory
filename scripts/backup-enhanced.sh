#!/bin/bash

################################################################################
# ITNSWInventory Enhanced Backup Script
#
# This script creates a comprehensive backup of the ITNSWInventory deployment:
# - PostgreSQL database
# - Environment configuration files
# - Docker Compose files
# - Application files (frontend + backend)
#
# This script enhances the existing full-backup.sh with:
# - Standardized directory structure
# - 7-day retention policy
# - JSON metadata generation
# - Non-interactive execution
#
# Usage: ./backup-enhanced.sh [OPTIONS]
# Options:
#   --database-only      Backup only the database
#   --stop-containers    Stop containers before backup (recommended)
#   --help               Show this help message
################################################################################

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INVENTORY_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_BASE_DIR="/home/roboe/backups/itnswinventory"
LOG_DIR="/home/roboe/backups/logs"

# Container names (try both dev and prod)
POSTGRES_CONTAINER_PROD="it-postgres-prod"
POSTGRES_CONTAINER_DEV="it-inventory-postgres"
BACKEND_CONTAINER_PROD="it-backend-prod"
BACKEND_CONTAINER_DEV="it-inventory-api"

# Configuration
DATABASE_ONLY=false
STOP_CONTAINERS=false
RETENTION_DAYS=7

# Timestamp for backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_BASE_DIR}/inventory_backup_${TIMESTAMP}"
LOG_FILE="${LOG_DIR}/backup_inventory_${TIMESTAMP}.log"

################################################################################
# Functions
################################################################################

log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} $message" | tee -a "$LOG_FILE"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOG_FILE"
            ;;
    esac

    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

show_help() {
    cat << EOF
ITNSWInventory Enhanced Backup Script

Usage: ./backup-enhanced.sh [OPTIONS]

Options:
    --database-only       Backup only the database (skip application files)
    --stop-containers     Stop containers before backup (recommended for consistency)
    --help                Show this help message

Examples:
    ./backup-enhanced.sh                     # Full backup without stopping containers
    ./backup-enhanced.sh --stop-containers   # Full backup with container stop
    ./backup-enhanced.sh --database-only     # Database only backup

The backup will be stored in: ${BACKUP_BASE_DIR}/inventory_backup_YYYYMMDD_HHMMSS/
EOF
    exit 0
}

detect_containers() {
    log INFO "Detecting running containers..."

    # Try to find which postgres container is running
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_PROD}$"; then
        POSTGRES_CONTAINER="$POSTGRES_CONTAINER_PROD"
        BACKEND_CONTAINER="$BACKEND_CONTAINER_PROD"
        COMPOSE_FILE="docker-compose.production.yml"
        log INFO "Detected production deployment"
    elif docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER_DEV}$"; then
        POSTGRES_CONTAINER="$POSTGRES_CONTAINER_DEV"
        BACKEND_CONTAINER="$BACKEND_CONTAINER_DEV"
        COMPOSE_FILE="docker-compose.yml"
        log INFO "Detected development deployment"
    else
        log ERROR "No running PostgreSQL container found"
        log ERROR "Expected: ${POSTGRES_CONTAINER_PROD} or ${POSTGRES_CONTAINER_DEV}"
        exit 1
    fi

    log SUCCESS "Using container: $POSTGRES_CONTAINER"
}

check_prerequisites() {
    log INFO "Checking prerequisites..."

    # Check if Docker is running
    if ! docker ps &>/dev/null; then
        log ERROR "Docker is not running or you don't have permission to access it"
        exit 1
    fi

    # Detect which containers are running
    detect_containers

    # Check if .env file exists
    if [ ! -f "${INVENTORY_DIR}/.env" ] && [ ! -f "${INVENTORY_DIR}/.env.production" ]; then
        log WARNING "Neither .env nor .env.production file found"
    fi

    # Create log directory if it doesn't exist
    mkdir -p "$LOG_DIR"

    log SUCCESS "Prerequisites check passed"
}

stop_containers() {
    if [ "$STOP_CONTAINERS" = true ]; then
        log INFO "Stopping ITNSWInventory containers..."

        cd "$INVENTORY_DIR"
        if docker compose -f "$COMPOSE_FILE" stop -t 30; then
            log SUCCESS "Containers stopped successfully"
            sleep 2
        else
            log WARNING "Failed to stop containers, continuing with backup"
        fi
    else
        log INFO "Containers will remain running during backup"
    fi
}

start_containers() {
    if [ "$STOP_CONTAINERS" = true ]; then
        log INFO "Starting ITNSWInventory containers..."

        cd "$INVENTORY_DIR"
        if docker compose -f "$COMPOSE_FILE" start; then
            log SUCCESS "Containers started successfully"
            sleep 10
        else
            log ERROR "Failed to start containers"
            log ERROR "Please manually start containers: docker compose -f $COMPOSE_FILE start"
        fi
    fi
}

create_backup_structure() {
    log INFO "Creating backup directory structure..."

    mkdir -p "${BACKUP_DIR}"/{database,config,application/{frontend,backend}}

    log SUCCESS "Backup directory created at: ${BACKUP_DIR}"
}

backup_database() {
    log INFO "Backing up PostgreSQL database..."

    # Get database credentials from env file
    local env_file
    if [ -f "${INVENTORY_DIR}/.env" ]; then
        env_file="${INVENTORY_DIR}/.env"
    elif [ -f "${INVENTORY_DIR}/.env.production" ]; then
        env_file="${INVENTORY_DIR}/.env.production"
    else
        log WARNING "No environment file found, using defaults"
        DB_USER="inventory_user"
        DB_NAME="inventory_db"
    fi

    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        source "$env_file"
    fi

    local db_backup_file="${BACKUP_DIR}/database/inventory_db_backup.sql"

    # Backup database using pg_dump
    if docker exec "$POSTGRES_CONTAINER" pg_dump \
        -U "${DB_USER:-inventory_user}" \
        -d "${DB_NAME:-inventory_db}" \
        > "$db_backup_file" 2>/dev/null; then

        # Compress the backup
        gzip "$db_backup_file"

        local db_size=$(du -h "${db_backup_file}.gz" | cut -f1)
        log SUCCESS "Database backup completed (Size: ${db_size})"

        # Verify the backup
        if gunzip -t "${db_backup_file}.gz" 2>/dev/null; then
            log SUCCESS "Database backup integrity verified"
        else
            log ERROR "Database backup integrity check failed"
            return 1
        fi

        # Get database statistics
        log INFO "Gathering database statistics..."
        docker exec "$POSTGRES_CONTAINER" psql -U "${DB_USER:-inventory_user}" -d "${DB_NAME:-inventory_db}" -t -c "
        SELECT
            table_name || ': ' || count || ' records'
        FROM (
            SELECT 'users' as table_name, COUNT(*)::text as count FROM users
            UNION ALL
            SELECT 'employees', COUNT(*)::text FROM employees
            UNION ALL
            SELECT 'hardware', COUNT(*)::text FROM hardware
            UNION ALL
            SELECT 'software', COUNT(*)::text FROM software
            UNION ALL
            SELECT 'assignments', COUNT(*)::text FROM assignments
            UNION ALL
            SELECT 'activities', COUNT(*)::text FROM activities
        ) t;
        " > "${BACKUP_DIR}/database/database_stats.txt" 2>/dev/null

        # Display statistics
        while IFS= read -r line; do
            log INFO "  $line"
        done < "${BACKUP_DIR}/database/database_stats.txt"
    else
        log ERROR "Database backup failed"
        return 1
    fi
}

backup_config_files() {
    log INFO "Backing up configuration files..."

    local config_files_backed_up=0

    # Backup .env file
    if [ -f "${INVENTORY_DIR}/.env" ]; then
        cp -p "${INVENTORY_DIR}/.env" "${BACKUP_DIR}/config/"
        chmod 600 "${BACKUP_DIR}/config/.env"
        log SUCCESS ".env file backed up"
        config_files_backed_up=$((config_files_backed_up + 1))
    fi

    # Backup .env.production file
    if [ -f "${INVENTORY_DIR}/.env.production" ]; then
        cp -p "${INVENTORY_DIR}/.env.production" "${BACKUP_DIR}/config/"
        chmod 600 "${BACKUP_DIR}/config/.env.production"
        log SUCCESS ".env.production file backed up"
        config_files_backed_up=$((config_files_backed_up + 1))
    fi

    # Backup docker-compose files
    if [ -f "${INVENTORY_DIR}/docker-compose.yml" ]; then
        cp -p "${INVENTORY_DIR}/docker-compose.yml" "${BACKUP_DIR}/config/"
        log SUCCESS "docker-compose.yml backed up"
        config_files_backed_up=$((config_files_backed_up + 1))
    fi

    if [ -f "${INVENTORY_DIR}/docker-compose.production.yml" ]; then
        cp -p "${INVENTORY_DIR}/docker-compose.production.yml" "${BACKUP_DIR}/config/"
        log SUCCESS "docker-compose.production.yml backed up"
        config_files_backed_up=$((config_files_backed_up + 1))
    fi

    # Backup nginx configuration
    if [ -f "${INVENTORY_DIR}/nginx.conf" ]; then
        cp -p "${INVENTORY_DIR}/nginx.conf" "${BACKUP_DIR}/config/"
        log SUCCESS "nginx.conf backed up"
    fi

    log SUCCESS "Configuration files backed up (${config_files_backed_up} critical files)"
}

backup_application_files() {
    log INFO "Backing up application files..."

    local app_files_backed_up=0

    # Backup frontend files
    if [ -f "${INVENTORY_DIR}/index.html" ]; then
        cp -p "${INVENTORY_DIR}/index.html" "${BACKUP_DIR}/application/frontend/"
        log SUCCESS "index.html backed up"
        app_files_backed_up=$((app_files_backed_up + 1))
    fi

    if [ -f "${INVENTORY_DIR}/script.js" ]; then
        cp -p "${INVENTORY_DIR}/script.js" "${BACKUP_DIR}/application/frontend/"
        log SUCCESS "script.js backed up"
        app_files_backed_up=$((app_files_backed_up + 1))
    fi

    # Backup CSS files
    for css_file in "${INVENTORY_DIR}"/*.css; do
        if [ -f "$css_file" ]; then
            cp -p "$css_file" "${BACKUP_DIR}/application/frontend/"
            log INFO "$(basename "$css_file") backed up"
        fi
    done

    # Backup favicon
    if [ -f "${INVENTORY_DIR}/favicon.ico" ]; then
        cp -p "${INVENTORY_DIR}/favicon.ico" "${BACKUP_DIR}/application/frontend/"
    fi

    # Backup backend files
    if [ -f "${INVENTORY_DIR}/backend/server.js" ]; then
        cp -p "${INVENTORY_DIR}/backend/server.js" "${BACKUP_DIR}/application/backend/"
        log SUCCESS "backend/server.js backed up"
        app_files_backed_up=$((app_files_backed_up + 1))
    fi

    if [ -f "${INVENTORY_DIR}/backend/package.json" ]; then
        cp -p "${INVENTORY_DIR}/backend/package.json" "${BACKUP_DIR}/application/backend/"
        log SUCCESS "backend/package.json backed up"
    fi

    if [ -f "${INVENTORY_DIR}/backend/database.sql" ]; then
        cp -p "${INVENTORY_DIR}/backend/database.sql" "${BACKUP_DIR}/application/backend/"
        log SUCCESS "backend/database.sql backed up"
    fi

    # Backup backend scripts if they exist
    if [ -d "${INVENTORY_DIR}/backend/scripts" ]; then
        cp -rp "${INVENTORY_DIR}/backend/scripts" "${BACKUP_DIR}/application/backend/"
        log SUCCESS "backend/scripts backed up"
    fi

    log SUCCESS "Application files backed up (${app_files_backed_up} critical files)"
}

generate_metadata() {
    log INFO "Generating backup metadata..."

    local metadata_file="${BACKUP_DIR}/metadata.json"
    local info_file="${BACKUP_DIR}/BACKUP_INFO.txt"

    # Get container status
    local postgres_status=$(docker inspect --format='{{.State.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null || echo "unknown")
    local backend_status=$(docker inspect --format='{{.State.Status}}' "$BACKEND_CONTAINER" 2>/dev/null || echo "unknown")

    # Get database credentials
    local env_file
    if [ -f "${INVENTORY_DIR}/.env" ]; then
        env_file="${INVENTORY_DIR}/.env"
    elif [ -f "${INVENTORY_DIR}/.env.production" ]; then
        env_file="${INVENTORY_DIR}/.env.production"
    fi

    if [ -n "$env_file" ] && [ -f "$env_file" ]; then
        source "$env_file"
    fi

    # Get database statistics
    local db_tables=0
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
        db_tables=$(docker exec "$POSTGRES_CONTAINER" psql -U "${DB_USER:-inventory_user}" -d "${DB_NAME:-inventory_db}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | xargs || echo "0")
    fi

    # Get git commit hash if available
    local git_commit="unknown"
    if [ -d "${INVENTORY_DIR}/.git" ]; then
        git_commit=$(cd "$INVENTORY_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    fi

    # Generate JSON metadata
    cat > "$metadata_file" << EOF
{
  "backup_timestamp": "$(date -Iseconds)",
  "backup_directory": "${BACKUP_DIR}",
  "hostname": "$(hostname)",
  "git_commit": "${git_commit}",
  "deployment_type": "$([ "$COMPOSE_FILE" = "docker-compose.production.yml" ] && echo "production" || echo "development")",
  "containers": {
    "postgres": {
      "name": "${POSTGRES_CONTAINER}",
      "status": "${postgres_status}"
    },
    "backend": {
      "name": "${BACKEND_CONTAINER}",
      "status": "${backend_status}"
    }
  },
  "database": {
    "name": "${DB_NAME:-inventory_db}",
    "user": "${DB_USER:-inventory_user}",
    "tables": ${db_tables}
  },
  "components": {
    "database_backup": "$([ -f "${BACKUP_DIR}/database/inventory_db_backup.sql.gz" ] && echo "true" || echo "false")",
    "config_files": "$([ -d "${BACKUP_DIR}/config" ] && echo "true" || echo "false")",
    "application_files": "$([ -d "${BACKUP_DIR}/application" ] && echo "true" || echo "false")"
  },
  "sizes": {
    "total": "$(du -sh "$BACKUP_DIR" | cut -f1)",
    "database": "$(du -sh "${BACKUP_DIR}/database" 2>/dev/null | cut -f1 || echo "0")",
    "config": "$(du -sh "${BACKUP_DIR}/config" 2>/dev/null | cut -f1 || echo "0")",
    "application": "$(du -sh "${BACKUP_DIR}/application" 2>/dev/null | cut -f1 || echo "0")"
  }
}
EOF

    # Generate human-readable info
    cat > "$info_file" << EOF
================================================================================
ITNSWInventory Backup Information
================================================================================

Backup Created: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)
Backup Directory: ${BACKUP_DIR}
Git Commit: ${git_commit}
Deployment Type: $([ "$COMPOSE_FILE" = "docker-compose.production.yml" ] && echo "Production" || echo "Development")

Container Status:
  - PostgreSQL: ${postgres_status}
  - Backend: ${backend_status}

Database Information:
  - Database: ${DB_NAME:-inventory_db}
  - User: ${DB_USER:-inventory_user}
  - Tables: ${db_tables}

Backup Components:
  ✓ PostgreSQL Database: $([ -f "${BACKUP_DIR}/database/inventory_db_backup.sql.gz" ] && echo "YES" || echo "NO")
  ✓ Configuration Files: $([ -d "${BACKUP_DIR}/config" ] && echo "YES" || echo "NO")
  ✓ Application Files: $([ -d "${BACKUP_DIR}/application" ] && echo "YES" || echo "NO")

Backup Sizes:
  - Total: $(du -sh "$BACKUP_DIR" | cut -f1)
  - Database: $(du -sh "${BACKUP_DIR}/database" 2>/dev/null | cut -f1 || echo "0")
  - Configuration: $(du -sh "${BACKUP_DIR}/config" 2>/dev/null | cut -f1 || echo "0")
  - Application: $(du -sh "${BACKUP_DIR}/application" 2>/dev/null | cut -f1 || echo "0")

Database Statistics:
$(cat "${BACKUP_DIR}/database/database_stats.txt" 2>/dev/null || echo "  Statistics not available")

================================================================================
RESTORE INSTRUCTIONS:
================================================================================
To restore this backup, use the existing restore script:
  cd /home/roboe/workspace/itNswinventory
  ./scripts/restore-db.sh ${BACKUP_DIR}/database/inventory_db_backup.sql.gz

For full system restore, refer to the backup documentation at:
  /home/roboe/backups/README.md

================================================================================
EOF

    log SUCCESS "Metadata generated successfully"
}

cleanup_old_backups() {
    log INFO "Cleaning up backups older than ${RETENTION_DAYS} days..."

    local deleted_count=0
    while IFS= read -r old_backup; do
        log INFO "Removing old backup: $(basename "$old_backup")"
        rm -rf "$old_backup"
        deleted_count=$((deleted_count + 1))
    done < <(find "$BACKUP_BASE_DIR" -maxdepth 1 -name "inventory_backup_*" -type d -mtime +${RETENTION_DAYS} 2>/dev/null)

    if [ $deleted_count -gt 0 ]; then
        log SUCCESS "Removed $deleted_count old backup(s)"
    else
        log INFO "No old backups to remove"
    fi
}

################################################################################
# Main Script
################################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --database-only)
                DATABASE_ONLY=true
                shift
                ;;
            --stop-containers)
                STOP_CONTAINERS=true
                shift
                ;;
            --help)
                show_help
                ;;
            *)
                log ERROR "Unknown option: $1"
                show_help
                ;;
        esac
    done

    log INFO "========================================="
    log INFO "ITNSWInventory Enhanced Backup Script"
    log INFO "========================================="
    log INFO "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log INFO "Backup Directory: ${BACKUP_DIR}"
    log INFO "Database Only: ${DATABASE_ONLY}"
    log INFO "Stop Containers: ${STOP_CONTAINERS}"
    log INFO "========================================="

    # Execute backup steps
    check_prerequisites
    stop_containers
    create_backup_structure

    # Backup components
    local backup_failed=false

    backup_database || backup_failed=true

    if [ "$DATABASE_ONLY" = false ]; then
        backup_config_files || true  # Non-critical
        backup_application_files || true  # Non-critical
    else
        log INFO "Skipping application files (database-only mode)"
    fi

    generate_metadata
    cleanup_old_backups
    start_containers

    # Final summary
    log INFO "========================================="
    if [ "$backup_failed" = false ]; then
        log SUCCESS "ITNSWInventory Backup Completed Successfully!"
        log SUCCESS "Backup Location: ${BACKUP_DIR}"
        log SUCCESS "Backup Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
        log INFO "========================================="
        exit 0
    else
        log ERROR "ITNSWInventory Backup Completed with Errors"
        log ERROR "Please check the log file: ${LOG_FILE}"
        log INFO "========================================="
        exit 1
    fi
}

# Run main function
main "$@"
