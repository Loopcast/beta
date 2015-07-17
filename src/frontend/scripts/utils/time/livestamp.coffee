moment = require 'moment'

updateInterval = 1e3
paused = false
$livestamps = $([])

init = ->
  # log "[Livestamp] init"
  livestampGlobal.resume()
  return

prep = ($el, timestamp) ->
  oldData = $el.data('livestampdata')
  if typeof timestamp == 'number'
    timestamp *= 1e3
  $el.removeAttr('data-livestamp').removeData 'livestamp'
  timestamp = moment(timestamp)
  if moment.isMoment(timestamp) and !isNaN(+timestamp)
    newData = $.extend({}, { 'original': $el.contents() }, oldData)
    newData.moment = moment(timestamp)
    $el.data('livestampdata', newData).empty()
    $livestamps.push $el[0]
  return

run = ->
  if paused
    return
  livestampGlobal.update()
  setTimeout run, updateInterval
  return

livestampGlobal = 
  update: ->
    $('[data-livestamp]').each ->
      $this = $(this)
      prep $this, $this.data('livestamp')
      return
    toRemove = []
    $livestamps.each ->
      $this = $(this)
      data = $this.data('livestampdata')
      if data == undefined
        toRemove.push this
      else if moment.isMoment(data.moment)
        from = $this.html()
        to = data.moment.fromNow()
        if from != to
          e = $.Event('change.livestamp')
          $this.trigger e, [
            from
            to
          ]
          if !e.isDefaultPrevented()
            $this.html to
      return
    $livestamps = $livestamps.not(toRemove)
    return
  pause: ->
    paused = true
    return
  resume: ->
    paused = false
    run()
    return
  interval: (interval) ->
    if interval == undefined
      return updateInterval
    updateInterval = interval
    return
livestampLocal = 
  add: ($el, timestamp) ->
    if typeof timestamp == 'number'
      timestamp *= 1e3
    timestamp = moment(timestamp)
    if moment.isMoment(timestamp) and !isNaN(+timestamp)
      $el.each ->
        prep $(this), timestamp
        return
      livestampGlobal.update()
    $el
  destroy: ($el) ->
    $livestamps = $livestamps.not($el)
    $el.each ->
      $this = $(this)
      data = $this.data('livestampdata')
      if data == undefined
        return $el
      $this.html(if data.original then data.original else '').removeData 'livestampdata'
      return
    $el
  isLivestamp: ($el) ->
    $el.data('livestampdata') != undefined
$.livestamp = livestampGlobal
$ init

$.fn.livestamp = (method, options) ->
  if !livestampLocal[method]
    options = method
    method = 'add'
  livestampLocal[method] this, options

module.exports = ->
