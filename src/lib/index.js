import proj4 from "./proj4";

const API = "https://api.ellipsis-drive.com/v3/";

let apiCall = (path, body, user, cb) => {
  return;
};

class EllipsisPreview {

  isValidTimestamp = (t) => {
    if (t.status !== 'active') {
      return { available: false, reason: 'Timestamp not active' };
    } else if (t.availability.blocked) {
      return { available: false, reason: t.availability.reason };
    }
    return { available: true };
  };
  
  isValidMap = (m) => {
    if (!m) {
      return { available: false, reason: 'No Layer' };
    }
    if (m.type !== 'raster' && m.type !== 'vector') {
      return { available: true };
    }
    if (m.disabled) {
      return { available: false, reason: 'Layer disabled' };
    }
    if (m.deleted) {
      return { available: false, reason: 'Layer trashed' };
    }
    if (m.yourAccess.accessLevel === 0) {
      return { available: false, reason: 'No access' };
    }
    if (m[m.type].timestamps.filter((t) => this.isValidTimestamp(t, m).available).length === 0) {
      if (m[m.type].timestamps.find((t) => t.availability?.reason === 'relocation')) {
        return { available: false, reason: 'Relocating layer' };
      } else if (m[m.type].timestamps.find((t) => t.availability?.reason === 'reindexing')) {
        return { available: false, reason: 'Reindexing layer' };
      } else if (m.type === 'raster' && m[m.type].timestamps.filter((t) => t.uploads.completed > 0).length === 0) {
        return { available: false, reason: 'No uploads' };
      } else if (m[m.type].timestamps.find((t) => t.status === 'activating')) {
        return { available: false, reason: 'Activating files' };
      } else if (m[m.type].timestamps.find((t) => t.status === 'pausing')) {
        return { available: false, reason: 'Pausing files' };
      } else if (m[m.type].timestamps.find((t) => t.status === 'created')) {
        return { available: false, reason: 'No active timestamps' };
      } else {
        return { available: false, reason: 'No timestamps' };
      }
    }
    return { available: true };
  };

  getButton = (text, cb) => {
    let button = document.createElement("button");
    button.onclick = cb;
    button.innerHTML = text;
    button.style.color = "#fff";
    button.style.backgroundColor = "#089EC8";
    button.style.boxShadow =
      "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)";
    button.style.padding = "6px 16px";
    button.style.fontSize = "1rem";
    button.style.minWidth = "64px";
    button.style.boxSizing = "border-box";
    button.style.transition = `"background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`;
    button.style.fontFamily = [
      "Roboto Condensed",
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Exo 2",
    ];
    button.style.fontWeight = "500";
    button.style.lineHeight = "1.75";
    button.style.borderRadius = "4px";
    button.style.letterSpacing = "0.5px";
    button.style.textTransform = "uppercase";
    button.style.border = 0;
    return button;
  };

  loginDiv = () => {
    let div = document.createElement("div");
    div.appendChild(this.p("Please log in to your Ellipsis Drive account:"));
    div.style.textAlign = "center";
    let button = this.getButton("Log in", () => {
      window.location = `https://app.ellipsis-drive.com/login?referer=${window.location.href}`;
    });
    div.appendChild(button);
    return div;
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

    return request.json().then((ret) => {
      this.layerLoaded = true;
      this.layer = ret;
      this.render();
    });
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
    const reprojectedMins = proj4('EPSG:4326', 'EPSG:3857', [extent.xMin, extent.yMin]);
  
    const reprojectedMaxs = proj4('EPSG:4326', 'EPSG:3857', [extent.xMax, extent.yMax]);
  
    return {
      xMin: reprojectedMins[0],
      yMin: reprojectedMins[1],
      xMax: reprojectedMaxs[0],
      yMax: reprojectedMaxs[1],
    };
  };

  getBaseMapPng = ({ extent, height, width }) => {
    const newExtent = this.getNewExtent(
      width / height,
      this.getReprojectedExtent(extent)
    );

    return `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
      newExtent.xMin
    },${newExtent.yMin},${newExtent.xMax},${
      newExtent.yMax
    }&SRS=EPSG%3A3857&WIDTH=${width}&HEIGHT=${Number(
      height / 1
    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true`;
  };

