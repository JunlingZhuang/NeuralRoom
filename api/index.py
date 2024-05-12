from flask import Flask
app = Flask(__name__)

@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/api/test", methods=["GET"])
def addCount(count=1):
    count += 1
    return {"count": count}