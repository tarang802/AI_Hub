import { useMemo, useState } from "react";
import roadmapData from "../assets/roadmap.json";

const STORAGE_KEY = "aihub-roadmap-progress";

// Content pages live in the members' Wiki (see wiki/README.md) — set
// VITE_WIKI_URL once that's deployed so roadmap nodes link straight there.
const WIKI_URL = import.meta.env.VITE_WIKI_URL || "";

function loadProgress() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage unavailable (private mode, disabled storage, etc.) — progress just won't persist
  }
}

function countDone(nodes, progress) {
  return nodes.reduce((n, node) => n + (progress[node.id] ? 1 : 0), 0);
}

export default function Roadmap() {
  const [progress, setProgress] = useState(loadProgress);

  const { totalNodes, totalDone } = useMemo(() => {
    let totalNodes = 0;
    let totalDone = 0;
    roadmapData.stages.forEach((stage) => {
      totalNodes += stage.nodes.length;
      totalDone += countDone(stage.nodes, progress);
    });
    return { totalNodes, totalDone };
  }, [progress]);

  const toggleNode = (id, checked) => {
    const next = { ...progress, [id]: checked };
    setProgress(next);
    saveProgress(next);
  };

  const reset = () => {
    setProgress({});
    saveProgress({});
  };

  return (
    <div className="roadmap-app">
      <div className="roadmap-summary">
        <span>
          {totalDone}/{totalNodes} topics checked off
        </span>
        <button type="button" className="roadmap-reset" onClick={reset}>
          Reset progress
        </button>
      </div>

      <div className="roadmap-flow">
        {roadmapData.stages.map((stage, i) => {
          const done = countDone(stage.nodes, progress);
          const pct = stage.nodes.length ? Math.round((done / stage.nodes.length) * 100) : 0;

          return (
            <div key={stage.id} style={{ display: "contents" }}>
              <div className={`roadmap-stage roadmap-stage--${stage.levelClass}`}>
                <span className="roadmap-stage-num">{stage.num}</span>
                <div className="roadmap-stage-head">
                  <span className={`hub-level-badge ${stage.levelClass}`}>{stage.label}</span>
                  <span className="roadmap-duration">{stage.duration}</span>
                </div>
                <h3>{stage.title}</h3>
                <p className="roadmap-goal">{stage.goal}</p>
                <div
                  className="roadmap-progress"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stage.title} progress`}
                >
                  <div className="roadmap-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="roadmap-progress-label">
                  {done}/{stage.nodes.length} done
                </span>

                <div className="roadmap-nodes">
                  {stage.nodes.map((node) => {
                    const isDone = !!progress[node.id];
                    return (
                      <div key={node.id} className={`roadmap-node${isDone ? " is-done" : ""}`}>
                        <a href={WIKI_URL ? `${WIKI_URL}/${node.href}` : node.href} className="roadmap-node-title">
                          {node.title}
                        </a>
                        <p className="roadmap-node-desc">{node.desc}</p>
                        <label className="roadmap-node-check">
                          <input
                            type="checkbox"
                            checked={isDone}
                            aria-label={`Mark "${node.title}" as done`}
                            onChange={(e) => toggleNode(node.id, e.target.checked)}
                          />
                          <span className="roadmap-checkmark" aria-hidden="true">
                            ✓
                          </span>
                          <span>Done</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {i < roadmapData.stages.length - 1 && <div className="roadmap-arrow">→</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
