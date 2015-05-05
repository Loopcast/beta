Modal = require '../components/modal'


module.exports = class PublishModal extends Modal

  constructor: ( @dom ) ->
    super @dom

    view.once 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main
    



