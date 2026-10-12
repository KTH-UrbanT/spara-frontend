const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");
const { transformSync } = require("@swc/core");

const tick = () => new Promise((done) => setImmediate(done));

function messageHelpers(user = null) {
  return loadSource("src/components/chat/Message.jsx", {
    react: { createElement: (...args) => args },
    "react-markdown": () => null,
    "react-icons/fi": new Proxy({}, { get: () => () => null }),
    "./AdvisorReviewPanel": () => null,
    "./RatePanel": "rating-panel",
    "../../services/api": { downloadDraftReport: () => {} },
    "../../context/authContext": { useAuth: () => ({ user, showToast() {} }) },
  });
}

function verifiedCard(extra = {}) {
  return { response_language: "sv", building_id: "01-80-TAPETEN2-1",
    building_identity_check: { status: "passed", matched_building_id: "01-80-TAPETEN2-1" },
    requested_address: "Ringvägen 10", epc_record_address: "Hornsgatan 104",
    evidence_scope: { building_id: "01-80-TAPETEN2-1", sources: { generic_sql: { accepted_records: 1 } } },
    retrieved_facts: { byggnadsid: "01-80-TAPETEN2-1", construction_year: 1952,
      epc_egienergiklass: "G", epc_egienergiklass2020_calc: "F",
      energy_performance: 201, specific_energy_use: 198, primary_energy_number: 145 }, ...extra };
}

test("card uses the recorded address, retains the searched alias, and separates declared/calculated classes", () => {
  const { buildBuildingContext } = messageHelpers();
  const card = buildBuildingContext(verifiedCard());
  assert.equal(card.address, "Hornsgatan 104");
  assert.equal(card.requestedAddress, "Ringvägen 10");
  const fields = Object.fromEntries(card.details.map(({ label, value }) => [label, value]));
  assert.equal(fields["Sökt adress (samma byggnadsid)"], "Ringvägen 10");
  assert.equal(fields["Byggår"], "1952");
  assert.equal(fields["Deklarerad energiklass"], "G");
  assert.equal(fields["Beräknad energiklass"], "F");
  assert.equal(fields["Deklarerad energiprestanda"], "201 kWh/(m²·år)");
  assert.equal(fields["Specifik energianvändning"], "198 kWh/(m²·år)");
  assert.equal(fields["Primärenergital (viktat mått)"], "145 kWh/(m²·år)");
});

test("the searched address note is absent when it matches the recorded address", () => {
  const card = messageHelpers().buildBuildingContext(verifiedCard({ requested_address: "Hornsgatan 104" }));
  assert.equal(card.requestedAddress, null);
});

test("the verified card replaces only the matching initial standalone building ID", () => {
  const { buildBuildingContext, stripRepeatedBuildingIdentifier } = messageHelpers();
  const card = buildBuildingContext(verifiedCard());
  for (const prefix of ["Byggnadsid: 01-80-TAPETEN2-1", "**Building ID:** `01-80-TAPETEN2-1`"]) {
    const content = `${prefix}\r\n\r\nEnergiprestanda: 142.\nByggnadsid: 01-80-TAPETEN2-1`;
    assert.equal(stripRepeatedBuildingIdentifier(content, card), "Energiprestanda: 142.\nByggnadsid: 01-80-TAPETEN2-1");
    assert.ok(content.startsWith(prefix));
  }
});

test("building ID text survives when the card is hidden or the ID differs", () => {
  const { buildBuildingContext, stripRepeatedBuildingIdentifier } = messageHelpers();
  const card = buildBuildingContext(verifiedCard());
  const content = "Byggnadsid: 01-80-SKYTTEN2-2\n\nEnergiprestanda: 142.";
  assert.equal(stripRepeatedBuildingIdentifier(content, card), content);
  assert.equal(stripRepeatedBuildingIdentifier(content, null), content);
  const prose = "För byggnadsid 01-80-TAPETEN2-1 gäller följande.";
  assert.equal(stripRepeatedBuildingIdentifier(prose, card), prose);
});

