import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { LavaRenderer } from "lava-web";

export interface LavaAnimationConfig {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  playbackSpeed?: number;
  startFrame?: number;
}

export interface LavaAnimationRef {
  play: () => void;
  pause: () => void;
  setFrame: (frameIndex: number) => void;
  getFrame: () => number;
}

interface LavaAnimationConfigurableProps {
  assetPath: string;
  config: LavaAnimationConfig;
  onFrameChange?: (frameIndex: number) => void;
}

const LavaAnimationConfigurable = forwardRef<LavaAnimationRef, LavaAnimationConfigurableProps>(
  ({ assetPath, config, onFrameChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<LavaRenderer | null>(null);
    const configRef = useRef<LavaAnimationConfig>(config);
    const customLoopRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const manifestRef = useRef<any>(null);
    const isPlayingRef = useRef<boolean>(false);

    useEffect(() => {
      configRef.current = config;
    }, [config]);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (rendererRef.current) {
          isPlayingRef.current = true;
          if (configRef.current.playbackSpeed && configRef.current.playbackSpeed !== 1.0) {
            startCustomSpeedLoop();
          } else {
            rendererRef.current.play();
          }
        }
      },
      pause: () => {
        if (rendererRef.current) {
          isPlayingRef.current = false;
          rendererRef.current.pause();
          if (customLoopRef.current) {
            cancelAnimationFrame(customLoopRef.current);
            customLoopRef.current = null;
          }
        }
      },
      setFrame: (frameIndex: number) => {
        if (rendererRef.current && manifestRef.current) {
          const maxFrame = manifestRef.current.frames.length - 1;
          const clampedFrame = Math.max(0, Math.min(frameIndex, maxFrame));
          rendererRef.current.frameIndex = clampedFrame;
          // Force a render by toggling play state briefly
          const wasPlaying = isPlayingRef.current;
          if (wasPlaying) {
            rendererRef.current.pause();
            setTimeout(() => {
              if (rendererRef.current && isPlayingRef.current) {
                rendererRef.current.play();
              }
            }, 10);
          }
          if (onFrameChange) {
            onFrameChange(clampedFrame);
          }
        }
      },
      getFrame: () => {
        return rendererRef.current?.frameIndex ?? 0;
      },
    }));

    const startCustomSpeedLoop = () => {
      if (!rendererRef.current || !manifestRef.current) return;

      const manifest = manifestRef.current;
      const baseFPS = manifest.fps;
      const adjustedFPS = baseFPS * (configRef.current.playbackSpeed || 1.0);
      const frameDuration = 1000 / adjustedFPS;

      const animate = (timestamp: number) => {
        if (!rendererRef.current || !isPlayingRef.current) return;

        const elapsed = timestamp - lastFrameTimeRef.current;

        if (elapsed >= frameDuration) {
          lastFrameTimeRef.current = timestamp - (elapsed % frameDuration);

          const currentFrame = rendererRef.current.frameIndex;
          const totalFrames = manifest.frames.length;
          rendererRef.current.frameIndex = (currentFrame + 1) % totalFrames;

          if (onFrameChange) {
            onFrameChange(rendererRef.current.frameIndex);
          }
        }

        if (isPlayingRef.current) {
          customLoopRef.current = requestAnimationFrame(animate);
        }
      };

      lastFrameTimeRef.current = performance.now();
      customLoopRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
      const initRenderer = async () => {
        if (!canvasRef.current) return;

        try {
          const renderer = new LavaRenderer(canvasRef.current);
          rendererRef.current = renderer;

          // Load manifest
          const manifestResponse = await fetch(`${assetPath}/manifest.json`);
          const manifest = await manifestResponse.json();
          manifestRef.current = manifest;

          await renderer.loadLavaAsset(assetPath);

          // Set initial frame
          if (config.startFrame !== undefined) {
            const maxFrame = manifest.frames.length - 1;
            renderer.frameIndex = Math.max(0, Math.min(config.startFrame, maxFrame));
          }

          // Handle custom playback speed
          if (config.playbackSpeed && config.playbackSpeed !== 1.0) {
            isPlayingRef.current = config.autoPlay !== false;
            if (isPlayingRef.current) {
              startCustomSpeedLoop();
            }
          } else if (config.autoPlay !== false) {
            isPlayingRef.current = true;
            renderer.play();
          }
        } catch (err) {
          console.error("Error initializing Lava animation:", err);
        }
      };

      initRenderer();

      return () => {
        if (customLoopRef.current) {
          cancelAnimationFrame(customLoopRef.current);
        }
        if (rendererRef.current) {
          rendererRef.current.pause();
        }
        rendererRef.current = null;
      };
    }, [assetPath]);

    // Update playback speed when config changes
    useEffect(() => {
      if (!rendererRef.current || !manifestRef.current) return;

      const wasPlaying = isPlayingRef.current;
      if (wasPlaying) {
        rendererRef.current.pause();
        if (customLoopRef.current) {
          cancelAnimationFrame(customLoopRef.current);
        }

        if (config.playbackSpeed && config.playbackSpeed !== 1.0) {
          startCustomSpeedLoop();
        } else {
          rendererRef.current.play();
        }
      }
    }, [config.playbackSpeed]);

    return (
      <canvas
        style={{ width: config.width || 300, height: config.height || 300 }}
        ref={canvasRef}
        width={(config.width || 300) * window.devicePixelRatio}
        height={(config.height || 300) * window.devicePixelRatio}
      />
    );
  }
);

LavaAnimationConfigurable.displayName = "LavaAnimationConfigurable";

export default LavaAnimationConfigurable;
