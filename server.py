#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # Add headers for iframe embedding
        self.send_header('X-Frame-Options', 'ALLOWALL')
        self.send_header('Content-Security-Policy', "frame-ancestors *")
        
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    PORT = 12000
    
    # Change to the directory containing the web files
    os.chdir('/workspace/project')
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://0.0.0.0:{PORT}")
        print(f"Access the app at: https://work-1-hfqrtdpxckreitqq.prod-runtime.all-hands.dev")
        httpd.serve_forever()