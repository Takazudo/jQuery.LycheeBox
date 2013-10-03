do ($ = jQuery) ->

  $window = $(window)
  $document = $(document)
  domwindowApi = null

  # define namespaces

  ns = {}

  # tiny util

  wait = (time) ->
    return $.Deferred (defer) ->
      setTimeout ->
        defer.resolve()
      , time
    .promise()

  # ============================================================
  # initializer

  ns.setup = do ->
    setupDone = false
    return ->
      return if setupDone
      setupDone = true
      $.ui.domwindowdialog.setup
        width: 600
        height: 300
      domwindowApi = window.domwindowApi

  # ============================================================
  # util

  ns.viewport =
    width: -> $window.width()
    height: -> window.innerHeight or $window.height()
    createSizeObject: ->
      o =
        width: ns.viewport.width()
        height: ns.viewport.height()
      return o

  ns.fadeIn = ($el, duration = 400) ->
    from =
      display: 'block'
      opacity: 0
    to =
      opacity: 1
    return $el.css(from).animate(to, duration)
    
  ns.fadeOut = ($el, duration = 400) ->
    from =
      display: 'block'
      opacity: 1
    to =
      opacity: 0
    return $el.css(from).animate(to, duration)
    

  # ============================================================
  # Dialog
  
  class ns.Dialog

    @defaults =
      dialog_src: """
        <div class="lycheebox-dialog">
          <div class="lycheebox-positioner">
            <div class="lycheebox-main">
              <div class="lycheebox-main-inner">
                <div class="lycheebox-imgholder"></div>
                <a class="lycheebox-dialogcloser apply-domwindow-close" href="#">close</a>
              </div>
            </div>
          </div>
          <div class="lycheebox-loader"></div>
        </div>
      """
      spinner_options:
        color: '#fff'
        lines: 20
        length: 10
        width: 2
        radius: 40
      selector_dialogRoot: '.lycheebox-dialog'
      selector_loader: '.lycheebox-loader'
      selector_holder: '.lycheebox-imgholder'
      selector_main: '.lycheebox-main'
      dialog_LR_margin: 10
      dialog_TB_margin: 10
      dialog_LR_padding: 10
      dialog_TB_padding: 10
      dialog_closer_height: 35
      dialog_click_close: true
    
    constructor: (@$opener, options) ->

      @options = $.extend {}, ns.Dialog.defaults, options
      @_eventify()

    open: ->

      ns.setup()
      dialog_src = $.trim @options.dialog_src

      openOptions = $.extend
        strdialog: true
        tandbmargintodecideposition: 0
        afteropen: (e, data) =>
          @$dialog = data.dialog
          @_handleAfterOpen()
        beforeclose: =>
          @_handleBeforeClose()
        afterclose: =>
          @$dialog.empty()
          @$dialog = null
      , ns.viewport.createSizeObject()

      domwindowApi.open @options.dialog_src, openOptions

    destroy: ->

      @$opener.unbind 'click', @_openerClickHandler
      $window.unbind 'resize orientationchange', @_resizeHandler

    resizeDialog: ->

      return unless @opened
      size =  ns.viewport.createSizeObject()
      @$dialog.css size

    resizeEls: ->
      
      return unless @opened
      return unless @imgReady
      o = @options

      imgSize = $.imgUtil.calcRectContainImgWH
        imgWidth: @naturalImgSize.width
        imgHeight: @naturalImgSize.height
        rectWidth: ns.viewport.width() - (o.dialog_LR_margin * 2) - (o.dialog_LR_padding * 2)
        rectHeight: ns.viewport.height() - (o.dialog_TB_margin * 2) - (o.dialog_TB_padding * 2) - o.dialog_closer_height
        enlargeSmallImg: false

      w = imgSize.width + (o.dialog_LR_padding * 2)
      h = imgSize.height + (o.dialog_TB_padding * 2) + o.dialog_closer_height
      mainSize =
        width: w
        height: h
        marginTop: -1 * h / 2
        marginLeft: -1 * w / 2

      @$main.css mainSize
      @$holder.css imgSize

    _handleAfterOpen: ->

      @opened = true
      @imgsrc = @$opener.attr 'href'
      @_eventify_overlayClickClose()
      @_putSpinner()
      @_calcImgSize().then =>
        return @_removeSpinner()
      .then =>
        @_prepareElsInsideDialog()
        @$holder.append @$img
        @imgReady = true
        @resizeEls()
        ns.fadeIn @$main

    _handleBeforeClose: ->

      @opened = false
      @imgReady = false
      @_uneventify_overlayClickClose()

    _eventify_overlayClickClose: ->

      return unless @options.dialog_click_close
      o = @options
      @_overlayClickHandler = (e) =>
        $target = $(e.target)
        return unless $target.is "#{o.selector_loader}, #{o.selector_dialogRoot}"
        domwindowApi.close()
      @$dialog.bind 'click', @_overlayClickHandler

    _uneventify_overlayClickClose: ->

      return unless @options.dialog_click_close
      @$dialog.unbind 'click', @_overlayClickHandler

    _putSpinner: ->

      o = @options
      @$loader = $(o.selector_loader, @$dialog)
      @$loader.stop().css
        display: 'block'
        opacity: 0
      (new Spinner o.spinner_options).spin @$loader[0]
      ns.fadeIn @$loader, 200

    _calcImgSize: ->

      defer = $.Deferred()
      ($.imgUtil.calcNaturalWH @imgsrc).done (wh, $img) =>
        @naturalImgSize = wh
        @$img = $img
        defer.resolve()
      return defer.promise()

    _removeSpinner: ->

      defer = $.Deferred()
      ($.when ns.fadeOut @$loader).done =>
        @$loader.empty().remove()
        defer.resolve()
      return defer.promise()

    _eventify: ->

      @_openerClickHandler = (e) =>
        e.preventDefault()
        @open()
      @_resizeHandler = (e) =>
        @resizeDialog()
        @resizeEls()

      @$opener.bind 'click', @_openerClickHandler
      $window.bind 'resize orientationchange', @_resizeHandler

    _prepareElsInsideDialog: ->

      @$main = $(@options.selector_main, @$dialog)
      @$holder = $(@options.selector_holder, @$dialog)
      @$main.css 'display', 'none'

  # ============================================================
  # jQuery bridges
  
  $.fn.lycheeBox = (options) ->
    return @each (i, el) ->
      $opener = $(el)
      instance = $opener.data 'lycheebox'
      if instance?
        instance.destroy()
      instance = new ns.Dialog $opener, options
      $opener.data 'liycheebox', instance

  # ============================================================
  # globalify

  $.LycheeBox = ns

