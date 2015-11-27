## Frontend View

The frontend code is made of coffescript, stylus and jade compiled using the node module polvo.
Everything boots from src/frontend/scripts/app.coffee

### Frontend Compile System

simply run from the terminal:

```bash

make client

```

This will call polvo in watch mode.


### Frontend View Binding System

The key feature of the view binding system is this:
the controller https://github.com/Loopcast/beta/blob/staging/src/frontend/scripts/controllers/views.coffee will automatically instantiate a new instance of a js view class for each html element with the data-view attribute.

So, for instance, if in the current page there is the following html:

```html


  <div class="content">
    <div class="other" data-view="room/tape/edit_model_opener"></div>
  </div>

```

the view controller will generate an instance of the js class located in src/frontend/scripts/views/room/tape/edit_model_opener
(hems knows a bit about this view binding system, you can also ask him for any quick doubts)

Every view class should have a destroy method which will be called from the view controller whenever the view needs to be destroyed. This is useful for garbage collection purposes.

If you want to get a reference of a view instance from your code, you need to subscribe to the view binded event:

```coffeescript

  constructor: (@dom) ->
    view.on 'binded', @on_views_binded

  on_views_binded: ( scope ) =>
    return if not scope.main

    view.off 'binded', @on_views_binded

    # Now you can get the references of your views
    my_reference = view.get_by_dom '.my_class'


```

It's really important to unsubscribe from the binded callback, because it might be called several times, and you code could run more than one time, possibly breaking something.

### Api Interface

you can interact with the backend api in any point of your coffeescript files by requiring the following singleton controller:

```coffeescript
  api  = require 'api/loopcast/loopcast'
  api.rooms.update( '', ... )
```
