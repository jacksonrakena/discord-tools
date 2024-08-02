import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Sigma from "sigma";
import { data } from "./data";
import "./style.css";
document.getElementById("load-btn").onclick = () => {
  start(JSON.parse(document.querySelector("textarea").value));
};
const stringToColour = (str) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, "0");
  }
  return colour;
};

async function start(mutualsData) {
  console.log("startin");

  document.getElementById("intro").remove();
  document.getElementById("target").style.width = "100vw";
  document.getElementById("target").style.height = "100vh";
  const colaData = {
    nodes: [],
    links: [],
  };
  const graphx = new Graph();
  // graph.addNode("1", { label: "Node 1", x: 0, y: 0, size: 10, color: "blue" });
  // graph.addNode("2", { label: "Node 2", x: 1, y: 1, size: 20, color: "red" });
  // graph.addEdge("1", "2", { size: 5, color: "purple" });

  const newData0 = [];
  for (var dd = 0; dd < mutualsData.length; dd++) {
    const newmutual0 = mutualsData[dd];
    graphx.addNode(newmutual0.name, {
      label: newmutual0.name,
      image: {
        url: "https://d.lu.je/avatar/" + newmutual0.id,
      },
    });
    colaData.nodes.push({
      name: newmutual0.name,
      width: newmutual0.name.length * 15,
      height: 30,
    });
  }
  for (var dd = 0; dd < mutualsData.length; dd++) {
    const newmutual0 = mutualsData[dd];
    for (var i = 0; i < newmutual0.mutuals.length; i++) {
      // var newlinkobj = {
      //     source: colaData.nodes.findIndex(e => e.name === newmutual0.name),
      //     target: colaData.nodes.findIndex(e => e.name === newmutual0.mutuals[i].name)
      // }
      //if (newlinkobj.source === -1 || newlinkobj.target === -1) continue;
      graphx.addEdge(newmutual0.name, newmutual0.mutuals[i].name);
      //colaData.links.push(newlinkobj)
    }
  }
  let ix = 0;
  // 5. Use degrees for node sizes:
  const degrees = graphx.nodes().map((node) => graphx.degree(node));
  const minDegree = Math.min(...degrees);
  const maxDegree = Math.max(...degrees);
  const minSize = 2,
    maxSize = 15;
  graphx.forEachNode((node) => {
    const degree = graphx.degree(node);
    graphx.setNodeAttribute(
      node,
      "size",
      minSize +
        ((degree - minDegree) / (maxDegree - minDegree)) * (maxSize - minSize)
    );
  });

  graphx.forEachNode((node, attributes) => {
    graphx.setNodeAttribute(node, "color", stringToColour(node));
  });

  circular.assign(graphx);
  const settings = forceAtlas2.inferSettings(graphx);
  forceAtlas2.assign(graphx, { settings, iterations: 600 });
  const sigmaInstance = new Sigma(graphx, document.getElementById("target"));
}

for (const k of Object.keys(data)) {
  const b = document.createElement("button");
  b.onclick = () => {
    start(data[k]);
  };
  b.appendChild(document.createTextNode(k));
  document.getElementById("existing-data").appendChild(b);
}
