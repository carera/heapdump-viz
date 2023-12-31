import fs from "fs";
import { CosmosInputLink } from "@cosmograph/cosmos";

export type CosmosGraphData = {
  nodes: any[],
  links: CosmosInputLink[],
  meta: {
    types: {[k: string]: number}
  }
};

export class Node {
  type: string;
  name: string
  id: string
  self_size: number
  edge_count: number
  trace_node_id: number
  detachedness: number
  childEdges: Edge[]
  parentEdges: Edge[]

  constructor(data: any) {
    this.type = data.type;
    this.name = data.name;
    this.id = data.id;
    this.self_size = data.self_size;
    this.edge_count = data.edge_count;
    this.trace_node_id = data.trace_node_id;
    this.detachedness = data.detachedness;
    this.childEdges = [];
    this.parentEdges = [];
  }
  print() {
    console.log(`${this.type} - ${this.name} - ${this.id} - ${this.self_size}`);
    // console.log(`Parents:`);
    // this.parentEdges.map((e) => {
    //   console.log(
    //     `${e.meta.type} - ${e.meta.name_or_index} - ${e.parent.id} - ${e.child.id}`
    //   );
    // });
    // console.log(`Children:`);
    // this.childEdges.map((e) => {
    //   console.log(
    //     `${e.meta.type} - ${e.meta.name_or_index} - ${e.parent.id} - ${e.child.id}`
    //   );
    // });
  }
}
class Edge {
  parent: Node
  child: Node
  meta: {
    type: string
    name_or_index: string
  }
  constructor(data: any) {
    this.parent = data.parent; // reference to parent Node
    this.child = data.child; // reference to child Node
    this.meta = data.meta; // Edge data
  }
  print() {
    return {
      parent: this.parent,
      child: this.child,
      meta: this.meta,
    };
  }
}

export class Graph {
  rawHeapData: any
  nodes: Node[]
  node_fields: string[]
  edge_fields: string[]
  constructor(rawHeapData: any) {
    // this.filename = filename;
    // const rawHeapDataTxt = fs.readFileSync(filename, "utf-8");
    // const rawHeapData = JSON.parse(rawHeapDataTxt);
    const { node_fields, node_types, edge_fields, edge_types } =
      rawHeapData.snapshot.meta;
    const { nodes, edges, strings } = rawHeapData;
    this.rawHeapData = rawHeapData;
    this.nodes = [];
    this.node_fields = node_fields;
    this.edge_fields = edge_fields;
    // console.log(rawHeapData.snapshot.meta);

    // PARSE NODES
    for (let i = 0; i < nodes.length; i += node_fields.length) {
      const nodeItem = new Node({
        type: node_types[0][nodes[i]],
        name: strings[nodes[i + 1]],
        id: nodes[i + 2],
        self_size: nodes[i + 3],
        edge_count: nodes[i + 4],
        trace_node_id: nodes[i + 5],
        detachedness: nodes[i + 6],
      });
      this.nodes.push(nodeItem);
    }
    // PARSE EDGES
    let edgeIdx = 0;
    this.nodes.forEach((node) => {
      const edgeCount = node.edge_count;

      // add N edges to a node
      for (let i = 0; i < edgeCount; i++) {
        const type = edges[edgeIdx++];
        const name_or_index = edges[edgeIdx++];
        const to_node = edges[edgeIdx++];
        const child = this.nodes[to_node / node_fields.length];
        const edge = new Edge({
          meta: {
            type: edge_types[0][type],
            name_or_index: strings[name_or_index],
          },
          parent: node,
          child: child,
        });
        child.parentEdges.push(edge);
        node.childEdges.push(edge);
      }
    });
  }

  // saveAsCSV() {
  //   const csv = [["source", "target"].join(",")];
  //   this.nodes.forEach((node) => {
  //     node.childEdges.forEach((edge) => {
  //       csv.push([node.id, edge.child.id].join(","));
  //     });
  //   });
  //   fs.writeFileSync(`${this.filename}.csv`, csv.join("\n"), "utf-8");
  // }

  // saveAsCosmograph() {
  //   const data: CosmosGraphData = {
  //     nodes: [],
  //     links: [],
  //     meta: {types: {}}
  //   };
  //   this.nodes.forEach((node) => {
  //     data.nodes.push(node);
  //     node.childEdges.forEach((edge) => {
  //       data.links.push({
  //         source: node.id,
  //         target: edge.child.id,
  //       });
  //     });
  //   });
  //   fs.writeFileSync(`data.json`, JSON.stringify(data), "utf-8");
  // }

  getCosmographAtDepth(depth: number, ignoreNodes: string[] = []) {
    const data: CosmosGraphData = {
      nodes: [],
      links: [],
      meta: {
        types: {}
      }
    };
    // find roots
    const roots: Node[] = []
    for (const node of this.nodes) {
      if (node.parentEdges.length == 0) {
        roots.push(node);
        data.nodes.push({...node, childEdges: [], parentEdges: []})
      }
    }
    // iterate over nodes down to a depth
    let queue = roots;
    const visited: {[k: string]: 1} = {};
    const addedNodes: {[k: string]: 1} = {}
    let currentDepth = 0;
    while (currentDepth < depth && queue.length) {
      const subQueue: Node[] = [];
      while (queue.length) {
        const node = queue.pop()!;
        if (visited[node.id]) {
          continue;
        }
        visited[node.id] = 1;
        node.childEdges.forEach((e) => {
          if (ignoreNodes.includes(e.child.type)) {
            return;
          }
          if (!visited[e.child.id]) {
            // do not double-add nodes
            if (!addedNodes[e.child.id]) {
              subQueue.push(e.child);
              data.nodes.push({...e.child, childEdges: [], parentEdges: []});
            }
            addedNodes[e.child.id] = 1
            data.links.push({source: node.id, target: e.child.id});
            data.meta.types[e.child.type] = data.meta.types[e.child.type] ? data.meta.types[e.child.type] + 1 : 1
          }
        });
      }
      queue = subQueue
      currentDepth++
    }
    return data;
  }

  getInfo() {
    console.log(`
    Graph info:
      Nodes: ${this.rawHeapData.nodes.length / this.node_fields.length}
      Edges: ${this.rawHeapData.edges.length / this.edge_fields.length}
    `);
  }
}
