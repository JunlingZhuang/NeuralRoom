"use cilent";

import { useState, useEffect } from "react";
import { getColorAndProgramNameDict } from "@/app/lib/data";
import { fetchSampleNodehData } from "@/app/lib/data";
import { fetchSampleEdgeData } from "@/app/lib/data";

export type Node = {
  initX: number;
  initY: number;
  id: number;
  programTypeIndex: number;
  programName: string;
  color?: string;
};

export type Edge = {
  source: Node;
  target: Node;
  type: number;
};

export type Graph = {
  Nodes: Node[];
  Edges: Edge[];
};

type ProgramInfo = {
  index: number;
  programName: string;
  programColor: string;
};

export type GraphManager = {
  graph: Graph;
  searchProgramInfo: (criteria: {
    index?: number;
    name?: string;
    color?: string;
  }) => Promise<ProgramInfo[]>;
  addNode: (node: Node) => void;
  deleteNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edge: Edge) => void;
  updateGraph: (newGraph: Graph) => void;
  formalizeGraphIntoNodesAndEdgesForBackend: () => any;
};

export const createGraphManager = (): GraphManager => {
  const [graph, setGraph] = useState<Graph>({ Nodes: [], Edges: [] });

  const initializeGraph = async () => {
    const nodesJson = await fetchSampleNodehData();

    const nodes = await Promise.all(
      nodesJson.map(async (node: { id: number; programTypeIndex: number }) => {
        const programInfo = await searchProgramInfo({
          programTypeIndex: node.programTypeIndex,
        });
        const programName = programInfo[0]?.programName || "Unknown Program";
        return {
          initX: Math.random() * 100,
          initY: Math.random() * 100,
          programTypeIndex: node.programTypeIndex,
          id: node.id,
          programName,
        };
      })
    );
    console.log("initialNode", nodes);
    const nodeMap = new Map<number, Node>();
    nodes.forEach((node: Node) => nodeMap.set(node.id, node));

    const edgesJson = await fetchSampleEdgeData();
    const edges = edgesJson.map(
      (edge: { type: number; source: number; target: number }) => ({
        type: edge.type,
        source: nodeMap.get(edge.source),
        target: nodeMap.get(edge.target),
      })
    );
    // console.log("edges are", edges);
    // console.log("nodes are", nodes);
    setGraph({ Nodes: nodes, Edges: edges });
  };

  useEffect(() => {
    initializeGraph();
  }, []);

  const formalizeGraphIntoNodesAndEdgesForBackend = () => {
    const { Nodes, Edges } = graph;
    console.log("before node formalize", Nodes);
    const nodesData = Nodes.map((node) => node.programTypeIndex);
    const edgesData = Edges.map((edge) => [
      edge.source.id,
      edge.type,
      edge.target.id,
    ]);
    console.log("nodesData is", nodesData);
    console.log("edgesData is", edgesData);
    return { nodesData, edgesData };
  };

  const updateGraph = (newGraph: Graph) => {
    setGraph(newGraph);
  };

  const searchProgramInfo = async (criteria: {
    programTypeIndex?: number;
    name?: string;
    color?: string;
  }): Promise<ProgramInfo[]> => {
    const programColorDict = await getColorAndProgramNameDict();
    const results: ProgramInfo[] = [];

    for (const key in programColorDict) {
      const program = programColorDict[key];
      if (
        (criteria.programTypeIndex !== undefined &&
          program.programTypeIndex === criteria.programTypeIndex) ||
        (criteria.name !== undefined &&
          program.programName === criteria.name) ||
        (criteria.color !== undefined &&
          program.programColor === criteria.color)
      ) {
        results.push(program);
      }
    }

    return results.length > 0
      ? results
      : [{ index: -1, programName: "Not Found", programColor: "#FFFFFF" }];
  };

  const addNode = (node: Node) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Nodes: [...prevGraph.Nodes, node],
    }));
  };

  const deleteNode = (nodeToDelete: Node) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Nodes: prevGraph.Nodes.filter((node) => node !== nodeToDelete),
    }));
  };

  const addEdge = (edge: Edge) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Edges: [...prevGraph.Edges, edge],
    }));
  };

  const deleteEdge = (edgeToDelete: Edge) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      Edges: prevGraph.Edges.filter((edge) => edge !== edgeToDelete),
    }));
  };

  return {
    graph,
    formalizeGraphIntoNodesAndEdgesForBackend,
    searchProgramInfo,
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
    updateGraph,
  };
};
