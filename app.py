from flask import Flask, request, jsonify
from flask_cors import CORS

import json
import heapq
from math import radians, sin, cos, sqrt, atan2

app = Flask(__name__)
CORS(app)
# Load locations
with open('locations.json', 'r') as file:
    locations = json.load(file)

# Helper: get coordinates from name
coord_map = {loc["name"]: loc["coords"] for loc in locations}

# Calculate Haversine distance
def calculate_distance(coord1, coord2):
    R = 6371e3
    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# Build graph
# Load paths
with open('path.json', 'r') as file:
    connections = json.load(file)

distance_matrix = {loc: {} for loc in coord_map}

for from_loc, neighbors in connections.items():
    for to_loc in neighbors:
        distance = calculate_distance(coord_map[from_loc], coord_map[to_loc])
        distance_matrix[from_loc][to_loc] = distance
        distance_matrix[to_loc][from_loc] = distance  # bidirectional


# Dijkstra's algorithm
def dijkstra(graph, start, end):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    prev = {node: None for node in graph}
    queue = [(0, start)]

    while queue:
        curr_dist, curr_node = heapq.heappop(queue)
        if curr_node == end:
            break
        if curr_dist > distances[curr_node]:
            continue
        for neighbor, weight in graph[curr_node].items():
            dist = curr_dist + weight
            if dist < distances[neighbor]:
                distances[neighbor] = dist
                prev[neighbor] = curr_node
                heapq.heappush(queue, (dist, neighbor))

    path = []
    node = end
    while node:
        path.insert(0, node)
        node = prev[node]
    return path, distances[end]

# API Route
@app.route('/shortest-path', methods=['POST'])
def shortest_path():
    data = request.json
    start = data.get('start')
    end = data.get('end')

    if start not in distance_matrix or end not in distance_matrix:
        return jsonify({'error': 'Invalid location name'}), 400

    path, distance = dijkstra(distance_matrix, start, end)
    coords = [coord_map[p] for p in path]
    return jsonify({'path': path, 'coordinates': coords, 'distance': distance})

if __name__ == '__main__':
    app.run(debug=True)
