figma.showUI(__html__, { width: 320, height: 440 });

let originalNodeTree = [];

figma.ui.onmessage = msg => {
  // Fetch a specific node by ID.
  if (msg.type === "fetch-layer-data") {
    let layer = figma.getNodeById(msg.id);
    let layerArray = [];

    // Using selection and viewport requires an array.
    layerArray.push(layer);

    // Moves the layer into focus and selects so the user can update it.
    figma.currentPage.selection = layerArray;
    figma.viewport.scrollAndZoomIntoView(layerArray);

    let layerData = JSON.stringify(layer);

    figma.ui.postMessage({
      type: "fetched layer",
      message: layerData
    });
  }

  if (msg.type === "update-errors") {
    figma.ui.postMessage({
      type: "updated errors",
      errors: lint(originalNodeTree)
    });
  }

  // Traverses the node tree
  function traverse(node) {
    if ("children" in node) {
      if (node.type !== "INSTANCE") {
        for (const child of node.children) {
          traverse(child);
        }
      }
    }
    return node;
  }

  function traverseNodes(selection) {
    let traversedNodes = traverse(selection);

    return traversedNodes;
  }

  // Serialize nodes to pass back to the UI.
  function seralizeNodes(nodes) {
    let serializedNodes = JSON.stringify(nodes, [
      "name",
      "type",
      "children",
      "id"
    ]);

    return serializedNodes;
  }

  function lint(nodes) {
    let errorArray = [];

    nodes.forEach(node => {
      // Create a new object.
      let newObject = {};

      // Give it the existing node id.
      newObject.id = node.id;

      // Check object for errors.
      newObject.errors = determineType(node);

      if (node["children"]) {
        errorArray.push(...lint(node["children"]));
      }

      errorArray.push(newObject);
    });

    return errorArray;
  }

  // Initalize the app
  if (msg.type === "run-app") {
    if (figma.currentPage.selection.length === 0) {
      return;
    } else {
      let nodes = traverseNodes(figma.currentPage.selection);

      // Maintain the original tree structure so we can enable
      // refreshing the tree and live updating errors.
      originalNodeTree = nodes;

      // Pass the array back to the UI to be displayed.
      figma.ui.postMessage({
        type: "complete",
        message: seralizeNodes(nodes),
        errors: lint(nodes)
      });
    }
  }

  function determineType(node) {
    switch (node.type) {
      case "COMPONENT":
      case "INSTANCE":
      case "ELLIPSE":
      case "POLYGON":
      case "STAR":
      case "LINE":
      case "BOOLEAN_OPERATION":
      case "FRAME":
      case "VECTOR":
      case "GROUP": {
        let errors = [];
        return errors;
      }
      case "RECTANGLE": {
        return lintShapeRules(node);
      }
      case "TEXT": {
        return lintTextRules(node);
      }
      default: {
        // do nothing
      }
    }
  }

  function lintTextRules(node) {
    let errors = [];

    if (node.textStyleId === "") {
      errors.push("Missing Text Style");
    }

    if (node.fills.length) {
      if (node.fillStyleId === "") {
        errors.push("Missing Fill Style");
      }
    }

    if (node.strokes.length) {
      if (node.strokeStyleId === "") {
        errors.push("Missing Stroke Style");
      }
    }

    if (node.effects.length) {
      if (node.effectStyleId === "") {
        errors.push("Missing Effects Style");
      }
    }

    return errors;
  }

  function lintShapeRules(node) {
    let errors = [];

    if (node.fills.length) {
      if (node.fillStyleId === "") {
        errors.push("Missing Fill Style");
      }
    }

    // Todo Radius

    if (node.strokes.length) {
      if (node.strokeStyleId === "") {
        errors.push("Missing Stroke Style");
      }
    }

    if (node.effects.length) {
      if (node.effectStyleId === "") {
        errors.push("Missing Effects Style");
      }
    }

    return errors;
  }
};