test("card does not label a calculated-only class as declared", () => {
  const card = messageHelpers().buildBuildingContext(verifiedCard({ retrieved_facts: {
    byggnadsid: "01-80-TAPETEN2-1", energy_class: "F", calculated_energy_class: "F",
  } }));
  assert.equal(card.details.find(({ label }) => label === "Beräknad energiklass").value, "F");
  assert.ok(!card.details.some(({ label }) => label === "Deklarerad energiklass" || label === "Registrerad energiklass"));
});

for (const [name, extra] of [
  ["a stale selected ID", { building_id_from_user: "01-80-SKYTTEN2-2" }],
  ["a mismatched fact ID", { retrieved_facts: { byggnadsid: "01-80-SKYTTEN2-2" } }],
  ["a mismatched evidence ID", { evidence_scope: { building_id: "01-80-SKYTTEN2-2", sources: { generic_sql: { accepted_records: 1 } } } }],
  ["unresolved identity", { building_identity_check: { status: "ambiguous", matched_building_id: "01-80-TAPETEN2-1" } }],
  ["a pending clarification", { clarification: { needed: true } }],
  ["no scoped records", { evidence_scope: { building_id: "01-80-TAPETEN2-1", sources: {} } }],
]) test(`card is hidden for ${name}`, () => assert.equal(messageHelpers().buildBuildingContext(verifiedCard(extra)), null));

test("retrieval alone does not append citations to an uncited claim", () => {
  const { addCitationMarkers } = messageHelpers();
  assert.equal(addCitationMarkers("This is a reported symptom.", [{ title: "Handbok" }], "ref-test"), "This is a reported symptom.");
});

test("Swedish explicit citations have separate readable markers", () => {
  const { addCitationMarkers } = messageHelpers();
  const result = addCitationMarkers("Kontrollera driften (Källor: Handbok; Checklista)", [{ title: "Handbok" }, { title: "Checklista" }], "ref-test");
  assert.equal(result, "Kontrollera driften [1](#ref-test-1) [2](#ref-test-2)");
});

test("different source documents survive a shared resource-page link", () => {
  const { getMessageSources } = messageHelpers();
  assert.equal(getMessageSources({ sources: [{ name: "A", filename: "a.pdf", link: "https://example.com/resources" }, { name: "B", filename: "b.pdf", link: "https://example.com/resources" }] }).length, 2);
});

for (const [language, declaredLabel, calculatedLabel] of [
  ["sv", "Deklarerad energiklass", "Beräknad energiklass"],
  ["en", "Declared energy class", "Calculated energy class"],
]) test(`restored ${language} metadata retains its own card language and recorded identity`, () => {
  const metadata = JSON.parse(JSON.stringify(verifiedCard({ response_language: language,
    data_freshness: { energy_declaration_year: 2018 },
    evidence_scope: { building_id: "01-80-TAPETEN2-1", cached_facts_used: true, sources: {} },
  })));
  const context = messageHelpers().buildBuildingContext(metadata);
  assert.equal(context.swedish, language === "sv");
  assert.equal(context.address, "Hornsgatan 104");
  assert.equal(context.buildingId, "01-80-TAPETEN2-1");
  assert.equal(context.cached, true);
  assert.equal(context.freshness.energy_declaration_year, 2018);
  assert.equal(context.details.find(({ label }) => label === declaredLabel).value, "G");
  assert.equal(context.details.find(({ label }) => label === calculatedLabel).value, "F");
  assert.ok(!context.details.some(({ value }) => value === "1 952"));
});

test("ODEN references display a public source name rather than an internal SQL name", () => {
  const { getMessageSources } = messageHelpers();
  const sources = getMessageSources({ metadata: verifiedCard({
    data_freshness: { energy_declaration_year: 2018 },
  }) });
  assert.equal(sources.length, 1);
  assert.equal(sources[0].title, "ODEN – energideklaration (2018)");
  assert.ok(!sources[0].title.includes("generic_sql"));
  assert.equal(sources[0].link, "");
});

