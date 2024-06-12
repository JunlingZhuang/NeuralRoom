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


@app.route("/api/generate", methods=["GET"])
def generate():

    # code for generating model data
    # return jsonify({"model_data": model_data}), 200
    return jsonify({"model_data": "model_data"}), 200


@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5328)
