# DMS Theme essentials

This documentation tries to cover some of the setup and
configuration options of the DMS theme and base theme.

## Responsive images

The Responsive Image module in D8 core uses the breakpoint
configuration found in your theme's _[theme]_.breakpoints.yml
file.

Any breakpoint you want to have access to in configuration
needs to be declared in this file. To avoid having to
maintain two lists of breakpoints for layout, we've made it
possible for you to export this YAML configuration as
Sass variables by running _**'gulp breakpoints'**_ from the CLI.
This will create or overwrite the _breakpoints.scss partial
in the config folder.

### Responsive images for performance

To serve the same image crop at optimized resolutions, you
want to output an _**```<img>```**_ tag with _**srcset**_
and _**sizes**_ attributes.
The advantage of this approach is that the browser uses the data
available to it to make an informed decision. (Currently resolution
and screen density but soon also bandwidth etc.)

To configure this in D8 you create a new Responsive Image Style,
selecting your theme's Breakpoint Group. You then leave all
breakpoints set to _**'Do not use this breakpoint.'**_ except
for the _**'Default-MQ'**_.

For _**'Default-MQ'**_ you set the **type** to _**'Select
multiple image styles and use the sizes attribute.'**_
Pick the image styles you want to use in the output and
set a fallback image (style) for older browsers that do
not parse the srcset attribute.

In the _**'Sizes'**_ field you have to declare at what size
the image will be show under which media conditions.
**It is important to be mindful of the order you enter
the options!** (The browser will pick the first match!)

**Bad example**: (min-width: 480px) 100vw, (min-width: 960px) 720px, 100vw

The browser will **never** use the second item in the suggestions
because for any width over 960px, the first suggestion
will already be matched and used.

### Responsive images for art direction

If you want to serve a completely different crop to various breakpoints,
you want to output a _**```<picture>```**_ element. In this scenario
the browser does **NOT** make any decisions and strictly follows
your proposed source mapping to the various media queries.

To configure this in D8 you create a new Responsive Image Style, selecting
your theme's Breakpoint Group. For every breakpoint that you want to
serve a different image style to, you change the default setting
from _**'Do not use this breakpoint.'**_ to _**'Select a single image
style.**_
Additionally you select the desired image style from the dropdown.

Best to once again also set a fallback image style (this can be the
original image) for older browsers that do not support the picture
element. This way they at least will get to see something, albeit not
the "perfect" version of your image.