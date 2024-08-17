from pydantic import BaseModel
from typing import List, Tuple
from LLM.prompt_basic import make_basic_input_prompt, make_basic_sysprompt
from openai import OpenAI
import os


class RoomAdjacency(BaseModel):
    room1: int
    room2: int


class OutputGraph(BaseModel):
    step1: List[str]
    step2: List[str]
    step3: List[RoomAdjacency]


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

    room_str_list = LLM_output.step2
    room_list = [classes_dict[rm] for rm in room_str_list]
    adj_id = rel_dict.get("adjacent to")
    adj_list = [[adj.room1, adj_id, adj.room2] for adj in LLM_output.step3]
    return room_list, adj_list


def make_LLM_request(input, classes_dict, rel_dict):
    client = OpenAI()
    sysprompt = make_basic_sysprompt()
    input = make_basic_input_prompt(input)

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[
            {"role": "system", "content": sysprompt},
            {"role": "user", "content": input},
        ],
        response_format=OutputGraph,
    )

    LLM_output = completion.choices[0].message.parsed
    print(LLM_output)

    room_list, adj_list = process_LLM_output(
        classes_dict, rel_dict, LLM_output=LLM_output
    )
    print("processed output", room_list, adj_list)
    return room_list, adj_list
