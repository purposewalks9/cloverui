# Recording Clover UI

Open `/record` and crop your screen recorder to the rounded stage. The stage contains only the active component and its variants, with no component heading, docs, navigation, or persistent site guide. It stays the same size while you switch scenes, replay, or hide the controls. Nothing advances automatically.

| Key            | Action                                               |
| -------------- | ---------------------------------------------------- |
| `→` / `N`      | Next component                                       |
| `←` / `P`      | Previous component                                   |
| `V`            | Next set of color or type variants                   |
| `R`            | Reset the current component and replay its animation |
| `T`            | Change the stage between light and dark              |
| `H`            | Hide or restore the controls                         |
| `F`            | Fullscreen the stage; Escape exits fullscreen        |
| `Home` / `End` | First or last component                              |

On touch screens, tap outside the stage to restore hidden controls. Sliders retain their arrow keys; use `N` / `P` after adjusting a slider. Text inputs retain their typing shortcuts. The microphone requests access only when clicked, and its stream stops when you leave its scene.

The sequence is Liquid Button, Soft Button, Theme Toggle, Price Range, Sign Pad, Switch, Mic, Block Text, Rich Text, Nucleus Text, Glitchy Text, Clicky, Ghost, Grid Reveal, Grain Cube, and Cursor Tag. Small variants appear together, usually as a pair. `V` cycles the additional prepared palettes or types; `T` changes the shared background. Theme Toggle's two examples can be pressed independently.

Link directly to a scene with its slug, such as `/record#grain-cube`. The sequence and prepared variants live in `app/record/scenes.tsx`. Existing registry components and their public designs are reused unchanged. Only the active scene is mounted, so previous animations and microphone streams clean up when you advance. The page is excluded from indexing and is not added to the docs sidebar or sitemap.
