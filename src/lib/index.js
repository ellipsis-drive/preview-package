import proj4 from "./proj4";

const API = "https://api.ellipsis-drive.com/v3";

const WIDTH = "640";
const HEIGHT = "360";

const SVG = {"vector" : `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="draw-polygon" class="svg-inline--fa fa-draw-polygon MuiChip-icon MuiChip-iconMedium MuiChip-iconColorDefault" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M384 352c-.35 0-.67.1-1.02.1l-39.2-65.32c5.07-9.17 8.22-19.56 8.22-30.78s-3.14-21.61-8.22-30.78l39.2-65.32c.35.01.67.1 1.02.1 35.35 0 64-28.65 64-64s-28.65-64-64-64c-23.63 0-44.04 12.95-55.12 32H119.12C108.04 44.95 87.63 32 64 32 28.65 32 0 60.65 0 96c0 23.63 12.95 44.04 32 55.12v209.75C12.95 371.96 0 392.37 0 416c0 35.35 28.65 64 64 64 23.63 0 44.04-12.95 55.12-32h209.75c11.09 19.05 31.49 32 55.12 32 35.35 0 64-28.65 64-64 .01-35.35-28.64-64-63.99-64zm-288 8.88V151.12A63.825 63.825 0 0 0 119.12 128h208.36l-38.46 64.1c-.35-.01-.67-.1-1.02-.1-35.35 0-64 28.65-64 64s28.65 64 64 64c.35 0 .67-.1 1.02-.1l38.46 64.1H119.12A63.748 63.748 0 0 0 96 360.88zM272 256c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zM400 96c0 8.82-7.18 16-16 16s-16-7.18-16-16 7.18-16 16-16 16 7.18 16 16zM64 80c8.82 0 16 7.18 16 16s-7.18 16-16 16-16-7.18-16-16 7.18-16 16-16zM48 416c0-8.82 7.18-16 16-16s16 7.18 16 16-7.18 16-16 16-16-7.18-16-16zm336 16c-8.82 0-16-7.18-16-16s7.18-16 16-16 16 7.18 16 16-7.18 16-16 16z"></path></svg>`,
              "raster": `<svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiChip-icon MuiChip-iconMedium MuiChip-iconColorDefault css-14yq2cq" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="MapIcon"><path d="m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"></path></svg>`}

const COLOR = {
  "vector": "#3F51B5",
  "raster": "#00796B",
}

let apiCall = (path, body, user, cb) => {
  return;
};

class EllipsisPreview {
  isValidTimestamp = (t) => {
    if (t.status !== "active") {
      return { available: false, reason: "Timestamp not active" };
    } else if (t.availability.blocked) {
      return { available: false, reason: t.availability.reason };
    }
    return { available: true };
  };

