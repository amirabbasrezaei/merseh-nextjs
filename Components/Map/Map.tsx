import React, { useRef, useState } from "react";
import styleJSON from "@/public/style.json";
import MapView, { Marker } from "react-map-gl";
import { Location_Pin, MersehSvg } from "../SVGS";
import { Coordinate } from "../Shipping/Address/Add_Address";



interface Props {
  setCoordinate: React.Dispatch<React.SetStateAction<Coordinate>>;
  coordinate: Coordinate | undefined;
}

export default function Map({ setCoordinate, coordinate }: Props) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [viewState, setViewState] = React.useState({
    longitude: 51.42747209534184,
    latitude: 35.80500946575964,
    zoom: 11,
  });

  return (
    <div className="w-full h-full  rounded-lg [&_canvas]:rounded-lg">
      <MapView
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN}
        {...viewState}
        pitchWithRotate={false}
        dragRotate={false}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "10px",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
        //@ts-ignore
        mapStyle={styleJSON}
        attributionControl={false}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={(evt) =>
          setCoordinate({
            latitude: evt.lngLat.lat,
            longitude: evt.lngLat.lng,
          })
        }
      >
        {coordinate?.latitude ? (
          <Marker
            longitude={coordinate.longitude}
            latitude={coordinate.latitude}
            anchor="bottom"
            rotationAlignment="viewport"
            style={{ top: 0, left: 0, position: "absolute" }}
          >
            <div className="flex flex-col h-fit w-fit justify-between items-center gap-2">
              <Location_Pin classname="w-9 h-9 fill-green1" />
              <svg className="fill-black1  w-1 h-1">
                <circle cy="2" cx="2" r="2" />
              </svg>
            </div>
          </Marker>
        ) : null}

        <Marker
          style={{ top: 0, left: 0, position: "absolute" }}
          longitude={51.42747209534184}
          latitude={35.80500946575964}
        >
          <div className="flex flex-col justify-center items-center ">
            <div className="bg-white rounded-lg w-fit gap-2 h-fit p-2 flex flex-row items-center">
              <MersehSvg classname="w-5 h-auto" />
              <span className="text-[10px] text-black1 font-[500]">
                مرسه اینجاست!
              </span>
            </div>
            <svg
              viewBox="0 0 4 10"
              className="fill-black1 h-4  flex items-center justify-center"
            >
              <line x1="0" y1="0" x2="0" y2="10" stroke="black" />
            </svg>
            {/* <div className="w-fit flex items-center justify-center">
              <svg className="fill-[#4e4e4e]  w-[10px] h-[10px]">
                <circle cy="3" cx="3" r="3" />
              </svg>
            </div> */}
          </div>
        </Marker>
      </MapView>
    </div>
  );
}
