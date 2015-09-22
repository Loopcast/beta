L      = require 'api/loopcast/loopcast'
Modal  = require 'app/views/modals/modal'
notify = require 'app/controllers/notify'

module.exports = class PublishModal extends Modal

  constructor: ( @dom ) ->
    super @dom

    @dismiss_btn = @dom.find '.dismiss_label'
    @publish_btn = @dom.find '.publish_label'

    @dismiss_btn.on 'click', @close
    @publish_btn.on 'click', @publish

  open_with_id: ( @id ) =>
    @open()

  publish: =>
    @show_loading()
    log "[PublishModal] publish #{@id} ...."

    # TODO: here we have to get the TAPE ID and not the room ID
    # at the moment it's using the room_id

    L.tapes.update @id, public: true, (error, response) =>
      @hide_loading()
      @close()

      if error
        log "[PublishModal] error", error
        notify.error "There was an error. Try later."
      else
        notify.info "The recording was published to your profile!"
        @emit 'room:published', @id



  destroy: ->
    @dismiss_btn.off 'click', @close
    @publish_btn.off 'click', @publish
    @id = null
    super()


    



