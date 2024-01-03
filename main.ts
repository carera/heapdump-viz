import { Graph, GraphConfigInterface, InputLink, InputNode } from "@cosmograph/cosmos";
import JSON5 from "json5";
import * as GraphLib from "./src/graph.js";

const rawDataResponse = await fetch('/data/heap-data-example.json5');
const rawData = await rawDataResponse.text()
const heapData = JSON5.parse(rawData)

const graphInstance = new GraphLib.Graph(heapData);
graphInstance.getInfo()

const canvas = document.querySelector("canvas");
const config: GraphConfigInterface<InputNode, InputLink> = {
  renderLinks: true,
  useQuadtree: true,
  linkArrows: false,
  backgroundColor: "#151515",
  spaceSize: 8192,
  nodeSize: 2,
  linkWidth: 1,
  nodeColor: (node) => {
    if (node.type == 'hidden') return '#2E3440';
    else if (node.type == 'array') return '#3B4252';
    else if (node.type == 'string') return '#434C5E';
    else if (node.type == 'object') return '#4C566A';
    else if (node.type == 'code') return '#5E81AC';
    else if (node.type == 'closure') return '#81A1C1';
    else if (node.type == 'regexp') return '#88C0D0';
    else if (node.type == 'number') return '#8FBCBB';
    else if (node.type == 'native') return '#A3BE8C';
    else if (node.type == 'synthetic') return '#B48EAD';
    else if (node.type == 'concatenated string') return '#BF616A';
    else if (node.type == 'sliced string') return '#D08770';
    else if (node.type == 'symbol') return '#EBCB8B';
    else if (node.type == 'bigint') return '#E5E9F0';
    return "#ECEFF4";
  },
  showFPSMonitor: false,
  simulation: {
    linkSpring: 1.2,
    repulsion: 0.2,
    gravity: 0.1,
  },
  events: {
    onClick: (node) => {
      if (!node) return;
      console.log("Clicked node:", node);
      nodeInfoDiv!.innerHTML = `
        id: ${node.id}<br/>
        type: ${node.type}<br/>
        name: ${node.name}<br/>
        size: ${node.self_size}<br/>
        children: ${(node.childEdges as []).length}<br/>
        parents: ${(node.parentEdges as []).length}<br/>
        detachedness: ${node.detachedness}<br/>
      `
    },
  },
  
  /* ... */
};

const graph = new Graph(canvas!, config);
const setGraph = (depth) => {
  const graphData = graphInstance.getCosmographAtDepth(depth);
  graph.setData(graphData.nodes, graphData.links);
  if (isPaused) graph.pause();
  graphInfoDiv!.innerHTML = `
    Nodes: ${graphData.nodes.length}<br/>
    Edges: ${graphData.links.length}<br/>
    <pre>${JSON.stringify(graphData.meta.types, null, 2)}</pre><br/>
  `
  depthInfoDiv!.innerHTML = `Depth: ${depth}`
};

// ############# CONTROLS

let isPaused = false;
let depth = 1
const pauseButton = document.getElementById("pause");
const increaseDepthButton = document.getElementById("increaseDepth");
const decreaseDepthButton = document.getElementById("decreaseDepth");
const fullDepthButton = document.getElementById("fullDepth");
const toggleEdgesButton = document.getElementById("toggleEdges");
const nodeInfoDiv = document.getElementById("nodeInfo");
const graphInfoDiv = document.getElementById("graphInfo");
const depthInfoDiv = document.getElementById("depthInfo");

function pause() {
  isPaused = true;
  pauseButton!.textContent = "Start (Space)";
  graph.pause();
}

function start() {
  isPaused = false;
  pauseButton!.textContent = "Pause (Space)";
  graph.start();
}

function togglePause() {
  if (isPaused) start();
  else pause();
}

function toggleEdges() {
  graph.setConfig({ renderLinks: !graph.config.renderLinks });
}

pauseButton!.addEventListener("click", togglePause);
increaseDepthButton!.addEventListener("click", () => {
  setGraph(++depth);
});
decreaseDepthButton!.addEventListener("click", () => {
  setGraph(--depth);
});
fullDepthButton!.addEventListener("click", () => {
  setGraph(depth = Infinity);
});
toggleEdgesButton!.addEventListener("click", () => {
  toggleEdges()
});
// increase depth when letter A is pressed
document.addEventListener("keypress", (e) => {
  if (e.key === "a") setGraph(++depth)
  else if (e.key ==="z") setGraph(--depth)
  else if (e.key ==="f") setGraph(depth = Infinity)
  else if (e.key ==="e") toggleEdges()
  else if (e.key === " ") togglePause()
});

setGraph(depth);
