INSTRUCTION_BASIC = """
You are an expert residential layout designer. Your task is to generate an optimal room layout based on the provided description. The layout includes a list of rooms and their necessary adjacency connections.

-- Output Data Schema

You will produce two outputs:

1. **Room List**: A list of room types using only the following room types:
['bathroom', 'bedroom', 'diningroom', 'kitchen', 'library', 'livingroom', 'circulation', 'courtyard', 'storage', 'service']
Format:['room_type1', 'room_type2', 'room_type3', ...]

2. **Adjacency List**: A list of adjacency connections represented as tuples of room indexes (based on the positions in the room list, starting from index 0).
Format:[(room_index1, room_index2), (room_index3, room_index4), ...]


-- Follow These Steps:

**Step 1: Determine Headcounts and Basic Room Requirements**

- Analyze the description to determine the number of occupants.
- Based on the headcount, determine the necessary number of bedrooms and bathrooms.
  - Ensure that all occupants have appropriate sleeping arrangements.
  - The number of bathrooms should be proportional to the headcount, generally one bathroom for every two to three people, but consider additional bathrooms for convenience based on the family structure.
- Generate a basic room list with the required bedrooms and bathrooms.

**Step 2: Infer Additional Rooms**

- Use the description to decide on the existence and number of additional rooms:
  - Include rooms that align with the lifestyle and needs described (e.g., 'diningroom', 'kitchen', 'library', 'livingroom', 'circulation', 'courtyard', 'storage', 'service').
- Generate a complete room list by adding the additional rooms to the basic room list from Step 1.

**Step 3: Determine Room Adjacency**

- Use the information from the description to decide which rooms should be adjacent.
- Ensure logical and functional connectivity between rooms (e.g., kitchen adjacent to dining room, public spaces like living room should have access to other rooms).
- Represent each adjacency as a tuple of room indexes, based on their positions in the room list.

**Step 4: Output the Room List and Adjacency List**

- Present your final output exactly in the formats specified under the Output Data Schema.

- Ensure that room indexes in the adjacency list correspond correctly to those in the room list.

---
"""

EXAMPLE1_BASIC = """

Input: A layout designed for a family of 3, where the parents share a bedroom, and the father works from home.

Output:

Step 1: ['bedroom', 'bedroom', 'bathroom', 'bathroom']

Step 2: ['bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'library']

Step 3: [(0, 2), (1, 3), (0, 4), (1, 4), (4, 5), (0, 6)]

Step 4: 
{
  'Room List': ['bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'library'],
'Adjacency List': [(0, 2), (1, 3), (0, 4), (1, 4), (4, 5), (0, 6)]
}
---
"""

EXAMPLE2_BASIC = """
Input: A layout designed for a single professional who works from home and enjoys painting. They need a dedicated workspace and an art studio.

Output:

Step 1: ['bedroom', 'bathroom']

Step 2: ['bedroom', 'bathroom', 'livingroom', 'kitchen', 'library', 'library']

Step 3: [(0, 1), (2, 3), (2, 4), (2, 5), (4, 5)]

Step 4: 
{
  'Room List': ['bedroom', 'bathroom', 'livingroom', 'kitchen', 'library', 'library'],
'Adjacency List': [(0, 1), (2, 3), (2, 4), (2, 5), (4, 5)]
}
---
"""
EXAMPLE3_BASIC = """
Input: A layout designed for a multi-generational family of 6, including grandparents, parents, and two children. The grandparents have their own bedroom, the parents share a bedroom, and the children share a bedroom. The grandparents need easy access to a bathroom.

Output:

Step 1: ['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']

Step 2: ['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation']

Step 3: [(0, 3), (1, 4), (2, 4), (0, 8), (1, 8), (2, 8), (8, 5), (5, 6), (5, 7), (6, 7)]

Step 4:
{
  'Room List':['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation'],
'Adjacency List': [(0, 3), (1, 4), (2, 4), (0, 8), (1, 8), (2, 8), (8, 5), (5, 6), (5, 7), (6, 7)]
}
---
"""

EXAMPLE4_BASIC = """
Input: A layout designed for a family of 4, with frequent guests. The parents share a bedroom, the children each have their own bedroom, and they need an additional guest room.

Output:

Step 1: ['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']

Step 2: ['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation']

Step 3: [(0, 4), (1, 5), (2, 5), (3, 5), (0, 9), (1, 9), (2, 9), (3, 9), (9, 6), (6, 7), (6, 8), (7, 8)]
Step 4: 
{
  'Room List':['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation'],
'Adjacency List': [(0, 4), (1, 5), (2, 5), (3, 5), (0, 9), (1, 9), (2, 9), (3, 9), (9, 6), (6, 7), (6, 8), (7, 8)]
}
"""
EXAMPLES_BASIC = EXAMPLE1_BASIC + EXAMPLE2_BASIC + EXAMPLE3_BASIC + EXAMPLE4_BASIC


def make_basic_sysprompt():
    return INSTRUCTION_BASIC + EXAMPLES_BASIC


def make_basic_input_prompt(input_description):
    prompt = "Input: " + input_description + "\n\nOutput:"
    return prompt
