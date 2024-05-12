from flask import Flask, jsonify

app = Flask(__name__)

global_count = 0 

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/test", methods=["GET"])
def add_count():
    global global_count
    global_count += 1  
    return jsonify({"count": global_count})