function renderedMessageText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (!Array.isArray(node)) return typeof node === "string" ? node : "";
  const [type, props, ...children] = node;
  if (typeof type === "function") {
    return renderedMessageText(type({ ...(props || {}), children }));
  }
  if (typeof type === "string" && (props == null || typeof props === "object")) {
    return children.map(renderedMessageText).join(" ");
  }
  return node.map(renderedMessageText).join(" ");
}

for (const [status, swedishLabel, englishLabel] of [
  ["pending_confirmation", "Väntar på ditt godkännande", "Expert handoff pending"],
  ["cancelled", "Överlämningen är avbruten", "Expert handoff cancelled"],
  ["submitted", "E-postservern har tagit emot meddelandet", "Expert handoff submitted"],
  ["simulated", "Överlämningen simulerades", "Expert handoff simulated"],
  ["unknown", "Överlämningens status är osäker", "Expert handoff status uncertain"],
]) for (const language of ["sv", "en"]) {
  test(`restored ${language} ${status} handover displays recorded status with delivery limits`, () => {
    const metadata = JSON.parse(JSON.stringify({ route: "expert_handoff",
      expert_handoff_triggered: true, response_language: language,
      expert_handoff_language: language, expert_handoff_status: status }));
    const text = renderedMessageText(messageHelpers().default({ children: "",
      message: { role: "assistant", message_id: 42, metadata }, time: "14:30" }));
    assert.ok(text.includes(language === "sv" ? swedishLabel : englishLabel));
    if (status === "submitted") {
      assert.ok(text.includes(language === "sv" ? "Leverans till inkorgen är inte bekräftad" : "Inbox delivery is not confirmed"));
    }
    if (status === "simulated") {
      assert.ok(text.includes(language === "sv" ? "Inget e-postmeddelande har skickats" : "no email was sent"));
    }
    if (status === "cancelled") {
      assert.ok(text.includes(language === "sv" ? "Inget e-postmeddelande har skickats" : "No email was submitted"));
    }
  });
}
const deferred = () => {
  let resolvePromise;
  const promise = new Promise((done) => { resolvePromise = done; });
  return { promise, resolve: resolvePromise };
};

function loadSource(file, dependencies, globals = {}) {
  const code = transformSync(readFileSync(resolve(__dirname, "..", file), "utf8"), {
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "classic" } } },
    module: { type: "commonjs" },
  }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports,
    require: (name) => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { log() {}, error() {} },
    setTimeout, clearTimeout, crypto: require("node:crypto"), ...globals,
  });
  return module.exports;
}

class FakeSocket extends EventEmitter {
  connected = false;
  outbound = [];
  emit(...args) { this.outbound.push(args); return this; }
  serverEmit(...args) { return super.emit(...args); }
  connect() { this.active = true; }
  serverConnect() { this.connected = true; this.serverEmit("connect"); }
}

function socketService() {
  const socket = new FakeSocket();
  const timers = new Map();
  let timerId = 0;
  const service = loadSource("src/services/socket.js", {
    "socket.io-client": { io: () => socket },
    "./api": { localizeServiceError: (detail, fallback) => detail || fallback },
    "../constants": { EVENTS: {
      CREATE_NEW_SESSION: "create_session", SESSION_CREATED: "session_created", ERROR_MESSAGE: "error_message",
    } },
  }, {
    setTimeout: (callback) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  });
  return { socket, service, timers };
}

