"use client"
import React from "react";
import Addresses from "../Address/Addresses";

export default function Shipping() {
  return (
    <section className="flex flex-row ">
      <div className="basis-1/2">
        <Addresses />
      </div>
      <div className="basis-1/2"></div>
    </section>
  );
}
