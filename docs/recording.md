# Recording Clover UI

Open `/record` and crop your screen recorder to the stage. The whole page is pure black (`#000`) and always uses the dark theme, with no box or border around the stage. The stage contains only the active component and its variants, with no component heading, docs, navigation, or persistent site guide. It stays the same size while you switch scenes, replay, or hide the controls. Nothing advances automatically.

| Key            | Action                                               |
| -------------- | ---------------------------------------------------- |
| `→` / `N`      | Next component                                       |
| `←` / `P`      | Previous component                                   |
| `V`            | Next set of color or type variants                   |
| `R`            | Reset the current component and replay its animation |
| `H`            | Hide or restore the controls                         |
| `F`            | Fullscreen the stage; Escape exits fullscreen        |
| `Home` / `End` | First or last component                              |

On touch screens, tap outside the stage to restore hidden controls. Sliders retain their arrow keys; use `N` / `P` after adjusting a slider. Text inputs retain their typing shortcuts. The microphone requests access only when clicked, and its stream stops when you leave its scene.

Each component sits in a 360 × 200 card with a plain gray border and a black inside, and its name in a small tag in the bottom-right corner. For now the page shows the launch reel, in order: Soft Button, Block Text, Reasoning Effort, Grain Cube (green), Liquid Button, Nucleus Text, Cursor Tag (one tag, as on the home page), Gauge Text, Grid Reveal (the grid alone, random then wave), Glitchy Text, Thinking State (pondering only, circle pixels) and Token Fall last. The other component scenes stay in `app/record/scenes.tsx`; add a scene's id to `order` to bring it back.

Link directly to a scene with its slug, such as `/record#grain-cube`. The sequence and prepared variants live in `app/record/scenes.tsx`. Existing registry components and their public designs are reused unchanged. Only the active scene is mounted, so previous animations and microphone streams clean up when you advance. The page is excluded from indexing and is not added to the docs sidebar or sitemap.
