# Web

The demo contains two pages: *Plugins* and *Processing*.

*Plugins* is a basic demo showing the ability to query plugins and show their
detailed descriptions. This was an initial test of building the API in Flask and
consuming it on the client side, little care was taken to code it well and as
such is not overly useful going forward.

*Processing* is a prototype of what a user would see when they want to use the
web application for a reconstruction.

## Building

Babel is used to compile JavaScript:
```sh
babel src -d js
```
