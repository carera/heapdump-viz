import React, { useEffect, useState } from 'react'

import JSON5 from "json5";
import { Cosmograph as CosmographReact } from '@cosmograph/react';
import { Graph, Node } from './graph';
import { nodeColor } from './color';
import { CosmosInputLink } from '@cosmograph/cosmos';
import { Cosmograph } from '@cosmograph/cosmograph';

const rawDataResponse = await fetch('../data/heap-data-example.json5');
const rawData = await rawDataResponse.text()
const heapData = JSON5.parse(rawData)
const graphInstance = new Graph(heapData);
let cosmograph: Cosmograph<Node, CosmosInputLink>;

const nodeTypes = [
  'hidden','array','string','object','code','closure','regexp','number','native','synthetic','concatenated string','sliced string','symbol','bigint'
]

const App = () => {
  const [depth, setDepth] = useState(1);
  const [graphData, setGraphData] = useState(graphInstance.getCosmographAtDepth(depth));
  const [renderLinks, setRenderLinks] = useState(true);
  const [running, setRunning] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);
  const [ignoredNodeTypes, setIgnoredNodeTypes] = useState<{[type: string]: boolean}>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        toggleSimulation()
      } else if (e.key === 'a') {
        setDepth(depth + 1)
      } else if (e.key === 'z') {
        setDepth(depth - 1)
      } else if (e.key === 'f') {
        setDepth(Infinity)
      } else if (e.key === 'e') {
        setRenderLinks(!renderLinks)
      } else if (e.key === 'l') {
        setShowLabels(!showLabels)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  })
  const toggleSimulation = () => {
    setRunning(!running)
    running ? cosmograph.pause() : cosmograph.restart()
  }
  const toggleIgnoreNodeType = (type: string) => {
    const newIgnoredNodeTypes = {...ignoredNodeTypes}
    newIgnoredNodeTypes[type] = ignoredNodeTypes[type] === undefined ? true : !ignoredNodeTypes[type]
    setIgnoredNodeTypes(newIgnoredNodeTypes)
  }
  useEffect(() =>{
    const ignoreNodeTypesArray = Object.keys(ignoredNodeTypes).filter(key => ignoredNodeTypes[key] === true)
    setGraphData(graphInstance.getCosmographAtDepth(depth, ignoreNodeTypesArray));
  }, [depth, ignoredNodeTypes])
  console.log(ignoredNodeTypes);
  return (
    <>
      <div className="app">
        <CosmographReact
          nodes={graphData.nodes}
          links={graphData.links}
          nodeSize={1}
          disableSimulation={!running}
          linkWidth={1}
          renderLinks={renderLinks}
          useQuadtree={true}
          ref={ref => {
            if (ref) {
              cosmograph = ref
            }
          }}
          linkArrows={false}
          backgroundColor='#151515'
          spaceSize={8192}
          nodeColor={nodeColor}
          showFPSMonitor={false}
          simulationLinkSpring={1.2}
          simulationRepulsion={0.2}
          simulationGravity={0.1}
          nodeLabelAccessor={node => `${node.type} - ${node.name} (${node.self_size}B)`}
          nodeLabelColor={'#dddddd'}
          hoveredNodeLabelColor={'#ffffff'}
          showTopLabels={showLabels}
          showDynamicLabels={showLabels}
          onClick={(node) => setSelectedNode(node)}
        />
      </div>
      <div className="actions">
        <div className="header">Actions:</div>
        <div className="action" onClick={() => toggleSimulation()}>{running ? 'Pause' : 'Unpause'} (Space)</div>
        <div className="action" onClick={() => setDepth(depth + 1)}>Increase depth (A)</div>
        <div className="action" onClick={() => setDepth(depth + 1)}>Decrease depth (Z)</div>
        <div className="action" onClick={() => setDepth(Infinity)}>Show full graph (F)</div>
        <div className="action" onClick={() => setRenderLinks(!renderLinks)}>Toggle edges (E)</div>
        <div className="action" onClick={() => setShowLabels(!showLabels)}>Toggle labels (L)</div>
        <br/>
      {
        // iterate through node types and display a checkbox for each
        nodeTypes.map((type, index) => {
          return (
            <div key={index}>
              <input
                type="checkbox"
                id={type}
                name={type}
                defaultChecked={true}
                onChange={() => {
                  toggleIgnoreNodeType(type)
                }}
              />
              <label htmlFor={type}>{type}</label>
            </div>
          )
        })
      }
        <br/>
        <div className="header">Graph Info:</div>
        <div className="depthInfo">Current depth: {depth}</div>
        <div className="graphInfo">Nodes: {graphData.nodes.length}</div>
        <div className="graphInfo">Edges: {graphData.links.length}</div>
        <br/>
        <div className="header">Node types:</div>
        <div className="graphInfo">{
          // iterate through graphData.meta object properties and display them
          Object.entries(graphData.meta.types).map(([key, value]) => {
            return <div key={key}>{key}: {value}</div>
          })
        }</div>
        <br/>
        {selectedNode &&
        <>
          <div className="header">Node Info:</div>
          <div className="nodeInfo">id: {selectedNode.id}</div>
          <div className="nodeInfo">type: {selectedNode.type}</div>
          <div className="nodeInfo">name: {selectedNode.name}</div>
          <div className="nodeInfo">size: {selectedNode.self_size}</div>
          <div className="nodeInfo">children: {(selectedNode.childEdges as []).length}</div>
          <div className="nodeInfo">parents: {(selectedNode.parentEdges as []).length}</div>
          <div className="nodeInfo">detachedness: {selectedNode.detachedness}</div>
        </>
        }
      </div>
    </>
    )
  }
  
  
  export default App