test("creation waits for a matching saved-message confirmation and emits only once", async () => {
  const { socket, service, timers } = socketService();
  let settled = false;
  const pending = service.createNewSession("Vad är en BRF?", 1, "user@example.com");
  pending.then(() => { settled = true; });
  assert.equal(socket.outbound.length, 0);
  socket.serverConnect();
  const request = socket.outbound[0];
  assert.equal(request[0], "create_session");
  const requestId = request[4];
  socket.serverEmit("session_created", { request_id: "another-request", message_accepted: true });
  await tick();
  assert.equal(settled, false);
  socket.serverEmit("session_created", {
    request_id: requestId, session_id: "chat-1", session_id_int: 21, message_accepted: true,
  });
  assert.equal((await pending).session_id, "chat-1");
  socket.serverConnect();
  assert.equal(socket.outbound.length, 1);
  assert.equal(timers.size, 0);
  assert.equal(socket.listenerCount("error_message"), 0);
});

test("connection failure cancels unsent creation instead of buffering it", async () => {
  const { socket, service, timers } = socketService();
  const pending = service.createNewSession("Keep this", 1, "user@example.com");
  const rejected = assert.rejects(pending, /inte att ansluta/);
  socket.serverEmit("connect_error", new Error("offline"));
  await rejected;
  socket.serverConnect();
  assert.equal(socket.outbound.length, 0);
  assert.equal(timers.size, 0);
});

test("creation timeout removes listeners and does not send after a late connection", async () => {
  const { socket, service, timers } = socketService();
  const pending = service.createNewSession("Keep this", 1, "user@example.com");
  const rejected = assert.rejects(pending, /inte bekräftat/);
  [...timers.values()][0]();
  await rejected;
  socket.serverConnect();
  assert.equal(socket.outbound.length, 0);
  assert.equal(socket.listenerCount("error_message"), 0);
});

test("a session without saved-message acceptance does not count as delivery", async () => {
  const { socket, service } = socketService();
  socket.connected = true;
  const pending = service.createNewSession("Keep this", 1, "user@example.com");
  const rejected = assert.rejects(pending, /bekräftade inte/);
  socket.serverEmit("session_created", {
    request_id: socket.outbound[0][4], session_id: "chat-1", session_id_int: 21,
  });
  await rejected;
});

// Exercise the actual component handlers and effects with deterministic hook state.
function hookHarness() {
  const slots = [];
  let cursor = 0;
  let effects = [];
  const react = {
    createContext: () => ({ Provider: "Provider" }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useContext() {},
    useRef: (value) => {
      const index = cursor++;
      slots[index] ||= { current: value };
      return slots[index];
    },
    useState: (value) => {
      const index = cursor++;
      slots[index] ||= { value: typeof value === "function" ? value() : value };
      return [slots[index].value, (next) => {
        slots[index].value = typeof next === "function" ? next(slots[index].value) : next;
      }];
    },
    useEffect: (callback, dependencies) => {
      const index = cursor++;
      const previous = slots[index];
      if (!previous || dependencies.some((value, position) => !Object.is(value, previous.dependencies[position]))) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[index] = { dependencies, cleanup: callback() };
        });
      }
    },
  };
  return {
    react,
    render: (component) => {
      cursor = 0;
      const result = component({ children: null });
      const pending = effects;
      effects = [];
      pending.forEach((effect) => effect());
      return result;
    },
  };
}

test("New Chat clears the previous selected session through the actual route effect", () => {
  const hooks = hookHarness();
  const auth = { selectedSession: "user@example.com:previous",
    setSelectedSession: (value) => { auth.selectedSession = value; } };
  const route = { location: { pathname: "/chat/user%40example.com%3Aprevious" },
    params: { chatId: "user%40example.com%3Aprevious" } };
  const root = loadSource("src/routes/Root.jsx", {
    react: hooks.react,
    "react-router": { useLocation: () => route.location, useParams: () => route.params },
    "react-router-dom": { Outlet: "outlet" },
    "../context/authContext": { useAuth: () => auth },
    "../hooks/useWindowSize": { useWindowSize: () => ({ windowHeight: 800 }) },
    "../components/Sidebar/Sidebar": "sidebar",
  }, { React: hooks.react }).default;
  hooks.render(root);
  assert.equal(auth.selectedSession, "user@example.com:previous");
  route.location = { pathname: "/" };
  route.params = {};
  hooks.render(root);
  assert.equal(auth.selectedSession, null);
});

