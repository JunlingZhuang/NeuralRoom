from flask import Flask, request, jsonify
import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
print("current_dir", current_dir)

sys.path.append(current_dir)


from scripts.visualize_box_version import (
    prepare_dataset_and_model,
    generate_queried_unit_mesh,
)
from LLM.LLM_utils import make_LLM_request

app = Flask(__name__)


# global variables
global_count = 0
dataset = None
model = None
args = None

gt_dir = os.path.join(current_dir, "test/new_prior_1500_GT")
args_location = os.path.join(current_dir, "test/new_prior_1500/args.json")
ckpt_link = (
    "https://drive.google.com/file/d/1-YjqqoAnv9_FD288mRYIGoNW75CcJaUR/view?usp=sharing"
)


# model and dataset initialized when webpage mounted
args, model, dataset, _, _ = prepare_dataset_and_model(
    args_location=args_location, ckpt_epoch=400, ckpt_link=ckpt_link
)
print("model initialized")


@app.route("/api/python")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/api/test", methods=["GET"])
def add_count():
    global global_count
    global_count += 1
    return jsonify({"count": global_count})


@app.route("/api/generate_backend", methods=["POST"])
def generate_model():
    print("generate_model")
    data = request.get_json()
    nodesData = data.get("nodes")
    edgesData = data.get("edges")
    length = data.get("length")
    height = data.get("height")
    width = data.get("width")
    # set length, height, width to float if not None
    length = float(length) if length is not None else 0.0
    height = float(height) if height is not None else 0.0
    width = float(width) if width is not None else 0.0

    print(length, height, width)
    print("Nodes Data received", nodesData)
    print("Edges Data received", edgesData)
    model_file_path = generate_queried_unit_mesh(
        input_objs=nodesData,
        input_triples=edgesData,
        unit_box=[length, height, width],
        args=args,
        model=model,
        train_dataset=dataset,
    )
    print(model_file_path)

    if model_file_path:
        try:
            with open(model_file_path, "r") as model_file:
                model_data = model_file.read()  # Read model file content
                # set key value pair, frontent will use this key to get the model data
                return jsonify({"model_data": model_data}), 200
        except FileNotFoundError:
            return jsonify({"error": "Model file not found"}), 404
    else:
        return jsonify({"error": "Model file path not found in script output"}), 404


@app.route("/api/text2graph", methods=["POST"])
def generate_graph():
    data = request.json
    text_value = data.get("text")
    classes_dict = dataset.classes
    rel_dict = dataset.relationships_dict
    try:
        room_list, adj_list = make_LLM_request(text_value, classes_dict, rel_dict)

        # Process the text_value as needed
        print(f"room_list {room_list}")
        print(f"adj_list {adj_list}")
    except Exception:
        print(f"Error with OpenAI requests {Exception}")
        return jsonify({"error": "OpenAI requests failed"}), 404

    response = {
        "nodes": room_list,  # a list of program type index
        "edges": adj_list,  # a list of [source id,type,target id]
    }

    return jsonify(response)


@app.route("/api/profile2graph", methods=["POST"])
def generate_userprofile_graph():
    data = request.json
    print(data)
    text_value = data.get("text")
    classes_dict = dataset.classes
    rel_dict = dataset.relationships_dict
    # try:
    #     room_list, adj_list = make_LLM_request(text_value, classes_dict, rel_dict)

    #     # Process the text_value as needed
    #     print(f"room_list {room_list}")
    #     print(f"adj_list {adj_list}")
    # except Exception:
    #     print(f"Error with OpenAI requests {Exception}")
    #     return jsonify({"error": "OpenAI requests failed"}), 404

    # response = {
    #     "nodes": room_list,  # a list of program type index
    #     "edges": adj_list,  # a list of [source id,type,target id]
    # }

    # return jsonify(response)
    test_response = {"test": "hello"}
    return jsonify(test_response)


@app.route("/api/openai", methods=["GET"])
def get_openAIApiKey():
    apikey = os.getenv("OPENAI_API_KEY")
    return jsonify({"Open AI Apikey": apikey})


@app.route("/health", methods=["GET"])
def health_check():
    return "OK", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5328)
