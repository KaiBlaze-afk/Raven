import requests
from pyngrok import ngrok
import http.server
import socketserver
import threading
import time
import os

SERVER_URL = "http://raveneye.glitch.me/upurl"
UPLOAD_DIRECTORY = "uploads"

os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

class FileUploadHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        content_type = self.headers['Content-Type']

        if "multipart/form-data" in content_type:
            boundary = content_type.split("boundary=")[1]
            boundary_bytes = f"--{boundary}".encode()

            file_data = self.rfile.read(content_length).split(boundary_bytes)
            for part in file_data:
                if b"Content-Disposition" in part:
                    headers, body = part.split(b"\r\n\r\n", 1)
                    filename = headers.split(b'filename="')[1].split(b'"')[0].decode()

                    with open(os.path.join(UPLOAD_DIRECTORY, filename), "wb") as f:
                        f.write(body.strip(b"\r\n--"))

                    self.send_response(200)
                    self.end_headers()
                    self.wfile.write(b"File uploaded successfully.")
                    return

        self.send_response(400)
        self.end_headers()
        self.wfile.write(b"Invalid request.")

def start_local_server():
    handler = FileUploadHTTPRequestHandler
    with socketserver.TCPServer(("", 8000), handler) as httpd:
        print("Serving at port 8000")
        httpd.serve_forever()

def send_ngrok_url_to_server(ngrok_url):
    try:
        response = requests.post(SERVER_URL, json={"ngrok_url": ngrok_url})
        if response.status_code == 200:
            print("URL successfully sent to server.")
        else:
            print(f"Failed to send URL to server. Status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

def main():
    server_thread = threading.Thread(target=start_local_server)
    server_thread.daemon = True
    server_thread.start()

    tunnel = ngrok.connect(8000)
    public_url = tunnel.public_url
    print(f"ngrok public URL: {public_url}")

    send_ngrok_url_to_server(public_url)

    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("Shutting down...")
        ngrok.kill()

if __name__ == "__main__":
    main()
