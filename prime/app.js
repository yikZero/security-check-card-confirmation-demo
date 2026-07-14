const state = {
  tier: "prime",
  scenario: "swap",
};

const scenarios = {
  swap: {
    label: "Swap",
    sheetTitle: "Swap",
    origin: "app.uniswap.org",
    appName: "Uniswap",
    network: "Ethereum",
    targetLabel: "Contract",
    targetValue: "Uniswap V3 Router 2",
    actionSummary: "Swap 0.10 ETH for ≈187.65 USDC",
    netUsd: "≈ $0.00",
    assets: [
      {
        symbol: "ETH",
        amount: "-0.10",
        usd: "-$187.59",
        direction: "out",
        before: "2.00",
        after: "1.90",
        network: "Ethereum",
      },
      {
        symbol: "USDC",
        amount: "+187.65",
        usd: "+$187.61",
        direction: "in",
        before: "20.00",
        after: "207.651101",
        network: "Ethereum",
      },
    ],
    flows: [
      {
        direction: "out",
        from: "Your wallet",
        to: "Uniswap V3 Router 2",
        amount: "0.10 ETH",
      },
      {
        direction: "in",
        from: "Uniswap V3 Pool",
        to: "Your wallet",
        amount: "187.651101 USDC",
      },
    ],
  },
  liquidity: {
    label: "Add liquidity",
    sheetTitle: "Add Liquidity",
    origin: "app.uniswap.org",
    appName: "Uniswap",
    network: "Ethereum",
    targetLabel: "Contract",
    targetValue: "Uniswap V3 Position Manager",
    actionSummary: "Add 1,273.57 USDC + 0.77975 WETH",
    netValueUnavailable: true,
    assets: [
      {
        symbol: "USDC",
        amount: "-1,273.57",
        usd: "-$1,273.24",
        direction: "out",
        before: "1,273.57099",
        after: "0.00",
        network: "Ethereum",
      },
      {
        symbol: "WETH",
        amount: "-0.77975",
        usd: "-$1,464.80",
        direction: "out",
        before: "0.78105281",
        after: "0.00130218",
        network: "Ethereum",
      },
      {
        symbol: "UNI-V3 Position",
        iconClass: "lp",
        iconText: "LP",
        amount: "+1",
        direction: "in",
        before: "0",
        after: "1",
        network: "Ethereum",
        balanceType: "position",
      },
    ],
    flows: [
      {
        direction: "out",
        from: "Your wallet",
        to: "Uniswap V3 Pool",
        amount: "1,273.57099 USDC",
      },
      {
        direction: "out",
        from: "Your wallet",
        to: "Uniswap V3 Pool",
        amount: "0.779750625 WETH",
      },
      {
        direction: "in",
        from: "Uniswap V3 Position Manager",
        to: "Your wallet",
        amount: "Position #1333201",
      },
    ],
  },
  nft: {
    label: "Buy NFT",
    sheetTitle: "Buy NFT",
    origin: "opensea.io",
    appName: "OpenSea",
    network: "Ethereum",
    targetLabel: "Contract",
    targetValue: "Seaport 1.6",
    actionSummary: "Buy CHILL BUGS #1251 for 0.008 ETH",
    netUsd: "-$2.82",
    netValueNote: "NFT value estimated · Fee not included",
    assets: [
      {
        symbol: "ETH",
        amount: "-0.008",
        usd: "-$15.03",
        direction: "out",
        before: "0.01142738",
        after: "0.00342738",
        network: "Ethereum",
      },
      {
        symbol: "CHILL BUGS #1251",
        iconClass: "nft",
        iconText: "NFT",
        amount: "+1",
        usd: "+$12.21",
        direction: "in",
        before: "0",
        after: "1",
        network: "Ethereum",
        balanceType: "ownership",
      },
    ],
    flows: [
      {
        direction: "out",
        from: "Your wallet",
        to: "Seaport 1.6",
        amount: "0.008 ETH",
      },
      {
        direction: "in",
        from: "Seller",
        to: "Your wallet",
        amount: "CHILL BUGS #1251",
      },
    ],
  },
};

const mount = document.querySelector("#security-card-mount");
const previewLabel = document.querySelector("#preview-label");
const sheetTitle = document.querySelector("#sheet-title");
const sheetOrigin = document.querySelector("#sheet-origin");
const networkValue = document.querySelector("#network-value");
const targetLabel = document.querySelector("#target-label");
const targetValue = document.querySelector("#target-value");
const replayButton = document.querySelector("#replay-glow");
const analysisDialog = document.querySelector("#analysis-dialog");
const introDialog = document.querySelector("#prime-intro-dialog");
const analysisContent = document.querySelector("#analysis-content");
const dialogSubtitle = document.querySelector("#dialog-subtitle");
let lastDialogTrigger = null;

