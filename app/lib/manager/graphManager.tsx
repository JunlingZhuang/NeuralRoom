import  {  useState } from "react";

export type Node = {
  id: string;
};

export type Edge = {
  id: string;
};

export type Graph = {
  Nodes: Node[];
  Edges: Edge[];
};

export type GraphManager = {
  graph: Graph;
  addNode: (node: Node) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
};

export const createGraphManager = (initialGraph: Graph): GraphManager => {
  const [graph, setGraph] = useState<Graph>(initialGraph);

  const addNode = (node: Node) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Nodes: [...prevGraph.Nodes, node],
    }));
  };

  const deleteNode = (nodeId: string) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Nodes: prevGraph.Nodes.filter((node) => node.id !== nodeId),
    }));
  };

  const addEdge = (edge: Edge) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Edges: [...prevGraph.Edges, edge],
    }));
  };

  const deleteEdge = (edgeId: string) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Edges: prevGraph.Edges.filter((edge) => edge.id !== edgeId),
    }));
  };

  return {
    graph,
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
  };
};
