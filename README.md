### Ellipsis Preview

This package allows you to easily load a preview for your Ellipsis Drive layers.


### Using the package

Place folders.js in your project directory. Construct an EllipsisDrive object, passing an object as paramater containing the following properties:

1. "div", an HTML element where the folder browser should be displayed in.
2. "cb" (semi-optional), the callback function to be called when a layer is clicked. A default callback is provided, but please provide your own.
3. "token" (optional), the (Ellipsis) api token to be used.
4. "showRaster" (optional, default true), determines whether raster layers should be displayed.
5. "showVector" (optional, default true), determines whether vector layers should be displayed.
6. "searchIncludeFolders" (optional, default true), determines whether search results should include folders or not.

If no token is provided, the user will be prompted to log in. The user will be redirected to Ellipsis Drive, and, after succesfully loging in, will be returned to the current page.


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