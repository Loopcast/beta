L      = require 'api/loopcast/loopcast'
Modal  = require 'app/views/modals/modal'
notify = require 'app/controllers/notify'

module.exports = class ExitModal extends Modal

  constructor: ( @dom ) ->
    super @dom

    @dismiss_btn = @dom.find '.dismiss_label'
    @stay_btn = @dom.find '.ok_label'

    @dismiss_btn.on 'click', @dismiss_clicked
    @stay_btn.on 'click', @stay_clicked
    app.on 'exit_modal:request_open', @open

  dismiss_clicked: =>
    app.emit 'exit_modal:answered', true
    @close()

  stay_clicked: =>
    app.emit 'exit_modal:answered', false
    @close()


  destroy: ->
    @dismiss_btn.off 'click', @dismiss_clicked
    @stay_btn.off 'click', @stay_clicked
    app.off 'exit_modal:request_open', @open
    super()


    