for (const temporaryUser of [true, false]) {
  test(`the actual Message component shows answer ratings for ${temporaryUser ? "email-continue" : "registered"} users`, () => {
    const user = { user_id: 3, email: "pilot@example.com", temporary_user: temporaryUser };
    const message = { message_id: 42, role: "assistant", content: "Råd" };
    const tree = messageHelpers(user).default({ children: message.content, message });
    const ratingPanels = [];
    const findPanels = (node) => {
      if (!Array.isArray(node)) return;
      if (node[0] === "rating-panel") ratingPanels.push(node);
      node.forEach(findPanels);
    };
    findPanels(tree);
    assert.equal(ratingPanels.length, 1);
    assert.equal(ratingPanels[0][1].message, message);
  });

  test(`${temporaryUser ? "email-continue" : "registered"} users can rate the actual answer ID and retain a restored rating`, async () => {
    const hooks = hookHarness();
    const user = { user_id: 3, email: "pilot@example.com", temporary_user: temporaryUser };
    const message = { message_id: 42, role: "assistant", content: "Råd", rating: 2 };
    const calls = [];
    const updates = [];
    const toasts = [];
    const ratingPanel = loadSource("src/components/chat/RatePanel.jsx", {
      react: hooks.react,
      "react-icons/io": { IoIosStar: "selected-star", IoIosStarOutline: "empty-star" },
      "../../services/api": { sendRating: async (...args) => {
        calls.push(args);
        return { rating_id: 17, message_id: 42 };
      } },
      "../../context/authContext": { useAuth: () => ({ user,
        showToast: (...args) => toasts.push(args) }) },
      "../../context/socketContext": { useSocket: () => ({
        updateMessageRating: (...args) => updates.push(args),
      }) },
    }, { localStorage: { getItem: (key) => JSON.stringify(key === "user" ? user : 21) } }).default;
    const render = () => hooks.render(() => ratingPanel({ message }));
    let panel = render();
    assert.equal(panel.props["aria-label"], "Betygsätt svaret");
    assert.equal(panel.props.children[0].length, 5);
    assert.equal(panel.props.children[0][1].props.children[0].type, "selected-star");
    await panel.props.children[0][3].props.onClick();
    assert.deepEqual(calls[0], [3, 4, "Råd", 21, 42]);
    assert.equal(updates[0][0], message);
    assert.deepEqual(updates[0].slice(1), [4, 17, 42]);
    assert.deepEqual(toasts[0], ["Betyget har skickats", "success"]);
    panel = render();
    assert.equal(panel.props.children[0][3].props.children[0].type, "selected-star");
    message.rating = 5;
    render();
    panel = render();
    assert.equal(panel.props.children[0][4].props.children[0].type, "selected-star");
  });
}

for (const accepted of [false, true]) {
  test(`input waits for acknowledgment, blocks double submission, and ${accepted ? "clears on success" : "survives failure"}`, async () => {
    const hooks = hookHarness();
    const acknowledgment = deferred();
    let calls = 0;
    const component = loadSource("src/components/chat/SendPanel.jsx", {
      react: hooks.react,
      "react-icons/hi": { HiPaperAirplane: "icon" },
      "react-router-dom": { useNavigate: () => () => {} },
      "../../context/authContext": { useAuth: () => ({ selectedSession: null, sessions: [], user: { email: "user@example.com" }, showToast() {} }) },
      "../../context/socketContext": { useSocket: () => ({ handleSendFirstMessage: () => { calls++; return acknowledgment.promise; } }) },
      "../../services/api": { localizeServiceError: (detail, fallback) => detail || fallback },
      "../Button": "button",
    }).default;
    let form = hooks.render(component);
    form.props.children[0].props.onChange({ target: { value: "My first question", style: {} } });
    form = hooks.render(component);
    const pending = form.props.onSubmit({ preventDefault() {} });
    await form.props.onSubmit({ preventDefault() {} });
    assert.equal(calls, 1);
    form = hooks.render(component);
    assert.equal(form.props.children[0].props.value, "My first question");
    assert.equal(form.props.children[0].props.disabled, true);
    acknowledgment.resolve(accepted);
    await pending;
    form = hooks.render(component);
    assert.equal(form.props.children[0].props.value, accepted ? "" : "My first question");
    assert.equal(form.props.children[0].props.disabled, false);
  });
}

