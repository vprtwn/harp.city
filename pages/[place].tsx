import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_HEIGHT,
  midiToNoteName,
  midiToTuningSymbol,
  mToColor,
  yToM,
  xToSep,
} from "../utils/transforms";
import React, { useEffect, useRef, useState } from "react";
import Gun from "gun";
import "gun/lib/webrtc";
import Tone from "tone";
import useWindowScroll from "react-use/lib/useWindowScroll";
import { Stage, Layer, Text, Line } from "react-konva";
import Konva from "konva";

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
  const [nodes, setNodes] = useState([]);
  const { x, y } = useWindowScroll();

  const {
    query: { place },
  } = useRouter();

  if (place && !gunStore) {
    // initGun
    const version = "2020.5.11.0";
    const prefix = `harp.city.${process.env.NODE_ENV}.${version}`;
    const nodeName = `${prefix}^${place || ""}`;
    gunStore = gun.get(nodeName);
    gunStore.map().on((val, msgId) => {
      nodes[val.i] = {
        x: val.x,
        y: val.y,
      };
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="canvas border border-solid border-black">
        {nodes.map((node, i) => {
          return (
            <Draggable
              defaultClassName="react-draggable absolute"
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
                node.d = false;
                gunStore.get(i).put(node);
              }}
            >
              <div
                className={`cell border`}
                style={{
                  borderColor: `${mToColor(yToM(node.y))}`,
                }}
              >
                {/* <div className="text-xs text-right">{node.x}</div> */}
                {/* <div className="text-xs text-right">{i}</div> */}
              </div>
            </Draggable>
          );
        })}
        {nodes.map((node, i) => {
          return (
            <div>
              <div
                className="string-label pl-1"
                style={{
                  top: `${node.y}px`,
                  left: `${x}px`,
                  color: `${mToColor(yToM(node.y))}`,
                }}
              >
                <span className="text-xs">{midiToNoteName(yToM(node.y))}</span>
                <sup className="text-xxs">{midiToTuningSymbol(yToM(node.y))}</sup>
              </div>
            </div>
          );
        })}

        <button
          hidden={nodes.length > 10}
          className="fixed top-0 left-0 bg-black hover:bg-gray-500 text-white px-2 pb-1"
          onClick={() => {
            const i = nodes.length;
            const node = {
              i: i,
              x: 100,
              y: 100,
            };
            gunStore.get(i).put(node);
          }}
        >
          new
        </button>

        <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          <Layer>
            {nodes.map((node, i) => {
              return (
                <Line
                  points={[0, node.y + CELL_HEIGHT / 2.0, CANVAS_WIDTH, node.y + CELL_HEIGHT / 2.0]}
                  stroke={mToColor(yToM(node.y))}
                  strokeWidth={2}
                  dash={[2, xToSep(node.x)]}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PlacePage;
