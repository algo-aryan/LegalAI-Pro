class VirtualAssistant {
  constructor(apiUtils) {
    this.apiUtils = apiUtils;
    this.init();
  }
  init() { this.setupVirtualAssistant(); }
  setupVirtualAssistant() {
    const input = document.getElementById("chat-input"),
          sendBtn = document.getElementById("chat-send-btn");
    if (!input || !sendBtn) return;
    sendBtn.addEventListener("click", e => { e.preventDefault(); this.sendChatMessage(); });
    input.addEventListener("keypress", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.sendChatMessage(); }
    });
    document.querySelectorAll(".suggestion-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        input.value = btn.textContent;
        this.sendChatMessage();
      });
    });
    const open = document.getElementById("mobile-sidebar-toggle"),
          close = document.getElementById("mobile-sidebar-close"),
          sidebar = document.getElementById("chat-sidebar");
    open?.addEventListener("click", e => { e.preventDefault(); sidebar.classList.add("active"); });
    close?.addEventListener("click", e => { e.preventDefault(); sidebar.classList.remove("active"); });
  }
  async sendChatMessage() {
    const input = document.getElementById("chat-input"),
          sendBtn = document.getElementById("chat-send-btn"),
          container = document.getElementById("chat-messages");
    const text = input.value.trim();
    if (!text) return;
    input.value = ""; input.disabled = true; sendBtn.disabled = true;
    this.addChatMessage("user", text);
    this.showTypingIndicator();
    try {
      const res = await this.apiUtils.apiCall("/chat/general","POST",{message:text});
      this.hideTypingIndicator();
      this.addChatMessage("assistant", res.response);
    } catch (err) {
      this.hideTypingIndicator();
      const msg = err.message.includes("404")
        ? "Section not found. Please verify the section number."
        : "An unexpected error occurred. Try again or refine your query.";
      this.addChatMessage("assistant", msg);
    } finally {
      input.disabled = false; sendBtn.disabled = false; input.focus();
      container.scrollTop = container.scrollHeight;
    }
  }
  addChatMessage(sender, msg) {
    const container = document.getElementById("chat-messages");
    if (!container) return;
    const div = document.createElement("div");
    div.className = `message ${sender}-message`;
    const avatar = sender==="user"?"U":'<i class="fas fa-robot"></i>';
    div.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">${this.format(msg)}</div>
    `;
    container.appendChild(div);
  }
  format(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>') // highlight instead of bold
      .split(/\n\n/).map(block => {
        if (/^\*\s+/.test(block)) {
          const items = block.trim().split(/\n/).map(l=>l.replace(/^\*\s+/,""));
          return `<ul>${items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
        }
        return `<p>${block.replace(/\n/g,"<br>")}</p>`;
      }).join("");
  }
  showTypingIndicator() {
    document.getElementById("typing-indicator").classList.remove("hidden");
  }
  hideTypingIndicator() {
    document.getElementById("typing-indicator").classList.add("hidden");
  }
}
document.addEventListener("DOMContentLoaded", ()=>{
  if (window.APIUtils) new VirtualAssistant(new window.APIUtils());
  const toggle = document.getElementById("theme-toggle"),
        saved = localStorage.getItem("theme")||"light";
  document.documentElement.setAttribute("data-color-scheme", saved);
  toggle?.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-color-scheme"),
          next = curr==="light"?"dark":"light";
    document.documentElement.setAttribute("data-color-scheme", next);
    localStorage.setItem("theme", next);
    toggle.querySelector("i").className = next==="light"?"fas fa-moon":"fas fa-sun";
  });
});