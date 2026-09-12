(function () {
  "use strict";

  var container = document.getElementById("roadmap-app");
  if (!container) return;

  var STORAGE_KEY = "aihub-roadmap-progress";

  function loadProgress() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      /* localStorage unavailable (private mode, disabled storage, etc.) — progress just won't persist */
    }
  }

  function countDone(nodes, progress) {
    var done = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (progress[nodes[i].id]) done++;
    }
    return done;
  }

  function render(data, progress) {
    container.innerHTML = "";

    var totalNodes = 0;
    var totalDone = 0;
    data.stages.forEach(function (stage) {
      totalNodes += stage.nodes.length;
      totalDone += countDone(stage.nodes, progress);
    });

    var summary = document.createElement("div");
    summary.className = "roadmap-summary";

    var summaryText = document.createElement("span");
    summaryText.textContent = totalDone + "/" + totalNodes + " topics checked off";
    summary.appendChild(summaryText);

    var resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "roadmap-reset";
    resetBtn.textContent = "Reset progress";
    resetBtn.addEventListener("click", function () {
      progress = {};
      saveProgress(progress);
      render(data, progress);
    });
    summary.appendChild(resetBtn);

    container.appendChild(summary);

    var flow = document.createElement("div");
    flow.className = "roadmap-flow";

    data.stages.forEach(function (stage, i) {
      var stageEl = document.createElement("div");
      stageEl.className = "roadmap-stage roadmap-stage--" + stage.levelClass;

      var done = countDone(stage.nodes, progress);
      var pct = stage.nodes.length ? Math.round((done / stage.nodes.length) * 100) : 0;

      var head = document.createElement("div");
      head.className = "roadmap-stage-head";
      head.innerHTML =
        '<span class="hub-level-badge ' + stage.levelClass + '">' + stage.label + "</span>" +
        '<span class="roadmap-duration">' + stage.duration + "</span>";

      var num = document.createElement("span");
      num.className = "roadmap-stage-num";
      num.textContent = stage.num;

      var h3 = document.createElement("h3");
      h3.textContent = stage.title;

      var goal = document.createElement("p");
      goal.className = "roadmap-goal";
      goal.textContent = stage.goal;

      var progressBar = document.createElement("div");
      progressBar.className = "roadmap-progress";
      progressBar.setAttribute("role", "progressbar");
      progressBar.setAttribute("aria-valuenow", String(pct));
      progressBar.setAttribute("aria-valuemin", "0");
      progressBar.setAttribute("aria-valuemax", "100");
      progressBar.setAttribute("aria-label", stage.title + " progress");

      var progressFill = document.createElement("div");
      progressFill.className = "roadmap-progress-fill";
      progressFill.style.width = pct + "%";
      progressBar.appendChild(progressFill);

      var progressLabel = document.createElement("span");
      progressLabel.className = "roadmap-progress-label";
      progressLabel.textContent = done + "/" + stage.nodes.length + " done";

      stageEl.appendChild(num);
      stageEl.appendChild(head);
      stageEl.appendChild(h3);
      stageEl.appendChild(goal);
      stageEl.appendChild(progressBar);
      stageEl.appendChild(progressLabel);

      var nodesEl = document.createElement("div");
      nodesEl.className = "roadmap-nodes";

      stage.nodes.forEach(function (node) {
        var isDone = !!progress[node.id];

        var nodeEl = document.createElement("div");
        nodeEl.className = "roadmap-node" + (isDone ? " is-done" : "");

        var link = document.createElement("a");
        link.href = node.href;
        link.className = "roadmap-node-title";
        link.textContent = node.title;

        var desc = document.createElement("p");
        desc.className = "roadmap-node-desc";
        desc.textContent = node.desc;

        var checkLabel = document.createElement("label");
        checkLabel.className = "roadmap-node-check";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = isDone;
        checkbox.setAttribute("aria-label", "Mark \"" + node.title + "\" as done");
        checkbox.addEventListener("change", function () {
          progress[node.id] = checkbox.checked;
          saveProgress(progress);
          render(data, progress);
        });

        var checkmark = document.createElement("span");
        checkmark.className = "roadmap-checkmark";
        checkmark.setAttribute("aria-hidden", "true");
        checkmark.textContent = "✓";

        var checkText = document.createElement("span");
        checkText.textContent = "Done";

        checkLabel.appendChild(checkbox);
        checkLabel.appendChild(checkmark);
        checkLabel.appendChild(checkText);

        nodeEl.appendChild(link);
        nodeEl.appendChild(desc);
        nodeEl.appendChild(checkLabel);
        nodesEl.appendChild(nodeEl);
      });

      stageEl.appendChild(nodesEl);
      flow.appendChild(stageEl);

      if (i < data.stages.length - 1) {
        var arrow = document.createElement("div");
        arrow.className = "roadmap-arrow";
        arrow.textContent = "→";
        flow.appendChild(arrow);
      }
    });

    container.appendChild(flow);
  }

  var src = container.getAttribute("data-roadmap-src");

  fetch(src)
    .then(function (res) {
      if (!res.ok) throw new Error("Failed to load roadmap data");
      return res.json();
    })
    .then(function (data) {
      render(data, loadProgress());
    })
    .catch(function () {
      container.innerHTML =
        '<p class="roadmap-error">Could not load the interactive roadmap. ' +
        '<a href="roadmap/">View the written roadmap instead</a>.</p>';
    });
})();
