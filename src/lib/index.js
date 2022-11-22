const API = "https://api.ellipsis-drive.com/v3/";

let apiCall = (path, body, user, cb) => {
  return;
};

class EllipsisPreview {
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
    const currentAspectRatio = computeRatio(extent);
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

  getBaseMapPng = ({ extent, height, width }) => {
    const newExtent = getNewExtent(
      width / height,
      getReprojectedExtent(extent)
    );

    return `https://ows.mundialis.de/osm/service?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${
      newExtent.xMin
    },${newExtent.yMin},${newExtent.xMax},${
      newExtent.yMax
    }&SRS=EPSG%3A3857&WIDTH=${width}&HEIGHT=${Number(
      height / 1
    )}&LAYERS=OSM-WMS-no-labels&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=true`;
  };

  getEllipsisMapPng = ({
    mapId,
    extent,
    timestampId,
    layerId,
    width,
    height,
    token,
  }) => {
    url = `/ogc/wms/${mapId}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&BBOX=${extent}&SRS=EPSG:3857&width=${width}&height=${height}&LAYERS=${timestampId}_${styleId}&STYLES=&FORMAT=image/png&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi:96&TRANSPARENT=TRUE`;
    if (token) {
      url += `&token=${token}`;
    }

    return url;
  };

  defaultSettings = {
    div: null,
    token: null,
    pathId: null,
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

  render = () => {
    this.settings.div.innerHTML = "";
    if (this.settings.loggedIn) {
      let div = document.createElement("div");
      let p = this.p("Ellipsis Preview");
      let pathId = this.p(this.settings.pathId);

      div.appendChild(p);
      div.appendChild(pathId);
      if (this.layerLoaded) {
        console.log("layer loaded!");
        console.log(this.layer);
      }

      this.settings.div.appendChild(div);
    } else {
      this.settings.div.appendChild(this.loginDiv());
    }
  };
}

export { EllipsisPreview };