  getEllipsisMapPng = ({ mapId, extent, timestampId, styleId, width, height, token }) => {
    if (token) {
      return `v3/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
        extent.xMin
      },${extent.yMin},${extent.xMax},${
        extent.yMax
      }&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE&token=${token}`;
    } else {
      return `v3/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
        extent.xMin
      },${extent.yMin},${extent.xMax},${
        extent.yMax
      }&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;
    }
  };

  defaultSettings = {
    div: null,
    token: null,
    pathId: null,
    timestampId: null,
    styleId: null,
  };

  settings = {};
  layer = null;
  layerLoaded = false;

  constructor(options = {}) {
    this.settings = { ...this.defaultSettings, ...options };

    if (!("div" in options)) {
      console.warn("EllipsisPreview: no div is provided!");
      return;
    }
    if (!("pathId" in options)) {
      console.warn("EllipsisPreview: no pathId is provided!");
      return;
    }

    if ("token" in options) {
      this.settings.token = options.token;
      this.settings.loggedIn = true;
    } else {
      // find out if there's a token for us in the url
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      if (urlParams.has("token")) {
        this.settings.token = urlParams.get("token");
        this.settings.loggedIn = true;
      }
    }

    this.getMetaData(this.settings.pathId);

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
    placeholder.style.backgroundImage = "url(https://app.ellipsis-drive.com/images/drive/map_placeholder.jpg)";
    placeholder.style.width = "inherit";
    placeholder.style.height = "inherit";
    placeholder.style.gap = "12px";
    placeholder.style.top = "0";
    placeholder.style.left = "0";
    placeholder.style.right = "0";
    placeholder.style.bottom = "0";
    placeholder.style.display = "flex";;
    placeholder.style.alignItems = "center";
    placeholder.style.flexDirection= "column";
    placeholder.style.backgroundSize = "contain";
    placeholder.style.justifyContent = "center";
    placeholder.style.backgroundImage = "url(https://app.ellipsis-drive.com/images/drive/map_placeholder.jpg)";
    placeholder.style.backgroundPosition = "center";
    return placeholder;
  }

  getExtent = (layer) => {
    // TODO for now we just pick the first one, but some more elaborate picking scheme should be implemented later
    let type = layer.type;
    return {extent: layer[type].timestamps[0].extent, timestampId: layer[type].timestamps[0].id, styleId: layer[type].styles[0].id};

    if (this.settings.timestampId === null){
      // find our own, if that fails we render placeholder

      

    } else {
      timestampId = this.settings.timestampId
    }
    return layer[type].timestamps[timestampId].extent
  }

  requestEllipsisPng = () =>{
    let obj = {
      extent: this.getExtent(this.layer).extent,
      width: WIDTH,
      height: HEIGHT,
      token: this.settings.token,
      timestampId: this.getExtent(this.layer).timestampId,
      styleId: this.getExtent(this.layer).styleId,
      mapId: this.layer.id,
    }
    let ellipsispng = this.getEllipsisMapPng(obj);

    let request = await fetch(`${API}${ellipsispng}}`, {
      method: "GET",
      headers: headers,
    });
  }

  requestBasePng = () => {
    let obj = {
      extent: this.getExtent(this.layer).extent,
      width: WIDTH,
      height: HEIGHT,
      token: this.settings.token,
      timestampId: this.getExtent(this.layer).timestampId,
      styleId: this.getExtent(this.layer).styleId,
      mapId: this.layer.id,
    }

    let basepng = this.getBaseMapPng(obj);
  }

  previewRender = () => {

    const WIDTH = "300";
    const HEIGHT = "200"; 

    let div = document.createElement("div");
    console.log(this.layer);


    let imgdiv = document.createElement("div");
    imgdiv.style.width = WIDTH;
    imgdiv.style.height = HEIGHT;

    let placeholder = this.getPlaceholderImg();
    imgdiv.appendChild(placeholder);

    let obj = {
      extent: this.getExtent(this.layer).extent,
      width: WIDTH,
      height: HEIGHT,
      token: this.settings.token,
      timestampId: this.getExtent(this.layer).timestampId,
      styleId: this.getExtent(this.layer).styleId,
      mapId: this.layer.id,
    }

    let basepng = this.getBaseMapPng(obj);
    let ellipsispng = this.getEllipsisMapPng(obj);

    console.log(basepng);
    console.log(ellipsispng);

    div.appendChild(this.p(this.layer.name));
    div.appendChild(this.p(this.settings.pathId));
    div.appendChild(imgdiv);

    return div;
  }

  loadingRender = () => {
    // should at some point just render the same as previewrender, but grayed out
    let div = document.createElement("div");
    div.appendChild(this.p("Loading..."));
    return div;
  }

  render = () => {
    this.settings.div.innerHTML = "";
    if (this.settings.loggedIn) {
      if (this.layerLoaded) {
        this.settings.div.appendChild(this.previewRender());
      } else {
        this.settings.div.appendChild(this.loadingRender());
      }
    } else {
      this.settings.div.appendChild(this.loginDiv());
    }
  };
}

export { EllipsisPreview };
