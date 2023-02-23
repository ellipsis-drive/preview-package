import proj4 from "./proj4";
import geojson2svg from "./geojson2svg";

const API = "https://api.ellipsis-drive.com/v3";

const SVG = {"vector" : `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="draw-polygon" class="svg-inline--fa fa-draw-polygon MuiChip-icon MuiChip-iconMedium MuiChip-iconColorDefault" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M384 352c-.35 0-.67.1-1.02.1l-39.2-65.32c5.07-9.17 8.22-19.56 8.22-30.78s-3.14-21.61-8.22-30.78l39.2-65.32c.35.01.67.1 1.02.1 35.35 0 64-28.65 64-64s-28.65-64-64-64c-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-35.35-28.64-64-63.99-64zm-288 8.88V151.12A63.825 63.825 0 0 0 119.12 128h208.36l-38.46 64.1c-.35-.01-.67-.1-1.02-.1-35.35 0-64 28.65-64 64s28.65 64 64 64c.35 0 .67-.1 1.02-.1l38.46 64.1H119.12A63.748 63.748 0 0 0 96 360.88zM272 256c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z"></path></svg>`,
              "raster": `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-icon MuiChip-iconMedium MuiChip-iconColorDefault css-14yq2cq" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MapIcon"><path d="m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>`}

const COLOR = {
  "vector": "#3F51B5",
  "raster": "#00796B",
}

class EllipsisPreview {

  isValidTimestamp = (t) => {
    if (t.status !== 'finished') {
      return { available: false, reason: 'Timestamp not active' };
    } else if (t.availability.blocked) {
      return { available: false, reason: t.availability.reason };
    }
    return { available: true };
  };
  
  isValidMap = (m) => {
    const t = m.type;
    if (!m) {
      return { available: false, reason: 'No Layer' };
    }
    if (m.type !== 'raster' && m.type !== 'vector') {
      return { available: true };
    }
    if (m.disabled) {
      return { available: false, reason: 'Layer disabled' };
    }
    if (m.trashed) {
      return { available: false, reason: 'Layer trashed' };
    }
    if (m.yourAccess.accessLevel === 0) {
      return { available: false, reason: 'No access' };
    }
    if (m[t].timestamps.filter((t) => this.isValidTimestamp(t, m).available).length === 0) {
      if (m[t].timestamps.find((t) => t.availability?.reason === 'relocation')) {
        return { available: false, reason: 'Relocating layer' };
      } else if (m[t].timestamps.find((t) => t.availability?.reason === 'reindexing')) {
        return { available: false, reason: 'Reindexing layer' };
      } else if (m[t].type === 'raster' && m[t].timestamps.filter((t) => t.totalSize > 0).length === 0) {
        return { available: false, reason: 'No uploads' };
      } else if (m[t].timestamps.find((t) => t.status === 'activating')) {
        return { available: false, reason: 'Activating files' };
      } else if (m[t].timestamps.find((t) => t.status === 'pausing')) {
        return { available: false, reason: 'Pausing files' };
      } else if (m[t].timestamps.find((t) => t.status === 'paused')) {
        return { available: false, reason: 'No active timestamps' };
      } else {
        return { available: false, reason: 'No timestamps' };
      }
    }
    return { available: true };
  };

