"use strict";

(() => {
  const tabs = document.getElementById("route-tabs");
  const panel = document.getElementById("route-panel");
  const colors = ["#6be0bb", "#c2aff8", "#72c7f5", "#ffa969"];
  let routes = [];

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined && value !== null) node.textContent = String(value);
    return node;
  }

  function valueText(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (value.display) return String(value.display);
    return [value.amount ?? value.quantity ?? "", value.asset ?? value.symbol ?? ""].filter(Boolean).join(" ");
  }

  function addNotes(parent, values) {
    if (!Array.isArray(values) || !values.length) return;
    const column = element("div", "route-note-column");
    column.append(element("h4", "", "How to read this route"));
    const list = element("ul", "route-notes");
    values.forEach((value) => list.append(element("li", "", typeof value === "object" ? value.text ?? value.note ?? "" : value)));
    column.append(list);
    parent.append(column);
    return column;
  }

  function addTransactions(parent, values) {
    if (!Array.isArray(values) || !values.length) return;
    const column = element("div", "route-evidence");
    column.append(element("h4", "", "Transaction evidence"));
    const list = element("div", "transaction-list");
    const validValues = values.filter((value) => /^0x[a-fA-F0-9]{64}$/.test(typeof value === "string" ? value : value.hash ?? value.tx_hash ?? ""));
    let moreList = null;
    validValues.forEach((value, index) => {
      const hash = typeof value === "string" ? value : value.hash ?? value.tx_hash ?? "";
      if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) return;
      const link = element("a", "transaction-link");
      link.href = `https://etherscan.io/tx/${hash}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.append(element("span", "", typeof value === "object" ? value.label ?? value.title ?? "View transaction" : "View transaction"));
      link.append(element("code", "", `${hash.slice(0, 8)}…${hash.slice(-6)} ↗`));
      if (index < 3) list.append(link);
      else {
        if (!moreList) {
          const more = element("details", "more-evidence");
          more.append(element("summary", "", `Show ${validValues.length - 3} more transactions`));
          moreList = element("div", "transaction-list");
          more.append(moreList);
          list.append(more);
        }
        moreList.append(link);
      }
    });
    if (!list.childElementCount) return;
    column.append(list);
    parent.append(column);
  }

  function addAddresses(parent, values) {
    if (!Array.isArray(values) || !values.length) return;
    const section = element("div", "route-addresses");
    section.append(element("h4", "", "Route addresses"));
    const list = element("div", "address-list");
    values.forEach((value) => {
      const address = typeof value === "string" ? value : value.address ?? "";
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return;
      const link = element("a", "address-link");
      link.href = `https://etherscan.io/address/${address}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      if (typeof value === "object" && value.label) link.append(element("span", "", value.label));
      link.append(element("code", "", address));
      list.append(link);
    });
    if (!list.childElementCount) return;
    section.append(list);
    parent.append(section);
  }

  function selectRoute(index, updateHash = true) {
    const route = routes[index];
    if (!route) return;
    [...tabs.children].forEach((tab, tabIndex) => {
      tab.setAttribute("aria-selected", String(tabIndex === index));
      tab.tabIndex = tabIndex === index ? 0 : -1;
    });
    panel.replaceChildren();
    panel.setAttribute("aria-labelledby", `route-tab-${index}`);
    panel.style.setProperty("--route-color", colors[index % colors.length]);
    const topline = element("div", "route-topline");
    const description = element("div", "route-description");
    description.append(element("p", "route-kicker", route.kicker ?? `Route ${String(index + 1).padStart(2, "0")} / observed outcomes`));
    description.append(element("h3", "", route.heading ?? route.title));
    if (route.summary) description.append(element("p", "route-summary", route.summary));
    topline.append(description);
    const input = valueText(route.input ?? route.initial_amount);
    if (input) {
      const amount = element("div", "route-input");
      amount.append(element("span", "", route.input_label ?? "Traced input"), element("strong", "", input));
      topline.append(amount);
    }
    panel.append(topline);
    if (Array.isArray(route.outcomes) && route.outcomes.length) {
      const outcomes = element("div", "outcome-list");
      route.outcomes.forEach((outcome) => {
        const item = element("div", "outcome");
        item.append(element("span", "outcome-label", outcome.label ?? outcome.title ?? "Observed outcome"));
        item.append(element("strong", "outcome-value", valueText(outcome.display ?? outcome.value ?? outcome)));
        if (outcome.note) item.append(element("p", "outcome-note", outcome.note));
        outcomes.append(item);
      });
      panel.append(outcomes);
    }
    const bottom = element("div", "route-bottom");
    const noteColumn = addNotes(bottom, route.notes);
    addAddresses(noteColumn ?? bottom, route.addresses);
    addTransactions(bottom, route.transactions ?? route.evidence);
    if (bottom.childElementCount) panel.append(bottom);
    if (updateHash && route.id) {
      const url = new URL(window.location.href);
      url.searchParams.set("route", route.id);
      window.history.replaceState(null, "", url);
    }
  }

  function render(data) {
    const block = data.meta?.snapshot_block ?? data.meta?.snapshot_end_block ?? data.snapshot_block;
    if (block) document.getElementById("snapshot-block").textContent = String(block).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    routes = data.routes ?? data.paths ?? [];
    if (!Array.isArray(routes) || !routes.length) throw new Error("The case record does not contain route summaries.");
    routes.forEach((route, index) => {
      const tab = element("button", "route-tab");
      tab.type = "button";
      tab.id = `route-tab-${index}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "route-panel");
      tab.style.setProperty("--route-color", colors[index % colors.length]);
      tab.append(element("span", "tab-number", String(index + 1).padStart(2, "0")), element("span", "", route.tab ?? route.short_title ?? route.title));
      tab.addEventListener("click", () => selectRoute(index));
      tab.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % routes.length;
        else if (event.key === "ArrowLeft") next = (index + routes.length - 1) % routes.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = routes.length - 1;
        else return;
        event.preventDefault();
        selectRoute(next);
        tabs.children[next].focus();
      });
      tabs.append(tab);
    });
    const selected = new URL(window.location.href).searchParams.get("route");
    selectRoute(Math.max(0, routes.findIndex((route) => route.id === selected)), false);
  }

  const dialog = document.getElementById("flow-dialog");
  const openButton = document.getElementById("expand-flow");
  openButton.addEventListener("click", () => {
    dialog.showModal();
    document.body.classList.add("body-dialog-open");
  });
  document.getElementById("close-flow").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("body-dialog-open");
    openButton.focus();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  fetch("./assets/case-data.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Case record unavailable (${response.status}).`);
      return response.json();
    })
    .then(render)
    .catch(() => {
      panel.replaceChildren(element("p", "loading-message error-message", "The case summary could not be loaded. You can still open the diagram above or inspect the downloadable case-data file below."));
    });
})();
