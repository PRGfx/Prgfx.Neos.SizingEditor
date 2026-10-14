(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js
  function readFromConsumerApi(key) {
    return (...args) => {
      if (window["@Neos:HostPluginAPI"] && window["@Neos:HostPluginAPI"][`@${key}`]) {
        return window["@Neos:HostPluginAPI"][`@${key}`](...args);
      }
      throw new Error("You are trying to read from a consumer api that hasn't been initialized yet!");
    };
  }
  var init_readFromConsumerApi = __esm({
    "node_modules/@neos-project/neos-ui-extensibility/dist/readFromConsumerApi.js"() {
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/react/index.js
  var require_react = __commonJS({
    "node_modules/@neos-project/neos-ui-extensibility/dist/shims/vendor/react/index.js"(exports, module) {
      init_readFromConsumerApi();
      module.exports = readFromConsumerApi("vendor")().React;
    }
  });

  // node_modules/@neos-project/neos-ui-extensibility/dist/index.js
  init_readFromConsumerApi();
  var dist_default = readFromConsumerApi("manifest");

  // src/BoxModelEditor.tsx
  var import_react = __toESM(require_react());

  // src/BoxModelEditor.module.css
  var BoxModelEditor_module_default = { "content": "UmZYgq_content", "box": "UmZYgq_box", "input": "UmZYgq_input" };

  // src/BoxModelEditor.tsx
  var sides = [
    { side: "top", property: "blockStart", label: "Top" },
    { side: "right", property: "inlineEnd", label: "Right" },
    { side: "bottom", property: "blockEnd", label: "Bottom" },
    { side: "left", property: "inlineStart", label: "Left" }
  ];
  var mirrors = {
    blockEnd: "blockStart",
    inlineEnd: "inlineStart"
  };
  var parseNumber = (input) => {
    const trimmed = input.trim();
    if (trimmed === "") {
      return null;
    }
    const nr = Number(trimmed);
    return Number.isFinite(nr) ? nr : null;
  };
  var BoxModelEditor = ({ value, options, commit, i18nRegistry, disabled, id }) => {
    const lockInline = options?.lockInline === true;
    const lockBlock = options?.lockBlock === true;
    const isDisabled = disabled === true || options?.disabled === true;
    const isLocked = (property) => lockBlock && property === "blockEnd" || lockInline && property === "inlineEnd";
    const sizing = (0, import_react.useMemo)(() => {
      const blockStart = value?.blockStart ?? 0;
      const inlineStart = value?.inlineStart ?? 0;
      return {
        blockStart,
        blockEnd: lockBlock ? blockStart : value?.blockEnd ?? 0,
        inlineStart,
        inlineEnd: lockInline ? inlineStart : value?.inlineEnd ?? 0
      };
    }, [value, lockBlock, lockInline]);
    const update = (property, nr) => {
      const next = { ...sizing, [property]: nr };
      for (const [target, source] of Object.entries(mirrors)) {
        if (isLocked(target)) {
          next[target] = next[source];
        }
      }
      commit(next);
    };
    return /* @__PURE__ */ import_react.default.createElement("div", { className: BoxModelEditor_module_default.box }, sides.map(({ side, property, label }) => /* @__PURE__ */ import_react.default.createElement(
      SideInput,
      {
        key: side,
        id: side === "top" ? id : void 0,
        side,
        label: i18nRegistry.translate(`Prgfx.Neos.SizingEditor:Main:side.${side}`, label),
        value: sizing[property],
        locked: isLocked(property),
        disabled: isDisabled,
        onChange: (nr) => update(property, nr)
      }
    )), /* @__PURE__ */ import_react.default.createElement("div", { className: BoxModelEditor_module_default.content, "aria-hidden": "true" }));
  };
  var SideInput = ({ id, side, label, value, locked, disabled, onChange }) => {
    const [draft, setDraft] = (0, import_react.useState)(null);
    const readOnly = disabled || locked;
    const handleChange = (event) => {
      setDraft(event.currentTarget.value);
      const nr = parseNumber(event.currentTarget.value);
      if (nr !== null) {
        onChange(nr);
      }
    };
    const handleKeyDown = (event) => {
      if (readOnly || event.key !== "ArrowUp" && event.key !== "ArrowDown") {
        return;
      }
      event.preventDefault();
      const step = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
      const direction = event.key === "ArrowUp" ? 1 : -1;
      setDraft(null);
      onChange(Math.round((value + direction * step) * 10) / 10);
    };
    return /* @__PURE__ */ import_react.default.createElement(
      "input",
      {
        id,
        className: BoxModelEditor_module_default.input,
        "data-side": side,
        type: "number",
        inputMode: "decimal",
        "aria-label": label,
        title: locked ? void 0 : label,
        value: draft ?? String(value),
        readOnly,
        onChange: handleChange,
        onKeyDown: handleKeyDown,
        onFocus: (event) => event.currentTarget.select(),
        onBlur: () => setDraft(null)
      }
    );
  };

  // src/manifest.ts
  dist_default("Prgfx.Neos.SizingEditor:BoxModelEditor", {}, (globalRegistry) => {
    const editorRegistry = globalRegistry.get("inspector").get("editors");
    editorRegistry.set("Prgfx.Neos.BoxModelEditor", {
      component: BoxModelEditor
    });
  });
})();
