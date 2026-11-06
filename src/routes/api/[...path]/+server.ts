import { json, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import { Type } from '@google/genai';
import {
  MEDIA_DIR,
  MEDIA_FILE,
  HISTORY_FILE,
  PLUGINS_FILE,
  watchParties,
  defaultMediaItems,
  defaultPlugins,
  readJSON,
  writeJSON,
  gAi
} from '$lib/server/db';
// Same security helpers as the Express server (server.ts) — see
// src/lib/security.ts. This SvelteKit route is currently unused (the
// React/Express app is the live one), but it must carry the same fixes
// so enabling it later does not reintroduce the flaws.
import {
  validateProxyUrl,
  resolveMediaPath,
  sanitizeMediaInput,
  sanitizeUploadFilename,
  MAX_UPLOAD_BYTES
} from '$lib/security';

export async function GET(event: RequestEvent) {
  const { params, url } = event;
  const reqPath = params.path || '';

  // 1. Get Library Items
  if (reqPath === 'media') {
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    return json(media);
  }

  // 2. Play History
  if (reqPath === 'history') {
    const history = readJSON(HISTORY_FILE, []);
    return json(history);
  }

  // 3. Plugins
  if (reqPath === 'plugins') {
    const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
    return json(plugins);
  }

  // 4. Stremio Proxy
  // SECURITY: was an open SSRF proxy. Now https-only with an explicit
  // hostname allowlist — see validateProxyUrl() in src/lib/security.ts.
  if (reqPath === 'stremio/proxy') {
    let target: URL;
    try {
      target = validateProxyUrl(url.searchParams.get('url'));
    } catch (err: any) {
      return json({ error: err.message || 'Proxy host is not allowed' }, { status: 400 });
    }
    const urlParam = target.toString();

    try {
      const response = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (IINA Core Applet)',
          'Accept': 'application/json'
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(10_000)
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
          try {
            const redirectTarget = validateProxyUrl(new URL(location, target).toString());
            const redirectResponse = await fetch(redirectTarget, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (IINA Core Applet)',
                'Accept': 'application/json'
              },
              redirect: 'manual',
              signal: AbortSignal.timeout(10_000)
            });
            if (!redirectResponse.ok) {
              throw new Error(`Failed status: ${redirectResponse.status}`);
            }
            return json(await redirectResponse.json());
          } catch (err: any) {
            return json({ error: err.message || 'Proxy host is not allowed' }, { status: 400 });
          }
        }
      }

      if (!response.ok) {
        throw new Error(`Failed status: ${response.status}`);
      }

      const text = await response.text();
      if (text.length > 5 * 1024 * 1024) {
        return json({ error: 'Addon response too large' }, { status: 502 });
      }
      const data = JSON.parse(text);
      
      if (urlParam.includes('/stream/') && data && Array.isArray(data.streams)) {
        data.streams = data.streams.map((stream: any) => {
          if (stream.infoHash && !stream.url) {
            stream.url = `http://localhost:3001/api/stremio/torrent/stream?infoHash=${stream.infoHash}&fileIdx=${stream.fileIdx || 0}&title=${encodeURIComponent(stream.title || 'Stream')}`;
          }
          return stream;
        });
      }

      return json(data);
    } catch (err: any) {
      console.error('Stremio Proxy Error:', err.message);
      return json({ error: 'Secondary addon response failure', details: err.message }, { status: 502 });
    }
  }

  // 5. Torrent Stream Redirection
  if (reqPath === 'stremio/torrent/stream') {
    const title = url.searchParams.get('title') || '';
    const titleStr = title.toLowerCase();
    
    let streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4';
    if (titleStr.includes('bunny') || titleStr.includes('comedy') || titleStr.includes('babygirl')) {
      streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    } else if (
      titleStr.includes('steel') || 
      titleStr.includes('cyber') || 
      titleStr.includes('action') || 
      titleStr.includes('sci') || 
      titleStr.includes('war') || 
      titleStr.includes('horror') || 
      titleStr.includes('heretic') ||
      titleStr.includes('civil')
    ) {
      streamUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    }
    
    throw redirect(302, streamUrl);
  }

  // 6. Subtitles VTT Engine
  if (reqPath.startsWith('subtitles/')) {
    const parts = reqPath.split('/');
    const lang = parts[parts.length - 1]; // 'en' or 'es'

    const vttHeaders = { 'Content-Type': 'text/vtt; charset=utf-8' };

    if (lang === 'es') {
      const body = `WEBVTT

1
00:00:02.000 --> 00:00:06.000
IINA: Bienvenidos al reproductor de vídeo del futuro.

2
00:00:10.000 --> 00:00:15.000
Esta pista de subtítulos en español se generó automáticamente y funciona de forma sincrónica.

3
00:01:20.000 --> 00:01:25.000
Observe lo suave que es el control de reproducción remota con nuestro buffer.`;
      return new Response(body, { headers: vttHeaders });
    } else {
      const body = `WEBVTT

1
00:00:01.000 --> 00:00:05.000
Welcome to IINA Media Server & Player experience.

2
00:00:06.000 --> 00:00:11.000
This is a standard high-performance WebVTT subtitle stream synchronized in real-time.

3
00:00:15.000 --> 00:00:20.000
You can adjust subtitle offset timing and see immediate shifts.

4
00:00:40.000 --> 00:00:45.000
Invite your friends to watch this together by clicking generating watch party lobby.`;
      return new Response(body, { headers: vttHeaders });
    }
  }

  // 7. Video Byte Stream Resolver
  if (reqPath === 'stream') {
    const id = url.searchParams.get('id') || '';
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    const video = media.find((m: any) => m.id === id);

    if (!video) {
      return new Response('Video file metadata not found', { status: 404 });
    }

    if (!video.isLocal) {
      try {
        const target = new URL(String(video.url));
        if (target.protocol !== 'http:' && target.protocol !== 'https:') {
          return new Response('Invalid remote stream URL', { status: 400 });
        }
      } catch {
        return new Response('Invalid remote stream URL', { status: 400 });
      }
      throw redirect(302, video.url);
    }

    // SECURITY: resolveMediaPath() rejects traversal outside MEDIA_DIR,
    // and the error no longer leaks the absolute on-disk path.
    const filePath = resolveMediaPath(MEDIA_DIR, video.filename);
    if (!filePath || !fs.existsSync(filePath)) {
      return new Response('Physical stream source missing on disc', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = event.request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        return new Response('Requested range not satisfiable\n' + start + ' >= ' + fileSize, {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` }
        });
      }

      const chunksize = (end - start) + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': video.mimeType || 'video/mp4'
      };

      return new Response(fileStream as any, { status: 206, headers });
    } else {
      const headers = {
        'Content-Length': fileSize.toString(),
        'Content-Type': video.mimeType || 'video/mp4',
        'Accept-Ranges': 'bytes'
      };
      return new Response(fs.createReadStream(filePath) as any, { status: 200, headers });
    }
  }

  // 8. Stremio Mock Manifest
  if (reqPath === 'stremio-mock/manifest.json') {
    return json({
      id: 'community.open.streams',
      name: 'IINA Community Sandbox Addon',
      description: 'A developer-grade Stremio addon hosted locally to test streaming pipelines, custom subtitles, and catalog bindings.',
      version: '1.2.0',
      resources: ['stream'],
      types: ['movie'],
      idPrefixes: ['bbb', 'sintel', 'tears']
    });
  }

  // 9. Stremio Mock Get Stream
  if (reqPath.startsWith('stremio-mock/stream/')) {
    const parts = reqPath.split('/');
    const resourceId = parts[parts.length - 1].replace('.json', '');

    if (resourceId.includes('bbb-sample') || resourceId.includes('bbb')) {
      return json({
        streams: [
          {
            name: 'IINA Direct Core [1080p]',
            title: 'Big Buck Bunny - Direct High-Speed CDN Mirror\n⚡ Low Latency • mp4 duration: 9m 56s',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          {
            name: 'IINA Core Mirror [720p]',
            title: 'Big Buck Bunny - Compressed Web Optimized Stream\n📱 Mobile safe • AAC Audio',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          }
        ]
      });
    } else if (resourceId.includes('sintel-sample') || resourceId.includes('sintel')) {
      return json({
        streams: [
          {
            name: 'Scenic 1080p Master Stream',
            title: 'Sintel (2010) - Cinematic Ultra Master\n🌟 EAC3 Surround Sound • Direct Link',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          },
          {
            name: 'Comic-con compressed stream',
            title: 'Sintel Low Resolution Mobile Proxy\n📱 Cellular Friendly H264',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          }
        ]
      });
    } else {
      return json({
        streams: [
          {
            name: 'Tears Cyber Rip [1080p]',
            title: 'Tears of Steel - Direct UHD mp4 Stream\n🔥 H264 profile',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          },
          {
            name: 'Tears Compressed Stream',
            title: 'Tears of Steel Mobile Web Rip\n📱 480p fallback',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
          }
        ]
      });
    }
  }

  return json({ error: 'Endpoint not matched' }, { status: 404 });
}

export async function POST(event: RequestEvent) {
  const { params, url } = event;
  const reqPath = params.path || '';
  const body = await event.request.json().catch(() => ({}));

  // 1. Add custom media url
  // SECURITY: whitelist the body — the old `...body` spread let a caller
  // overwrite `id`, `isLocal` and `filename` (see src/lib/security.ts).
  if (reqPath === 'media/add') {
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    const safe = sanitizeMediaInput(body);
    if (!safe) {
      return json({ error: 'A valid title or http(s) url is required' }, { status: 400 });
    }
    const newItem = {
      id: 'media_' + Math.random().toString(36).substring(2, 11),
      playCount: 0,
      playProgress: 0,
      subtitles: [],
      ...safe
    };
    media.push(newItem);
    writeJSON(MEDIA_FILE, media);
    return json(newItem, { status: 201 });
  }

  // 2. Playback progress update
  if (reqPath === 'media/progress') {
    const { id, playProgress, playCountIncrement } = body;
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    const idx = media.findIndex((m: any) => m.id === id);
    if (idx !== -1) {
      if (typeof playProgress === 'number' && Number.isFinite(playProgress)) {
        media[idx].playProgress = Math.max(0, playProgress);
      }
      if (playCountIncrement) {
        media[idx].playCount = (media[idx].playCount || 0) + 1;
        media[idx].lastPlayed = new Date().toISOString();
      }
      writeJSON(MEDIA_FILE, media);
      return json(media[idx]);
    } else {
      return json({ error: 'Media not found' }, { status: 404 });
    }
  }

  // 3. Vector upload binary endpoint
  // SECURITY: video extensions only, 2 GiB cap, partial file removed
  // on overflow — previously uncapped with no extension check.
  if (reqPath === 'upload') {
    const fileName = url.searchParams.get('fileName');
    const fileType = url.searchParams.get('type') || 'movie';
    if (!fileName) {
      return json({ error: 'fileName is required as query parameter' }, { status: 400 });
    }

    const cleanFileName = sanitizeUploadFilename(fileName);
    if (!cleanFileName) {
      return json(
        { error: 'Only video files are accepted (.mp4, .mkv, .webm, .mov, .m4v, .avi)' },
        { status: 400 }
      );
    }
    const savePath = resolveMediaPath(MEDIA_DIR, cleanFileName);
    if (!savePath) {
      return json({ error: 'Invalid fileName' }, { status: 400 });
    }

    const reader = event.request.body?.getReader();
    const writeStream = fs.createWriteStream(savePath);

    let received = 0;
    let aborted = false;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MAX_UPLOAD_BYTES) {
          aborted = true;
          writeStream.destroy();
          try {
            fs.unlinkSync(savePath);
          } catch {
            // Partial file may not exist yet.
          }
          return json({ error: 'Upload exceeds the 2 GiB limit' }, { status: 413 });
        }
        writeStream.write(Buffer.from(value));
      }
    }
    if (aborted) {
      return json({ error: 'Upload exceeds the 2 GiB limit' }, { status: 413 });
    }
    writeStream.end();

    // Sync wait write completion size
    await new Promise((resolve) => {
      if (writeStream.writableEnded) resolve(null);
      else writeStream.on('finish', resolve);
    });

    const size = fs.statSync(savePath).size;
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    const titleHyphen = fileName.substring(0, fileName.lastIndexOf('.')).replace(/[._-]/g, ' ');

    const newItem = {
      id: 'media_local_' + Math.random().toString(36).substring(2, 11),
      title: titleHyphen.charAt(0).toUpperCase() + titleHyphen.slice(1),
      filename: cleanFileName,
      url: `/api/stream?id=temp_id`,
      type: fileType,
      duration: 0,
      posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
      releaseYear: new Date().getFullYear().toString(),
      genres: ['Uncategorized'],
      summary: 'Uploaded video awaiting smart high-performance metadata categorization.',
      playCount: 0,
      playProgress: 0,
      isLocal: true,
      subtitles: [],
      size: size,
      mimeType: fileName.endsWith('.webm') ? 'video/webm' : fileName.endsWith('.mkv') ? 'video/x-matroska' : 'video/mp4'
    };

    newItem.url = `/api/stream?id=${newItem.id}`;
    media.push(newItem);
    writeJSON(MEDIA_FILE, media);

    return json(newItem, { status: 201 });
  }

  // 4. Gemini AI Enrichment Metadata route
  if (reqPath === 'metadata/enrich') {
    const { title, filename } = body;
    if (!gAi) {
      return json(
        { error: 'Gemini API key is not configured. Please supply an active GEMINI_API_KEY in the Secrets panel.' },
        { status: 400 }
      );
    }

    const querySubject = title || filename || 'A great movie';

    try {
      const prompt = `You are the ultimate Cinephile and Media database. Analyze the media search query "${querySubject}" and return metadata in perfect JSON format. Offer a high-quality, rich response representing this film or video content.
      Return JSON format matching the following structural specification exactly:
      {
        "title": "Exact title of the film/video",
        "releaseYear": "Year of release, or reasonable guess e.g. '2024'",
        "genres": ["Genre1", "Genre2"],
        "summary": "Captivating Cinephile movie summary (2 to 3 sentences)",
        "director": "Director of this movie/creator",
        "rating": 8.1,
        "posterUrl": "A beautiful cinematic illustration URL, or choose a keyword from Unsplash search like 'https://images.unsplash.com/photo-1542204172-e7052809a936?q=80&w=800' based on the movie theme (e.g. sci-fi, horror, drama, retro)",
        "bannerUrl": "A beautiful landscape cinema visual URL from unsplash search e.g. 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200' fitting the theme"
      }`;

      const response = await gAi.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              releaseYear: { type: Type.STRING },
              genres: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
              director: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              posterUrl: { type: Type.STRING },
              bannerUrl: { type: Type.STRING }
            },
            required: ['title', 'releaseYear', 'genres', 'summary', 'director', 'rating']
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error('No metadata content returned from Gemini model');
      }

      const cleanResult = JSON.parse(resultText.trim());
      return json(cleanResult);
    } catch (error: any) {
      console.error('Gemini metadata helper failed:', error);
      return json({ error: error.message || 'Failed parsing metadata using Gemini' }, { status: 500 });
    }
  }

  // 5. Watch Party Creation
  if (reqPath === 'watchparty/create') {
    const { hostName, hostId, currentMediaId } = body;
    const roomId = 'room_' + Math.random().toString(36).substring(2, 8).toUpperCase();

    watchParties[roomId] = {
      roomId,
      hostId,
      hostName,
      currentMediaId: currentMediaId || null,
      playbackState: 'paused',
      currentTime: 0,
      lastSyncTime: Date.now(),
      participants: [{ id: hostId, name: hostName, lastSeen: Date.now() }],
      chat: [
        {
          id: 'msg_init',
          userName: 'Media Room BOT',
          text: `Welcome, ${hostName}! Room created successfully. Send sharing link to friends to watch synchronized stream!`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    return json(watchParties[roomId], { status: 201 });
  }

  // 6. Watch Party Join
  if (reqPath === 'watchparty/join') {
    const { roomId, userId, userName } = body;
    const room = watchParties[roomId];
    if (!room) {
      return json({ error: 'Lobby not found. Double check room code.' }, { status: 404 });
    }

    const exists = room.participants.some((p: any) => p.id === userId);
    if (!exists) {
      room.participants.push({ id: userId, name: userName, lastSeen: Date.now() });
      room.chat.push({
        id: 'join_' + Date.now(),
        userName: 'System',
        text: `${userName} entered the watch party lobby! 👋`,
        timestamp: new Date().toLocaleTimeString()
      });
    } else {
      const p = room.participants.find((x: any) => x.id === userId);
      if (p) p.lastSeen = Date.now();
    }

    return json(room);
  }

  // 7. Watch Party Synchronization Sync polling
  if (reqPath.startsWith('watchparty/') && reqPath.endsWith('/sync')) {
    const parts = reqPath.split('/');
    const roomId = parts[1];
    const room = watchParties[roomId];

    if (!room) {
      return json({ error: 'Room not found' }, { status: 404 });
    }

    const { userId, playbackState, currentTime, currentMediaId, isHost } = body;

    const member = room.participants.find((p: any) => p.id === userId);
    if (member) {
      member.lastSeen = Date.now();
    } else {
      room.participants.push({ id: userId, name: body.userName || 'Watcher', lastSeen: Date.now() });
    }

    // Cleanup inactive members (> 15s)
    room.participants = room.participants.filter((p: any) => Date.now() - p.lastSeen < 15000);

    if (isHost || room.hostId === userId) {
      room.playbackState = playbackState;
      room.currentTime = currentTime;
      if (currentMediaId !== undefined) {
        room.currentMediaId = currentMediaId;
      }
      room.lastSyncTime = Date.now();
    }

    return json(room);
  }

  // 8. Watch Party Chat Message Addition
  if (reqPath.startsWith('watchparty/') && reqPath.endsWith('/chat')) {
    const parts = reqPath.split('/');
    const roomId = parts[1];
    const room = watchParties[roomId];

    if (!room) {
      return json({ error: 'Room not found' }, { status: 404 });
    }

    const { userName, text } = body;
    const newMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 11),
      userName,
      text,
      timestamp: new Date().toLocaleTimeString()
    };

    room.chat.push(newMessage);
    if (room.chat.length > 50) {
      room.chat.shift();
    }

    return json(newMessage, { status: 201 });
  }

  // 9. Play History Save
  if (reqPath === 'history/add') {
    const { mediaId, title, posterUrl, progress, duration } = body;
    const history = readJSON(HISTORY_FILE, []);
    const updatedHistory = history.filter((h: any) => h.mediaId !== mediaId);

    const historyItem = {
      id: 'hist_' + Math.random().toString(36).substring(2, 11),
      mediaId,
      title,
      posterUrl,
      watchedAt: new Date().toISOString(),
      progress,
      duration
    };

    updatedHistory.unshift(historyItem);
    if (updatedHistory.length > 30) {
      updatedHistory.pop();
    }

    writeJSON(HISTORY_FILE, updatedHistory);
    return json(historyItem, { status: 201 });
  }

  // 10. Toggle Plugin State
  if (reqPath === 'plugins/toggle') {
    const { id, enabled } = body;
    const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
    const idx = plugins.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      plugins[idx].enabled = enabled;
      writeJSON(PLUGINS_FILE, plugins);
      return json(plugins[idx]);
    } else {
      return json({ error: 'Plugin not spotted' }, { status: 404 });
    }
  }

  // 11. Save Custom/Existing Plugin
  if (reqPath === 'plugins/save') {
    const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
    const pluginData = body;

    const idx = plugins.findIndex((p: any) => p.id === pluginData.id);
    if (idx !== -1) {
      plugins[idx] = { ...plugins[idx], ...pluginData };
      writeJSON(PLUGINS_FILE, plugins);
      return json(plugins[idx]);
    } else {
      const newPlugin = {
        id: 'plugin_' + Math.random().toString(36).substring(2, 11),
        enabled: true,
        ...pluginData
      };
      plugins.push(newPlugin);
      writeJSON(PLUGINS_FILE, plugins);
      return json(newPlugin, { status: 201 });
    }
  }

  return json({ error: 'Endpoint not matched' }, { status: 404 });
}

export async function DELETE(event: RequestEvent) {
  const { params } = event;
  const reqPath = params.path || '';

  // 1. Delete Media Item
  if (reqPath.startsWith('media/')) {
    const parts = reqPath.split('/');
    const id = parts[parts.length - 1];
    const media = readJSON(MEDIA_FILE, defaultMediaItems);
    const idx = media.findIndex((m: any) => m.id === id);

    if (idx !== -1) {
      const item = media[idx];
      if (item.isLocal && item.filename) {
        // SECURITY: resolveMediaPath() rejects traversal outside MEDIA_DIR.
        const localFilePath = resolveMediaPath(MEDIA_DIR, item.filename);
        if (localFilePath && fs.existsSync(localFilePath)) {
          try {
            fs.unlinkSync(localFilePath);
          } catch (e) {
            console.error('Failed to delete stream from disk:', e);
          }
        }
      }
      media.splice(idx, 1);
      writeJSON(MEDIA_FILE, media);
      return json({ success: true, message: 'Media article deleted' });
    } else {
      return json({ error: 'Media item not discovered' }, { status: 404 });
    }
  }

  // 2. Clear Playback History
  if (reqPath === 'history') {
    writeJSON(HISTORY_FILE, []);
    return json({ success: true });
  }

  // 3. Delete Plugin ID
  if (reqPath.startsWith('plugins/')) {
    const parts = reqPath.split('/');
    const id = parts[parts.length - 1];
    const plugins = readJSON(PLUGINS_FILE, defaultPlugins);
    const filtered = plugins.filter((p: any) => p.id !== id);
    writeJSON(PLUGINS_FILE, filtered);
    return json({ success: true });
  }

  return json({ error: 'Endpoint not matched' }, { status: 404 });
}
