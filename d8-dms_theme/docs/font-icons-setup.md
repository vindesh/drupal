# DMS Theme essentials

This documentation tries to cover some of the setup and
configuration options of the DMS theme and base theme.

## FontAwesome and custom font icons

By default the DMS theme comes with:
* the entire set of FontAwesome icons
* one custom SVG icon added to the font as an example
* backwards compatible FontAwesome styles ".fa .fa-icon"
* a Sass icons variables file
* a custom mixin to more easily implement a font icon on any given element

### Regular use

Works just as if you use FontAwesome: anywhere there's an element with a .fa 
class and an accompanying .fa-icon class, that icon is rendered before
the element.

### Creating custom font icons

To add custom SVG icons to the font, we use the online service IcoMoon. 
[https://icomoon.io/app]

In the font assets folder "/fonts/dmsicons" you can find the current version
of the generated font as well as a JSON config file. You can load this
selection.json config file in the IcoMoon web app. Easiest way to do that
is to just drag and drop it onto a new project. Afterwards don't forget
to scroll down and remove the default IcoMoon icon set (unless you want them!).

You can add custom SVG icons with the "import icons" button at the top and
ultimately export new webfonts with the "generate font" button.

### Adding custom icons to the theme

After you've exported the generated font, extract the three font variations
(Woff, TTF and SVG) along with the new selection.json config file. Replace
the default ones in the "/fonts/dmsicons" folder.

Now you still need to add your new, custom font declarations to the 
variables Sass map in "config/_icons.scss". Custom fonts are added at the end
of the Sass map, below the FontAwesome icons. You can take the the values from
the "variables.scss" file that was part of the exported font package. You will
have to manually remove the prefix ($icon-) and replace the semicolons with commas.

### Iconize all the things!

To make life easier, there's now a custom mixin _**iconize()**_ - it takes two **optional**
arguments: $i for icon and $p for position. This way you do not have to insert the .fa classes,
which sometimes can be a pain with the output of certain contrib modules.

By default, when you don't pass any arguments, it outputs a > after the element.

Example:
.my-warning-button {
  @include iconize($i: 'warning', $p: 'before');
}
will add the icon named 'warning' before any element with the class ".my-warning-button".