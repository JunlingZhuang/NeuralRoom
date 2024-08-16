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
  nodeColor?: string;
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
        const nodeColor = programInfo[0]?.programColor; // Default color if not found

        return {
          initX: Math.random() * 100,
          initY: Math.random() * 100,
          programTypeIndex: node.programTypeIndex,
          id: node.id,
          programName,
          nodeColor,
        };
      })
    );
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
    setGraph({ Nodes: nodes, Edges: edges });
  };

  useEffect(() => {
    initializeGraph();
  }, []);

  const formalizeGraphIntoNodesAndEdgesForBackend = () => {
    const { Nodes, Edges } = graph;
    const nodesData = Nodes.map((node) => node.programTypeIndex);
    const edgesData = Edges.map((edge) => [
      edge.source.id,
      edge.type,
      edge.target.id,
    ]);

    return { nodesData, edgesData };
  };

  const updateGraph = (newGraph: Graph) => {
    setGraph(newGraph);
  };

  const searchProgramInfo = async (criteria: {
    programTypeIndex?: number;
    name?: string;
    programColor?: string;
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
        (criteria.programColor !== undefined &&
          program.programColor === criteria.programColor)
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
      Nodes: [...prevGraph.Nodes, node], // 更新节点数组
      Edges: prevGraph.Edges, // 保持边数组不变
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
      Nodes: prevGraph.Nodes, // 保持节点数组不变
      Edges: [...prevGraph.Edges, edge], // 更新边数组
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
