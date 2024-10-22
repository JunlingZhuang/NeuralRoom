from pydantic import BaseModel
from typing import Dict, List
from LLM.prompt_basic import make_basic_input_prompt, make_basic_sysprompt
from LLM.prompt_profile import make_profile_sysprompt
from openai import OpenAI
import os


class RoomAdjacency(BaseModel):
    room1: int
    room2: int


class RoomGraph(BaseModel):
    roomlist: Dict[str, str]
    adjacencylist: List[RoomAdjacency]


class OutputGraph(BaseModel):
    step1: str
    step2: str
    step3: str
    step4: str
    step5: RoomGraph


def process_LLM_output(classes_dict, rel_dict, LLM_output=None):
    """
    input
    - class_dic: the obj classes dict from the dataset
    - rel_dic: the relationship dict from the dataset
    - LLM_output: the raw output of LLM, including step1,step2,step3

    return
    - room_list: a list of room class integer id
    - adj_list: a list of room adjcency tuple, (room1 index, room2 index)

    """

    room_graph = LLM_output.step5
    room_str_list = room_graph.roomlist
    room_list = [classes_dict[rm] for rm in room_str_list.values()]
    adj_id = rel_dict.get("adjacent to")
    adj_list = [[adj.room1, adj_id, adj.room2] for adj in room_graph.adjacencylist]
    return room_list, adj_list


def make_LLM_request(input, classes_dict, rel_dict, use_profile=False):
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    if use_profile:
        sysprompt = make_profile_sysprompt()
    else:
        sysprompt = make_basic_sysprompt()
    input = make_basic_input_prompt(input)

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": sysprompt},
            {"role": "user", "content": input},
        ],
        response_format=OutputGraph,
    )

    LLM_output = completion.choices[0].message.parsed

    room_list, adj_list = process_LLM_output(
        classes_dict, rel_dict, LLM_output=LLM_output
    )
    return room_list, adj_list