function signGuardFooter() {
  return `
    <footer class="signguard-footer">
      <span>Powered by</span>
      <span class="signguard-wordmark"><i class="sg-mark"></i>SignGuard</span>
    </footer>
  `;
}

function tokenIcon(asset) {
  const iconClass = asset.iconClass || asset.symbol.toLowerCase();
  const iconText = asset.iconText || asset.symbol.slice(0, 1);
  return `<i class="token-icon ${iconClass}">${iconText}</i>`;
}

function cardActionSummary(scenario) {
  return [scenario.actionSummary, scenario.appName].filter(Boolean).join(" · ");
}

function assetRows(assets, showUsd) {
  return assets
    .map((asset) => {
      const usdValue = asset.usd
        ? `<span class="asset-usd">≈ ${asset.usd}</span>`
        : '<span class="asset-usd unavailable" aria-label="No price available" title="No price available">—</span>';
      if (showUsd) {
        return `
          <div class="asset-row with-usd">
            ${tokenIcon(asset)}
            <span class="asset-name">${asset.symbol}</span>
            <span class="asset-values">
              <span class="asset-amount ${asset.direction}">${asset.amount}</span>
              ${usdValue}
            </span>
          </div>
        `;
      }
      return `
        <div class="asset-row amount-only">
          ${tokenIcon(asset)}
          <span class="asset-name">${asset.symbol}</span>
          <span class="asset-amount ${asset.direction}">${asset.amount}</span>
        </div>
      `;
    })
    .join("");
}

function securityHeader({ status, badge, subtitle }) {
  return `
    <div class="security-header">
      <span class="security-title">
        <strong>Security Checks</strong>
        <span>${subtitle || "Site Security · Transaction Analysis"}</span>
      </span>
      <span class="status-badge ${status}">${badge}</span>
    </div>
  `;
}

function primeBadge() {
  return `<span class="prime-badge"><i>P</i>Prime</span>`;
}

function detailButton() {
  return `
    <button class="detail-link" type="button" data-open-analysis aria-haspopup="dialog">
      <span>Details</span><span>›</span>
    </button>
  `;
}

function primeCta() {
  return `
    <button class="prime-cta" type="button" data-open-prime-intro aria-label="Know more about this transaction with Prime">
      <strong class="prime-cta-title">Know more about this transaction</strong>
      <span class="prime-cta-trailing">
        <span class="prime-cta-badge">Prime</span>
        <span class="prime-cta-chevron" aria-hidden="true">›</span>
      </span>
    </button>
  `;
}

function basicPreviewCard(scenario) {
  return `
    <div class="security-shell" data-has-assets="true">
      <section class="security-card">
        ${securityHeader({ status: "success", badge: "No issues detected" })}
        <section class="preview-section">
          <div class="preview-heading"><h3>Estimated asset changes</h3></div>
          <div class="asset-list">${assetRows(scenario.assets, false)}</div>
          ${state.tier === "free" ? primeCta() : ""}
        </section>
        ${signGuardFooter()}
      </section>
    </div>
  `;
}

function netValueImpact(scenario) {
  if (scenario.netValueUnavailable) return "";
  const impactNote = scenario.netValueNote || "Network fee not included";
  return `
    <div class="impact-row">
      <span class="impact-label">
        <span>Estimated net value change</span>
        <small>${impactNote}</small>
      </span>
      <strong>${scenario.netUsd}</strong>
    </div>
  `;
}

function primePreviewCard(scenario) {
  return `
    <div class="security-shell" data-has-assets="true">
      <section class="security-card">
        ${securityHeader({ status: "success", badge: "No issues detected" })}
        <section class="preview-section">
          <div class="preview-heading"><h3>Estimated asset changes</h3>${primeBadge()}</div>
          <p class="action-summary">${cardActionSummary(scenario)}</p>
          <div class="asset-list">${assetRows(scenario.assets, true)}</div>
          ${netValueImpact(scenario)}
          ${detailButton()}
        </section>
        ${signGuardFooter()}
      </section>
    </div>
  `;
}

function renderCard() {
  const scenario = scenarios[state.scenario];
  if (state.tier === "prime") {
    mount.innerHTML = primePreviewCard(scenario);
  } else {
    mount.innerHTML = basicPreviewCard(scenario);
  }
  bindCardInteractions();
}

function updateContext() {
  const scenario = scenarios[state.scenario];
  previewLabel.textContent = `${state.tier === "prime" ? "Prime" : "Free"} · ${scenario.label}`;
  sheetTitle.textContent = scenario.sheetTitle;
  sheetOrigin.textContent = scenario.origin;
  networkValue.textContent = scenario.network;
  targetLabel.textContent = scenario.targetLabel;
  targetValue.textContent = scenario.targetValue;
  replayButton.disabled = !hasVisibleAssets();
}