  getMetaData = async (pathId) => {
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.settings.token}`,
    };

    let request = await fetch(`${API}/path/${pathId}`, {
      method: "GET",
      headers: headers,

    });

    let resjson = await request.json();

    if (resjson.status == 403){
      console.warn(`Ellipsis Preview: Insufficient access for layer ${this.settings.pathId}`);
    } else {
      this.settings.layer = resjson;
    }
    this.render();
    return;
  };

  computeRatio = (extent) =>
    (extent.xMax - extent.xMin) / (extent.yMax - extent.yMin);

  getNewExtent = (goalAspectRatio, extent) => {
    const currentAspectRatio = this.computeRatio(extent);
    if (goalAspectRatio > currentAspectRatio) {
      const widthToAdd =
        ((extent.xMax - extent.xMin) * (goalAspectRatio - currentAspectRatio)) /
        (2 * currentAspectRatio);
      return {
        xMin: extent.xMin - widthToAdd,
        yMin: extent.yMin,
        xMax: extent.xMax + widthToAdd,
        yMax: extent.yMax,
      };
    } else {
      const heightToAdd =
        ((extent.yMax - extent.yMin) * (currentAspectRatio - goalAspectRatio)) /
        (2 * goalAspectRatio);

      return {
        xMin: extent.xMin,
        yMin: extent.yMin - heightToAdd,
        xMax: extent.xMax,
        yMax: extent.yMax + heightToAdd,
      };
    }
  };

  getReprojectedExtent = (extent) => {
    const reprojectedMins = proj4("EPSG:4326", "EPSG:3857", [
      extent.xMin,
      extent.yMin,
    ]);

    const reprojectedMaxs = proj4("EPSG:4326", "EPSG:3857", [
      extent.xMax,
      extent.yMax,
    ]);

    return {
      xMin: reprojectedMins[0],
      yMin: reprojectedMins[1],
      xMax: reprojectedMaxs[0],
      yMax: reprojectedMaxs[1],
    };
  };

  getBaseMapPng = ({ extent, height, width }) => {
    let img = document.createElement("img");

    const newExtent = this.getNewExtent(
      width / height,
      this.getReprojectedExtent(extent)
    );

    const tokenstr = this.settings.osmToken === null ? "" : `&TOKEN=${this.settings.osmToken}`

    img.src = `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
      newExtent.xMin
    },${newExtent.yMin},${newExtent.xMax},${
      newExtent.yMax
    }&SRS=EPSG%3A3857&WIDTH=${this.settings.width}&HEIGHT=${Number(
      height / 1
    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true${tokenstr}`;

    img.alt = this.settings.layer.name;
    img.loading = "lazy";

    let style = {
      top: "0",
      bottom: "0",
      zIndex: "1",
      position: "absolute",
      background: "transparent",
      objectFit: "fill",
    };

    for (const key in style) {
      img.style[key] = style[key];
    }

    return img;
  };

  // this function sets the 'overlay' of the layer
  // async, because for vector layers we have to do do an api call and process it
  // for raster layers we can set the api call as the img src and lazy load it
  setEllipsisMapPng = async ({
    mapId,
    extent,
    timestampId,
    styleId,
    width,
    height,
    token,
  }, targetdiv) => {

    let img = document.createElement("img");
    let vectorssvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    const reprojectedExtent = this.getReprojectedExtent(extent);

    const newExtent = this.getNewExtent(width/height, reprojectedExtent);

    let url = "";

    if (this.settings.layer.type === "raster"){
      if (token) {
        url = `${API}/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${newExtent.xMin},${newExtent.yMin},${newExtent.xMax},${newExtent.yMax}&SRS=EPSG:3857&width=${this.settings.width}&height=${this.settings.height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE&token=${token}`;
      } else {
        url = `${API}ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${newExtent.xMin},${newExtent.yMin},${newExtent.xMax},${newExtent.yMax}&SRS=EPSG:3857&width=${this.settings.width}&height=${this.settings.height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;
      }

      img.src = url;
      img.alt = this.settings.layer.name;
      img.loading = "lazy";
  
      let style = {
        top: "0",
        bottom: "0",
        zIndex: "2",
        position: "absolute",
        background: "transparent",
      };
  
      for (const key in style) {
        img.style[key] = style[key];
      }
  
      targetdiv.appendChild(img);

    } else if (this.settings.layer.type === "vector"){

      let headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.token}`,
      };

      let res = await fetch(`${API}/path/${mapId}/vector/timestamp/${timestampId}/listFeatures?returnType=center&pageSize=${this.settings.vectorPreviewFeaturesCount}`, {
        method: "GET",
        headers: headers,
      });
      res = await res.json();
      
      let reprojectedResult = {
        ...res.result,
        features: res?.result?.features?.map((feature) => {
          return {
            ...feature,
            properties: {
              ...feature?.properties,
              color:
                feature?.properties?.color?.length === 9
                  ? feature?.properties?.color?.slice(0, 7)
                  : feature?.properties?.color,
            },
            geometry: {
              ...feature.geometry,
              coordinates: proj4('EPSG:4326', 'EPSG:3857', [
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
              ]),
            },
          };
        }),
      };

      const converter = geojson2svg({
        viewportSize: {
          width: width,
          height: height,
        },
        mapExtent: {
          left: newExtent.xMin,
          right: newExtent.xMax,
          bottom: newExtent.yMin,
          top: newExtent.yMax,
        },
        pointAsCircle: true,
        r: Math.ceil((height / 100) * 5),
        attributes: [
          {
            property: 'properties.color',
            type: 'dynamic',
            key: 'fill',
          },
        ],
      });

      const svgStrings = converter.convert(reprojectedResult);

      vectorssvg.style.width = this.settings.width;
      vectorssvg.style.height = this.settings.height;
      vectorssvg.style.position = "absolute";
      vectorssvg.style.zIndex = "3";
      vectorssvg.style.width = "100%";
      vectorssvg.style.height = "100%";
      vectorssvg.innerHTML = svgStrings;

      targetdiv.appendChild(vectorssvg)
    }

  };

  defaultSettings = {
    div: null,
    token: null,
    pathId: null,
    timestampId: null,
    styleId: null,
    vectorPreviewFeaturesCount: 50,
    width: null,
    height: null,
    disableCbIfNoPreview: false,
    osmToken: null,
    layer: null,
  };

  settings = {};

  constructor(options = {}) {
    this.settings = { ...this.defaultSettings, ...options };

    if (!("div" in options)) {
      console.warn("EllipsisPreview: no div is provided!");
      return;
    }

    if ("token" in options) {
      this.settings.token = options.token;
      this.settings.loggedIn = true;
    }

    // if no width and height is supplied by the user, we use the width and height of the div we've been given
    if (this.settings.width === null && this.settings.height === null){
      this.settings.width = this.settings.div.offsetWidth;
      this.settings.height = this.settings.div.offsetHeight;
    }

    // if the user provides a layer object, we don't have to do anything
    // if a pathId is provided, we retrieve the layer information ourselves. 
    // if none is provided, we can't render a preview
    if (this.settings.layer === null){
      if (this.settings.pathId === null){
        console.warn("EllipsisPreview: no pathId or layer object is provided!")
      } else {
        this.getMetaData(this.settings.pathId);
      }
    }

    this.render();
  }

  p = (str) => {
    let elem = document.createElement("p");
    elem.innerText = str;
    elem.classList.add("ellipsis-preview-p");
    elem.style.fontFamily = `"Roboto Condensed","Roboto","Helvetica","Lucida Sans Unicode","sans-serif"`;
    return elem;
  };

  getPlaceholderImg = () => {
    let placeholder = document.createElement("div");
    placeholder.style.width = "inherit";
    placeholder.style.height = "inherit";
    placeholder.style.gap = "12px";
    placeholder.style.top = "0";
    placeholder.style.left = "0";
    placeholder.style.right = "0";
    placeholder.style.bottom = "0";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.flexDirection = "column";
    placeholder.style.backgroundSize = "contain";
    placeholder.style.justifyContent = "center";
    placeholder.style.backgroundImage =
      "url(https://app.ellipsis-drive.com/images/drive/map_placeholder.jpg)";
    placeholder.style.backgroundPosition = "center";
    return placeholder;
  };

  getExtent = (layer) => {
    let type = layer.type;

    let timestamp = null;
    let styleId = null;

    // if timestampId is provided, find that timestamp, otherwise pick the first one

    if (this.settings.timestampId !== null){
      timestamp = layer[type].timestamps.find(elem => elem.id === this.settings.timestampId);
    } else {
      timestamp = layer[type].timestamps[0];
    }

    // same for styleId
  
    if (this.settings.styleId !== null){
      styleId = this.settings.styleId;
    } else {
      styleId = layer[type].styles[0].id;
    }

    return {
      extent: timestamp.extent,
      timestampId: timestamp.id,
      styleId: styleId,
    }
  };

  invalidRender = (validobj) => {
    let div = document.createElement("div");
    div.className = "ellipsis-preview-img";
    div.style.width = `${this.settings.width}px`;
    div.style.height = `${this.settings.height}px`;

    let placeholder = this.getPlaceholderImg();
    placeholder.style.backgroundColor = "#00000054";

    let reason = document.createElement("div");

    reason.appendChild(this.p(validobj.reason));

    reason.style.color = "#FFF";

    reason.style.position = "absolute";
    reason.style.zIndex = 3;
    
    div.style.display = "flex";
    div.style.display = "flex";
    div.style.position = "absolute";
    div.style.alignItems = "center";
    div.style.flexDirection = "column";
    div.style.backgroundSize = "contain";
    div.style.justifyContent = "center";

    let grayout = document.createElement("div");
    grayout.style.backgroundColor = "#00000054";
    grayout.style.position = "absolute";
    grayout.style.zIndex = "2";
    grayout.style.width = `${this.settings.width}px`;
    grayout.style.height = `${this.settings.height}px`;

    if (!this.settings.disableCbIfNoPreview){
      div.onclick = () => {
        this.settings.cb(this.settings.layer);
      }
      div.style.cursor = "pointer";
    }

    div.appendChild(placeholder);
    div.appendChild(reason);
    div.appendChild(grayout);
    
    return div;
  }

  previewRender = () => {
    let div = document.createElement("div");
    div.style.width = `${this.settings.width}px`;
    div.style.height = `${this.settings.height}px`;

    div.id = `ellipsis-preview-${this.settings.layer.id}`;
    div.classList.add("ellipsis-preview");

    let style = {
      left: "0",
      right: "0",
      bottom: "0",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "LightGray",
    };

    for (const key in style) {
      div.style[key] = style[key];
    }

    let obj = {
      extent: this.getExtent(this.settings.layer).extent,
      width: this.settings.width,
      height: this.settings.height,
      token: this.settings.token,
      timestampId: this.getExtent(this.settings.layer).timestampId,
      styleId: this.getExtent(this.settings.layer).styleId,
      mapId: this.settings.layer.id,
    };

    let basepng = this.getBaseMapPng(obj);
    basepng.classList.add("ellipsis-preview-base")

    let ellipsispngdiv = document.createElement("div");
    this.setEllipsisMapPng(obj, ellipsispngdiv);

    ellipsispngdiv.classList.add("ellipsis-preview-overlay")
    
    let layertype = document.createElement("div");

    layertype.style.backgroundColor = COLOR[this.settings.layer.type];
    layertype.style.color = "#fff";
    layertype.style.right = "12px";
    layertype.style.bottom = "12px";
    layertype.style.padding = "0 12 px";
    layertype.style.zIndex = "3"
    layertype.style.position = "absolute";
    layertype.style.height = "32px";

    layertype.style.display = "inline-flex";
    layertype.style.justifyContent = "center";
    layertype.style.borderRadius = "16px";

    let typesvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    typesvg.innerHTML = SVG[this.settings.layer.type]
    typesvg.style.fill = "#fff";
    typesvg.style.width = "1.1em";
    typesvg.style.paddingLeft = "10px";

    typesvg.classList.add(`ellipsis-preview-type`);

    layertype.appendChild(typesvg);
    let layertypetext = document.createElement("span");
    layertypetext.innerHTML = this.settings.layer.type;
    layertypetext.style.textTransform = "capitalize";
    layertypetext.style.display = "inline-flex";
    layertypetext.style.alignItems = "center";
    layertypetext.style.padding = "0 12px 2px 5px";
    layertypetext.style.fontFamily = "Roboto Condensed, Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol";
    layertypetext.style.userSelect = "none";

    layertype.appendChild(layertypetext);
    
    div.appendChild(basepng);
    div.appendChild(ellipsispngdiv);
    div.appendChild(layertype);

    div.onclick = () => {
      this.settings.cb(this.settings.layer);
    }

    div.style.cursor = "pointer";

    return div;
  };

  loadingRender = () => {
    let div = document.createElement("div");
    div.style.width = `${this.settings.width}px`;
    div.style.height = `${this.settings.height}px`;
    div.style.backgroundColor = "#00000054";


    // "Loading" text could be included if wanted

    // let loadtxt = this.p("Loading...");
    // loadtxt.style.position = "relative";
    // loadtxt.style.textAlign = "center";
    // loadtxt.style.top = `${this.settings.height / 2 - 10}px`;
    // div.appendChild(loadtxt);
    
    return div;
  };

  render = () => {
    this.settings.div.innerHTML = "";
      if (this.settings.layer !== null) {
        let valid = this.isValidMap(this.settings.layer);
        if (valid.available){
          this.settings.div.appendChild(this.previewRender());
        } else {
          this.settings.div.appendChild(this.invalidRender(valid));
        }
      } else {
        this.settings.div.appendChild(this.loadingRender());
      }
  };
}

export { EllipsisPreview };