for (const timing of ["empty-preload", "stale-preload", "early-answer"]) {
test(`new chat selection needs no session-list refresh and keeps messages with ${timing}`, async () => {
  const hooks = hookHarness();
  const socket = new FakeSocket();
  const acknowledgment = deferred();
  const history = deferred();
  let creationCalls = 0;
  let sends = 0;
  const auth = {
    selectedSession: null, sessions: [], user: { user_id: 1, email: "user@example.com" },
    showToast() {}, setSelectedSession: (value) => { auth.selectedSession = value; },
    setSessions: (update) => { auth.sessions = update(auth.sessions); },
    setSessionLoadingStatus() {},
  };
  const socketModule = { default: socket, __esModule: true,
    createNewSession: () => { creationCalls++; return acknowledgment.promise; },
    sendMessage: () => { sends++; }, establishSession() {},
  };
  for (const [add, remove, event] of [
    ["listenForSessionUpdates", "removeSessionUpdatedListener", "session_updated"],
    ["listenForMessages", "removeMessageListener", "receive_message"],
    ["listenForAnswers", "removeAnswerListener", "answer_message"],
    ["listenForProcessingStatus", "removeProcessingStatusListener", "processing_status"],
    ["listenForErrors", "removeErrorListener", "error_message"],
  ]) {
    socketModule[add] = (callback) => socket.on(event, callback);
    socketModule[remove] = (callback) => socket.off(event, callback);
  }
  const provider = loadSource("src/context/socketContext.jsx", {
    react: hooks.react, "../routes/router": { router: { navigate() {} } },
    "../services/socket": socketModule,
    "../services/api": { getMessagesBySession: () => history.promise },
    "./authContext": { useAuth: () => auth },
  }, { localStorage: { setItem() {} } }).SocketProvider;
  let context = hooks.render(provider).props.value;
  const pending = context.handleSendFirstMessage("My first question");
  assert.equal(await context.handleSendFirstMessage("Duplicate"), false);
  const first = { message_id: 41, role: "user", content: "My first question" };
  const answer = { message_id: 42, role: "assistant", content: "Answer" };
  if (timing === "early-answer") {
    socket.serverEmit("session_updated", { session_id: "chat-1", messages: [first, answer] });
  }
  acknowledgment.resolve({ session_id: "chat-1", session_id_int: 21, messages: [first] });
  assert.equal(await pending, true);
  assert.equal(creationCalls, 1);
  assert.equal(sends, 0);
  hooks.render(provider);
  context = hooks.render(provider).props.value;
  assert.equal(context.messages[0].content, first.content);
  if (timing === "stale-preload") {
    socket.serverEmit("session_updated", { session_id: "chat-1", messages: [first, answer] });
  }
  history.resolve([]);
  await tick();
  if (timing === "empty-preload") {
    context = hooks.render(provider).props.value;
    assert.equal(context.messages.length, 1);
    socket.serverEmit("session_updated", { session_id: "chat-1", messages: [first, answer] });
  }
  context = hooks.render(provider).props.value;
  assert.equal(context.messages.length, 2);
  assert.equal(context.messages[1].content, "Answer");
});
}