  isValidMap = (m) => {
    if (!m) {
      return { available: false, reason: "No Layer" };
    }
    if (m.type !== "raster" && m.type !== "vector") {
      return { available: true };
    }
    if (m.disabled) {
      return { available: false, reason: "Layer disabled" };
    }
    if (m.deleted) {
      return { available: false, reason: "Layer trashed" };
    }
    if (m.yourAccess.accessLevel === 0) {
      return { available: false, reason: "No access" };
    }
    if (
      m[m.type].timestamps.filter((t) => this.isValidTimestamp(t, m).available)
        .length === 0
    ) {
      if (
        m[m.type].timestamps.find(
          (t) => t.availability?.reason === "relocation"
        )
      ) {
        return { available: false, reason: "Relocating layer" };
      } else if (
        m[m.type].timestamps.find(
          (t) => t.availability?.reason === "reindexing"
        )
      ) {
        return { available: false, reason: "Reindexing layer" };
      } else if (
        m.type === "raster" &&
        m[m.type].timestamps.filter((t) => t.uploads.completed > 0).length === 0
      ) {
        return { available: false, reason: "No uploads" };
      } else if (m[m.type].timestamps.find((t) => t.status === "activating")) {
        return { available: false, reason: "Activating files" };
      } else if (m[m.type].timestamps.find((t) => t.status === "pausing")) {
        return { available: false, reason: "Pausing files" };
      } else if (m[m.type].timestamps.find((t) => t.status === "created")) {
        return { available: false, reason: "No active timestamps" };
      } else {
        return { available: false, reason: "No timestamps" };
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

  getMetaDataAndProfileImage = async (pathId) => {
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.settings.token}`,
    };

    let request = await fetch(`${API}/path/${pathId}`, {
      method: "GET",
      headers: headers,

    });

    return request.json().then(async (ret) => {
      this.layerLoaded = true;
      this.layer = ret;

      let headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.token}`,
      };
      let request = await fetch(`${API}/user/${this.layer.user.id}`, {method: "GET", headers: headers})
  
      request.json().then( ret => {
        console.log(ret);
        this.profileImage = `data:image/jpeg;base64,${ret.profile.picture}`;
        this.render();
      });
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

    img.src = `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
      newExtent.xMin
    },${newExtent.yMin},${newExtent.xMax},${
      newExtent.yMax
    }&SRS=EPSG%3A3857&WIDTH=${width}&HEIGHT=${Number(
      height / 1
    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true`;

    img.alt = this.layer.name;
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

  getEllipsisMapPng = ({
    mapId,
    extent,
    timestampId,
    styleId,
    width,
    height,
    token,
  }) => {
    let img = document.createElement("img");

    extent = this.getNewExtent(
      width / height,
      this.getReprojectedExtent(extent)
    );
    let url = "";
    let protocol = this.layer.type == "vector" ? "wfs" : "wms";
    if (token) {
      url = `${API}/ogc/${protocol}/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${extent.xMin},${extent.yMin},${extent.xMax},${extent.yMax}&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE&token=${token}`;
    } else {
      url = `${API}ogc/${protocol}/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${extent.xMin},${extent.yMin},${extent.xMax},${extent.yMax}&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;
    }

    img.src = url;
    img.alt = this.layer.name;
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

    return img;
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
  profileImage = null;

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

    this.getMetaDataAndProfileImage(this.settings.pathId);

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
    // TODO for now we just pick the first one, but some more elaborate picking scheme should be implemented later
    let type = layer.type;
    return {
      extent: layer[type].timestamps[0].extent,
      timestampId: layer[type].timestamps[0].id,
      styleId: layer[type].styles[0].id,
    };

    if (this.settings.timestampId === null) {
      // find our own, if that fails we render placeholder
    } else {
      timestampId = this.settings.timestampId;
    }
    return layer[type].timestamps[timestampId].extent;
  };

  requestEllipsisPng = async () => {
    let obj = {
      extent: this.getExtent(this.layer).extent,
      width: WIDTH,
      height: HEIGHT,
      token: this.settings.token,
      timestampId: this.getExtent(this.layer).timestampId,
      styleId: this.getExtent(this.layer).styleId,
      mapId: this.layer.id,
    };
    let ellipsispng = this.getEllipsisMapPng(obj);

    let request = await fetch(ellipsispng, {
      method: "GET",
    });

    return request;
  };

  previewRender = () => {

    let div = document.createElement("div");
    div.className = "ellipsis-preview-img";
    div.style.width = `${WIDTH}px`;
    div.style.height = `${HEIGHT}px`;

    div.id = `ellipsis-preview-${this.layer.id}` 

    let style = {
      left: "0",
      right: "0",
      bottom: "0",
      display: "flex",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "LightGray",
    };

    for (const key in style) {
      div.style[key] = style[key];
    }

    let placeholder = this.getPlaceholderImg();
    div.appendChild(placeholder);

    let obj = {
      extent: this.getExtent(this.layer).extent,
      width: WIDTH,
      height: HEIGHT,
      token: this.settings.token,
      timestampId: this.getExtent(this.layer).timestampId,
      styleId: this.getExtent(this.layer).styleId,
      mapId: this.layer.id,
    };

    let basepng = this.getBaseMapPng(obj);
    let ellipsispng = this.getEllipsisMapPng(obj);
    
    let layertype = document.createElement("div");

    layertype.style.backgroundColor = COLOR[this.layer.type];
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
    typesvg.innerHTML = SVG[this.layer.type]
    typesvg.style.fill = "#fff";
    typesvg.style.width = "1.1em";
    typesvg.style.paddingLeft = "10px";

    layertype.appendChild(typesvg);
    let layertypetext = document.createElement("span");
    layertypetext.innerHTML = this.layer.type;
    layertypetext.style.textTransform = "capitalize";
    layertypetext.style.display = "inline-flex";
    layertypetext.style.alignItems = "center";
    layertypetext.style.padding = "0 12px";
    layertypetext.style.fontFamily = "Roboto Condensed, Roboto, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol";
    
    layertype.appendChild(layertypetext);

  
    
    div.appendChild(basepng);
    div.appendChild(ellipsispng);
    div.appendChild(layertype);

    div.onclick = () => {
      this.settings.cb(this.layer);
    }

    div.style.cursor = "pointer";

    return div;
  };

  loadingRender = () => {
    // should at some point just render the same as previewrender, but grayed out
    let div = document.createElement("div");
    div.appendChild(this.p("Loading..."));
    return div;
  };

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
