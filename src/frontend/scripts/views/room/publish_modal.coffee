Modal = require '../components/modal'


module.exports = class PublishModal extends Modal

  constructor: ( @dom ) ->
    super @dom
    log "[Publish Modal] Created"
    view.once 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main
    



