import Head from "next/head";
import Draggable from "react-draggable";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

const PlacePage = (props: any) => {
  const [nodes, setNodes] = useState([
    {
      x: 200,
      y: 200,
    },
    {
      x: 50,
      y: 50,
    },
  ]);

  const {
    query: { place },
  } = useRouter();

  return (
    <div>
      <base target="_blank" />
      <Head>
        <title>{place ?? "harp.city"}</title>
      </Head>
      <div className="w-screen">
        {nodes.map((node, i) => {
          console.log(node);
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
                  x: p.x,
                  y: p.y,
                };
                setNodes(newNodes);
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
