"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  EyeOff,
  Maximize,
  RotateCcw,
  SunMoon,
  SwatchBook,
} from "lucide-react";
import { useTheme } from "next-themes";
import { recordingScenes } from "./scenes";
import styles from "./recording-studio.module.css";

export function RecordingStudio() {
  const [index, setIndex] = useState(0);
  const [variant, setVariant] = useState(0);
  const [take, setTake] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [notice, setNotice] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();
  const scene = recordingScenes[index];

  const select = useCallback((next: number) => {
    const selected = (next + recordingScenes.length) % recordingScenes.length;
    setIndex(selected);
    setVariant(0);
    setTake(0);
    setNotice("");
    window.history.replaceState(window.history.state, "", `#${recordingScenes[selected].id}`);
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const readHash = () => {
      const selected = recordingScenes.findIndex(
        (entry) => `#${entry.id}` === window.location.hash,
      );
      if (selected >= 0) {
        setIndex(selected);
        setVariant(0);
        setTake(0);
      }
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const replay = useCallback(() => {
    setTake((value) => value + 1);
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  const nextVariant = useCallback(() => {
    setVariant((value) => (value + 1) % scene.variants);
    setTake((value) => value + 1);
    stageRef.current?.focus({ preventScroll: true });
  }, [scene.variants]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const toggleControls = useCallback(() => {
    setControlsVisible((visible) => !visible);
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  const fullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stageRef.current?.requestFullscreen) await stageRef.current.requestFullscreen();
      else setNotice("Fullscreen is unavailable in this browser. Use H to hide the controls.");
    } catch {
      setNotice("Fullscreen is unavailable. Use H to hide the controls.");
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.isContentEditable || target?.closest("input, textarea, select, [role='dialog']"))
        return;
      if (target?.closest("[role='slider']") && /^(Arrow|Home|End|Page)/.test(event.key)) return;
      const key = event.key.toLowerCase();
      const actions: Record<string, () => void> = {
        arrowright: () => select(index + 1),
        arrowleft: () => select(index - 1),
        n: () => select(index + 1),
        p: () => select(index - 1),
        home: () => select(0),
        end: () => select(recordingScenes.length - 1),
        r: replay,
        v: nextVariant,
        t: toggleTheme,
        h: toggleControls,
        f: fullscreen,
      };
      if (!actions[key]) return;
      event.preventDefault();
      actions[key]();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, select, replay, nextVariant, toggleTheme, toggleControls, fullscreen]);

  return (
    <main
      className={styles.studio}
      aria-label="Component recording studio"
      onPointerDown={(event) => {
        if (!controlsVisible && !(event.target as Element).closest("[data-recording-stage]"))
          setControlsVisible(true);
      }}
    >
      <h1 className="sr-only">Clover UI recording studio</h1>
      <p id="recording-help" className="sr-only">
        Left and right arrows, or N and P, switch components. V changes variants, R replays, T
        changes the background theme, H hides controls, and F enters fullscreen. Tap outside the
        stage to restore hidden controls. Use N and P after adjusting a slider; its arrow keys keep
        adjusting the value.
      </p>
      <div className={styles.workspace}>
        <div
          ref={stageRef}
          className={styles.stage}
          data-recording-stage
          data-scene={scene.id}
          tabIndex={-1}
          role="region"
          aria-label={`${scene.name} recording stage`}
          aria-describedby="recording-help"
        >
          <div
            key={`${scene.id}-${variant}-${take}`}
            className={styles.scene}
            data-variant={variant}
            data-take={take}
          >
            {scene.render(variant)}
          </div>
        </div>
        <div className={styles.controls} data-hidden={!controlsVisible} inert={!controlsVisible}>
          <button
            className={styles.control}
            onClick={() => select(index - 1)}
            aria-label="Previous component"
            title="Previous component (←)"
          >
            <ArrowLeft />
          </button>
          <span className={styles.count} aria-hidden>
            {String(index + 1).padStart(2, "0")} / {recordingScenes.length}
          </span>
          <button
            className={styles.control}
            onClick={() => select(index + 1)}
            aria-label="Next component"
            title="Next component (→)"
          >
            <ArrowRight />
          </button>
          <span className={styles.divider} aria-hidden />
          <button
            className={styles.control}
            onClick={nextVariant}
            disabled={scene.variants === 1}
            aria-label="Next variants"
            title={`Variants ${variant + 1} of ${scene.variants} (V)`}
          >
            <SwatchBook />
            <span>Variants</span>
            <kbd>V</kbd>
          </button>
          <button
            className={styles.control}
            onClick={replay}
            aria-label="Replay component"
            title="Replay (R)"
          >
            <RotateCcw />
            <kbd>R</kbd>
          </button>
          <button
            className={styles.control}
            onClick={toggleTheme}
            aria-label="Toggle stage theme"
            title="Light / dark (T)"
          >
            <SunMoon />
            <kbd>T</kbd>
          </button>
          <button
            className={styles.control}
            onClick={fullscreen}
            aria-label="Fullscreen stage"
            title="Fullscreen (F)"
          >
            <Maximize />
            <kbd>F</kbd>
          </button>
          <button
            className={styles.control}
            onClick={toggleControls}
            aria-label="Hide controls"
            title="Hide controls (H)"
          >
            <EyeOff />
            <kbd>H</kbd>
          </button>
          <p className={styles.hint}>
            {notice || "← → switch · V variants · H hides controls · Tap outside to restore."}
          </p>
        </div>
        <p role="status" className="sr-only">
          {scene.name}, {index + 1} of {recordingScenes.length}. Variants {variant + 1} of{" "}
          {scene.variants}. {notice}
        </p>
      </div>
    </main>
  );
}
