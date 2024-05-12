from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# CORS(app)

global_count = 0  # 全局变量来存储计数

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/api/test", methods=["GET"])
def add_count():
    global global_count
    global_count += 1  # 每次调用时增加全局计数
    return jsonify({"count": global_count})


if __name__ == "__main__":
    app.run()