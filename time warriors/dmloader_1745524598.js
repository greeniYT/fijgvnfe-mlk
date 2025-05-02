var CUSTOM_PARAMETERS = {
    archive_location_filter: function(path) {
      return "1745524598" + path
    },
    engine_arguments: ["--verify-graphics-calls=false"],
    custom_heap_size: 134217728,
    full_screen_container: "#canvas-container",
    disable_context_menu: !0,
    retry_time: 1,
    retry_count: 10,
    unsupported_webgl_callback: function() {
      document.getElementById("webgl-not-supported").style.display = "block"
    },
    resize_window_callback: function() {
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && window.scrollTo(0, 0);
      var width, height, targetRatio, app_container = document.getElementById("app-container"),
        game_canvas = document.getElementById("canvas"),
        innerWidth = window.innerWidth,
        innerHeight = +window.innerHeight; - 1 == innerWidth && -1 == innerHeight || ((targetRatio = (width = 720) / (height = 1280)) < innerWidth / innerHeight ? (app_container.style.marginLeft = (innerWidth - (width = (height = innerHeight) * targetRatio)) / 2 + "px", app_container.style.marginTop = "0px") : (height = (width = innerWidth) / targetRatio, app_container.style.marginLeft = "0px", app_container.style.marginTop = (innerHeight - height) / 2 + "px"), innerWidth = 1, innerWidth = window.devicePixelRatio || 1, app_container.style.width = width + "px", app_container.style.height = height + 0 + "px", game_canvas.width = Math.floor(width * innerWidth), game_canvas.height = Math.floor(height * innerWidth))
    }
  },
  FileLoader = {
    options: {
      retryCount: 4,
      retryInterval: 1e3
    },
    request: function(url, method, responseType, currentAttempt) {
      if (void 0 === method) throw TypeError("No method specified");
      if ("responseType" == typeof method) throw TypeError("No responseType specified");
      void 0 === currentAttempt && (currentAttempt = 0);
      var obj = {
        send: function() {
          var onprogress = this.onprogress,
            onload = this.onload,
            onerror = this.onerror,
            onretry = this.onretry,
            xhr = new XMLHttpRequest;
          xhr._loadedSize = 0, xhr.open(method, url, !0), xhr.responseType = responseType, xhr.onprogress = function(event) {
            onprogress && onprogress(xhr, event, xhr._loadedSize), xhr._loadedSize = event.loaded
          }, xhr.onerror = function(event) {
            currentAttempt == FileLoader.options.retryCount ? onerror && onerror(xhr, event) : (onretry && onretry(xhr, event, xhr._loadedSize, currentAttempt), xhr._loadedSize = 0, currentAttempt += 1, setTimeout(obj.send.bind(obj), FileLoader.options.retryInterval))
          }, xhr.onload = function(event) {
            onload && onload(xhr, event)
          }, xhr.send(null)
        }
      };
      return obj
    },
    size: function(url, callback) {
      url = FileLoader.request(url, "HEAD", "text");
      url.onerror = function(xhr, e) {
        callback(void 0)
      }, url.onload = function(xhr, e) {
        4 === xhr.readyState && (200 === xhr.status ? (xhr = xhr.getResponseHeader("content-length"), callback(xhr)) : callback(void 0))
      }, url.send()
    },
    load: function(url, responseType, onprogress, onerror, onload, onretry) {
      var request = FileLoader.request(url, "GET", responseType);
      request.onprogress = function(xhr, e, ls) {
        e = e.loaded - ls;
        onprogress(e)
      }, request.onerror = function(xhr, e) {
        onerror("Error loading '" + url + "' (" + e + ")")
      }, request.onload = function(xhr, e) {
        xhr.readyState === XMLHttpRequest.DONE && (200 === xhr.status ? (xhr = xhr.response, onload("json" == responseType && "string" == typeof xhr ? JSON.parse(xhr) : xhr)) : onerror("Error loading '" + url + "' (" + e + ")"))
      }, request.onretry = function(xhr, event, loadedSize, currentAttempt) {
        onretry(loadedSize, currentAttempt)
      }, request.send()
    }
  },
  EngineLoader = {
    wasm_size: 3044487,
    wasmjs_size: 344404,
    asmjs_size: 6169142,
    wasm_instantiate_progress: 0,
    stream_wasm: !1,
    updateWasmInstantiateProgress: function(totalDownloadedSize) {
      EngineLoader.wasm_instantiate_progress = .1 * totalDownloadedSize
    },
    loadAndInstantiateWasmAsync: function(src, imports, successCallback) {
      FileLoader.load(src, "arraybuffer", function(delta) {
        ProgressUpdater.updateCurrent(delta)
      }, function(error) {
        throw error
      }, function(wasm) {
        if (wasm.byteLength != EngineLoader.wasm_size) throw "Invalid wasm size. Expected: " + EngineLoader.wasm_size + ", actual: " + wasm.byteLength;
        WebAssembly.instantiate(new Uint8Array(wasm), imports).then(function(output) {
          successCallback(output.instance)
        }).catch(function(e) {
          throw console.log("wasm instantiation failed! " + e), e
        })
      }, function(loadedDelta, currentAttempt) {
        ProgressUpdater.updateCurrent(-loadedDelta)
      })
    },
    streamAndInstantiateWasmAsync: async function(src, imports, successCallback) {
      var fetchFn = fetch;
      "function" == typeof TransformStream && ReadableStream.prototype.pipeThrough && (fetchFn = async function(path) {
        var ts;
        return (path = await fetch(path)).ok ? (ts = new TransformStream({
          transform(chunk, controller) {
            ProgressUpdater.updateCurrent(chunk.byteLength), controller.enqueue(chunk)
          }
        }), new Response(path.body.pipeThrough(ts), path)) : new Response(null, path)
      }), WebAssembly.instantiateStreaming(fetchFn(src), imports).then(function(output) {
        ProgressUpdater.updateCurrent(EngineLoader.wasm_instantiate_progress), successCallback(output.instance)
      }).catch(function(e) {
        console.log("wasm streaming instantiation failed! " + e), console.log("Fallback to wasm loading"), EngineLoader.loadAndInstantiateWasmAsync(src, imports, successCallback)
      })
    },
    loadWasmAsync: function(exeName) {
      Module.instantiateWasm = function(imports, successCallback) {
        return EngineLoader.stream_wasm && "function" == typeof WebAssembly.instantiateStreaming ? EngineLoader.streamAndInstantiateWasmAsync(exeName + ".wasm", imports, successCallback) : EngineLoader.loadAndInstantiateWasmAsync(exeName + ".wasm", imports, successCallback), {}
      }, EngineLoader.loadAndRunScriptAsync(exeName + "_wasm.js")
    },
    loadAsmJsAsync: function(exeName) {
      EngineLoader.loadAndRunScriptAsync(exeName + "_asmjs.js")
    },
    loadAndRunScriptAsync: function(src) {
      FileLoader.load(src, "text", function(delta) {
        ProgressUpdater.updateCurrent(delta)
      }, function(error) {
        throw error
      }, function(response) {
        var tag = document.createElement("script");
        tag.text = response, document.body.appendChild(tag)
      }, function(loadedDelta, currentAttempt) {
        ProgressUpdater.updateCurrent(-loadedDelta)
      })
    },
    load: function(appCanvasId, exeName) {
      ProgressView.addProgress(Module.setupCanvas(appCanvasId)), CUSTOM_PARAMETERS.exe_name = exeName, FileLoader.options.retryCount = CUSTOM_PARAMETERS.retry_count, FileLoader.options.retryInterval = 1e3 * CUSTOM_PARAMETERS.retry_time, "function" == typeof CUSTOM_PARAMETERS.can_not_download_file_callback && GameArchiveLoader.addFileDownloadErrorListener(CUSTOM_PARAMETERS.can_not_download_file_callback), GameArchiveLoader.addFileLoadedListener(Module.onArchiveFileLoaded), GameArchiveLoader.addArchiveLoadedListener(Module.onArchiveLoaded), GameArchiveLoader.setFileLocationFilter(CUSTOM_PARAMETERS.archive_location_filter), GameArchiveLoader.loadArchiveDescription("/archive_files.json"), "function" == typeof CUSTOM_PARAMETERS.resize_window_callback && ((appCanvasId = CUSTOM_PARAMETERS.resize_window_callback)(), window.addEventListener("resize", appCanvasId, !1), window.addEventListener("orientationchange", appCanvasId, !1), window.addEventListener("focus", appCanvasId, !1))
    }
  },
  GameArchiveLoader = {
    _files: [],
    _fileIndex: 0,
    isCompleted: !1,
    _onFileLoadedListeners: [],
    _onArchiveLoadedListeners: [],
    _onFileDownloadErrorListeners: [],
    _archiveLocationFilter: function(path) {
      return "split" + path
    },
    cleanUp: function() {
      this._files = [], this._fileIndex = 0, this.isCompleted = !1, this._onGameArchiveLoaderCompletedListeners = [], this._onAllTargetsBuiltListeners = [], this._onFileDownloadErrorListeners = []
    },
    addListener: function(list, callback) {
      if ("function" != typeof callback) throw TypeError("Invalid callback registration");
      list.push(callback)
    },
    notifyListeners: function(list, data) {
      for (i = 0; i < list.length; ++i) list[i](data)
    },
    addFileDownloadErrorListener: function(callback) {
      this.addListener(this._onFileDownloadErrorListeners, callback)
    },
    notifyFileDownloadError: function(url) {
      this.notifyListeners(this._onFileDownloadErrorListeners, url)
    },
    addFileLoadedListener: function(callback) {
      this.addListener(this._onFileLoadedListeners, callback)
    },
    notifyFileLoaded: function(file) {
      this.notifyListeners(this._onFileLoadedListeners, {
        name: file.name,
        data: file.data
      })
    },
    addArchiveLoadedListener: function(callback) {
      this.addListener(this._onArchiveLoadedListeners, callback)
    },
    notifyArchiveLoaded: function() {
      this.notifyListeners(this._onArchiveLoadedListeners)
    },
    setFileLocationFilter: function(filter) {
      if ("function" != typeof filter) throw "Invalid filter";
      this._archiveLocationFilter = filter
    },
    loadArchiveDescription: function(descriptionUrl) {
      FileLoader.load(this._archiveLocationFilter(descriptionUrl), "json", function(delta) {}, function(error) {
        GameArchiveLoader.notifyFileDownloadError(descriptionUrl)
      }, function(json) {
        GameArchiveLoader.onReceiveDescription(json)
      }, function(loadedDelta, currentAttempt) {})
    },
    onReceiveDescription: function(json) {
      var totalSize = json.total_size,
        exeName = CUSTOM_PARAMETERS.exe_name,
        json = (this._files = json.content, Module.isWASMSupported);
      json ? (EngineLoader.loadWasmAsync(exeName), totalSize += EngineLoader.wasm_size + EngineLoader.wasmjs_size) : (EngineLoader.loadAsmJsAsync(exeName), totalSize += EngineLoader.asmjs_size), this.downloadContent(), ProgressUpdater.resetCurrent(), json && EngineLoader.updateWasmInstantiateProgress(totalSize), ProgressUpdater.setupTotal(totalSize + EngineLoader.wasm_instantiate_progress)
    },
    downloadContent: function() {
      var file = this._files[this._fileIndex],
        limit = (1 < file.pieces.length && (file.data = new Uint8Array(file.size)), file.pieces.length);
      void 0 !== this.MAX_CONCURRENT_XHR && (limit = Math.min(limit, this.MAX_CONCURRENT_XHR));
      for (var i = 0; i < limit; ++i) this.downloadPiece(file, i)
    },
    notifyDownloadProgress: function(delta) {
      ProgressUpdater.updateCurrent(delta)
    },
    downloadPiece: function(file, index) {
      if (index < file.lastRequestedPiece) throw RangeError("Request out of order: " + file.name + ", index: " + index + ", last requested piece: " + file.lastRequestedPiece);
      var piece = file.pieces[index],
        index = (file.lastRequestedPiece = index, file.totalLoadedPieces = 0, this._archiveLocationFilter("/" + piece.name));
      FileLoader.load(index, "arraybuffer", function(delta) {
        GameArchiveLoader.notifyDownloadProgress(delta)
      }, function(error) {
        GameArchiveLoader.notifyFileDownloadError(error)
      }, function(response) {
        piece.data = new Uint8Array(response), piece.dataLength = piece.data.length, total = piece.dataLength, downloaded = piece.dataLength, GameArchiveLoader.onPieceLoaded(file, piece), piece.data = void 0
      }, function(loadedDelta, currentAttempt) {
        ProgressUpdater.updateCurrent(-loadedDelta)
      })
    },
    addPieceToFile: function(file, piece) {
      if (1 == file.pieces.length) file.data = piece.data;
      else {
        var start = piece.offset,
          end = start + piece.data.length;
        if (start < 0) throw RangeError("Buffer underflow. Start: " + start);
        if (end > file.data.length) throw RangeError("Buffer overflow. End : " + end + ", data length: " + file.data.length);
        file.data.set(piece.data, piece.offset)
      }
    },
    onPieceLoaded: function(file, piece) {
      this.addPieceToFile(file, piece), ++file.totalLoadedPieces, file.totalLoadedPieces == file.pieces.length ? this.onFileLoaded(file) : (piece = file.lastRequestedPiece + 1) < file.pieces.length && this.downloadPiece(file, piece)
    },
    verifyFile: function(file) {
      for (var actualSize = 0, i = 0; i < file.pieces.length; ++i) actualSize += file.pieces[i].dataLength;
      if (actualSize != file.size) throw "Unexpected data size: " + file.name + ", expected size: " + file.size + ", actual size: " + actualSize;
      if (1 < file.pieces.length)
        for (var pieces = file.pieces, i = 0; i < pieces.length; ++i) {
          var item = pieces[i],
            start = item.offset,
            item = start + item.dataLength;
          if (0 < i) {
            var previous = pieces[i - 1];
            if (previous.offset + previous.dataLength > start) throw RangeError("Segment underflow in file: " + file.name + ", offset: " + (previous.offset + previous.dataLength) + " , start: " + start)
          }
          if (pieces.length - 2 > i) {
            previous = pieces[i + 1];
            if (item > previous.offset) throw RangeError("Segment overflow in file: " + file.name + ", offset: " + previous.offset + ", end: " + item)
          }
        }
    },
    onFileLoaded: function(file) {
      this.verifyFile(file), this.notifyFileLoaded(file), ++this._fileIndex, this._fileIndex == this._files.length ? this.onArchiveLoaded() : this.downloadContent()
    },
    onArchiveLoaded: function() {
      this.isCompleted = !0, this.notifyArchiveLoaded()
    }
  },
  ProgressView = {
    progress_id: "defold-progress",
    bar_id: "defold-progress-bar",
    addProgress: function(canvas) {
      canvas.insertAdjacentHTML("afterend", '<div id="' + ProgressView.progress_id + '" class="canvas-app-progress"><div id="' + ProgressView.bar_id + '" class="canvas-app-progress-bar" style="transform: scaleX(0.0);"></div></div>'), ProgressView.bar = document.getElementById(ProgressView.bar_id), ProgressView.progress = document.getElementById(ProgressView.progress_id)
    },
    updateProgress: function(percentage) {
      ProgressView.bar && (ProgressView.bar.style.transform = "scaleX(" + Math.min(percentage, 100) / 100 + ")")
    },
    removeProgress: function() {
      null !== ProgressView.progress.parentElement && (ProgressView.progress.parentElement.removeChild(ProgressView.progress), Module.canvas.style.background = "")
    }
  },
  ProgressUpdater = {
    current: 0,
    total: 1,
    listeners: [],
    addListener: function(callback) {
      if ("function" != typeof callback) throw TypeError("Invalid callback registration");
      this.listeners.push(callback)
    },
    notifyListeners: function(percentage) {
      for (i = 0; i < this.listeners.length; ++i) this.listeners[i](percentage)
    },
    setupTotal: function(total) {
      this.total = total
    },
    setCurrent: function(current) {
      this.current = current;
      current = this.calculateProgress();
      ProgressView.updateProgress(current), this.notifyListeners(current)
    },
    updateCurrent: function(diff) {
      this.current += diff;
      diff = this.calculateProgress();
      ProgressView.updateProgress(diff), this.notifyListeners(diff)
    },
    resetCurrent: function() {
      this.current = 0
    },
    complete: function() {
      this.setCurrent(this.total)
    },
    calculateProgress: function() {
      return this.current / this.total * 100
    }
  },
  Progress = {
    addListener: function(callback) {
      ProgressUpdater.addListener(callback)
    },
    notifyListeners: function(percentage) {},
    addProgress: function(canvas) {
      ProgressView.addProgress(canvas)
    },
    updateProgress: function(percentage) {},
    calculateProgress: function(from, to, current, total) {},
    removeProgress: function() {
      ProgressView.removeProgress()
    }
  },
  Module = {
    noInitialRun: !0,
    _filesToPreload: [],
    _archiveLoaded: !1,
    _preLoadDone: !1,
    _isEngineLoaded: !1,
    persistentStorage: !0,
    _syncInProgress: !1,
    _syncNeeded: !1,
    _syncInitial: !1,
    _syncMaxTries: 3,
    _syncTries: 0,
    arguments: [],
    print: function(text) {
      console.log(text)
    },
    printErr: function(text) {
      console.error(text)
    },
    setStatus: function(text) {
      console.log(text)
    },
    isWASMSupported: function() {
      try {
        if ("object" == typeof WebAssembly && "function" == typeof WebAssembly.instantiate) {
          var module = new WebAssembly.Module(Uint8Array.of(0, 97, 115, 109, 1, 0, 0, 0));
          if (module instanceof WebAssembly.Module) return new WebAssembly.Instance(module) instanceof WebAssembly.Instance
        }
      } catch (e) {}
      return !1
    }(),
    prepareErrorObject: function(err, url, line, column, errObj) {
      url = (url = void 0 === url ? "" : url) + ":" + (line = void 0 === line ? 0 : line) + ":" + (column = void 0 === column ? 0 : column), line = errObj || (void 0 !== window.event ? window.event.error : "") || err || "Undefined Error", column = "", errObj = "", "object" == typeof line && void 0 !== line.stack && void 0 !== line.message ? (errObj = String(line.stack), column = String(line.message)) : (column = (errObj = String(line).split("\n")).shift(), errObj = errObj.join("\n")), errObj = errObj || url, err = /at (\S+:\d*$)/.exec(column);
      return err && (column = column.replace(/(at \S+:\d*$)/, ""), errObj = err[1] + "\n" + errObj), column = column.replace(/(abort\(.+\)) at .+/, "$1"), {
        stack: errObj = (errObj = (errObj = (errObj = (errObj = errObj.replace(/\?{1}\S+(:\d+:\d+)/g, "$1")).replace(/ *at (\S+)$/gm, "@$1")).replace(/ *at (\S+)(?: \[as \S+\])? +\((.+)\)/g, "$1@$2")).replace(/^((?:Object|Array)\.)/gm, "")).split("\n"),
        message: column
      }
    },
    hasWebGLSupport: function() {
      var webgl_support = !1;
      try {
        var canvas = document.createElement("canvas"),
          gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl && gl instanceof WebGLRenderingContext && (webgl_support = !0)
      } catch (error) {
        console.log("An error occurred while detecting WebGL support: " + error), webgl_support = !1
      }
      return webgl_support
    },
    setupCanvas: function(appCanvasId) {
      return appCanvasId = void 0 === appCanvasId ? "canvas" : appCanvasId, Module.canvas = document.getElementById(appCanvasId), Module.canvas
    },
    runApp: function(appCanvasId, _) {
      Module._isEngineLoaded = !0, Module.setupCanvas(appCanvasId), Module.arguments = CUSTOM_PARAMETERS.engine_arguments;
      appCanvasId = CUSTOM_PARAMETERS.full_screen_container;
      "string" == typeof appCanvasId && (appCanvasId = document.querySelector(appCanvasId)), Module.fullScreenContainer = appCanvasId || Module.canvas, Module.hasWebGLSupport() ? (Module.canvas.focus(), CUSTOM_PARAMETERS.disable_context_menu && (Module.canvas.oncontextmenu = function(e) {
        e.preventDefault()
      }), Module._preloadAndCallMain()) : (ProgressUpdater.complete(), Module.setStatus = function(text) {
        text && Module.printErr("[missing WebGL] " + text)
      }, "function" == typeof CUSTOM_PARAMETERS.unsupported_webgl_callback && CUSTOM_PARAMETERS.unsupported_webgl_callback())
    },
    onArchiveFileLoaded: function(file) {
      Module._filesToPreload.push({
        path: file.name,
        data: file.data
      })
    },
    onArchiveLoaded: function() {
      GameArchiveLoader.cleanUp(), Module._archiveLoaded = !0, Module._preloadAndCallMain()
    },
    toggleFullscreen: function(element) {
      GLFW.isFullscreen ? GLFW.cancelFullScreen() : GLFW.requestFullScreen(element)
    },
    preSync: function(done) {
      1 != Module.persistentStorage ? done() : FS.syncfs(!0, function(err) {
        err ? (Module._syncTries += 1, console.warn("Unable to synchronize mounted file systems: " + err), Module._syncMaxTries > Module._syncTries ? Module.preSync(done) : (Module._syncInitial = !0, done())) : (Module._syncInitial = !0, void 0 !== done && done())
      })
    },
    preloadAll: function() {
      if (!Module._preLoadDone) {
        Module._preLoadDone = !0;
        for (var i = 0; i < Module._filesToPreload.length; ++i) {
          var item = Module._filesToPreload[i];
          FS.createPreloadedFile("", item.path, item.data, !0, !0)
        }
      }
    },
    persistentSync: function() {
      1 == Module.persistentStorage && Module._syncInitial && (Module._syncInProgress ? Module._syncNeeded = !0 : Module._startSyncFS())
    },
    preInit: [function() {
      var dir = DMSYS.GetUserPersistentDataRoot();
      try {
        FS.mkdir(dir)
      } catch (error) {
        return Module.persistentStorage = !1, void Module._preloadAndCallMain()
      }
      try {
        FS.mount(IDBFS, {}, dir);
        var _close = FS.close;
        FS.close = function(stream) {
          stream = _close(stream);
          return Module.persistentSync(), stream
        }
      } catch (error) {
        return Module.persistentStorage = !1, void Module._preloadAndCallMain()
      }
      Module.preSync(function() {
        Module._preloadAndCallMain()
      })
    }],
    preRun: [function() {
      Module._archiveLoaded && Module.preloadAll()
    }],
    postRun: [function() {
      Module._archiveLoaded && ProgressView.removeProgress()
    }],
    _preloadAndCallMain: function() {
      (Module._syncInitial || 1 != Module.persistentStorage) && Module._archiveLoaded && (Module.preloadAll(), Module._isEngineLoaded) && (ProgressUpdater.complete(), Module._callMain())
    },
    _callMain: function() {
      ProgressView.removeProgress(), void 0 === Module.callMain ? Module.noInitialRun = !1 : Module.callMain(Module.arguments)
    },
    _startSyncFS: function() {
      Module._syncInProgress = !0, Module._syncTries < Module._syncMaxTries && FS.syncfs(!1, function(err) {
        Module._syncInProgress = !1, err && (console.warn("Unable to synchronize mounted file systems: " + err), Module._syncTries += 1), Module._syncNeeded && (Module._syncNeeded = !1, Module._startSyncFS())
      })
    }
  };
Module.persistentStorage = "undefined" != typeof window && !!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB), Module.INITIAL_MEMORY = CUSTOM_PARAMETERS.custom_heap_size, Module.onRuntimeInitialized = function() {
  Module.runApp("canvas")
}, Module.locateFile = function(path, scriptDirectory) {
  return scriptDirectory + (path = "dmengine.wasm" != path && "dmengine_release.wasm" != path && "dmengine_headless.wasm" != path ? path : "warriors.wasm")
}, window.onerror = function(err, url, line, column, errObj) {
  void 0 !== Module.ccall && (err = Module.prepareErrorObject(err, url, line, column, errObj), Module.ccall("JSWriteDump", "null", ["string"], [JSON.stringify(err.stack)])), Module.setStatus("Exception thrown, see JavaScript console"), Module.setStatus = function(text) {
    text && Module.printErr("[post-exception status] " + text)
  }
};