import { EllipsisPreview } from "../lib";

let div = document.getElementById("test");

let callback = (layerobj) => {
  console.log("Clicked on layer");
  console.log(layerobj);
}

let options = {
  div: div,
  // pathId: "0ec49fb8-f577-45de-8e4f-6243fdc62908" // volcano_rgb,
  pathId: "0a2362a6-85e8-480a-ade0-a8f2e45f4e0d", // vulcano
  // pathId: "c955e15e-8747-4714-9008-92c0da514c72", // my own\
  //pathId: "63eaa08e-8ffd-4a1b-b5f0-14eda1456ee5", // "No uploads"
  // pathId: "2109c37a-d549-45dd-858e-7eddf1bd7c22", // vector map (Basis registratie percelen)
  cb: callback,
  backgroundWmsUrl: "https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG%3A3857&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96",
};

let preview = new EllipsisPreview(options);
