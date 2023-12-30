import { Graph, InputLink } from "@cosmograph/cosmos";
import rawHeapData from "./data/heap-data-example.json";
import * as GraphLib from "./src/graph.js";

const graphInstance = new GraphLib.Graph(rawHeapData);

const canvas = document.querySelector("canvas");
const config = {
  renderLinks: false,
  useQuadtree: true,
  linkArrows: false,
  backgroundColor: "#151515",
  nodeSize: 4,
  nodeColor: "#4B5BBF",
  simulation: {
    linkSpring: 1.2,
    repulsion: 0.2,
    gravity: 0.1,
  },
  events: {
    onClick: (node) => {
      console.log("Clicked node: %s", node);
    },
  },
  /* ... */
};

let graph: Graph<any, InputLink>;

const setGraph = (depth) => {
  const graphData = graphInstance.getCosmographAtDepth(depth);
  graph = new Graph(canvas!, config);
  graph.setData(graphData.nodes, graphData.links);
};

// ############# CONTROLS

let isPaused = false;
let depth = 1;
const pauseButton = document.getElementById("pause");
const increaseDepthButton = document.getElementById("increaseDepth");

function pause() {
  isPaused = true;
  pauseButton!.textContent = "Start";
  graph.pause();
}

function start() {
  isPaused = false;
  pauseButton!.textContent = "Pause";
  graph.start();
}

function togglePause() {
  if (isPaused) start();
  else pause();
}

pauseButton!.addEventListener("click", togglePause);
increaseDepthButton!.addEventListener("click", () => {
  setGraph(++depth);
});
// pause();

setGraph(depth);
