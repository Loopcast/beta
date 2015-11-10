## Frontend View

The frontend code is made of coffescript, stylus and jade compiled using the node module polvo.
Everything boots from src/frontend/scripts/app.coffee

## Frontend View Binding System

The key feature of the view binding system is this:
the controller /src/frontend/scripts/controllers/views.coffee will automatically instantiate a new instance of a js view class for each html element with the data-view attribute.

So, for instance, if in the current page there is the following html:

  <div class="content">
    <div class="other" data-view="room/tape/edit_model_opener"></div>
  </div>

the view controller will generate an instance of the js class located in src/frontend/scripts/views/room/tape/edit_model_opener
(hems knows a bit about this view binding system, you can also ask him for any quick doubts)

Every view class should have a destroy method which will be called from the view controller whenever the view needs to be destroyed. This is useful for garbage collection purposes.

