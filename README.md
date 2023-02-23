### Ellipsis Preview

This package allows you to easily load a preview for your Ellipsis Drive layers.


### Using the package

Place preview.js in your project directory. Construct an EllipsisPreview object, passing an object as paramater containing the following properties:

1. "div", an HTML element where the folder browser should be displayed in.
2. "cb" (semi-optional), the callback function to be called when a layer is clicked. A default callback is provided, but please provide your own.
3. "layer" (semi-optional), a layer object for which you want to display a preview
4. "pathId" (semi-optional), instead of a layer object, you may also provide a pathId, in which case the layer object wil be retrieved by the package
5. "token" (optional), the (Ellipsis) api token to be used.
6. "osmToken" (optional), munidal open street map token (to remove the QR code displayed)
7. "styleId" (optional), the id of the style you would like to render as preview
8. "width" (optional), the width of the preview to be generated. if none is provided, the width of the provided div is used.
9. "height" (optional), the height of the preview to be generated. if none is provided, the height of the provided div is used.
10. "disableCbIfNoPreview" (optional), default false, disable the callback when no preview is shown
11. "showLayerType" (optional), default true, determines whether the type of the layer is displayed
12. "vectorPreviewFeaturesCount" (optional),  default 50, the number of features displayed for vector layers

#### Example usage
test.html

```html
<html>
  <head>
    <script src="https://raw.githubusercontent.com/ellipsis-drive/preview-package/npm-support/build/ellipsis-preview.js"></script>
  </head>
  <body>
    <div id="test"></div>
    <script>
      let cb = (layer) => {
        console.log("Preview clicked");
      };
      let div = document.getElementById("test");

      let options = {
        div: div,
        cb: cb,
        pathId: "2109c37a-d549-45dd-858e-7eddf1bd7c22",
      }

      let myDrive = new EllipsisDrive(options);
    </script>
  </body>
</html>
```