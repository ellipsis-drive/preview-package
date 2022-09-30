const API = "https://api.ellipsis-drive.com/v3/";

class EllipsisPreview {
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
    loggedIn: false,
    div: null,
    token: null,
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
    } else {
      // find out if there's a token for us in the url
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      if (urlParams.has("token")) {
        this.settings.token = urlParams.get("token");
        this.settings.loggedIn = true;
      }
    }
  }
}

export default EllipsisPreview;
