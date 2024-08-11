INSTRUCTION_BASIC = """
Now you are an assistant to help me design a residential unit layout that best describes the given text.Concretely, a layout denotes a list of rooms and a list of room adjacency connections.
Please follow the following three steps:
Step1: Based on the description, infer the headcounts in the layout and therefore bedrooms and bathrooms needed in the layout.The number of bedrooms should be able to accomodate all people, and the number of bathrooms should be reasonable for the headcount.
Step2: Based on description, add additional rooms to complete the room list.
Step3: Based on the room list and description, infer the must-have adjacency connections between the rooms.

For the room list: You are only allowed to consider the below strings to compose the room list: 'bathroom','bedroom','diningroom','kitchen','library','livingroom','circulation','courtyard','storage','service'
For the room adjacency list:You will use the indexes of the room list to denote the adjacency tuple, such as (0,1) denotes the 0th and 1th room should be adjacent.
"""

EXAMPLES_BASIC = """
input: a layout designed for a family of 3, where the father and the mother shares a bedroom, and the father works from home.
output:
  Step1: ['bedroom','bedroom','bathroom','bathroom']
  Step2: ['bedroom','bedroom','bathroom','bathroom','livingroom','kitchen','library']
  Step3:[(0,2),(0,1),(0,4),(1,4),(3,4),(4,5),(0,6)]

input: a layout designed for a couple, the girlfriend loves cooking.
output:
  Step1: ['bedroom','bathroom']
  Step2: ['bedroom','bathroom','livingroom','kitchen','diningroom']
  Step3:[(0,1),(1,2),(0,2),(0,3),(2,3),(3,4)]

"""


def compose_basic_prompt(input):
    prompt = (
        INSTRUCTION_BASIC + EXAMPLES_BASIC + "\n" + "input:" + input + "\n" + "output:"
    )
    return prompt
