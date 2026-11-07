/**
 * Embedded Waku Light Node for the Express server.
 * Uses @waku/sdk (LightPush / Filter / Store). Failures must never
 * take down the rest of the app — callers check isAvailable().
 */

import {
  DefaultNetworkConfig,
  Protocols,
  createDecoder,
  createEncoder,
  createLightNode,
  type IDecodedMessage,
  type LightNode,
} from "@waku/sdk";
import { createRoutingInfo } from "@waku/utils";

export type WakuWireMessage = {
  payload: string; // Base64
  contentTopic: string;
  version: number;
  timestamp: number;
  ephemeral?: boolean;
  meta?: string;
};

export type WakuPeerInfo = {
  id: string;
  multiaddr: string;
  latencyMs: number | null;
  protocols: string[];
  status: "connected" | "disconnected";
};

export type WakuNodeInfo = {
  listenAddresses: string[];
  enr: string | null;
  peerId: string;
  fleet: string;
  protocols: string[];
  peerCount: number;
  version: string;
  connected: boolean;
};

const MAX_CACHE_PER_TOPIC = 150;
const DEFAULT_TOPICS = [
  "/iina-player/1/lounge/proto",
  "/iina-player/1/watch-party/proto",
  "/iina-player/1/4k-streamers/proto",
];

type MessageListener = (msg: WakuWireMessage) => void;

function networkConfig(clusterId: number) {
  return {
    clusterId,
    numShardsInCluster: DefaultNetworkConfig.numShardsInCluster,
  };
}

function routingFor(contentTopic: string, clusterId: number) {
  return createRoutingInfo(networkConfig(clusterId), { contentTopic });
}

