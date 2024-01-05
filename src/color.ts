import { Node } from "./graph";

const colorPalette = [
    '#a8ce93',// '#2E3440',
    '#dada93',// '#3B4252',
    '#83afe5',// '#434C5E',
    '#d18ec2',// '#4C566A',
    '#e6eef3',// '#5E81AC',
    '#9a93e1',// '#81A1C1',
    '#7fc1ca',// '#88C0D0',
    '#c5d4dd',// '#8FBCBB',
    '#899ba6',// '#A3BE8C',
    '#f2c38f',// '#B48EAD',
    '#df8c8c',// '#BF616A',
    '#a8ce93',// '#D08770',
    '#dada93',// '#EBCB8B',
    '#83afe5',// '#E5E9F0'
  ]
  
export const nodeColor = (node: Node) => {
    if (node.type == 'hidden') return colorPalette[0];
    else if (node.type == 'array') return colorPalette[1];
    else if (node.type == 'string') return colorPalette[2];
    else if (node.type == 'object') return colorPalette[3];
    else if (node.type == 'code') return colorPalette[4];
    else if (node.type == 'closure') return colorPalette[5];
    else if (node.type == 'regexp') return colorPalette[6];
    else if (node.type == 'number') return colorPalette[7];
    else if (node.type == 'native') return colorPalette[8];
    else if (node.type == 'synthetic') return colorPalette[9];
    else if (node.type == 'concatenated string') return colorPalette[10];
    else if (node.type == 'sliced string') return colorPalette[11];
    else if (node.type == 'symbol') return colorPalette[12];
    else if (node.type == 'bigint') return colorPalette[13];
    return "#ECEFF4";
  }