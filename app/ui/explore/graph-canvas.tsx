import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { useGenerationManager } from "@/app/lib/context/generationContext";
import { Node, Edge } from "@/app/lib/manager/graphManager";

export default function GraphCanvas() {
  const { graphManager } = useGenerationManager();
  const graphData = graphManager.graph;
  const nodesData = graphData.Nodes;
  const edgesData = graphData.Edges;

  // Animation transition settings
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

    // Create tooltips
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

    console.log("link are", link);

    // Add nodes
    const node = svg
      .selectAll("g.node")
      .data(nodesData)
      .enter()
      .append("g")
      .attr("class", "node");

    const actualNode = node
      .append("circle")
      .attr("r", 8)
      .attr("fill", (d: Node) => d.nodeColor || "#FFFFFF")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add invisible circles for better mouse interaction
    node
      .append("circle")
      .attr("r", 20) // Larger radius for interaction
      .attr("fill", "transparent")
      .on("mouseover", function (event, d) {
        const previousNode = this.previousSibling as Element | null;
        if (previousNode) {
          d3.select(previousNode) // Select the actual circle
            .transition()
            .duration(nodeTransition)
            .attr("r", 12)
            .attr("stroke-width", 2)
            .attr("stroke", "white");
        }
        // Show tooltip based on the mouse event position
        nodeTooltip.transition().duration(200).style("opacity", 0.9);
        nodeTooltip
          .html(`ID: ${d.id}<br/>Program: ${d.programName}`)
          .style("left", `${event.pageX}px`) // 使用鼠标的页面X坐标
          .style("top", `${event.pageY - 40}px`); // 使用鼠标的页面Y坐标并向上偏移
      })
      .on("mouseout", function () {
        const previousNode = this.previousSibling as Element | null;
        if (previousNode) {
          d3.select(previousNode) // // Select the actual circle
            .transition()
            .duration(nodeTransition)
            .attr("r", 8)
            .attr("stroke-width", 1)
            .attr("stroke", "white");
        }
        // Hide tooltip
        nodeTooltip.transition().duration(500).style("opacity", 0);
      });

    // Initialize force simulation
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

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      link
        .selectAll("line")
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    simulationRef.current = simulation;

    // Handle window resize
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
      nodeTooltip.remove(); // Remove tooltip
      window.removeEventListener("resize", handleResize);
    };
  }, [nodesData, edgesData]);

  return (
    <div
      ref={canvasRef}
      className="GraphCanvas shadow-2xl rounded-[16px] backdrop-blur-xl w-full h-96 bg-panel-bg bg-opacity-60 justify-center"
    ></div>
  );
}