function updateControls() {
  document.querySelectorAll("[data-tier]").forEach((button) => {
    const active = button.dataset.tier === state.tier;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll("[data-scenario]").forEach((button) => {
    const active = button.dataset.scenario === state.scenario;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function hasVisibleAssets() {
  return scenarios[state.scenario].assets.length > 0;
}

function replayGlow() {
  const shell = mount.querySelector(".security-shell");
  if (!shell || !hasVisibleAssets()) return;
  shell.classList.remove("glow-run");
  void shell.offsetWidth;
  shell.classList.add("glow-run");
}

function bindCardInteractions() {
  const analysisTrigger = mount.querySelector("[data-open-analysis]");
  analysisTrigger?.addEventListener("click", () => {
    lastDialogTrigger = analysisTrigger;
    openAnalysis();
  });
  const introTrigger = mount.querySelector("[data-open-prime-intro]");
  introTrigger?.addEventListener("click", () => {
    lastDialogTrigger = introTrigger;
    introDialog.showModal();
  });
}

function simulatedBalance(asset) {
  if (asset.before == null || asset.after == null) {
    return {
      label: "Balance details",
      unavailable: true,
    };
  }
  if (asset.balanceType === "ownership") {
    return {
      label: "Simulated ownership",
      before: asset.before === "0" ? "Not owned" : "Owned",
      after: asset.after === "0" ? "Not owned" : "Owned",
    };
  }
  if (asset.balanceType === "position") {
    return {
      label: "Simulated position quantity",
      before: asset.before,
      after: asset.after,
    };
  }
  return {
    label: "Simulated balance",
    before: asset.before,
    after: asset.after,
  };
}

function reportBalances(scenario) {
  return `
    <section class="simulation-section balance-section">
      <h3>Balance after simulation</h3>
      <div class="simulation-balance-list">
        ${scenario.assets
          .map((asset) => {
            const balance = simulatedBalance(asset);
            return `
              <article class="simulation-balance-card">
                <div class="simulation-balance-asset">
                  ${tokenIcon(asset)}
                  <span>
                    <strong>${asset.symbol}</strong>
                    <small>${asset.network}</small>
                  </span>
                </div>
                <div class="simulation-balance-values ${balance.unavailable ? "unavailable" : ""}">
                  ${
                    balance.unavailable
                      ? "<strong>Balance unavailable</strong>"
                      : `
                        <span><small>Before</small><strong>${balance.before}</strong></span>
                        <i aria-hidden="true">→</i>
                        <span><small>After</small><strong>${balance.after}</strong></span>
                      `
                  }
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function reportFlows(scenario) {
  if (!scenario.flows?.length) return "";
  return `
    <section class="simulation-section flow-section">
      <h3>Asset flow</h3>
      <div class="asset-flow-list">
        ${scenario.flows
          .map(
            (flow) => `
              <div class="asset-flow-row">
                <i class="asset-flow-icon ${flow.direction}" aria-hidden="true">${
                  flow.direction === "in" ? "↙" : "↗"
                }</i>
                <span class="asset-flow-route">
                  <strong>${flow.from} → ${flow.to}</strong>
                  <small>${flow.direction === "in" ? "Received" : "Sent"}</small>
                </span>
                <strong class="asset-flow-amount ${flow.direction}">${flow.amount}</strong>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function openAnalysis() {
  const scenario = scenarios[state.scenario];
  dialogSubtitle.textContent = [scenario.network, scenario.appName]
    .filter(Boolean)
    .join(" · ");
  analysisContent.innerHTML = `
    ${reportBalances(scenario)}
    ${reportFlows(scenario)}
  `;
  analysisDialog.showModal();
}

function render({ animate = true } = {}) {
  updateControls();
  renderCard();
  updateContext();
  if (animate && hasVisibleAssets()) {
    requestAnimationFrame(replayGlow);
  }
}

document.querySelector("#tier-control").addEventListener("click", (event) => {
  const button = event.target.closest("[data-tier]");
  if (!button) return;
  state.tier = button.dataset.tier;
  render();
});

document
  .querySelector("#scenario-control")
  .addEventListener("click", (event) => {
    const button = event.target.closest("[data-scenario]");
    if (!button || button.disabled) return;
    state.scenario = button.dataset.scenario;
    render();
  });

replayButton.addEventListener("click", replayGlow);

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

for (const dialog of [analysisDialog, introDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    lastDialogTrigger?.focus();
    lastDialogTrigger = null;
  });
}

render();
