do ($ = jQuery) ->

  # define namespaces
  ns = {}

  # misc
  
  wait = (time) ->
    $.Deferred (defer) ->
      setTimeout ->
        defer.resolve()
      , time

  # ============================================================
  # util
  

  # ============================================================
  # Dialog
  
  class ns.Dialog extends EveEve

    constructor: ->

  # ============================================================
  # jQuery bridges
  
  $.fn.lycheeBox = (options) ->
    return @each (i, el) ->
      $opener = $(el)
      instance = $opener.data 'lycheebox'
      if instance
        instance.open()
        return
      instance = new ns.Dialog $opener, options
      $opener.data 'liycheebox', instance
      instance.open()

  # ============================================================
  # globalify

  $.LycheeBoxNs = ns
  $.LycheeBox = ns.Dialog