function b64ToBytes(b64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

function bytesToB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function decodedToWire(msg: IDecodedMessage, fallbackTopic: string): WakuWireMessage {
  const payload = msg.payload ? bytesToB64(msg.payload) : "";
  const ts =
    typeof msg.timestamp === "bigint"
      ? Number(msg.timestamp)
      : msg.timestamp
        ? Number(msg.timestamp)
        : Date.now();
  return {
    payload,
    contentTopic: msg.contentTopic || fallbackTopic,
    version: msg.version ?? 0,
    timestamp: ts,
    ephemeral: false,
  };
}

export class WakuNodeService {
  private node: LightNode | null = null;
  private cache: Record<string, WakuWireMessage[]> = {};
  private listeners = new Set<MessageListener>();
  private subscribed = new Set<string>();
  private starting: Promise<boolean> | null = null;
  private fleetLabel = "Status Network (default bootstrap)";
  private clusterId = 1;

  isAvailable(): boolean {
    return Boolean(this.node?.isStarted());
  }

  onMessage(listener: MessageListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(msg: WakuWireMessage) {
    for (const listener of this.listeners) {
      try {
        listener(msg);
      } catch {
        // ignore listener errors
      }
    }
  }

  private appendCache(msg: WakuWireMessage) {
    if (msg.ephemeral) return;
    const topic = msg.contentTopic;
    if (!this.cache[topic]) this.cache[topic] = [];
    const dup = this.cache[topic].some(
      (m) => m.payload === msg.payload && m.timestamp === msg.timestamp
    );
    if (dup) return;
    this.cache[topic].push(msg);
    if (this.cache[topic].length > MAX_CACHE_PER_TOPIC) {
      this.cache[topic].shift();
    }
  }

  getCached(contentTopic: string): WakuWireMessage[] {
    return [...(this.cache[contentTopic] || [])];
  }

  async start(): Promise<boolean> {
    if (this.node?.isStarted()) return true;
    if (this.starting) return this.starting;

    this.starting = (async () => {
      try {
        const bootstrapPeers = (process.env.WAKU_BOOTSTRAP_PEERS || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        this.clusterId = Number(process.env.WAKU_CLUSTER || 1) || 1;
        this.fleetLabel = bootstrapPeers.length
          ? `Custom bootstrap (${bootstrapPeers.length} peers, cluster ${this.clusterId})`
          : `Status Network default bootstrap (cluster ${this.clusterId})`;

        const node = await createLightNode({
          defaultBootstrap: bootstrapPeers.length === 0,
          bootstrapPeers: bootstrapPeers.length ? bootstrapPeers : undefined,
          networkConfig: networkConfig(this.clusterId),
        });

        await node.start();
        this.node = node;

        try {
          await Promise.race([
            node.waitForPeers([Protocols.LightPush, Protocols.Filter]),
            new Promise<void>((resolve) => setTimeout(resolve, 12_000)),
          ]);
        } catch {
          // peers may arrive later
        }

        await this.subscribeTopics(DEFAULT_TOPICS);

        const peerId = node.libp2p.peerId.toString();
        const peerCount = node.libp2p.getPeers().length;
        console.log(
          `[IINA SERVER] Waku LightNode online — peerId ${peerId}, peers ${peerCount}, fleet: ${this.fleetLabel}`
        );
        return true;
      } catch (err) {
        this.node = null;
        console.warn(
          `[IINA SERVER] Waku LightNode failed to start (${(err as Error).message}). ` +
            "Waku endpoints will return 503; the rest of the server stays up."
        );
        return false;
      } finally {
        this.starting = null;
      }
    })();

    return this.starting;
  }

  async stop(): Promise<void> {
    const node = this.node;
    this.node = null;
    this.subscribed.clear();
    if (node?.isStarted()) {
      try {
        await node.stop();
        console.log("[IINA SERVER] Waku LightNode stopped.");
      } catch (err) {
        console.warn(`[IINA SERVER] Waku stop error: ${(err as Error).message}`);
      }
    }
  }

  async publish(contentTopic: string, wireMsg: WakuWireMessage): Promise<void> {
    if (!this.isAvailable() || !this.node) {
      throw new Error("Waku node unavailable");
    }
    const routingInfo = routingFor(contentTopic, this.clusterId);
    const encoder = createEncoder({ contentTopic, routingInfo });
    const payload = b64ToBytes(wireMsg.payload);
    const result = await this.node.lightPush.send(encoder, {
      payload,
      timestamp: new Date(wireMsg.timestamp || Date.now()),
    });
    if (result && typeof result === "object" && "failures" in result) {
      const failures = (result as { failures?: unknown[] }).failures;
      const successes = (result as { successes?: unknown[] }).successes;
      if (Array.isArray(failures) && failures.length > 0 && (!successes || successes.length === 0)) {
        throw new Error("LightPush failed — no peers accepted the message");
      }
    }
    const stored: WakuWireMessage = {
      ...wireMsg,
      contentTopic: wireMsg.contentTopic || contentTopic,
      timestamp: wireMsg.timestamp || Date.now(),
    };
    this.appendCache(stored);
    this.emit(stored);
  }

  async queryStore(
    contentTopic: string,
    pageSize: number
  ): Promise<{ messages: WakuWireMessage[]; source: "store" | "cache"; totalCount: number }> {
    const safePageSize = Math.max(1, Math.min(100, pageSize));
    if (!this.isAvailable() || !this.node) {
      throw new Error("Waku node unavailable");
    }

    const routingInfo = routingFor(contentTopic, this.clusterId);
    const decoder = createDecoder(contentTopic, routingInfo);
    const collected: WakuWireMessage[] = [];
    try {
      await Promise.race([
        this.node.store.queryWithOrderedCallback(
          [decoder],
          (msg) => {
            if (!msg?.payload) return false;
            collected.push(decodedToWire(msg, contentTopic));
            return collected.length >= safePageSize;
          },
          {
            pubsubTopic: routingInfo.pubsubTopic,
            contentTopics: [contentTopic],
            includeData: true,
            paginationForward: false,
            paginationLimit: safePageSize,
          }
        ),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("Store query timed out")), 10_000)
        ),
      ]);
      if (collected.length > 0) {
        const messages = collected.slice(-safePageSize);
        return { messages, source: "store", totalCount: collected.length };
      }
    } catch {
      // fall through to cache
    }

    const cached = this.getCached(contentTopic);
    return {
      messages: cached.slice(-safePageSize),
      source: "cache",
      totalCount: cached.length,
    };
  }

  async subscribeTopics(topics: string[]): Promise<string[]> {
    if (!this.isAvailable() || !this.node) {
      throw new Error("Waku node unavailable");
    }
    for (const topic of topics) {
      if (!topic || this.subscribed.has(topic)) continue;
      try {
        const routingInfo = routingFor(topic, this.clusterId);
        const decoder = createDecoder(topic, routingInfo);
        const ok = await this.node.filter.subscribe(decoder, (msg) => {
          if (!msg?.payload) return;
          const wire = decodedToWire(msg, topic);
          this.appendCache(wire);
          this.emit(wire);
        });
        if (ok) {
          this.subscribed.add(topic);
        } else {
          console.warn(`[IINA SERVER] Waku Filter subscribe failed for ${topic}`);
        }
      } catch (err) {
        console.warn(
          `[IINA SERVER] Waku Filter error for ${topic}: ${(err as Error).message}`
        );
      }
    }
    return [...this.subscribed];
  }

  async getPeers(): Promise<WakuPeerInfo[]> {
    if (!this.isAvailable() || !this.node) {
      throw new Error("Waku node unavailable");
    }
    const peerIds = this.node.libp2p.getPeers();
    const out: WakuPeerInfo[] = [];
    for (const peerId of peerIds) {
      let multiaddr = peerId.toString();
      let protocols: string[] = [];
      let latencyMs: number | null = null;
      try {
        const conns = this.node.libp2p.getConnections(peerId);
        if (conns?.[0]?.remoteAddr) {
          multiaddr = conns[0].remoteAddr.toString();
        }
        const start = performance.now();
        const pingSvc = this.node.libp2p.services?.ping as
          | { ping?: (id: typeof peerId) => Promise<number> }
          | undefined;
        if (pingSvc?.ping) {
          await pingSvc.ping(peerId);
          latencyMs = Math.round(performance.now() - start);
        }
        const peer = await this.node.libp2p.peerStore.get(peerId);
        protocols = (peer.protocols || []).map(String);
      } catch {
        // keep defaults
      }
      out.push({
        id: peerId.toString(),
        multiaddr,
        latencyMs,
        protocols,
        status: "connected",
      });
    }
    return out;
  }

  getInfo(): WakuNodeInfo {
    if (!this.isAvailable() || !this.node) {
      throw new Error("Waku node unavailable");
    }
    const peerId = this.node.libp2p.peerId.toString();
    const connections = this.node.libp2p.getConnections();
    const listenAddresses = this.node.libp2p
      .getMultiaddrs()
      .map((a) => a.toString());
    return {
      listenAddresses,
      enr: null,
      peerId,
      fleet: this.fleetLabel,
      protocols: [
        "/vac/waku/lightpush/2.0.0",
        "/vac/waku/filter/2.0.0",
        "/vac/waku/store/2.0.0",
      ],
      peerCount: connections.length,
      version: "@waku/sdk LightNode",
      connected: connections.length > 0,
    };
  }
}

export const wakuService = new WakuNodeService();
