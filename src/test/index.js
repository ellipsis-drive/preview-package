import { EllipsisPreview } from "../lib";

let div = document.getElementById("test");

let options = {
  div: div,
  // pathId: "0ec49fb8-f577-45de-8e4f-6243fdc62908" // volcano_rgb,
   pathId: "0a2362a6-85e8-480a-ade0-a8f2e45f4e0d", // vulcano
  // pathId: "c955e15e-8747-4714-9008-92c0da514c72", // my own\
  // pathId: "2109c37a-d549-45dd-858e-7eddf1bd7c22", // vector map (Basis registratie percelen)
};

let preview = new EllipsisPreview(options);
