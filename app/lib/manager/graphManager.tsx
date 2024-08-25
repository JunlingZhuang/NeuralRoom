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

export type ProgramInfo = {
  programTypeIndex: number;
  programName: string;
  programColor: string;
};

export type GraphManager = {
  graph: Graph;
  searchProgramInfo: (criteria: {
    programTypeIndex?: number;
    name?: string;
    color?: string;
  }) => Promise<ProgramInfo[]>;
  addNode: (node: Node) => void;
  deleteNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edge: Edge) => void;
  updateGraph: (newGraph: Graph) => void;
  handleGeneratedGraphData: (response: {
    nodes: number[];
    edges: [number, number, number][];
  }) => Promise<Graph>;
  formalizeGraphIntoNodesAndEdgesForBackend: () => any;
  getProgramDictList: () => any;
};

export const createGraphManager = (): GraphManager => {
  const [graph, setGraph] = useState<Graph>({ Nodes: [], Edges: [] });

  const formalizeRawNodesAndEdgesData = async (
    nodeData: { id: number; programTypeIndex: number }[],
    edgeData: { type: number; source: number; target: number }[]
  ): Promise<Graph> => {
    const nodes = await Promise.all(
      nodeData.map(async (node) => {
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
    nodes.forEach((node) => nodeMap.set(node.id, node));

    const edges = edgeData
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) {
          return null; // Filter out invalid edges
        }

        return {
          type: edge.type,
          source: sourceNode,
          target: targetNode,
        };
      })
      .filter((edge): edge is Edge => edge !== null);

    return { Nodes: nodes, Edges: edges }; // 返回新的 Graph 对象
  };

  const initializeGraph = async () => {
    const nodesJson = await fetchSampleNodehData();
    const edgesJson = await fetchSampleEdgeData();

    const initialGraph = await formalizeRawNodesAndEdgesData(
      nodesJson.map((node: { id: number; programTypeIndex: number }) => ({
        id: node.id,
        programTypeIndex: node.programTypeIndex,
      })),
      edgesJson
    );
    updateGraph(initialGraph);
  };

  useEffect(() => {
    initializeGraph();
  }, []);

  const handleGeneratedGraphData = async (response: {
    nodes: number[];
    edges: [number, number, number][];
  }): Promise<Graph> => {
    // Ensure the return type is Promise<Graph>
    const nodesData = response.nodes.map((programTypeIndex, id) => ({
      id,
      programTypeIndex,
    }));
    const edgesData = response.edges.map(([source, type, target]) => ({
      source,
      type,
      target,
    }));

    const generatedGraph: Graph = await formalizeRawNodesAndEdgesData(
      nodesData,
      edgesData
    );
    return generatedGraph;
  };

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

  const getProgramDictList = async () => {
    const programNameColorDict = await getColorAndProgramNameDict();
    console.log("searchprogram result", programNameColorDict);
    return programNameColorDict;
  };

  const searchProgramInfo = async (criteria: {
    programTypeIndex?: number;
    name?: string;
    programColor?: string;
  }): Promise<ProgramInfo[]> => {
    const programNameColorDict = await getColorAndProgramNameDict();
    const results: ProgramInfo[] = [];

    for (const key in programNameColorDict) {
      const program = programNameColorDict[key];
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
      : [
          {
            programTypeIndex: -1,
            programName: "Not Found",
            programColor: "#FFFFFF",
          },
        ];
  };

  const addNode = (node: Node) => {
    setGraph((prevGraph) => ({
      Nodes: [...prevGraph.Nodes, node], // update nodes list
      Edges: prevGraph.Edges, // keep orgrinal edges list
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
      Nodes: prevGraph.Nodes, // keep orgrinal edges list
      Edges: [...prevGraph.Edges, edge], // update edges list
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
    handleGeneratedGraphData,
    formalizeGraphIntoNodesAndEdgesForBackend,
    searchProgramInfo,
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
    updateGraph,
    getProgramDictList,
  };
};
