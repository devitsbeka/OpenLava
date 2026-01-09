import React, { useState, useRef, useEffect } from "react";
import LavaAnimationConfigurable, { LavaAnimationRef, LavaAnimationConfig } from "./LavaAnimationConfigurable";

interface AnimationConfigPanelProps {
  assetPath: string;
  defaultConfig?: LavaAnimationConfig;
  title?: string;
}

const AnimationConfigPanel: React.FC<AnimationConfigPanelProps> = ({
  assetPath,
  defaultConfig = {},
  title = "Animation Controls",
}) => {
  const animationRef = useRef<LavaAnimationRef>(null);
  const [manifest, setManifest] = useState<any>(null);
  const [config, setConfig] = useState<LavaAnimationConfig>({
    width: defaultConfig.width || 200,
    height: defaultConfig.height || 200,
    autoPlay: defaultConfig.autoPlay !== false,
    playbackSpeed: defaultConfig.playbackSpeed || 1.0,
    startFrame: defaultConfig.startFrame || 0,
  });
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Load manifest to get frame count and FPS
    fetch(`${assetPath}/manifest.json`)
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        setConfig((prev) => ({
          ...prev,
          startFrame: Math.min(prev.startFrame || 0, data.frames.length - 1),
        }));
      })
      .catch(console.error);
  }, [assetPath]);

  const handlePlayPause = () => {
    if (isPlaying) {
      animationRef.current?.pause();
      setIsPlaying(false);
    } else {
      animationRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleFrameChange = (frameIndex: number) => {
    setCurrentFrame(frameIndex);
  };

  const handleSetFrame = (frameIndex: number) => {
    if (manifest) {
      const clampedFrame = Math.max(0, Math.min(frameIndex, manifest.frames.length - 1));
      animationRef.current?.setFrame(clampedFrame);
      setCurrentFrame(clampedFrame);
    }
  };

  const totalFrames = manifest?.frames.length || 0;
  const fps = manifest?.fps || 30;

  return (
    <div className="config-panel">
      <div className="config-header">
        <h3>{title}</h3>
        <div className="config-status">
          Frame: {currentFrame + 1} / {totalFrames} | FPS: {fps}
        </div>
      </div>

      <div className="config-content">
        {/* Animation Preview */}
        <div className="config-section">
          <h4>Preview</h4>
          <div className="animation-preview">
            <LavaAnimationConfigurable
              ref={animationRef}
              assetPath={assetPath}
              config={config}
              onFrameChange={handleFrameChange}
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="config-section">
          <h4>Playback</h4>
          <div className="config-controls">
            <button onClick={handlePlayPause} className="control-button">
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={() => handleSetFrame(0)}
              className="control-button"
              disabled={currentFrame === 0}
            >
              ⏮ First
            </button>
            <button
              onClick={() => handleSetFrame(currentFrame - 1)}
              className="control-button"
              disabled={currentFrame === 0}
            >
              ⏪ Prev
            </button>
            <button
              onClick={() => handleSetFrame(currentFrame + 1)}
              className="control-button"
              disabled={currentFrame >= totalFrames - 1}
            >
              ⏩ Next
            </button>
            <button
              onClick={() => handleSetFrame(totalFrames - 1)}
              className="control-button"
              disabled={currentFrame >= totalFrames - 1}
            >
              ⏭ Last
            </button>
          </div>
        </div>

        {/* Frame Slider */}
        <div className="config-section">
          <h4>Frame Navigation</h4>
          <div className="config-controls">
            <input
              type="range"
              min="0"
              max={Math.max(0, totalFrames - 1)}
              value={currentFrame}
              onChange={(e) => handleSetFrame(parseInt(e.target.value))}
              className="frame-slider"
            />
            <input
              type="number"
              min="0"
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => handleSetFrame(parseInt(e.target.value) || 0)}
              className="frame-input"
            />
          </div>
        </div>

        {/* Playback Speed */}
        <div className="config-section">
          <h4>Playback Speed</h4>
          <div className="config-controls">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={config.playbackSpeed || 1.0}
              onChange={(e) => {
                const speed = parseFloat(e.target.value);
                setConfig((prev) => ({ ...prev, playbackSpeed: speed }));
                setIsPlaying(false);
                animationRef.current?.pause();
                // Restart with new speed
                setTimeout(() => {
                  setIsPlaying(true);
                  animationRef.current?.play();
                }, 100);
              }}
              className="speed-slider"
            />
            <span className="control-value">{config.playbackSpeed?.toFixed(1)}x</span>
          </div>
        </div>

        {/* Size Controls */}
        <div className="config-section">
          <h4>Display Size</h4>
          <div className="config-controls">
            <label>
              Width:
              <input
                type="number"
                min="50"
                max="800"
                value={config.width || 200}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, width: parseInt(e.target.value) || 200 }))
                }
                className="size-input"
              />
            </label>
            <label>
              Height:
              <input
                type="number"
                min="50"
                max="800"
                value={config.height || 200}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, height: parseInt(e.target.value) || 200 }))
                }
                className="size-input"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationConfigPanel;
