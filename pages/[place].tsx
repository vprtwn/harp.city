import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Gun from "gun";

// Community relay peers: https://github.com/amark/gun/wiki/volunteer.dht
let peers = [
  "https://www.raygun.live/gun",
  "https://gunmeetingserver.herokuapp.com/gun",
  "https://gun-us.herokuapp.com/gun",
  "https://gun-eu.herokuapp.com/gun",
];
if (process.env.NODE_ENV === "development") {
  peers = ["http://localhost:8765/gun"];
}
const gun = Gun(peers);
let gunStore = null;

const PlacePage = (props: any) => {
  const [nodes, setNodes] = useState([
    // {
    //   x: 200,
    //   y: 200,
    // },
    // {
    //   x: 50,
    //   y: 50,
    // },
  ]);

  const {
    query: { place },
  } = useRouter();

  if (place && !gunStore) {
    // initGun
    const version = "2020.5.11.0";
    const prefix = `harp.city.${process.env.NODE_ENV}.${version}`;
    const nodeName = `${prefix}^${place || ""}`;
    gunStore = gun.get(nodeName);
    gunStore.map().once((val, msgId) => {
      let newNodes = [];
      nodes.forEach((n, index) => {
        newNodes[index] = n;
      });
      nodes[val.i] = {
        x: val.x,
        y: val.y,
      };
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  // useEffect(() => {

  // }, []); // [] = run once

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
      </Head>
      <div className="w-screen">
        {nodes.map((node, i) => {
          return (
            <Draggable
              key={`draggable_${i}`}
              bounds="parent"
              position={{ x: node.x, y: node.y }}
              onDrag={(e, p) => {
                let newNodes = [];
                nodes.forEach((n, index) => {
                  newNodes[index] = n;
                });
                newNodes[i] = {
                  i: i,
                  x: p.x,
                  y: p.y,
                };
                setNodes(newNodes);
              }}
              onStop={(e, d) => {
                let node = nodes[i];
                gunStore.get(i).put(node);
              }}
            >
              <div className="cell border border-solid border-black">
                <div className="text-xs">{node.x}</div>
                <div className="text-xs">{node.y}</div>
              </div>
            </Draggable>
          );
        })}
        <div className="h-screen"></div>
        <div className="h-screen"></div>
      </div>
    </div>
  );
};

export default PlacePage;
