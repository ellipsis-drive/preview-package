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
      cursor: "auto",
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
      cursor: "auto",
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
    div.id = `ellipsis-preview-${this.layer.id}` 

    div.style.background = "#FFF";
    div.style.width = `${WIDTH}px`;
    div.style.height = `${HEIGHT}px`;
    div.style.borderRadius = "4px";
    div.style.boxShadow = "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px";

    div.style.position = "relative";

    let headerdiv = document.createElement("div");
    // the header contains the ellipsis logo, the name of the layer and the rights
    // we start with the first two

    headerdiv.className = "ellipsis-preview-header"
    headerdiv.style.display = "flex";
    headerdiv.style.alignItems = "center";
    headerdiv.style.gap = "16px";
    headerdiv.style.padding = "16px";

    console.log(this.layer);

    let profileImage = document.createElement("img")
    let namep = this.p(this.layer.name);
    profileImage.id = `ellipsis-preview-logo-${this.layer.id}`;
    if (this.profileImage === null){
    profileImage.src = `data:image/jpeg;base64,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`
      
    }
    else {
      profileImage.src = this.profileImage;
    }
    profileImage.style.width = "40px";
    profileImage.style.height = "40px";
    profileImage.style.color = "transparent";
    profileImage.style.borderRadius = "50%";
    
    headerdiv.appendChild(profileImage);
    headerdiv.appendChild(namep);


    let imgdiv = document.createElement("div");
    imgdiv.className = "ellipsis-preview-img";
    imgdiv.style.width = `${WIDTH}px`;
    imgdiv.style.height = `${HEIGHT}px`;

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
      imgdiv.style[key] = style[key];
    }

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

    
    let footerdiv = document.createElement("div");
    if (this.layer.metadata.description !== "")
      footerdiv.appendChild(this.p(this.layer.metadata.description));

    div.appendChild(headerdiv);
    
    imgdiv.appendChild(basepng);
    imgdiv.appendChild(ellipsispng);
    imgdiv.appendChild(layertype);



    div.appendChild(imgdiv);

    div.appendChild(footerdiv);

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
