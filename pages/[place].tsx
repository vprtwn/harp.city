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
import useWindowSize from "react-use/lib/useWindowSize";
import useScrolling from "react-use/lib/useScrolling";
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
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedY, setSelectedY] = useState<number | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const scrollRef = React.useRef(null);
  const scrolling = useScrolling(scrollRef);
  const { x: scrollX, y: scrollY } = useWindowScroll();
  const { width: windowW, height: windowH } = useWindowSize();

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
      if (val) {
        nodes[msgId] = {
          x: val.x,
          y: val.y,
        };
      } else {
        nodes[msgId] = null;
      }
      setNodes(JSON.parse(JSON.stringify(nodes)));
    });
  }

  useEffect(() => {
    if (selected !== null) {
      const node = nodes[selected];
      setSelectedY(node.y);
    } else {
      setSelectedY(null);
    }
  }, [selected, nodes]);

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div ref={scrollRef} className="canvas border border-solid">
        {nodes.map((node, i) => {
          return node ? (
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
                  x: p.x,
                  y: p.y,
                };
                setNodes(newNodes);
              }}
              onStart={() => {
                setDragging(true);
              }}
              onStop={(e, d) => {
                let node = nodes[i];
                node.d = false;
                gunStore.get(i).put(node);
                setSelected(i);
                setDragging(false);
              }}
            >
              <div
                className={`cell ${selected === i ? "border-2" : "border"}`}
                style={{
                  borderColor: `${mToColor(yToM(node.y))}`,
                  backgroundColor:
                    selected === i ? `${mToColor(yToM(selectedY))}88` : `transparent`,
                }}
              ></div>
            </Draggable>
          ) : null;
        })}
        {nodes.map((node, i) => {
          return node ? (
            <div>
              <div
                className="string-label pl-1"
                style={{
                  top: `${node.y}px`,
                  left: `${scrollX}px`,
                  color: `${mToColor(yToM(node.y))}`,
                }}
              >
                <span className="text-xs">{midiToNoteName(yToM(node.y))}</span>
                <sup className="text-xxs">{midiToTuningSymbol(yToM(node.y))}</sup>
              </div>
            </div>
          ) : null;
        })}

        <div className={`fixed top-0 ${dragging ? "invisible" : null} z-50`}>
          <button
            className="hover:bg-gray-800 text-gray-600 border rounded border-gray-600 text-lg px-5 py-2"
            onClick={() => {
              const i = nodes.length;
              const node = {
                x: 0.5 * windowW + scrollX - 0.5 * CELL_HEIGHT,
                y: 0.5 * windowH + scrollY - 0.5 * CELL_HEIGHT,
              };
              gunStore.get(i).put(node);
              setSelected(i);
            }}
          >
            +□
          </button>
        </div>
        <div className={`fixed top-0 right-0 ${dragging ? "invisible" : null} z-50`}>
          <button
            hidden={selected === null}
            className="ml-3 hover:bg-gray-800 text-white border-2 rounded border-white text-lg px-5 py-2"
            style={{
              borderColor: mToColor(yToM(selectedY)),
              color: mToColor(yToM(selectedY)),
            }}
            onClick={() => {
              gunStore.get(selected).put(null);
              setSelected(null);
            }}
          >
            -□
          </button>
        </div>

        <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
          <Layer>
            {nodes.map((node, i) => {
              return node ? (
                <Line
                  points={[0, node.y + 0.5 * CELL_HEIGHT, CANVAS_WIDTH, node.y + 0.5 * CELL_HEIGHT]}
                  stroke={mToColor(yToM(node.y))}
                  strokeWidth={2}
                  dash={[2, xToSep(node.x)]}
                />
              ) : null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default PlacePage;
