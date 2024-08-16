INSTRUCTION_BASIC = """
You are an expert residential layout designer. Your task is to generate an optimal room layout based on the provided description. The layout includes a list of rooms and their necessary adjacency connections.

Please follow these steps:

Step 1: Analyze the description to determine the number of occupants and identify the required number of bedrooms and bathrooms. 
- Ensure that all occupants have appropriate sleeping arrangements.
- The number of bathrooms should be proportional to the headcount, generally one bathroom for every two to three people, but consider additional bathrooms for convenience based on the family structure.

Step 2: Expand the room list by adding any additional rooms that align with the lifestyle and needs described.

Step 3: Create the room adjacency list by specifying the essential connections between the rooms, using the room list's indexes. Each connection should represent a meaningful adjacency based on the description.

Room List: You can only use the following room types: 'bathroom', 'bedroom', 'dining room', 'kitchen', 'library', 'living room', 'circulation', 'courtyard', 'storage', 'service'.

Adjacency List: Represent each adjacency connection as a tuple of room indexes, such as (0,1) to denote the first and second rooms being adjacent.
"""

EXAMPLES_BASIC = """
input: A layout designed for a family of 3, where the parents share a bedroom, and the father works from home.
output:
  Step 1: ['bedroom', 'bedroom', 'bathroom', 'bathroom']
  Step 2: ['bedroom', 'bedroom', 'bathroom', 'bathroom', 'living room', 'kitchen', 'library']
  Step 3: [(0,2), (0,1), (0,4), (1,4), (3,4), (4,5), (0,6)]

input:A layout designed for a single professional who works from home and enjoys painting. They need a dedicated workspace and an art studio.
output:
  Output:
  Step 1: ['bedroom', 'bathroom']
  Step 2: ['bedroom', 'bathroom', 'living room', 'kitchen', 'library', 'library']
  Step 3: [(0,1), (1,2), (2,3), (2,4), (4,5)]
  
input: A layout designed for a multi-generational family of 6, including grandparents, parents, and two children. The grandparents have their own bedroom, the parents share a bedroom, and the children share a bedroom. The grandparents need easy access to a bathroom.
output:
  Step 1: ['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']
  Step 2: ['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'living room', 'kitchen', 'dining room', 'circulation']
  Step 3: [(0,3), (1,4), (2,4), (0,5), (1,5), (2,5), (5,6), (6,7), (7,8)]

input: A layout designed for a family of 4, with frequent guests. The parents share a bedroom, the children each have their own bedroom, and they need an additional guest room.
output:
Step 1: ['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']
Step 2: ['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'living room', 'kitchen']
Step 3: [(0,4), (1,5), (2,5), (3,5), (4,6), (5,6), (6,7)]

"""


def make_basic_sysprompt():
    return INSTRUCTION_BASIC + EXAMPLES_BASIC


def make_basic_input_prompt(input):
    prompt = "input: " + input + "\n" + "output:"
    return prompt
