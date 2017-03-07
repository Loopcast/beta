## API Documentation for Native App

Our app will have a page (explore channels) which shows a list of all our channels. This list must be fetched from our database.

method: POST
path: /api/v1/rooms

It is also important that we only return channels that are set to live:

"is_live": true,
