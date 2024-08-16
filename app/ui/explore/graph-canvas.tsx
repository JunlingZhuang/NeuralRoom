import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Node, Edge } from "@/app/lib/manager/graphManager";
import ProgramDropdown from "@/app/ui/explore/dropDown/programSelectionDropdown";

// extend node type to add property to align the d3 features
type NodeWithCoords = Node & {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

export default function GraphCanvas() {
  const { graphManager } = useGenerationManager();
  const graphData = graphManager.graph;
  const nodesData = graphData.Nodes as NodeWithCoords[];
  const edgesData = graphData.Edges;

  const nodeTransition = 250;
  const edgeTransition = 100;

  const canvasRef = useRef(null);
  const simulationRef = useRef<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);

  useEffect(() => {
    d3.select(canvasRef.current).selectAll("svg").remove();

    const svg = d3
      .select(canvasRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    const nodeTooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "auto")
      .style("height", "auto")
      .style("padding", "8px")
      .style("font", "12px sans-serif")
      .style("background", "black")
      .style("color", "white")
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const link = svg.selectAll("g").data(edgesData).enter().append("g");

    const actualLine = link
      .append("line")
      .style("stroke", "grey")
      .style("stroke-width", 1);

    link
      .append("line")
      .style("stroke", "transparent")
      .style("stroke-width", 10)
      .on("mouseover", function () {
        const previousLine = this.previousSibling as Element | null;
        if (previousLine) {
          d3.select(previousLine)
            .transition()
            .duration(edgeTransition)
            .style("stroke", "white")
            .style("stroke-width", 1.5);
        }
      })
      .on("mouseout", function () {
        const previousLine = this.previousSibling as Element | null;
        if (previousLine) {
          d3.select(previousLine)
            .transition()
            .duration(edgeTransition)
            .style("stroke", "grey")
            .style("stroke-width", 1);
        }
      });

    const node = svg
      .selectAll("g.node")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, NodeWithCoords>()
          .on("start", (event, d) => dragstarted(event, d))
          .on("drag", (event, d) => dragged(event, d))
          .on("end", (event, d) => dragended(event, d))
      );

    const actualNode = node
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d: NodeWithCoords) => d.nodeColor || "#FFFFFF")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", "transparent")
      .on("mouseover", function (event, d) {
        const previousNode = this.previousSibling as Element | null;
        if (previousNode) {
          d3.select(previousNode)
            .transition()
            .duration(nodeTransition)
            .attr("r", 12)
            .attr("stroke-width", 2)
            .attr("stroke", "white");
        }
        nodeTooltip.transition().duration(200).style("opacity", 0.9);
        nodeTooltip
          .html(`ID: ${d.id}<br/>Program: ${d.programName}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 40}px`);
      })
      .on("mouseout", function () {
        const previousNode = this.previousSibling as Element | null;
        if (previousNode) {
          d3.select(previousNode)
            .transition()
            .duration(nodeTransition)
            .attr("r", 8)
            .attr("stroke-width", 1)
            .attr("stroke", "white");
        }
        nodeTooltip.transition().duration(500).style("opacity", 0);
      });

    let dragLine: d3.Selection<SVGLineElement, unknown, null, undefined>;
    let newNode: NodeWithCoords | null = null;

    const simulation = d3
      .forceSimulation(nodesData as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(
            edgesData.map((edge) => ({
              ...edge,
              source: edge.source as d3.SimulationNodeDatum,
              target: edge.target as d3.SimulationNodeDatum,
            }))
          )
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force(
        "center",
        d3.forceCenter(
          (canvasRef.current as any)?.clientWidth / 2,
          (canvasRef.current as any)?.clientHeight / 2
        )
      );

    simulation.on("tick", () => {
      link
        .selectAll("line")
        .attr("x1", (d: any) => (d.source as NodeWithCoords).x || 0)
        .attr("y1", (d: any) => (d.source as NodeWithCoords).y || 0)
        .attr("x2", (d: any) => (d.target as NodeWithCoords).x || 0)
        .attr("y2", (d: any) => (d.target as NodeWithCoords).y || 0);

      node.attr("transform", (d: any) => `translate(${d.x || 0},${d.y || 0})`);
    });

    simulationRef.current = simulation;

    const handleResize = () => {
      if (simulationRef.current) {
        const width = (canvasRef.current as any)?.clientWidth;
        const height = (canvasRef.current as any)?.clientHeight;
        simulationRef.current.force(
          "center",
          d3.forceCenter(width / 2, height / 2)
        );
        simulationRef.current.alpha(1).restart();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      simulation.stop();
      svg.selectAll("*").remove();
      nodeTooltip.remove();
      window.removeEventListener("resize", handleResize);
    };

    function dragstarted(event: any, d: NodeWithCoords) {
      if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      // create virtual link
      dragLine = svg
        .append("line")
        .attr("class", "drag-line")
        .style("stroke", "gray")
        .style("stroke-dasharray", "4,4")
        .attr("x1", d.x || 0)
        .attr("y1", d.y || 0)
        .attr("x2", d.x || 0)
        .attr("y2", d.y || 0);
    }

    function dragged(event: any, d: NodeWithCoords) {
      dragLine.attr("x2", event.x).attr("y2", event.y);

      // display virtual node
      if (!newNode) {
        newNode = {
          initX: event.x,
          initY: event.y,
          id: nodesData.length,
          programTypeIndex: 11,
          programName: "kitchen",
          nodeColor: "#94CDE9",
          x: event.x,
          y: event.y,
        } as NodeWithCoords;

        svg
          .append("circle")
          .attr("class", "temp-node")
          .style("stroke-dasharray", "3, 3")
          .attr("r", 8)
          .attr("fill", "transparent")
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          // .attr("stroke-dasharray", "0 16 0 48")
          .attr("cx", event.x)
          .attr("cy", event.y);
      } else {
        newNode.x = event.x;
        newNode.y = event.y;
        svg.selectAll(".temp-node").attr("cx", event.x).attr("cy", event.y);

        console.log("Updated newNode position:", newNode);
        console.log(
          "Temporary node element:",
          svg.selectAll(".temp-node").node()
        );
      }
    }

    function dragended(event: any, d: NodeWithCoords) {
      if (!event.active) simulationRef.current?.alphaTarget(0);

      d.fx = null;
      d.fy = null;

      console.log("Final new node at end of drag:", newNode);

      // when cursor release, add new node to graphManager
      if (newNode) {
        graphManager.addNode(newNode);
        graphManager.addEdge({ type: 3, source: d, target: newNode });

        dragLine.remove();
        svg.selectAll(".temp-node").remove();

        simulationRef.current?.nodes(
          graphManager.graph.Nodes as NodeWithCoords[]
        );
        (simulationRef.current?.force("link") as d3.ForceLink<any, any>).links(
          graphManager.graph.Edges
        );

        simulationRef.current?.alpha(1).restart();
        newNode = null;

        console.log("New node added to nodesData:", nodesData);
      }
    }
  }, [graphManager.graph.Nodes, graphManager.graph.Edges]);

  return (
    <div
      ref={canvasRef}
      className="GraphCanvas shadow-2xl rounded-[16px] backdrop-blur-xl w-full h-96 bg-panel-bg bg-opacity-60 justify-center relative"
    >
      <ProgramDropdown />
      {/* </ProgramDropdown className="absolute top-0 right-0 m-4 p-2 bg-white text-black rounded">
      > */}
    </div>
  );
}
