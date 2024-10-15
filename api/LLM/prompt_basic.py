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

**Step 1: Determine Headcounts and Basic Room Requirements**

- **Headcount Determination**:
  - Total occupants: 3 people.

- **Bedroom Requirements**:
  - Parents share a bedroom: 1 bedroom.
  - One child requires a bedroom: 1 bedroom.
  - Total bedrooms: 2 bedrooms.

- **Bathroom Requirements**:
  - For 3 people, include 2 bathrooms for convenience.
  - Total bathrooms: 2 bathrooms.

- **Basic Room List**:
['bedroom', 'bedroom', 'bathroom', 'bathroom']

**Step 2: Infer Additional Rooms**
- **Livingroom**:
- Include 1 living room for family activities.

- **Kitchen**:
- Necessary for meal preparation.

- **Library**:
- Father works from home.
- Include 1 library or home office.

- **Updated Room List**:
['bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'library']

**Step 3: Determine Room Adjacency**

- **Assign Indexes**:
Index Room Type 
0 bedroom (parents) 
1 bedroom (child) 
2 bathroom 
3 bathroom 
4 livingroom 
5 kitchen 
6 library

- **Adjacency Analysis**:
- Bedroom (index 0) connected to bathroom (index 2): (0, 2)
- Bedroom (index 1) connected to bathroom (index 3): (1, 3)
- Bedrooms connected to livingroom (index 4): (0, 4), (1, 4)
- Livingroom connected to kitchen (index 5): (4, 5)
- Bedroom (index 0) connected to library (index 6): (0, 6)

- **Adjacency List**:
[(0, 2), (1, 3), (0, 4), (1, 4), (4, 5), (0, 6)]

**Step 4: Output the Room List and Adjacency List**
{
  'Room List': ['bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'library'],
'Adjacency List': [(0, 2), (1, 3), (0, 4), (1, 4), (4, 5), (0, 6)]
}
---
"""

EXAMPLE2_BASIC = """
Input: A layout designed for a single professional who works from home and enjoys painting. They need a dedicated workspace and an art studio.

Output:

**Step 1: Determine Headcounts and Basic Room Requirements**

- **Headcount Determination**:
  - Total occupants: 1 person.

- **Bedroom Requirements**:
  - 1 bedroom.

- **Bathroom Requirements**:
  - 1 bathroom.

- **Basic Room List**:
['bedroom', 'bathroom']

**Step 2: Infer Additional Rooms**

- **Livingroom**:
- Include 1 living room.

- **Kitchen**:
- Necessary for meal preparation.

- **Library**:
- Needs a dedicated workspace and an art studio.
- Include 2 libraries (one for workspace, one for art studio).

- **Updated Room List**:
['bedroom', 'bathroom', 'livingroom', 'kitchen', 'library', 'library']
**Step 3: Determine Room Adjacency**

- **Assign Indexes**:
Index Room Type 
0 bedroom 
1 bathroom 
2 livingroom 
3 kitchen 
4 library (workspace) 
5 library (art studio)
- **Adjacency Analysis**:
- Bedroom (index 0) connected to bathroom (index 1): (0, 1)
- Livingroom (index 2) connected to kitchen (index 3): (2, 3)
- Livingroom connected to libraries (indexes 4 and 5): (2, 4), (2, 5)
- Libraries connected to each other: (4, 5)

- **Adjacency List**:
[(0, 1), (2, 3), (2, 4), (2, 5), (4, 5)]

**Step 4: Output the Room List and Adjacency List**
{
  'Room List': ['bedroom', 'bathroom', 'livingroom', 'kitchen', 'library', 'library'],
'Adjacency List': [(0, 1), (2, 3), (2, 4), (2, 5), (4, 5)]
}
---
"""
EXAMPLE3_BASIC = """
Input: A layout designed for a multi-generational family of 6, including grandparents, parents, and two children. The grandparents have their own bedroom, the parents share a bedroom, and the children share a bedroom. The grandparents need easy access to a bathroom.

Output:

**Step 1: Determine Headcounts and Basic Room Requirements**

- **Headcount Determination**:
  - Total occupants: 6 people.

- **Bedroom Requirements**:
  - Grandparents: 1 bedroom.
  - Parents: 1 bedroom.
  - Children: 1 bedroom (shared).
  - Total bedrooms: 3 bedrooms.

- **Bathroom Requirements**:
  - For 6 people, include 2 bathrooms.
  - Total bathrooms: 2 bathrooms.

- **Basic Room List**:
['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']

**Step 2: Infer Additional Rooms**

- **Livingroom**:
- Include 1 living room for family gatherings.

- **Kitchen**:
- Necessary for meal preparation.

- **Diningroom**:
- Include 1 dining room for shared meals.

- **Circulation**:
- Needed for connectivity in a large unit.

- **Updated Room List**:
['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation']

**Step 3: Determine Room Adjacency**

- **Assign Indexes**:
Index Room Type 
0 bedroom (grandparents) 
1 bedroom (parents) 
2 bedroom (children) 
3 bathroom (near grandparents) 
4 bathroom 
5 livingroom 
6 kitchen 
7 diningroom 
8 circulation
- **Adjacency Analysis**:
- Grandparents' bedroom (index 0) connected to bathroom (index 3): (0, 3)
- Parents' and children's bedrooms (indexes 1, 2) connected to bathroom (index 4): (1, 4), (2, 4)
- All bedrooms connected to circulation (index 8): (0, 8), (1, 8), (2, 8)
- Circulation connected to livingroom (index 5): (8, 5)
- Livingroom connected to kitchen (index 6) and diningroom (index 7): (5, 6), (5, 7)
- Kitchen connected to diningroom: (6, 7)

- **Adjacency List**:
[(0, 3), (1, 4), (2, 4), (0, 8), (1, 8), (2, 8), (8, 5), (5, 6), (5, 7), (6, 7)]

**Step 4: Output the Room List and Adjacency List**
{
  'Room List':['bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation'],
'Adjacency List': [(0, 3), (1, 4), (2, 4), (0, 8), (1, 8), (2, 8), (8, 5), (5, 6), (5, 7), (6, 7)]
}
---
"""

EXAMPLE4_BASIC = """
Input: A layout designed for a family of 4, with frequent guests. The parents share a bedroom, the children each have their own bedroom, and they need an additional guest room.

Output:

**Step 1: Determine Headcounts and Basic Room Requirements**

- **Headcount Determination**:
  - Total permanent occupants: 4 people.
  - Frequent guests require an additional bedroom.
  - Total bedrooms: 4 bedrooms (parents, child 1, child 2, guest room).

- **Bathroom Requirements**:
  - For 4+ people, include at least 2 bathrooms.
  - Total bathrooms: 2 bathrooms.

- **Basic Room List**:
['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom']
**Step 2: Infer Additional Rooms**

- **Livingroom**:
- Include 1 living room for family and guests.

- **Kitchen**:
- Necessary for meal preparation.

- **Diningroom**:
- Include 1 dining room for meals and entertaining.

- **Circulation**:
- Needed for connectivity.

- **Updated Room List**:
['bedroom', 'bedroom', 'bedroom', 'bedroom', 'bathroom', 'bathroom', 'livingroom', 'kitchen', 'diningroom', 'circulation']
**Step 3: Determine Room Adjacency**

- **Assign Indexes**:
Index Room Type 
0 bedroom (parents) 
1 bedroom (child 1) 
2 bedroom (child 2) 
3 bedroom (guest) 
4 bathroom 
5 bathroom 
6 livingroom 
7 kitchen 
8 diningroom 
9 circulation

- **Adjacency Analysis**:
- Bedrooms connected to bathrooms: (0, 4), (1, 5), (2, 5), (3, 5)
- All bedrooms connected to circulation: (0, 9), (1, 9), (2, 9), (3, 9)
- Circulation connected to livingroom: (9, 6)
- Livingroom connected to kitchen and diningroom: (6, 7), (6, 8)
- Kitchen connected to diningroom: (7, 8)

- **Adjacency List**:
[(0, 4), (1, 5), (2, 5), (3, 5), (0, 9), (1, 9), (2, 9), (3, 9), (9, 6), (6, 7), (6, 8), (7, 8)]
**Step 4: Output the Room List and Adjacency List**
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
