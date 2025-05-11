#!/usr/bin/env python3
import os
import sys
import argparse
import shutil
from pathlib import Path
import subprocess

try:
    from termcolor import colored
except ImportError:
    def colored(text, color):
        return text

INDEX_FILE = 'index.ts'
BACKUP_FILE = 'index.ts.bak'

EMOJIS = {
    'info': 'ℹ️',
    'success': '✅',
    'warn': '⚠️',
    'error': '❌',
    'prompt': '👉',
    'input': '⌨️',
    'dir': '📁',
    'write': '✍️',
    'revert': '⏪',
    'exit': '🚪',
    'search': '🔍',
}

COLORS = {
    'info': 'blue',
    'success': 'green',
    'warn': 'yellow',
    'error': 'red',
    'prompt': 'magenta',
    'input': 'cyan',
    'dir': 'yellow',
    'write': 'green',
    'revert': 'yellow',
    'exit': 'red',
    'search': 'cyan',
}

def log(msg, level='info'):
    emoji = EMOJIS.get(level, '')
    color = COLORS.get(level, None)
    print(colored(f"{emoji} {msg}", color))

def get_export_statements(directory):
    files = [f for f in os.listdir(directory)
             if f.endswith('.ts') and not f.endswith('.d.ts') and f != INDEX_FILE]
    return [f"export * from './{os.path.splitext(f)[0]}';" for f in files]

def backup_index(directory):
    index_path = os.path.join(directory, INDEX_FILE)
    backup_path = os.path.join(directory, BACKUP_FILE)
    if os.path.exists(index_path):
        shutil.copy2(index_path, backup_path)
        log('Backed up existing index.ts to index.ts.bak', 'info')

def revert_index(directory):
    backup_path = os.path.join(directory, BACKUP_FILE)
    index_path = os.path.join(directory, INDEX_FILE)
    if os.path.exists(backup_path):
        shutil.copy2(backup_path, index_path)
        log('Reverted index.ts from backup!', 'success')
    else:
        log('No backup found to revert!', 'error')

def write_index(directory, lines, dry_run):
    index_path = os.path.join(directory, INDEX_FILE)
    if dry_run:
        log('Dry run enabled. Would write:', 'info')
        print(colored('\n'.join(lines), 'cyan'))
    else:
        backup_index(directory)
        with open(index_path, 'w') as f:
            f.write('\n'.join(lines) + '\n')
        log('index.ts written!', 'success')

def list_all_dirs(root):
    """Recursively list all directories under root."""
    dirs = []
    for dirpath, dirnames, _ in os.walk(root):
        for d in dirnames:
            dirs.append(os.path.relpath(os.path.join(dirpath, d), root))
    return dirs

def fzf_select(options):
    try:
        proc = subprocess.run(['fzf'], input='\n'.join(options), text=True, capture_output=True)
        if proc.returncode == 0:
            return proc.stdout.strip()
    except Exception:
        pass
    return None

def python_fuzzy_select(options):
    log('Fuzzy search: type part of the directory name and press Enter.', 'search')
    while True:
        query = input(colored(f"{EMOJIS['search']} Search: ", COLORS['search'])).strip().lower()
        matches = [o for o in options if query in o.lower()]
        if not matches:
            log('No matches found. Try again.', 'warn')
            continue
        for idx, m in enumerate(matches):
            print(colored(f"  {idx+1}. {m}", COLORS['dir']))
        inp = input(colored(f"{EMOJIS['input']} Select [1-{len(matches)}] or new search: ", COLORS['input']))
        if inp.isdigit() and 1 <= int(inp) <= len(matches):
            return matches[int(inp)-1]

def prompt_directory():
    repo_root = os.getcwd()
    log('Fuzzy search for the target directory:', 'prompt')
    all_dirs = list_all_dirs(repo_root)
    if not all_dirs:
        log('No directories found in the repository.', 'error')
        sys.exit(1)
    # Prefer fzf if available
    selected = fzf_select(all_dirs)
    if selected:
        log(f"Selected directory: {selected}", 'dir')
        return os.path.abspath(selected)
    # Fallback to python fuzzy
    selected = python_fuzzy_select(all_dirs)
    log(f"Selected directory: {selected}", 'dir')
    return os.path.abspath(selected)

def prompt_action():
    log('Choose an action:', 'prompt')
    print(colored(f"  1. {EMOJIS['write']} Generate barrel file", COLORS['write']))
    print(colored(f"  2. {EMOJIS['write']} Dry run (preview only)", COLORS['write']))
    print(colored(f"  3. {EMOJIS['revert']} Revert to previous index.ts", COLORS['revert']))
    print(colored(f"  4. {EMOJIS['exit']} Exit", COLORS['exit']))
    while True:
        inp = input(colored(f"{EMOJIS['input']} Enter choice [1-4]: ", COLORS['input']))
        if inp.strip() in {'1', '2', '3', '4'}:
            return int(inp.strip())
        else:
            log('Invalid choice. Please enter 1, 2, 3, or 4.', 'error')

def prompt_confirm(msg):
    log(msg + ' (y/n)', 'prompt')
    while True:
        inp = input(colored(f"{EMOJIS['input']} Confirm: ", COLORS['input'])).lower()
        if inp in {'y', 'yes'}:
            return True
        elif inp in {'n', 'no'}:
            return False
        else:
            log('Please enter y or n.', 'error')

def interactive_menu():
    directory = prompt_directory()
    while True:
        action = prompt_action()
        if action == 1:
            lines = get_export_statements(directory)
            if not lines:
                log('No .ts files found to export!', 'warn')
                continue
            print(colored('\n'.join(lines), 'cyan'))
            if prompt_confirm('Write this to index.ts?'):
                write_index(directory, lines, dry_run=False)
        elif action == 2:
            lines = get_export_statements(directory)
            if not lines:
                log('No .ts files found to export!', 'warn')
                continue
            log('Dry run enabled. Would write:', 'info')
            print(colored('\n'.join(lines), 'cyan'))
        elif action == 3:
            if prompt_confirm('Are you sure you want to revert index.ts from backup?'):
                revert_index(directory)
        elif action == 4:
            log('Exiting. Goodbye!', 'exit')
            break

def main():
    parser = argparse.ArgumentParser(description='Generate a TypeScript barrel file (index.ts) for a directory.')
    parser.add_argument('--dir', '-d', help='Target directory')
    parser.add_argument('--dry-run', '-n', action='store_true', help='Dry run (no changes written)')
    parser.add_argument('--revert', '-r', action='store_true', help='Revert to previous index.ts')
    args = parser.parse_args()

    if not args.dir and not args.dry_run and not args.revert:
        interactive_menu()
        return

    if not args.dir:
        log('You must specify --dir for non-interactive mode.', 'error')
        sys.exit(1)

    directory = os.path.abspath(args.dir)
    if not os.path.isdir(directory):
        log(f'Directory not found: {directory}', 'error')
        sys.exit(1)

    if args.revert:
        revert_index(directory)
        return

    log(f'Generating barrel file for {directory}', 'info')
    lines = get_export_statements(directory)
    if not lines:
        log('No .ts files found to export!', 'warn')
        return
    write_index(directory, lines, args.dry_run)

if __name__ == '__main__':
    main() 