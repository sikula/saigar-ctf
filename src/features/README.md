### What are features?
Every app has multiple layers:
1) View layer
2) Data Layer
3) State Management Layer
4) Styling Layer

Components are suppose to be used as reusable peices of code that you can plug certain attributes in, independant of how you use the other layers.  But sometimes you may fall into situations where a "Component" would use all the layers.  For example, the scoreboard component is used on multiple pages, but were always fetching from the same place, so it makes sense to group the data layer as well
